import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import {
  buildSystemPrompt,
  detectSadnessOrFeelings,
  SUBJECTS,
  AGE_BANDS,
} from './src/tutor-prompt.ts';
import { generateTopicGroundedQuest } from './src/adventure-stories.ts';

dotenv.config();

const currentDir =
  typeof __dirname !== 'undefined'
    ? __dirname
    : typeof import.meta !== 'undefined' && import.meta.url
    ? path.dirname(fileURLToPath(import.meta.url))
    : process.cwd();

const IS_SERVERLESS = Boolean(
  process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT
);

const app = express();
app.use((req, _res, next) => {
  if (req.url.startsWith('/.netlify/functions/api')) {
    req.url = req.url.replace(/^\/\.netlify\/functions\/api/, '/api') || '/api';
  }
  next();
});
app.use(express.json({ limit: '30kb' }));

// CORS headers
app.use((req, res, next) => {
  const origin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Lightweight in-memory rate limiting (max 30 requests per minute per IP)
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();
app.use('/api/', (req, res, next) => {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = ipRequestCounts.get(ip);

  if (!record || now > record.resetTime) {
    ipRequestCounts.set(ip, { count: 1, resetTime: now + 60_000 });
    return next();
  }

  if (record.count >= 30) {
    return res.status(429).json({
      error: "You are asking questions super fast! Let's pause for a moment and read the answers. 🌟"
    });
  }

  record.count += 1;
  next();
});

// User Authentication Data Layer
interface StoredUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  salt: string;
  ageBand?: string;
  createdAt: string;
}

const DATA_DIR = IS_SERVERLESS
  ? path.resolve('/tmp', 'tutorly-data')
  : path.resolve(currentDir, 'data');
const USERS_FILE = path.resolve(DATA_DIR, 'users.json');
const QUOTA_FILE = path.resolve(DATA_DIR, 'quota.json');
const CHAT_CACHE_FILE = path.resolve(DATA_DIR, 'chat-cache.json');
const QUIZ_CACHE_FILE = path.resolve(DATA_DIR, 'quiz-cache.json');
const DAILY_QUESTION_LIMIT = 20;
const GUEST_DAILY_LIMIT = 3;

interface DailyQuotaState {
  datePT: string;
  remaining: number;
  guestUsageByIp?: Record<string, number>;
}

function getPacificDateKey(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function loadQuota(): DailyQuotaState {
  const todayPT = getPacificDateKey();
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(QUOTA_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(QUOTA_FILE, 'utf-8'));
      if (parsed?.datePT === todayPT && typeof parsed?.remaining === 'number') {
        return {
          datePT: todayPT,
          remaining: Math.max(0, Math.min(DAILY_QUESTION_LIMIT, parsed.remaining)),
          guestUsageByIp:
            parsed.guestUsageByIp && typeof parsed.guestUsageByIp === 'object'
              ? parsed.guestUsageByIp
              : {},
        };
      }
    }
  } catch {
    // Fall through to fresh quota for today
  }
  const fresh: DailyQuotaState = {
    datePT: todayPT,
    remaining: DAILY_QUESTION_LIMIT,
    guestUsageByIp: {},
  };
  saveQuota(fresh);
  return fresh;
}

function saveQuota(quota: DailyQuotaState) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(QUOTA_FILE, JSON.stringify(quota, null, 2), 'utf-8');
  } catch {
    // Ignore disk write issues
  }
}

function consumeQuestionQuota(guestIp?: string): number {
  const q = loadQuota();
  const nextRemaining = Math.max(0, q.remaining - 1);
  const guestUsageByIp = { ...(q.guestUsageByIp || {}) };
  if (guestIp) {
    guestUsageByIp[guestIp] = (guestUsageByIp[guestIp] || 0) + 1;
  }
  saveQuota({ datePT: q.datePT, remaining: nextRemaining, guestUsageByIp });
  return nextRemaining;
}

function markQuotaExhausted(): number {
  const q = loadQuota();
  saveQuota({ datePT: q.datePT, remaining: 0, guestUsageByIp: q.guestUsageByIp || {} });
  return 0;
}

function getRequestClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded || req.socket.remoteAddress || 'unknown';
  return String(raw).split(',')[0].trim() || 'unknown';
}

function readJsonCache<T>(filePath: string): Record<string, T> {
  try {
    if (fs.existsSync(filePath)) {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Ignore corrupt cache file
  }
  return {};
}

function writeJsonCache<T>(filePath: string, data: Record<string, T>, maxEntries = 400) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const keys = Object.keys(data);
    if (keys.length > maxEntries) {
      const trimmed: Record<string, T> = {};
      for (const k of keys.slice(-maxEntries)) {
        trimmed[k] = data[k];
      }
      fs.writeFileSync(filePath, JSON.stringify(trimmed, null, 2), 'utf-8');
      return;
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // Ignore disk write errors
  }
}

function makeChatCacheKey(subject: string, ageBand: string, question: string): string {
  const normalized = question
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return `${subject}|${ageBand}|${normalized}`;
}

function makeQuizCacheKey(topic: string, numQuestions: number, ageBand: string, context: string): string {
  const hash = crypto.createHash('sha256').update(context.slice(0, 600)).digest('hex').slice(0, 12);
  return `${topic.toLowerCase().trim()}|${numQuestions}|${ageBand}|${hash}`;
}

function loadUsers(): StoredUser[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data) || [];
  } catch (err) {
    console.error('Failed to load users:', err);
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save users:', err);
  }
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

// Active sessions + stateless HMAC token verification (works across serverless cold starts)
const sessions = new Map<string, { userId: string; expiresAt: number }>();
const revokedTokens = new Set<string>();
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  crypto
    .createHash('sha256')
    .update(process.env.GEMINI_API_KEY || process.env.API_KEY || 'tutorly-dev-session-secret')
    .digest('hex');

function createSession(user: StoredUser): string {
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
  const payload = Buffer.from(
    JSON.stringify({
      id: user.id,
      username: user.username,
      email: user.email,
      ageBand: user.ageBand,
      createdAt: user.createdAt,
      exp: expiresAt,
    })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  const token = `${payload}.${sig}`;
  sessions.set(token, { userId: user.id, expiresAt });
  return token;
}

function getUserByToken(token: string | undefined): StoredUser | null {
  if (!token || revokedTokens.has(token)) return null;

  const session = sessions.get(token);
  if (session) {
    if (Date.now() > session.expiresAt) {
      sessions.delete(token);
      return null;
    }
    const users = loadUsers();
    const found = users.find((u) => u.id === session.userId);
    if (found) return found;
  }

  // Fallback: verify signed token payload (survives serverless cold starts)
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  if (sig.length !== expectedSig.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (!data?.id || !data?.exp || Date.now() > Number(data.exp)) return null;
    return {
      id: String(data.id),
      username: String(data.username || 'Learner'),
      email: String(data.email || ''),
      passwordHash: '',
      salt: '',
      ageBand: data.ageBand ? String(data.ageBand) : '8-10',
      createdAt: String(data.createdAt || new Date().toISOString()),
    };
  } catch {
    return null;
  }
}

function getAuthenticatedUser(req: Request): StoredUser | null {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : undefined;
  return getUserByToken(token);
}

function getGuestAccessStatus(req: Request): {
  isGuest: boolean;
  allowed: boolean;
  guestRemaining: number;
  clientIp?: string;
} {
  const user = getAuthenticatedUser(req);
  if (user) {
    return { isGuest: false, allowed: true, guestRemaining: DAILY_QUESTION_LIMIT };
  }
  const clientIp = getRequestClientIp(req);
  const q = loadQuota();
  const used = q.guestUsageByIp?.[clientIp] || 0;
  const guestRemaining = Math.max(0, GUEST_DAILY_LIMIT - used);
  return {
    isGuest: true,
    allowed: guestRemaining > 0,
    guestRemaining,
    clientIp,
  };
}

// Authentication Endpoints

// POST /api/auth/signup
app.post(['/api/auth/signup', '/api/auth/signup/'], (req: Request, res: Response) => {
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const ageBand = typeof req.body?.ageBand === 'string' ? req.body.ageBand : '8-10';

  if (!username || username.length < 2 || username.length > 30) {
    return res.status(400).json({ error: 'Username must be between 2 and 30 characters.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  if (!password || password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters long.' });
  }

  const users = loadUsers();
  if (users.some((u) => u.email.toLowerCase() === email)) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(409).json({ error: 'This username is already taken. Please choose another!' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);
  const newUser: StoredUser = {
    id: `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    username,
    email,
    passwordHash,
    salt,
    ageBand,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  const token = createSession(newUser);

  return res.status(201).json({
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      ageBand: newUser.ageBand,
      createdAt: newUser.createdAt,
    },
    token,
  });
});

// POST /api/auth/login
app.post(['/api/auth/login', '/api/auth/login/'], (req: Request, res: Response) => {
  const identifier = typeof req.body?.identifier === 'string' ? req.body.identifier.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Please provide both username/email and password.' });
  }

  const users = loadUsers();
  const lowerIdent = identifier.toLowerCase();
  const user = users.find(
    (u) => u.email.toLowerCase() === lowerIdent || u.username.toLowerCase() === lowerIdent
  );

  if (!user) {
    return res.status(401).json({ error: 'Incorrect email/username or password.' });
  }

  const computedHash = hashPassword(password, user.salt);
  if (computedHash !== user.passwordHash) {
    return res.status(401).json({ error: 'Incorrect email/username or password.' });
  }

  const token = createSession(user);

  return res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      ageBand: user.ageBand,
      createdAt: user.createdAt,
    },
    token,
  });
});

// GET /api/auth/me
app.get(['/api/auth/me', '/api/auth/me/'], (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  const user = getUserByToken(token);

  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  return res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      ageBand: user.ageBand,
      createdAt: user.createdAt,
    },
  });
});

// POST /api/auth/logout
app.post(['/api/auth/logout', '/api/auth/logout/'], (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  if (token) {
    sessions.delete(token);
    revokedTokens.add(token);
  }
  return res.json({ ok: true });
});

// Message sanitization helper
interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

function cleanMessages(input: unknown): ChatMsg[] | null {
  if (!Array.isArray(input)) return null;
  const msgs = input
    .slice(-14)
    .filter(
      (m): m is ChatMsg =>
        Boolean(m) &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string'
    )
    .map((m) => ({
      role: m.role,
      content: m.content.slice(0, 1000).trim(),
    }))
    .filter((m) => m.content.length > 0);

  if (!msgs.length || msgs[msgs.length - 1].role !== 'user') {
    return null;
  }
  return msgs;
}

// In-memory cache for synthesized studio voice clips (max 200 items)
const ttsCache = new Map<string, string>();
// Circuit breaker when Free Tier quota limit (10 requests/day for gemini-3.8-flash-lite-tts) is reached
let ttsQuotaExhaustedUntil = 0;

interface VoicePreset {
  voiceName: string;
  stylePrompt: string;
}

const VOICE_PRESETS: Record<string, VoicePreset> = {
  'conversational-upbeat': {
    voiceName: 'Kore',
    stylePrompt:
      'Conversational, upbeat, warm, friendly, clear, and articulate young adult commercial voice actor for children',
  },
  'bold-energetic': {
    voiceName: 'Puck',
    stylePrompt: 'Lively, energetic, punchy tutor for kids',
  },
  'upbeat-explorer': {
    voiceName: 'Zephyr',
    stylePrompt: 'Bright, friendly, and curious learning guide',
  },
  'deep-storyteller': {
    voiceName: 'Charon',
    stylePrompt: 'Warm, patient, resonant narrator',
  },
};

function cleanTextForSpeech(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
    .replace(/[*_#`~[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function synthesizeStudioVoice(
  ai: GoogleGenAI,
  text: string,
  style = 'conversational-upbeat'
): Promise<string | null> {
  // If Free Tier quota has been exhausted, immediately return null to allow fast client-side fallback
  if (Date.now() < ttsQuotaExhaustedUntil) {
    return null;
  }

  const clean = cleanTextForSpeech(text);
  if (!clean) return null;

  const preset = VOICE_PRESETS[style] || VOICE_PRESETS['conversational-upbeat'];
  const cacheKey = `${preset.voiceName}:${clean}`;
  if (ttsCache.has(cacheKey)) {
    return ttsCache.get(cacheKey)!;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: clean,
              speechMetadata: {
                style: preset.stylePrompt,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: preset.voiceName },
          },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      if (ttsCache.size > 200) {
        const firstKey = ttsCache.keys().next().value;
        if (firstKey) ttsCache.delete(firstKey);
      }
      ttsCache.set(cacheKey, base64Audio);
      return base64Audio;
    }
  } catch (err: any) {
    const errMsg = typeof err?.message === 'string' ? err.message : String(err);
    const isQuotaExhausted =
      err?.status === 429 ||
      errMsg.includes('429') ||
      errMsg.includes('quota') ||
      errMsg.includes('RESOURCE_EXHAUSTED');

    if (isQuotaExhausted) {
      // Free Tier TTS quota exhausted (10 req/day). Trip circuit breaker for 1 hour to avoid repeated failures.
      ttsQuotaExhaustedUntil = Date.now() + 60 * 60 * 1000;
    } else {
      console.warn('Gemini TTS synthesis note:', errMsg);
    }
  }
  return null;
}

const ACTIVE_TEXT_MODELS = ['gemini-4-hydrogen', 'gemini-3.1-flash-lite'] as const;
const modelQuotaCooldownUntil = new Map<string, number>();

function extractErrorStatus(err: any): number | undefined {
  const direct = Number(err?.status || err?.code || err?.error?.code);
  if (!Number.isNaN(direct) && direct >= 400 && direct < 600) {
    return direct;
  }
  const msg = typeof err?.message === 'string' ? err.message : String(err || '');
  const match = msg.match(/\b(400|401|403|404|429|500|502|503|504)\b/);
  if (match) {
    return Number(match[1]);
  }
  if (/UNAVAILABLE|high demand/i.test(msg)) return 503;
  if (/RESOURCE_EXHAUSTED|quota/i.test(msg)) return 429;
  if (/PERMISSION_DENIED/i.test(msg)) return 403;
  return undefined;
}

function isDailyQuotaError(err: any): boolean {
  const msg = typeof err?.message === 'string' ? err.message : String(err || '');
  return /PerDay|requests per day|GenerateRequestsPerDay/i.test(msg);
}

function classifyGeminiError(err: any): {
  status: number;
  userMessage: string;
  retryable: boolean;
} {
  const code = extractErrorStatus(err);
  const msg = typeof err?.message === 'string' ? err.message : String(err || '');

  if (code === 429 || /RESOURCE_EXHAUSTED|quota/i.test(msg)) {
    if (isDailyQuotaError(err)) {
      return {
        status: 429,
        retryable: false,
        userMessage:
          "Tutorly used up today's 20 free AI chat turns — no payment needed, it resets automatically! While it resets, you can jump into the Interactive Lab, Story Mode, or Daily Challenge below for free anytime! 🌟",
      };
    }
    return {
      status: 429,
      retryable: true,
      userMessage:
        'Too many questions asked at once! Please wait a few seconds and tap Try Again (or explore Interactive Lab, Story Mode, or Daily Challenge anytime). 🌟',
    };
  }

  if (code === 503 || code === 504 || code === 500 || /UNAVAILABLE|high demand/i.test(msg)) {
    return {
      status: 503,
      retryable: true,
      userMessage:
        "Tutorly's free AI server is super busy right now because lots of people are using it! Wait a few seconds and tap Try Again — or explore Interactive Lab, Story Mode, or Daily Challenge below right now! 🌟",
    };
  }

  if (code === 401 || code === 403 || /PERMISSION_DENIED|API_KEY_INVALID/i.test(msg)) {
    return {
      status: 502,
      retryable: false,
      userMessage:
        'Tutorly could not verify the Gemini API key. Please check your GEMINI_API_KEY in Settings > Secrets.',
    };
  }

  return {
    status: 502,
    retryable: true,
    userMessage:
      'Tutorly had a small hiccup reaching the AI helper. Please tap Try Again in a moment! 🌟',
  };
}

async function generateWithModelFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    systemInstruction?: string;
    responseMimeType?: string;
  }
): Promise<string> {
  let lastErr: any = null;
  let quotaErr: any = null;
  const now = Date.now();

  for (const model of ACTIVE_TEXT_MODELS) {
    const cooldownUntil = modelQuotaCooldownUntil.get(model) || 0;
    if (now < cooldownUntil) {
      continue;
    }

    const maxAttempts = IS_SERVERLESS ? 1 : 2;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const config: Record<string, any> = {};
        if (params.systemInstruction) {
          config.systemInstruction = params.systemInstruction;
        }
        if (params.responseMimeType) {
          config.responseMimeType = params.responseMimeType;
        }
        if (model === 'gemini-4-hydrogen') {
          config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
        }

        const generatePromise = ai.models.generateContent({
          model,
          contents: params.contents,
          config,
        });

        if (IS_SERVERLESS && model === 'gemini-4-hydrogen') {
          generatePromise.catch(() => {});
        }
        const response =
          IS_SERVERLESS && model === 'gemini-4-hydrogen'
            ? await Promise.race([
                generatePromise,
                new Promise<never>((_, reject) =>
                  setTimeout(() => reject(new Error('Primary model timeout (serverless)')), 4500)
                ),
              ])
            : await generatePromise;

        const text = response.text?.trim() || '';
        if (text) return text;
      } catch (err: any) {
        lastErr = err;
        const status = extractErrorStatus(err);
        if (status === 429 && isDailyQuotaError(err)) {
          quotaErr = err;
          // Avoid retrying daily quota errors; cool down for 10 minutes and fall back to next model
          modelQuotaCooldownUntil.set(model, Date.now() + 10 * 60 * 1000);
          break;
        }
        const isTransient = status === 503 || status === 504 || status === 429 || status === 500;
        if (isTransient && attempt < maxAttempts - 1) {
          const baseDelay = 700 * Math.pow(2, attempt);
          const jitter = Math.floor(Math.random() * 250);
          await new Promise((r) => setTimeout(r, baseDelay + jitter));
          continue;
        }
        break;
      }
    }
  }

  if (lastErr) {
    throw lastErr;
  }
  if (quotaErr) {
    throw quotaErr;
  }
  throw new Error('All Gemini models are currently unavailable or quota-limited.');
}

// POST /api/chat - main tutor endpoint
app.post(['/api/chat', '/api/chat/'], async (req: Request, res: Response) => {
  const messages = cleanMessages(req.body?.messages);
  if (!messages) {
    return res
      .status(400)
      .json({ error: "Send a list of messages that ends with the child's message." });
  }

  const subject = SUBJECTS.includes(req.body?.subject) ? req.body.subject : 'General';
  const ageBand = AGE_BANDS.includes(req.body?.ageBand) ? req.body.ageBand : '8-10';

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  const lastUserMsg = messages[messages.length - 1]?.content || '';
  const hasFeelings = detectSadnessOrFeelings(lastUserMsg);

  // Serve cached response for standalone/first-turn educational questions (costs 0 Gemini API calls!)
  const canUseCache = !hasFeelings && messages.length <= 2;
  const chatCacheKey = canUseCache ? makeChatCacheKey(subject, ageBand, lastUserMsg) : '';
  if (canUseCache && chatCacheKey) {
    const cache = readJsonCache<string>(CHAT_CACHE_FILE);
    if (cache[chatCacheKey]) {
      return res.json({
        reply: cache[chatCacheKey],
        cached: true,
        questionsLeft: loadQuota().remaining,
      });
    }
  }

  // Protect the shared 20/day pool from anonymous strangers draining all questions
  const access = getGuestAccessStatus(req);
  if (!hasFeelings && !access.allowed) {
    return res.status(429).json({
      error: `Guests get ${GUEST_DAILY_LIMIT} free AI previews per day to keep questions available for members. Sign In (free!) to continue asking, or explore Interactive Lab, Story Mode & Daily Challenge anytime! 🌟`,
      guestLimitReached: true,
      questionsLeft: loadQuota().remaining,
    });
  }

  if (!apiKey) {
    if (hasFeelings) {
      return res.json({
        reply:
          "I hear you, and it's completely okay to feel this way. All feelings are natural, and your feelings matter. 💛 When you're experiencing big or tough emotions, it can really help to share them with a trusted adult — like a parent, guardian, teacher, or school counselor. They care about you and are there to listen and help! You never have to handle big feelings all alone. 🌟",
      });
    }
    return res.status(502).json({
      error:
        'Tutorly is getting ready. Please check that GEMINI_API_KEY is configured in Settings > Secrets.',
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        timeout: IS_SERVERLESS ? 10000 : 15000,
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const systemInstruction = buildSystemPrompt(subject, ageBand);
    let reply = await generateWithModelFallback(ai, {
      contents,
      systemInstruction,
    });

    if (hasFeelings && reply) {
      const mentionsAdult =
        /\b(trusted adult|adult|parent|guardian|grown-up|counselor|teacher|mom|dad|family member)\b/i.test(
          reply
        );
      if (!mentionsAdult) {
        reply +=
          "\n\n💛 Remember: Whenever you have big or tough feelings — whether you feel sad, mad, scared, or overwhelmed — talking to a trusted adult (like a parent, guardian, teacher, or school counselor) can really help. You never have to handle big feelings all alone!";
      }
    }

    if (canUseCache && chatCacheKey && reply) {
      const cache = readJsonCache<string>(CHAT_CACHE_FILE);
      cache[chatCacheKey] = reply;
      writeJsonCache(CHAT_CACHE_FILE, cache, 500);
    }

    const questionsLeft = consumeQuestionQuota(access.isGuest ? access.clientIp : undefined);
    return res.json({ reply, questionsLeft });
  } catch (err: any) {
    if (hasFeelings) {
      return res.json({
        reply:
          "I hear you, and it's completely okay to feel this way. 💛 All feelings are natural. You never have to carry big or tough feelings all by yourself. It can really help to talk with a trusted adult — like a parent, guardian, teacher, or school counselor. They care about you and are there to listen and support you. 🌟",
        questionsLeft: loadQuota().remaining,
      });
    }

    const errInfo = classifyGeminiError(err);
    const questionsLeft = isDailyQuotaError(err) ? markQuotaExhausted() : loadQuota().remaining;
    console.info(`Chat request unavailable (${errInfo.status}):`, err?.message || err);
    return res.status(errInfo.status).json({
      error: errInfo.userMessage,
      retryable: errInfo.retryable,
      questionsLeft,
    });
  }
});

// POST /api/tts - synthesize studio voice on demand
app.post(['/api/tts', '/api/tts/'], async (req: Request, res: Response) => {
  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
  if (!text) {
    return res.status(400).json({ error: 'Text is required for TTS' });
  }

  // Fast return if Free Tier quota is currently exhausted
  if (Date.now() < ttsQuotaExhaustedUntil) {
    return res.json({ audio: null, fallback: true, quotaExhausted: true });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  if (!apiKey) {
    return res.json({ audio: null, fallback: true });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        timeout: 10000,
        headers: { 'User-Agent': 'aistudio-build' },
      },
    });
    const style = req.body?.style || 'conversational-upbeat';
    const audio = await synthesizeStudioVoice(ai, text, style);
    if (!audio) {
      return res.json({
        audio: null,
        fallback: true,
        quotaExhausted: Date.now() < ttsQuotaExhaustedUntil,
      });
    }

    res.json({ audio, mimeType: 'audio/wav' });
  } catch (err: any) {
    res.json({
      audio: null,
      fallback: true,
      quotaExhausted: Date.now() < ttsQuotaExhaustedUntil,
    });
  }
});

// POST /api/quiz - generate 4 or 5 question quiz on the answered topic
app.post(['/api/quiz', '/api/quiz/'], async (req: Request, res: Response) => {
  const context = typeof req.body?.context === 'string' ? req.body.context.trim() : '';
  const rawTopic = typeof req.body?.topic === 'string' ? req.body.topic.trim() : '';
  const topic = rawTopic || 'Learning';
  const requestedNum = Number(req.body?.numQuestions) === 5 ? 5 : 4;
  const ageBand = typeof req.body?.ageBand === 'string' ? req.body.ageBand : '8-10';

  const quizCacheKey = makeQuizCacheKey(topic, requestedNum, ageBand, context);
  const quizCache = readJsonCache<any>(QUIZ_CACHE_FILE);
  if (quizCache[quizCacheKey]) {
    return res.json({
      ...quizCache[quizCacheKey],
      cached: true,
      questionsLeft: loadQuota().remaining,
    });
  }

  const access = getGuestAccessStatus(req);
  if (!access.allowed) {
    return res.status(429).json({
      error: `Guests get ${GUEST_DAILY_LIMIT} free AI quizzes/questions per day. Sign In (free!) to keep generating quizzes! 🌟`,
      guestLimitReached: true,
      questionsLeft: loadQuota().remaining,
    });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  if (!apiKey) {
    return res.status(502).json({
      error:
        'Tutorly is getting ready. Please check that GEMINI_API_KEY is configured in Settings > Secrets.',
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        timeout: IS_SERVERLESS ? 10000 : 15000,
        headers: { 'User-Agent': 'aistudio-build' },
      },
    });

    const prompt = `Create an engaging, fun, age-appropriate ${requestedNum}-question multiple-choice quiz for a ${ageBand} year old student based on this lesson content:

Topic: "${topic}"
Lesson content:
"""
${context.slice(0, 1500)}
"""

Requirements:
- Exactly ${requestedNum} questions.
- Each question must test understanding of key concepts in the lesson in a fun, clear, accessible way suitable for age ${ageBand}.
- Exactly 4 clear options for each question (1 correct answer, 3 plausible distractors).
- Provide answerIndex (0, 1, 2, or 3) indicating which option in the options array is the correct choice.
- Distribute the answerIndex among 0, 1, 2, and 3 so the correct answer is not always in the first position.
- Provide a short, cheerful 1-2 sentence explanation celebrating the correct answer.

Return ONLY a valid JSON object matching this schema:
{
  "title": "${requestedNum}-Question Quiz on ${topic.replace(/"/g, '')}",
  "topic": "${topic.replace(/"/g, '')}",
  "numQuestions": ${requestedNum},
  "questions": [
    {
      "question": "Clear question text?",
      "options": ["Choice A", "Choice B", "Choice C", "Choice D"],
      "answerIndex": 1,
      "explanation": "Great job! Here is why..."
    }
  ]
}`;

    const text = await generateWithModelFallback(ai, {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      responseMimeType: 'application/json',
    });
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed?.questions) || parsed.questions.length < requestedNum) {
      throw new Error('Incomplete quiz payload received');
    }

    const quizData = {
      title: parsed.title || `${requestedNum}-Question Quiz: ${topic}`,
      topic: parsed.topic || topic,
      numQuestions: requestedNum,
      questions: parsed.questions.slice(0, requestedNum).map((q: any) => ({
        question: String(q.question || 'Question'),
        options:
          Array.isArray(q.options) && q.options.length === 4
            ? q.options.map(String)
            : ['Option A', 'Option B', 'Option C', 'Option D'],
        answerIndex:
          typeof q.answerIndex === 'number' && q.answerIndex >= 0 && q.answerIndex <= 3
            ? q.answerIndex
            : 0,
        explanation: String(q.explanation || 'Awesome work!'),
      })),
    };

    quizCache[quizCacheKey] = quizData;
    writeJsonCache(QUIZ_CACHE_FILE, quizCache, 250);

    const questionsLeft = consumeQuestionQuota(access.isGuest ? access.clientIp : undefined);
    return res.json({ ...quizData, questionsLeft });
  } catch (err: any) {
    const errInfo = classifyGeminiError(err);
    const questionsLeft = isDailyQuotaError(err) ? markQuotaExhausted() : loadQuota().remaining;
    console.info(`Quiz generation unavailable (${errInfo.status}):`, err?.message || err);
    return res.status(errInfo.status).json({
      error: errInfo.userMessage,
      retryable: errInfo.retryable,
      questionsLeft,
    });
  }
});

// POST /api/story/generate - generate a 5-7 year old hero story where choices require math/science answers
app.post(['/api/story/generate', '/api/story/generate/'], async (req: Request, res: Response) => {
  const rawHero = typeof req.body?.heroName === 'string' ? req.body.heroName.trim() : 'Captain Nova';
  const heroName = rawHero || 'Captain Nova';
  const rawSubject = typeof req.body?.subject === 'string' ? req.body.subject.trim() : 'General';
  const subject = rawSubject || 'General';
  const rawTopic =
    typeof req.body?.topic === 'string' && req.body.topic.trim()
      ? req.body.topic.trim()
      : typeof req.body?.theme === 'string' && req.body.theme.trim()
      ? req.body.theme.trim()
      : subject !== 'General'
      ? subject
      : 'Science & Nature';
  const topic = rawTopic;
  const heroAvatar = typeof req.body?.heroAvatar === 'string' ? req.body.heroAvatar : '🚀';

  // Topic-grounded fallback (zero keys/doors; 100% focused on topic and subject)
  const fallbackQuest = generateTopicGroundedQuest(heroName, heroAvatar, topic, subject);

  const access = getGuestAccessStatus(req);
  if (!access.allowed) {
    return res.status(429).json({
      error: `Guests get ${GUEST_DAILY_LIMIT} free AI custom quests per day. Sign In (free!) or pick any built-in Story Mode adventure! 🌟`,
      guestLimitReached: true,
      questionsLeft: loadQuota().remaining,
    });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  if (!apiKey) {
    return res.json(fallbackQuest);
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { timeout: IS_SERVERLESS ? 10000 : 15000, headers: { 'User-Agent': 'aistudio-build' } },
    });

    const prompt = `Create an interactive 4-chapter story quest for a 5-7 year old child named "${heroName}" with avatar emoji "${heroAvatar}" specifically on the educational topic: "${topic}" (Subject: ${subject}).
CRITICAL TOPIC RELEVANCE:
- The entire story and EVERY SINGLE CHAPTER MUST DIRECTLY RELATE TO "${topic}".
- DO NOT invent generic unrelated filler like keys, keypads, or locks unless the child asked specifically for keys!
- If the topic is "${topic}", the story setting, obstacles, and math/science dilemmas MUST be centered on "${topic}" (e.g. if topic is Photosynthesis: seeds, sunlight, water, leaves, oxygen; if Fractions: slicing pizza/cake in halves and quarters, sharing treats; if Dinosaurs: herbivore vs carnivore, counting footprints, fossil shapes; if Space: rocket fuel, moon gravity, satellite signals).
- The kid "${heroName}" is the hero of the adventure.
- The age group is strictly 5 to 7 years old (simple vocabulary, exciting, uplifting, positive reinforcement).
- Exactly 4 scenes (chapters 1, 2, 3, 4).
- In each scene provide 3 choices: 1 correct choice (isCorrect: true) and 2 friendly distractors (isCorrect: false).
- Choices should require 5-7 year old math or science skills.

Return ONLY valid JSON matching this schema:
{
  "id": "custom-${Date.now()}",
  "title": "${heroName}'s ${topic.replace(/"/g, '')} Adventure",
  "subtitle": "Short exciting tagline about ${topic.replace(/"/g, '')}",
  "theme": "custom",
  "subject": "${subject}",
  "topic": "${topic.replace(/"/g, '')}",
  "themeEmoji": "${heroAvatar}",
  "accentColor": "from-indigo-600 via-purple-600 to-pink-600",
  "bgGradient": "bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 text-white",
  "description": "Short 1-sentence description",
  "scenes": [
    {
      "id": "scene-1",
      "chapterNumber": 1,
      "title": "Exciting Chapter Title",
      "sceneEmoji": "🚀",
      "location": "Location Name",
      "narrative": "Story text introducing the scene and the dilemma for ${heroName} directly about ${topic.replace(/"/g, '')}...",
      "challengePrompt": "Clear child-friendly question prompt directly about ${topic.replace(/"/g, '')}",
      "visualHelper": {
        "type": "emoji-row",
        "items": ["🍎", "🍎", "➕", "🍎"],
        "hintText": "Friendly hint to help count or think"
      },
      "choices": [
        {
          "id": "c1",
          "text": "Answer text with emoji",
          "isCorrect": true,
          "subjectType": "math",
          "conceptTag": "Concept Name",
          "explanation": "Cheerful explanation of why this is right!",
          "outcomeNarrative": "What happens next in the story when the hero succeeds!",
          "earnedItem": "Fun Item Name 🛡️"
        },
        {
          "id": "c2",
          "text": "Wrong answer",
          "isCorrect": false,
          "subjectType": "math",
          "conceptTag": "Concept Name",
          "explanation": "Gentle encouraging hint",
          "outcomeNarrative": "Friendly try-again text"
        },
        {
          "id": "c3",
          "text": "Wrong answer 2",
          "isCorrect": false,
          "subjectType": "math",
          "conceptTag": "Concept Name",
          "explanation": "Gentle encouraging hint",
          "outcomeNarrative": "Friendly try-again text"
        }
      ]
    }
  ],
  "victoryReward": {
    "badgeName": "Hero Badge Title",
    "badgeEmoji": "🏆",
    "congratulations": "Warm celebratory message",
    "followUpQuestion": "A fun question for Tutorly chat"
  }
}`;

    const text = await generateWithModelFallback(ai, {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      responseMimeType: 'application/json',
    });
    const parsed = JSON.parse(text);
    const questionsLeft = consumeQuestionQuota(access.isGuest ? access.clientIp : undefined);
    if (parsed?.title && Array.isArray(parsed?.scenes) && parsed.scenes.length >= 3) {
      return res.json({ ...parsed, questionsLeft });
    }
    return res.json({ ...fallbackQuest, questionsLeft });
  } catch (err: any) {
    const errInfo = classifyGeminiError(err);
    const questionsLeft = isDailyQuotaError(err) ? markQuotaExhausted() : loadQuota().remaining;
    console.info(`Story generation unavailable (${errInfo.status}):`, err?.message || err);
    return res.status(errInfo.status).json({
      error: errInfo.userMessage,
      retryable: errInfo.retryable,
      questionsLeft,
    });
  }
});

// Daily free AI question quota status (resets automatically at 12:00 AM Pacific Time)
app.get(['/api/quota', '/api/quota/'], (req: Request, res: Response) => {
  const q = loadQuota();
  const access = getGuestAccessStatus(req);
  res.json({
    questionsLeft: q.remaining,
    limit: DAILY_QUESTION_LIMIT,
    datePT: q.datePT,
    isGuest: access.isGuest,
    guestRemaining: access.guestRemaining,
    guestLimit: GUEST_DAILY_LIMIT,
  });
});

// Health check endpoint
app.get(['/api/health', '/api/health/'], (req, res) => {
  res.json({ status: 'ok', name: 'Tutorly' });
});

// Catch-all for API endpoints to prevent Vite HTML fallback from returning doctype html
app.all('/api/*', (_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Setup Vite or static serving
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const port = Number(process.env.PORT) || 3000;

  if (!isProduction) {
    const vitePkg = 'vite';
    const { createServer: createViteServer } = await import(vitePkg);
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(currentDir, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Tutorly server running at http://0.0.0.0:${port}`);
  });
}

if (!IS_SERVERLESS) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export { app };
