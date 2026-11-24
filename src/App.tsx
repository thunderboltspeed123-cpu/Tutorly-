/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Mic,
  BookOpen,
  HelpCircle,
  Smile,
  ShieldCheck,
  ChevronDown,
  ArrowDown,
  User,
  LogIn,
  LogOut,
  Heart,
  Award,
  Flame,
} from 'lucide-react';
import {
  SUBJECTS,
  AGE_BANDS,
  SUBJECT_DETAILS,
  detectFeelingsOrDistress,
  detectSadnessOrFeelings,
  type Subject,
  type AgeBand,
} from './tutor-prompt.ts';
import { BookIcon } from './components/BookIcon.tsx';
import { InteractiveLesson } from './components/InteractiveLesson.tsx';
import { FormattedChatMessage } from './components/FormattedChatMessage.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { QuizModal } from './components/QuizModal.tsx';
import { DailyChallengeModal } from './components/DailyChallengeModal.tsx';
import { DailyChallengeSection } from './components/DailyChallengeSection.tsx';
import { StoryModeSection } from './components/StoryModeSection.tsx';
import {
  loadStreakData,
  getDailyPuzzleForDate,
  getLocalDateString,
  type StreakData,
} from './daily-puzzles.ts';
import type { UserProfile } from './types/auth.ts';
import {
  initVoiceEngine,
  speakNaturalSentences,
  stopSpeaking,
  VOICE_STYLES,
  type VoiceStyle,
} from './voice-engine.ts';
import {
  detectExplainTopic,
  getInteractiveLessonForTopic,
  type InteractiveConceptLesson,
} from './interactive-topics.ts';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isError?: boolean;
  isTyping?: boolean;
}

// Gentle Web Audio sound effect for child positive feedback
function playChime(type: 'pop' | 'success' = 'success') {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === 'pop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } else {
      // Gentle chord: C5 -> E5 -> G5
      const freqs = [523.25, 659.25, 783.99];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.07;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.1, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.36);
      });
    }
  } catch {
    // Audio context may be restricted before user gesture
  }
}

const DAILY_QUESTION_LIMIT = 20;
const QUOTA_STORAGE_KEY = 'tutorly_daily_questions_v1';

function getPacificDateKey(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function getLocalPacificMidnightLabel(): string {
  try {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      timeZoneName: 'shortOffset',
    }).formatToParts(now);
    const offsetStr = parts.find((p) => p.type === 'timeZoneName')?.value || 'GMT-8';
    const match = offsetStr.match(/GMT([+-]\d+)/);
    const offsetHours = match ? Number(match[1]) : -8;
    const ptDate = getPacificDateKey(now);
    const [y, m, d] = ptDate.split('-').map(Number);
    const resetUtcMs = Date.UTC(y, m - 1, d + 1, 0 - offsetHours, 0, 0);
    const diffMs = Math.max(0, resetUtcMs - now.getTime());
    const totalMins = Math.max(1, Math.ceil(diffMs / 60_000));
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    const countdown = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    const localClock = new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(resetUtcMs));
    return `in ${countdown} (${localClock})`;
  } catch {
    return 'at 12:00 PM Noon';
  }
}

function loadLocalQuestionsLeft(): number {
  const todayPT = getPacificDateKey();
  try {
    const raw = localStorage.getItem(QUOTA_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.datePT === todayPT && typeof parsed?.left === 'number') {
        return Math.max(0, Math.min(DAILY_QUESTION_LIMIT, parsed.left));
      }
    }
  } catch {
    // Ignore storage error
  }
  return DAILY_QUESTION_LIMIT;
}

function saveLocalQuestionsLeft(left: number) {
  try {
    localStorage.setItem(
      QUOTA_STORAGE_KEY,
      JSON.stringify({
        datePT: getPacificDateKey(),
        left: Math.max(0, Math.min(DAILY_QUESTION_LIMIT, left)),
      })
    );
  } catch {
    // Ignore storage error
  }
}

export default function App() {
  const [subject, setSubject] = useState<Subject>('General');
  const [ageBand, setAgeBand] = useState<AgeBand>('8-10');
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [autoReadAloud, setAutoReadAloud] = useState(true);
  const [voiceStyle, setVoiceStyle] = useState<VoiceStyle>('conversational-upbeat');
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'story' | 'daily' | 'lesson'>('chat');
  const [activeConceptLesson, setActiveConceptLesson] = useState<InteractiveConceptLesson | null>(null);

  // Authentication states
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Scroll-to-bottom button states
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [userScrolledUp, setUserScrolledUp] = useState(false);

  // 4 or 5 question quiz state
  const [quizState, setQuizState] = useState<{
    isOpen: boolean;
    topic: string;
    contextContent: string;
    numQuestions: 4 | 5;
  }>({
    isOpen: false,
    topic: '',
    contextContent: '',
    numQuestions: 4,
  });

  // Daily puzzle challenge and flame streak
  const [streak, setStreak] = useState<StreakData>(() => loadStreakData());
  const [showDailyModal, setShowDailyModal] = useState(false);

  // Daily free AI questions left (20/day, auto-resets at 12:00 AM Pacific Time)
  const [questionsLeft, setQuestionsLeft] = useState<number>(() => loadLocalQuestionsLeft());
  const [resetTimeLabel, setResetTimeLabel] = useState<string>(() =>
    getLocalPacificMidnightLabel()
  );

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial-welcome',
      role: 'assistant',
      content: "Hi! I'm Tutorly, your book learning buddy. What would you like to learn today?",
      timestamp: new Date(),
    },
  ]);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const typingTimerRef = useRef<any>(null);

  // Initialize Voice Engine & preload voices
  useEffect(() => {
    initVoiceEngine();
  }, []);

  // Sync daily questions left with server & auto-reset when Pacific Time date rolls over
  useEffect(() => {
    const syncQuotaFromServer = () => {
      setResetTimeLabel(getLocalPacificMidnightLabel());
      const token = localStorage.getItem('tutorly_token');
      fetch('/api/quota', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (typeof data?.questionsLeft === 'number') {
            setQuestionsLeft(data.questionsLeft);
            saveLocalQuestionsLeft(data.questionsLeft);
          }
        })
        .catch(() => {
          const localLeft = loadLocalQuestionsLeft();
          setQuestionsLeft(localLeft);
        });
    };

    syncQuotaFromServer();
    window.addEventListener('tutorly-quota-sync', syncQuotaFromServer);
    const timer = setInterval(syncQuotaFromServer, 60_000);
    return () => {
      window.removeEventListener('tutorly-quota-sync', syncQuotaFromServer);
      clearInterval(timer);
    };
  }, [currentUser]);

  // Check saved authentication session
  useEffect(() => {
    const token = localStorage.getItem('tutorly_token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) {
            setCurrentUser(data.user);
            if (data.user.ageBand && AGE_BANDS.includes(data.user.ageBand as AgeBand)) {
              setAgeBand(data.user.ageBand as AgeBand);
            }
          } else {
            localStorage.removeItem('tutorly_token');
          }
        })
        .catch(() => {});
    }
  }, []);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRec =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRec) {
      setSpeechSupported(true);
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Handle user scrolling inside the chat window
  const handleChatScroll = () => {
    const el = chatContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - (el.scrollTop + el.clientHeight);
    // User is considered scrolled up if more than 100px from the bottom
    const isUp = distanceFromBottom > 100;
    setShowScrollBottom(isUp);
    setUserScrolledUp(isUp);
  };

  // Smooth scroll to bottom helper
  const scrollToBottom = (smooth = true) => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    } else {
      chatEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
    setShowScrollBottom(false);
    setUserScrolledUp(false);
  };

  // Auto-scroll to bottom only when child hasn't explicitly scrolled up to read earlier responses
  useEffect(() => {
    if (!userScrolledUp) {
      scrollToBottom(false);
    }
  }, [messages, isThinking, userScrolledUp]);

  // Log out user
  const handleLogout = async () => {
    const token = localStorage.getItem('tutorly_token');
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
      localStorage.removeItem('tutorly_token');
    }
    setCurrentUser(null);
    setShowUserDropdown(false);
    playChime('pop');
  };

  // Open 4 or 5 question quiz on the answered topic
  const openQuiz = (assistantMsg: Message, count: 4 | 5) => {
    const msgIdx = messages.findIndex((m) => m.id === assistantMsg.id);
    const userMsg = msgIdx > 0 ? messages[msgIdx - 1]?.content : '';

    let topicName = userMsg ? userMsg.slice(0, 50).replace(/[?!.]+$/, '').trim() : subject;
    const detected = detectExplainTopic(userMsg);
    if (detected) {
      topicName = detected;
    }

    setQuizState({
      isOpen: true,
      topic: topicName || subject,
      contextContent: assistantMsg.content,
      numQuestions: count,
    });
    playChime('pop');
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
      }
      stopSpeaking();
    };
  }, []);

  // Natural bold & energetic speech playback
  const speakText = (text: string, msgId: string, preloadedAudio?: string | null) => {
    if (speakingMsgId === msgId) {
      stopSpeaking();
      setSpeakingMsgId(null);
      return;
    }

    setSpeakingMsgId(msgId);
    speakNaturalSentences({
      text,
      style: voiceStyle,
      preloadedAudioBase64: preloadedAudio,
      onStart: () => setSpeakingMsgId(msgId),
      onEnd: () => setSpeakingMsgId(null),
      onError: () => setSpeakingMsgId(null),
    });
  };

  // Streaming typewriter effect synchronized with speech playback
  const streamTutorResponse = (fullText: string, msgId: string, initialAudio?: string | null) => {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }

    // 1. Immediately start hearing the answer with high-fidelity studio voice!
    if (autoReadAloud) {
      speakText(fullText, msgId, initialAudio);
    }

    // 2. Insert initial assistant bubble with empty content and isTyping flag
    const initialTutorMsg: Message = {
      id: msgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true,
    };

    setMessages((prev) => [...prev, initialTutorMsg]);
    setIsThinking(false);

    if (soundEnabled) {
      playChime('success');
    }

    // 3. Reveal tokens smoothly in sync with speech
    const tokens = fullText.match(/\S+|\s+/g) || [fullText];
    let tokenIndex = 0;

    typingTimerRef.current = setInterval(() => {
      tokenIndex += 1;
      const currentChunk = tokens.slice(0, tokenIndex).join('');
      const isStillTyping = tokenIndex < tokens.length;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? {
                ...m,
                content: currentChunk,
                isTyping: isStillTyping,
              }
            : m
        )
      );

      if (!isStillTyping) {
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }
    }, 45);
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleSend = async (contentToSend?: string) => {
    const textToSend = (contentToSend ?? input).trim();
    if (!textToSend || isThinking) return;

    if (soundEnabled) {
      playChime('pop');
    }

    setInput('');
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    // Stop ongoing speech
    stopSpeaking();
    setSpeakingMsgId(null);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    // Append child's message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsThinking(true);

    // Detect keyword "explain ____" and show in interactive zone
    const explainTopic = detectExplainTopic(textToSend);
    if (explainTopic) {
      const lesson = getInteractiveLessonForTopic(explainTopic, ageBand);
      setActiveConceptLesson(lesson);
      setActiveTab('lesson');
      if (soundEnabled) {
        playChime('success');
      }
    }

    try {
      // Prepare payload: array of { role: "user" | "assistant", content }
      const apiMessages = updatedMessages
        .filter((m) => !m.isError)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const token = localStorage.getItem('tutorly_token');
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: apiMessages,
          subject,
          ageBand,
          voiceStyle,
          wantVoice: autoReadAloud,
        }),
      });

      let data: any = null;
      try {
        const text = await res.text();
        data = JSON.parse(text);
      } catch {
        data = null;
      }

      if (!res.ok) {
        if (typeof data?.questionsLeft === 'number') {
          setQuestionsLeft(data.questionsLeft);
          saveLocalQuestionsLeft(data.questionsLeft);
        }
        if (res.status === 404 && !data) {
          throw new Error(
            'AI Chat server (/api/chat) is not running on this host yet. Deploy the full project with Netlify Functions + GEMINI_API_KEY — or use Interactive Lab, Story Mode & Daily Challenge below! 🌟'
          );
        }
        throw new Error(
          data?.error ||
          'Tutorly took a quick pause to think. Please try asking again in a moment! 🌟'
        );
      }

      const tutorReply = typeof data?.reply === 'string' ? data.reply.trim() : '';
      if (!tutorReply) {
        throw new Error(
          'Tutorly did not receive an answer right now. Please tap Try Again in a moment! 🌟'
        );
      }
      if (typeof data?.questionsLeft === 'number') {
        setQuestionsLeft(data.questionsLeft);
        saveLocalQuestionsLeft(data.questionsLeft);
      } else {
        setQuestionsLeft((prev) => {
          const next = Math.max(0, prev - 1);
          saveLocalQuestionsLeft(next);
          return next;
        });
      }
      const tutorAudio = data?.audio || null;
      const tutorMsgId = `assistant-${Date.now()}`;

      // Stream typewriter text and hear audio immediately as it starts typing!
      streamTutorResponse(tutorReply, tutorMsgId, tutorAudio);
    } catch (err: any) {
      setIsThinking(false);
      let errorMessage = err?.message || 'Tutorly is taking a quick breath. Please try again in a moment! 🌟';

      // Clean raw HTML or JSON parse syntax errors into friendly language for children
      if (
        typeof errorMessage === 'string' &&
        (errorMessage.includes('Unexpected token') ||
          errorMessage.includes('is not valid JSON') ||
          errorMessage.includes('Failed to fetch') ||
          errorMessage.includes('doctype'))
      ) {
        errorMessage = 'Tutorly is taking a quick breath. Please tap Send again in a moment! 🌟';
      }

      // Rule: "On an error, show the server's error text in a tutor bubble and remove the last child message from the list so they can try again."
      setMessages((prev) => {
        const withoutLastChild = prev.filter((m) => m.id !== userMessage.id);
        return [
          ...withoutLastChild,
          {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: `⚠️ ${errorMessage}`,
            timestamp: new Date(),
            isError: true,
          },
        ];
      });

      // Restore child's typed text into input box so they can easily retry or edit
      setInput(textToSend);
    } finally {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const handleResetChat = () => {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    stopSpeaking();
    setSpeakingMsgId(null);

    setMessages([
      {
        id: `initial-${Date.now()}`,
        role: 'assistant',
        content: `Hi! I'm Tutorly! Ready to explore ${subject} with you! What would you like to ask or practice?`,
        timestamp: new Date(),
      },
    ]);
    setInput('');
  };

  const currentSubjectInfo = SUBJECT_DETAILS[subject];
  const quickPrompts = currentSubjectInfo?.quickPrompts[ageBand] || [];
  const hasBigFeelings = messages.some(
    (m) => m.role === 'user' && detectFeelingsOrDistress(m.content)
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      {/* Crisp White Header with Blue Brand & Green/Gold Accents */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b-2 border-slate-200/90 px-4 py-3 sm:py-4 shadow-xs">
        <div className="max-w-4xl mx-auto flex flex-col gap-2.5">
          {/* Top Row: Tutorly Brand on left + Questions Left Counter right beside it */}
          <div className="flex items-center justify-between gap-3">
            {/* Logo / Mascot Title */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 sm:w-13 sm:h-13 shrink-0 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 text-white flex items-center justify-center shadow-md shadow-blue-600/20 border-2 border-white select-none">
                <BookIcon size="lg" animated className="text-white" withGoldBookmark={true} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black">
                    Tutorly
                  </h1>
                  {/* Little Green Accent: Kid-Safe Badge */}
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Kid Safe</span>
                    {/* Little Gold Accent: Tiny Sparkle */}
                    <Sparkles className="w-3 h-3 text-amber-500" />
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium hidden sm:block truncate">
                  Ask me anything — science, stories, games, how things work & more!
                </p>
              </div>
            </div>

            {/* Questions Left Counter (top-right beside Tutorly) */}
            <div
              className={`shrink-0 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl border-2 flex items-center gap-2 shadow-2xs transition-colors ${
                questionsLeft === 0
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : questionsLeft <= 5
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-blue-50/90 border-blue-200 text-blue-950'
              }`}
              title={`Free daily AI questions reset at ${resetTimeLabel} your time (12:00 AM Pacific Time)`}
            >
              <HelpCircle
                className={`w-4 h-4 shrink-0 ${
                  questionsLeft === 0
                    ? 'text-rose-500'
                    : questionsLeft <= 5
                    ? 'text-amber-600'
                    : 'text-blue-600'
                }`}
              />
              <div className="leading-tight">
                <div className="text-xs sm:text-sm font-black tracking-tight whitespace-nowrap">
                  Questions left: <span className="tabular-nums">{questionsLeft}</span>
                </div>
                <div className="text-[10px] font-bold opacity-75 whitespace-nowrap">
                  Resets {resetTimeLabel}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Header Utilities */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-1.5 sm:gap-2">
            {/* Auto Read-Aloud Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !autoReadAloud;
                setAutoReadAloud(next);
                if (!next) {
                  stopSpeaking();
                  setSpeakingMsgId(null);
                }
              }}
              title={autoReadAloud ? 'Voice read is ON (speaks as it types)' : 'Voice read is muted'}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border-2 transition-all cursor-pointer ${
                autoReadAloud
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <Volume2 className={`w-4 h-4 ${autoReadAloud ? 'text-amber-300' : ''}`} />
              <span className="hidden md:inline">{autoReadAloud ? 'Voice: ON' : 'Voice: OFF'}</span>
            </button>

            {/* Voice Style Picker (Bold & Energetic, Upbeat Explorer, Storyteller) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowVoiceMenu((prev) => !prev)}
                title="Change Tutorly's voice style"
                className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-800 transition-all cursor-pointer shadow-2xs"
              >
                <span className="text-sm select-none">{VOICE_STYLES[voiceStyle].emoji}</span>
                <span className="hidden lg:inline">{VOICE_STYLES[voiceStyle].label}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showVoiceMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border-2 border-blue-200 p-2 z-50 text-left animate-fade-in">
                  <div className="px-2.5 py-1.5 text-[11px] font-black uppercase text-blue-900 tracking-wider">
                    Voice Style
                  </div>
                  {(Object.keys(VOICE_STYLES) as VoiceStyle[]).map((vKey) => {
                    const cfg = VOICE_STYLES[vKey];
                    const isSelected = voiceStyle === vKey;
                    return (
                      <button
                        key={vKey}
                        type="button"
                        onClick={() => {
                          setVoiceStyle(vKey);
                          setShowVoiceMenu(false);
                          stopSpeaking();
                          speakNaturalSentences({
                            text:
                              vKey === 'conversational-upbeat'
                                ? "Hi! I'm Tutorly. What would you like to explore and learn today?"
                                : vKey === 'bold-energetic'
                                ? "Hey! I'm Tutorly. Let's solve awesome puzzles together!"
                                : vKey === 'upbeat-explorer'
                                ? "Ready for an adventure? Let's discover something brand new!"
                                : "Curiosity and patience help us learn the greatest ideas in science.",
                            style: vKey,
                            onStart: () => setSpeakingMsgId('voice-sample'),
                            onEnd: () => setSpeakingMsgId(null),
                          });
                        }}
                        className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-blue-50 border border-blue-300 text-blue-950 font-bold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="text-lg select-none mt-0.5">{cfg.emoji}</span>
                        <div>
                          <div className="text-xs font-black flex items-center gap-1">
                            <span>{cfg.label}</span>
                            {isSelected && (
                              <span className="text-blue-600 text-[10px] bg-blue-100 px-1.5 py-0.5 rounded-full font-bold">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-normal leading-tight mt-0.5">
                            {cfg.tagline}
                          </div>
                          {cfg.artistNote && (
                            <div className="text-[10px] text-blue-600/80 font-medium mt-0.5">
                              {cfg.artistNote}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sound Effects Toggle with Emerald Green active state */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Sound effects on' : 'Sound effects muted'}
              className="p-2 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Reset / New Chat with Golden Amber accent */}
            <button
              type="button"
              onClick={handleResetChat}
              title="Start a fresh conversation"
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 bg-white border-2 border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">New Topic</span>
            </button>

            {/* Daily Challenge & Flame Streak Counter */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('daily');
                playChime('pop');
              }}
              title={
                streak.lastCompletedDate === getLocalDateString()
                  ? `Today's puzzle completed! Current streak: ${streak.currentStreak} day${streak.currentStreak === 1 ? '' : 's'}`
                  : `Daily Challenge! Keep your ${streak.currentStreak}-day streak alive 🔥`
              }
              className={`p-1.5 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 border-2 transition-all cursor-pointer shadow-2xs ${
                streak.lastCompletedDate === getLocalDateString()
                  ? 'bg-amber-50/90 border-amber-300 text-amber-900 shadow-amber-200/40 hover:bg-amber-100'
                  : streak.currentStreak > 0
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-400 shadow-md shadow-orange-500/25 hover:brightness-105 animate-pulse'
                  : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <Flame
                className={`w-4 h-4 transition-transform ${
                  streak.lastCompletedDate === getLocalDateString()
                    ? 'text-amber-500 fill-amber-400'
                    : streak.currentStreak > 0
                    ? 'text-yellow-200 fill-yellow-200 scale-110'
                    : 'text-orange-500 fill-orange-400'
                }`}
              />
              <span className="font-black text-sm tracking-tight">{streak.currentStreak}</span>
              <span className="hidden md:inline text-xs font-bold">
                {streak.lastCompletedDate === getLocalDateString() ? 'Done ✨' : 'Daily'}
              </span>
            </button>

            {/* User Account / Sign In */}
            {currentUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserDropdown((prev) => !prev)}
                  className="p-1.5 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 border-2 border-blue-200 bg-blue-50/90 hover:bg-blue-100 text-blue-900 transition-all cursor-pointer shadow-2xs"
                  title="Your student profile"
                >
                  <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
                    {currentUser.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline font-black max-w-[100px] truncate">
                    {currentUser.username}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border-2 border-blue-200 p-3 z-50 animate-fade-in text-left">
                    <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
                      <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-lg">
                        {currentUser.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-black text-sm text-slate-900 truncate">
                          {currentUser.username}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {currentUser.email}
                        </div>
                      </div>
                    </div>

                    <div className="py-2.5 text-xs text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Account:</span>
                        <span className="font-bold text-slate-800">Student Learner</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Age Band:</span>
                        <span className="font-bold text-slate-800">Age {currentUser.ageBand || ageBand}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full mt-1 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border-2 border-blue-600 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-xs transition-all cursor-pointer"
                title="Log in or create a student account"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Top Dropdowns: Subject and Age Band */}
        <div className="max-w-4xl mx-auto mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Subject Dropdown */}
          <div className="flex-1 min-w-[170px] sm:min-w-[220px]">
            <label
              htmlFor="subject-select"
              className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Subject</span>
            </label>
            <div className="relative">
              <select
                id="subject-select"
                value={subject}
                onChange={(e) => setSubject(e.target.value as Subject)}
                aria-label="Subject"
                className="w-full font-bold text-base sm:text-lg rounded-2xl border-2 border-slate-200 bg-white text-slate-900 py-2.5 sm:py-3 pl-3.5 pr-8 appearance-none focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all cursor-pointer shadow-2xs"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {SUBJECT_DETAILS[s].icon} {s}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Age Group Dropdown */}
          <div className="flex-1 min-w-[150px] sm:min-w-[190px]">
            <label
              htmlFor="age-select"
              className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5"
            >
              {/* Little Gold Accent: Smile icon */}
              <Smile className="w-3.5 h-3.5 text-amber-500" />
              <span>Age Group</span>
            </label>
            <div className="relative">
              <select
                id="age-select"
                value={ageBand}
                onChange={(e) => setAgeBand(e.target.value as AgeBand)}
                aria-label="Age group"
                className="w-full font-bold text-base sm:text-lg rounded-2xl border-2 border-slate-200 bg-white text-slate-900 py-2.5 sm:py-3 pl-3.5 pr-8 appearance-none focus:outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-400 transition-all cursor-pointer shadow-2xs"
              >
                {AGE_BANDS.map((a) => (
                  <option key={a} value={a}>
                    Age {a} {a === '5-7' ? '🌱' : a === '8-10' ? '🚀' : '🎓'}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Subject Chips Bar */}
        <div className="max-w-4xl mx-auto mt-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {SUBJECTS.map((s) => {
            const isSelected = subject === s;
            const details = SUBJECT_DETAILS[s];
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSubject(s)}
                className={`whitespace-nowrap px-3 py-1 rounded-xl text-xs sm:text-sm font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span>{details.icon}</span>
                <span>{s}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-3 sm:gap-4 overflow-hidden">
        {/* Mode Switcher: Tutor Chat vs. Story Adventure vs. Daily Challenge vs. Interactive Lab */}
        <div className="flex items-center justify-between gap-1 p-1 bg-slate-200/80 rounded-2xl w-full max-w-xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('chat');
              playChime('pop');
            }}
            className={`flex-1 py-2 px-2 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-black hover:bg-white/70'
            }`}
          >
            <span>💬</span>
            <span>Chat</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('story');
              playChime('pop');
            }}
            className={`flex-1 py-2 px-2 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
              activeTab === 'story'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-black hover:bg-white/70'
            }`}
          >
            <span>🚀</span>
            <span>Story Mode</span>
            <span
              className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                activeTab === 'story'
                  ? 'bg-amber-300 text-amber-950'
                  : 'bg-purple-100 text-purple-900'
              }`}
            >
              5-7 ⭐
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('daily');
              playChime('pop');
            }}
            className={`flex-1 py-2 px-2 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'daily'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                : 'text-slate-700 hover:text-black hover:bg-white/70'
            }`}
          >
            <span>🔥</span>
            <span>Daily</span>
            <span
              className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                activeTab === 'daily'
                  ? 'bg-white text-orange-600'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              {streak.currentStreak}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('lesson');
              playChime('pop');
            }}
            className={`flex-1 py-2 px-2 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'lesson'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-black hover:bg-white/70'
            }`}
          >
            <span>🎯</span>
            <span>Lab</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          </button>
        </div>

        {activeTab === 'story' ? (
          <StoryModeSection
            initialHeroName={currentUser?.username}
            subject={subject}
            currentTopic={
              activeConceptLesson?.title ||
              detectExplainTopic([...messages].reverse().find((m) => m.role === 'user')?.content || '') ||
              ((() => {
                const last = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
                return last.length >= 3 && last.length <= 40 ? last.replace(/[?!.]+$/, '').trim() : '';
              })()) ||
              (subject !== 'General' ? subject : 'Science and Nature')
            }
            onAskTutor={(prompt) => {
              setActiveTab('chat');
              handleSend(prompt);
            }}
            onPlaySound={playChime}
            autoReadAloud={autoReadAloud}
          />
        ) : activeTab === 'lesson' ? (
          <InteractiveLesson
            subject={subject}
            ageBand={ageBand}
            activeConceptLesson={activeConceptLesson}
            onSelectConceptLesson={setActiveConceptLesson}
            onAskTutor={(prompt) => {
              setActiveTab('chat');
              handleSend(prompt);
            }}
            onPlaySound={playChime}
          />
        ) : activeTab === 'daily' ? (
          <DailyChallengeSection
            puzzle={getDailyPuzzleForDate(getLocalDateString(), ageBand)}
            streak={streak}
            onStreakUpdate={setStreak}
            onPlaySound={playChime}
            onAskTutor={(prompt) => {
              setActiveTab('chat');
              handleSend(prompt);
            }}
          />
        ) : (
          <>
            {/* Chat Area Container with Floating Scroll-To-Bottom */}
            <div className="relative flex-1 flex flex-col min-h-0">
              <div
                id="chat"
                ref={chatContainerRef}
                onScroll={handleChatScroll}
                role="log"
                aria-live="polite"
                aria-label="Conversation with tutor"
                className="flex-1 bg-white rounded-3xl border-2 border-slate-200 p-3.5 sm:p-6 shadow-sm overflow-y-auto flex flex-col gap-4 sm:gap-5 min-h-[350px] sm:min-h-[460px]"
              >
          {/* Subtle Subject Description Banner */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-lg">{currentSubjectInfo.icon}</span>
              <span>
                <strong className="text-black">{subject}:</strong> {currentSubjectInfo.description} (Age {ageBand})
              </span>
            </div>
            {/* Little Green Accent: Kid-Safe Indicator */}
            <div className="hidden sm:flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kid-Safe Mode</span>
            </div>
          </div>

          {/* Story Mode Hero Banner (Featured prominently when ageBand is 5-7) */}
          {ageBand === '5-7' && (
            <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 border-2 border-purple-200 text-xs sm:text-sm shadow-2xs animate-fade-in">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center text-lg shadow-xs shrink-0">
                  🚀
                </div>
                <div>
                  <div className="font-black text-purple-950 flex items-center gap-1.5 flex-wrap">
                    <span>Story Adventure Mode is Ready!</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-200 text-purple-900">
                      You are the Hero! 🌟
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-900/80 mt-0.5 font-medium">
                    Embark on space, dinosaur, and ocean quests where every choice needs your math or science powers!
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('story');
                  playChime('pop');
                }}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-black text-xs shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer transition-all ml-2"
              >
                <span>Play Story Mode</span>
                <span>⭐</span>
              </button>
            </div>
          )}

          {/* Daily Challenge Card / Streak Status */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/70 border-2 border-amber-300/80 text-xs sm:text-sm shadow-2xs animate-fade-in">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs ${
                  streak.lastCompletedDate === getLocalDateString()
                    ? 'bg-amber-400 text-amber-950'
                    : 'bg-gradient-to-tr from-orange-500 to-amber-500'
                }`}
              >
                <Flame
                  className={`w-5 h-5 ${
                    streak.lastCompletedDate === getLocalDateString()
                      ? 'fill-amber-600 text-amber-700'
                      : 'fill-yellow-200 text-yellow-100 animate-pulse'
                  }`}
                />
              </div>
              <div>
                <div className="font-black text-amber-950 flex items-center gap-1.5 flex-wrap">
                  <span>
                    {streak.lastCompletedDate === getLocalDateString()
                      ? "Today's Daily Puzzle Solved!"
                      : "Today's Daily Brain Puzzle is Ready!"}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                    {streak.currentStreak > 0
                      ? `${streak.currentStreak}-Day Streak 🔥`
                      : 'Start your streak! 🚀'}
                  </span>
                </div>
                <p className="text-[11px] text-amber-900/80 mt-0.5">
                  {streak.lastCompletedDate === getLocalDateString()
                    ? `Great job! Your flame is burning bright at ${streak.currentStreak} day${streak.currentStreak === 1 ? '' : 's'}. Come back tomorrow to keep it going!`
                    : streak.currentStreak > 0
                    ? `Don't break your streak! Answer today's quick riddle to keep your flame glowing.`
                    : `One new puzzle every day. Solve today's puzzle to ignite your flame!`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveTab('daily');
                playChime('pop');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all ml-2"
            >
              <span>{streak.lastCompletedDate === getLocalDateString() ? 'View Puzzle' : 'Play Today'}</span>
              <span>🔥</span>
            </button>
          </div>

          {/* Interactive Zone Concept Ready Banner */}
          {activeConceptLesson && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-amber-50 border-2 border-blue-200 text-xs sm:text-sm shadow-xs animate-fade-in">
              <div className="flex items-center gap-2">
                <span className="text-xl select-none">{activeConceptLesson.icon}</span>
                <span>
                  Interactive model active for <strong className="text-blue-900">{activeConceptLesson.title}</strong>!
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('lesson');
                  playChime('pop');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <span>View in Interactive Zone 🎯</span>
              </button>
            </div>
          )}
 
          {/* Comforting Trusted Adult Guidance Banner */}
          {hasBigFeelings && (
            <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs sm:text-sm shadow-xs animate-fade-in">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-white flex items-center justify-center shrink-0 font-bold text-lg shadow-2xs select-none">
                💛
              </div>
              <div className="flex-1">
                <div className="font-black text-amber-950 text-sm sm:text-base flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-amber-600 fill-amber-500" />
                  <span>It's completely okay to have big feelings</span>
                </div>
                <p className="text-amber-900 text-xs sm:text-sm leading-relaxed mt-0.5">
                  Whenever you feel sad, angry, scared, worried, or overwhelmed, talking to a <strong>trusted adult</strong> — like a parent, guardian, teacher, or school counselor — is the best thing you can do. You never have to handle big feelings all by yourself!
                </p>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isAssistant = msg.role === 'assistant';
            const isSpeaking = speakingMsgId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 sm:gap-3 items-end max-w-[94%] sm:max-w-[85%] ${
                  isUser ? 'self-end flex-row-reverse' : 'self-start flex-row'
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex-shrink-0 flex items-center justify-center text-lg sm:text-xl border-2 select-none shadow-xs ${
                    isUser
                      ? 'bg-amber-100 border-amber-400 text-amber-700'
                      : 'bg-blue-600 border-blue-500 text-white'
                  }`}
                  aria-hidden="true"
                >
                  {isUser ? (
                    '⭐'
                  ) : (
                    <BookIcon size="sm" className="text-white" withGoldBookmark={true} />
                  )}
                </div>

                {/* Message Bubble */}
                <div className="flex flex-col group">
                  <div
                    className={`px-4 py-3 sm:px-5 sm:py-4 rounded-3xl text-lg sm:text-xl md:text-[21px] font-medium leading-relaxed break-words whitespace-pre-wrap shadow-sm hover:shadow-md transition-all ${
                      isUser
                        ? 'bg-gradient-to-br from-amber-50 via-white to-amber-50/70 text-slate-950 border-2 border-amber-400/90 rounded-br-sm'
                        : msg.isError
                        ? 'bg-rose-50 text-rose-950 border-2 border-rose-300 rounded-bl-sm'
                        : 'bg-gradient-to-br from-blue-50 via-white to-blue-50/80 text-slate-950 border-2 border-blue-200 rounded-bl-sm'
                    }`}
                  >
                    <FormattedChatMessage
                      content={msg.content}
                      isAssistant={isAssistant && !msg.isError}
                      isTyping={msg.isTyping}
                      onAskTutor={(prompt) => handleSend(prompt)}
                      onPlaySound={playChime}
                    />
                  </div>

                  {/* Actions under bubble (Read Aloud & Quiz Options) */}
                  {isAssistant && !msg.isError && (
                    <div className="flex flex-col gap-2 mt-1.5 px-1">
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => speakText(msg.content, msg.id)}
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                            isSpeaking
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
                          }`}
                          title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{isSpeaking ? 'Stop voice' : 'Listen'}</span>
                        </button>

                        {isSpeaking && (
                          <span className="text-xs font-bold text-blue-600 flex items-center gap-1.5 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                            <span>Speaking as it types…</span>
                          </span>
                        )}
                      </div>

                      {/* Option for 4-question quiz or 5-question quiz */}
                      {!msg.isTyping && msg.id !== 'initial-welcome' && (
                        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <span>Quiz on this:</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => openQuiz(msg, 4)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 flex items-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95 transition-all cursor-pointer"
                            title="Take a 4-question quiz on what Tutorly just answered"
                          >
                            <span>🎯 4-Question Quiz</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openQuiz(msg, 5)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-900 flex items-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95 transition-all cursor-pointer"
                            title="Take a 5-question quiz on what Tutorly just answered"
                          >
                            <span>🏆 5-Question Quiz</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Retry & built-in free learning mode actions for error bubble */}
                  {msg.isError && (
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 px-1">
                      {Boolean(input.trim()) && (
                        <button
                          type="button"
                          onClick={() => handleSend()}
                          className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Tap to Try Again</span>
                        </button>
                      )}
                      {!currentUser && (
                        <button
                          type="button"
                          onClick={() => setShowAuthModal(true)}
                          className="text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Sign In (Free!)</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('lesson');
                          playChime('pop');
                        }}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 transition-colors cursor-pointer"
                      >
                        🧪 Interactive Lab
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('story');
                          playChime('pop');
                        }}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-900 transition-colors cursor-pointer"
                      >
                        📖 Story Mode
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('daily');
                          playChime('pop');
                        }}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 transition-colors cursor-pointer"
                      >
                        🔥 Daily Challenge
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Thinking / Waiting indicator */}
          {isThinking && (
            <div className="flex gap-2.5 sm:gap-3 items-end max-w-[85%] self-start animate-fade-in">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex-shrink-0 flex items-center justify-center text-lg sm:text-xl border-2 bg-blue-600 border-blue-500 text-white select-none shadow-xs">
                <BookIcon size="sm" className="text-white animate-pulse" withGoldBookmark={true} />
              </div>
              <div className="px-5 py-3.5 rounded-3xl bg-gradient-to-br from-blue-50 via-white to-blue-50/80 text-slate-950 border-2 border-blue-200 rounded-bl-sm text-lg sm:text-xl flex items-center gap-2.5 shadow-sm">
                <span className="font-bold text-blue-600">Thinking…</span>
                <span className="flex gap-1.5 items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-bounce" />
                </span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
              </div>

              {/* Floating scroll-to-bottom button: appears only when child scrolls up */}
              {showScrollBottom && (
                <button
                  type="button"
                  onClick={() => scrollToBottom(true)}
                  className="absolute bottom-4 right-4 sm:right-6 z-20 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-xs sm:text-sm shadow-xl shadow-blue-600/35 border-2 border-white flex items-center gap-2 cursor-pointer transition-all animate-bounce"
                  title="Return to latest message"
                  aria-label="Scroll to latest message"
                >
                  <ArrowDown className="w-4 h-4 text-amber-300 stroke-[3]" />
                  <span>
                    {isThinking
                      ? 'Tutor thinking… ↓'
                      : speakingMsgId
                      ? 'Tutor speaking… ↓'
                      : 'Latest message ↓'}
                  </span>
                </button>
              )}
            </div>

        {/* Quick Inspiration Prompts (Click to Ask) */}
        {quickPrompts.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>Try asking:</span>
              </span>
              <span className="text-[11px] font-bold text-blue-600">Tap to ask directly</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <button
                type="button"
                disabled={isThinking}
                onClick={() => handleSend('Explain photosynthesis')}
                className="whitespace-nowrap px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 text-emerald-900 transition-all shadow-2xs active:scale-95 cursor-pointer text-left shrink-0"
              >
                <span>🌱 Explain Photosynthesis</span>
              </button>
              <button
                type="button"
                disabled={isThinking}
                onClick={() => handleSend('Explain fractions')}
                className="whitespace-nowrap px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 text-amber-900 transition-all shadow-2xs active:scale-95 cursor-pointer text-left shrink-0"
              >
                <span>🍕 Explain Fractions</span>
              </button>
              <button
                type="button"
                disabled={isThinking}
                onClick={() => handleSend('Explain gravity')}
                className="whitespace-nowrap px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold bg-blue-50 hover:bg-blue-100 border-2 border-blue-300 text-blue-900 transition-all shadow-2xs active:scale-95 cursor-pointer text-left shrink-0"
              >
                <span>🪐 Explain Gravity</span>
              </button>
              <button
                type="button"
                disabled={isThinking}
                onClick={() => handleSend('Explain coding loops')}
                className="whitespace-nowrap px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold bg-cyan-50 hover:bg-cyan-100 border-2 border-cyan-300 text-cyan-900 transition-all shadow-2xs active:scale-95 cursor-pointer text-left shrink-0"
              >
                <span>🔁 Explain Loops</span>
              </button>
              {quickPrompts.map((promptText, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isThinking}
                  onClick={() => handleSend(promptText)}
                  className="whitespace-nowrap px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold bg-white hover:bg-blue-50/60 border-2 border-slate-200 hover:border-blue-300 text-slate-800 transition-all shadow-2xs active:scale-95 disabled:opacity-50 text-left shrink-0"
                >
                  <span className="mr-1 text-amber-500">💡</span>
                  <span>{promptText}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form Input Area */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 sm:gap-3"
        >
          {/* Main Input Text Box - Multi-line auto-expanding textarea */}
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              id="message-input"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (!isThinking && input.trim()) {
                    handleSend();
                  }
                }
              }}
              placeholder="Ask me anything! (science, games, space, animals, history, code...)"
              maxLength={1500}
              autoComplete="off"
              disabled={isThinking}
              aria-label="Your message"
              className="w-full text-base sm:text-lg md:text-xl rounded-2xl sm:rounded-3xl border-2 border-slate-300 bg-white text-black py-3 sm:py-3.5 pl-4 sm:pl-5 pr-12 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-xs disabled:bg-slate-50 placeholder:text-slate-400 resize-none min-h-[52px] max-h-[140px] leading-relaxed"
            />

            {/* Voice Dictation Button (Microphone) with Green active indicator */}
            {speechSupported && (
              <button
                type="button"
                onClick={toggleVoiceInput}
                disabled={isThinking}
                className={`absolute right-2.5 top-3.5 p-2 sm:p-2.5 rounded-xl transition-all ${
                  isListening
                    ? 'bg-emerald-600 text-white animate-pulse'
                    : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                }`}
                title={isListening ? 'Listening... click to stop' : 'Speak with your microphone'}
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Big Blue Send Button */}
          <button
            type="submit"
            disabled={isThinking || !input.trim()}
            className="h-14 sm:h-16 px-5 sm:px-8 rounded-2xl sm:rounded-3xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-95 text-white font-black text-lg sm:text-xl flex items-center justify-center gap-2 border-2 border-blue-600 shadow-md shadow-blue-600/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 transition-all cursor-pointer"
            aria-label="Send message"
          >
            <span>Send</span>
            <Send className="w-5 h-5" />
          </button>
        </form>
        </>
        )}

        {/* Footer Note with Gold & Green accents */}
        <footer className="py-1 text-center">
          <p className="text-xs sm:text-sm text-slate-500 font-semibold flex items-center justify-center gap-1.5">
            <span className="text-amber-500">🧸</span>
            <span>Ask a grown-up for help</span>
            <span className="text-slate-300">•</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
            <span>Tutorly never asks for personal information</span>
          </p>
        </footer>
      </main>

      {/* User Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          if (user.ageBand && AGE_BANDS.includes(user.ageBand as AgeBand)) {
            setAgeBand(user.ageBand as AgeBand);
          }
        }}
        defaultAgeBand={ageBand}
      />

      {/* 4 or 5 Question Quiz Modal */}
      <QuizModal
        isOpen={quizState.isOpen}
        onClose={() => setQuizState((prev) => ({ ...prev, isOpen: false }))}
        topic={quizState.topic}
        contextContent={quizState.contextContent}
        numQuestions={quizState.numQuestions}
        ageBand={ageBand}
        onPlaySound={playChime}
        onAskTutor={(prompt) => {
          setQuizState((prev) => ({ ...prev, isOpen: false }));
          handleSend(prompt);
        }}
        onChangeNumQuestions={(n) =>
          setQuizState((prev) => ({ ...prev, numQuestions: n }))
        }
      />

      {/* Daily Challenge & Flame Streak Modal */}
      <DailyChallengeModal
        isOpen={showDailyModal}
        onClose={() => setShowDailyModal(false)}
        puzzle={getDailyPuzzleForDate(getLocalDateString(), ageBand)}
        streak={streak}
        onStreakUpdate={setStreak}
        onPlaySound={playChime}
        onAskTutor={(prompt) => {
          setShowDailyModal(false);
          handleSend(prompt);
        }}
      />
    </div>
  );
}
