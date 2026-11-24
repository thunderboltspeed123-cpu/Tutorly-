// Specialized Voice Engine for Tutorly
// Delivers a bold, energetic, and human-like natural voice experience for children

export type VoiceStyle =
  | 'conversational-upbeat'
  | 'bold-energetic'
  | 'upbeat-explorer'
  | 'deep-storyteller';

export interface VoiceStyleConfig {
  id: VoiceStyle;
  label: string;
  tagline: string;
  artistNote?: string;
  emoji: string;
  rate: number;
  pitch: number;
  preferredVoices: string[];
}

export const VOICE_STYLES: Record<VoiceStyle, VoiceStyleConfig> = {
  'conversational-upbeat': {
    id: 'conversational-upbeat',
    label: 'Akisha (Upbeat & Clear)',
    tagline: 'Conversational, warm, and articulate young adult tone',
    artistNote: 'Modeled after Akisha Archer (Voice #1: TV Ad / Upbeat Conversational)',
    emoji: '🎙️',
    rate: 1.03,
    pitch: 1.06,
    preferredVoices: [
      'Microsoft Jenny Online (Natural)',
      'Microsoft Aria Online (Natural)',
      'Microsoft Michelle Online (Natural)',
      'Google US English',
      'Samantha (Enhanced)',
      'Samantha',
      'Ava (Premium)',
      'Ava (Enhanced)',
      'Ava',
      'Victoria',
      'Allison (Enhanced)',
      'Allison',
      'Microsoft Zira Desktop',
      'Google UK English Female',
      'en-US-Neural2-F',
      'en-US-Wavenet-D',
      'en-US-Standard-C',
    ],
  },
  'bold-energetic': {
    id: 'bold-energetic',
    label: 'Bold & Energetic',
    tagline: 'Confident, punchy, and lively tutor tone',
    emoji: '⚡',
    rate: 1.05,
    pitch: 0.98,
    preferredVoices: [
      'Microsoft Guy Online (Natural)',
      'Microsoft Christopher Online (Natural)',
      'Microsoft Eric Online (Natural)',
      'Google US English Male',
      'Google UK English Male',
      'Alex',
      'Daniel (Enhanced)',
      'Oliver',
      'Evan',
      'Nathan',
      'Tom',
    ],
  },
  'upbeat-explorer': {
    id: 'upbeat-explorer',
    label: 'Upbeat Explorer',
    tagline: 'Bright, enthusiastic, and curious guide',
    emoji: '🚀',
    rate: 1.08,
    pitch: 1.03,
    preferredVoices: [
      'Google US English',
      'Microsoft Jenny Online (Natural)',
      'Microsoft Aria Online (Natural)',
      'Samantha (Enhanced)',
      'Victoria',
      'Karen',
    ],
  },
  'deep-storyteller': {
    id: 'deep-storyteller',
    label: 'Storyteller',
    tagline: 'Warm, rich, and resonant narrative voice',
    emoji: '📖',
    rate: 0.98,
    pitch: 0.93,
    preferredVoices: [
      'Microsoft Christopher Online (Natural)',
      'Daniel',
      'Alex',
      'Fred',
      'Oliver',
    ],
  },
};

// Global voice cache
let cachedVoices: SpeechSynthesisVoice[] = [];
let hasSubscribedVoices = false;

export function initVoiceEngine() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  const load = () => {
    try {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length) {
        cachedVoices = v;
      }
    } catch {
      // ignore
    }
  };

  load();
  if (!hasSubscribedVoices && 'onvoiceschanged' in window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = load;
    hasSubscribedVoices = true;
  }
}

// Select the most human-like, energetic voice matching preferences
export function pickBestVoice(style: VoiceStyle): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = cachedVoices.length ? cachedVoices : window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const config = VOICE_STYLES[style] || VOICE_STYLES['conversational-upbeat'];
  const isFemaleStyle = style === 'conversational-upbeat' || style === 'upbeat-explorer';

  // 1. Try exact matches from preferred voice list
  for (const preferred of config.preferredVoices) {
    const match = voices.find(
      (v) => v.name.toLowerCase().includes(preferred.toLowerCase()) && v.lang.startsWith('en')
    );
    if (match) return match;
  }

  // 2. If conversational female style (like Akisha Archer), find female-designated voices
  if (isFemaleStyle) {
    const femaleKeywords = [
      'jenny',
      'aria',
      'samantha',
      'ava',
      'victoria',
      'allison',
      'karen',
      'michelle',
      'zira',
      'female',
      'google us english',
      'neural2-f',
      'wavenet-d',
    ];
    const femaleMatch = voices.find((v) => {
      if (!v.lang.startsWith('en')) return false;
      const lower = v.name.toLowerCase();
      return femaleKeywords.some((k) => lower.includes(k)) && !lower.includes('espeak');
    });
    if (femaleMatch) return femaleMatch;
  }

  // 3. Try any modern Natural / Neural / Enhanced English voice
  const naturalMatch = voices.find((v) => {
    if (!v.lang.startsWith('en')) return false;
    const lower = v.name.toLowerCase();
    const isNatural =
      lower.includes('natural') ||
      lower.includes('neural') ||
      lower.includes('enhanced') ||
      lower.includes('online');
    if (!isNatural || lower.includes('espeak')) return false;

    // For female style, avoid explicitly male voices
    if (isFemaleStyle) {
      const maleNames = ['guy', 'david', 'mark', 'alex', 'george', 'daniel', 'christopher', 'eric', 'male'];
      if (maleNames.some((m) => lower.includes(m))) return false;
    }
    return true;
  });
  if (naturalMatch) return naturalMatch;

  // 4. Try standard Google or Apple English voice
  const highQualityStandard = voices.find((v) => {
    if (!v.lang.startsWith('en') || v.name.includes('eSpeak')) return false;
    const lower = v.name.toLowerCase();
    if (isFemaleStyle) {
      const maleNames = ['guy', 'david', 'mark', 'alex', 'george', 'daniel', 'christopher', 'eric', 'male'];
      if (maleNames.some((m) => lower.includes(m))) return false;
    }
    return lower.includes('google') || lower.includes('samantha') || lower.includes('victoria');
  });
  if (highQualityStandard) return highQualityStandard;

  // 5. Any English voice not marked as robotic/compact
  const fallbackEnglish = voices.find(
    (v) =>
      v.lang.startsWith('en') &&
      !v.name.toLowerCase().includes('espeak') &&
      !v.name.toLowerCase().includes('compact')
  );
  if (fallbackEnglish) return fallbackEnglish;

  return voices[0] || null;
}

// Active sentence queue controller
interface QueueState {
  isCancelled: boolean;
  activeTimeout: any;
}

// Active audio element & queue controllers
let currentQueue: QueueState | null = null;
let currentAudioElement: HTMLAudioElement | null = null;
let currentAbortController: AbortController | null = null;
const clientAudioCache = new Map<string, string>();

let clientTtsDisabled = false;
let clientTtsDisabledUntil = 0;

try {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    const saved = window.sessionStorage.getItem('tutorly_tts_exhausted');
    if (saved && Number(saved) > Date.now()) {
      clientTtsDisabled = true;
      clientTtsDisabledUntil = Number(saved);
    }
  }
} catch {
  // ignore
}

export function cacheAudioForText(text: string, base64Audio: string) {
  const clean = text
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
    .replace(/[*_#`~[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (clean && base64Audio) {
    clientAudioCache.set(clean, base64Audio);
  }
}

export function stopSpeaking() {
  if (currentAbortController) {
    currentAbortController.abort();
    currentAbortController = null;
  }
  if (currentAudioElement) {
    try {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
      currentAudioElement.src = '';
    } catch {
      // ignore
    }
    currentAudioElement = null;
  }
  if (currentQueue) {
    currentQueue.isCancelled = true;
    if (currentQueue.activeTimeout) {
      clearTimeout(currentQueue.activeTimeout);
    }
    currentQueue = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

export interface SpeakOptions {
  text: string;
  style?: VoiceStyle;
  preloadedAudioBase64?: string | null;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}

export function speakNaturalSentences({
  text,
  style = 'conversational-upbeat',
  preloadedAudioBase64,
  onStart,
  onEnd,
  onError,
}: SpeakOptions) {
  stopSpeaking();

  const clean = text
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
    .replace(/[*_#`~[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean) {
    onEnd?.();
    return;
  }

  const playAudioUri = (uri: string) => {
    try {
      const audio = new Audio(uri);
      currentAudioElement = audio;
      audio.onplay = () => onStart?.();
      audio.onended = () => {
        currentAudioElement = null;
        onEnd?.();
      };
      audio.onerror = () => {
        currentAudioElement = null;
        fallbackToSpeechSynthesis();
      };
      audio.play().catch(() => {
        fallbackToSpeechSynthesis();
      });
    } catch {
      fallbackToSpeechSynthesis();
    }
  };

  const fallbackToSpeechSynthesis = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onError?.();
      return;
    }

    const voice = pickBestVoice(style);
    const config = VOICE_STYLES[style] || VOICE_STYLES['conversational-upbeat'];
    const rawSentences = clean.match(/[^.!?\n]+[.!?\n]*/g) || [clean];
    const sentences = rawSentences.map((s) => s.trim()).filter((s) => s.length > 0);

    if (!sentences.length) {
      onEnd?.();
      return;
    }

    const queueState: QueueState = {
      isCancelled: false,
      activeTimeout: null,
    };
    currentQueue = queueState;

    let sentenceIdx = 0;
    onStart?.();

    const speakNext = () => {
      if (queueState.isCancelled) return;

      if (sentenceIdx >= sentences.length) {
        currentQueue = null;
        onEnd?.();
        return;
      }

      const currentSentence = sentences[sentenceIdx];
      sentenceIdx += 1;

      const utterance = new SpeechSynthesisUtterance(currentSentence);
      if (voice) {
        utterance.voice = voice;
      }
      utterance.rate = config.rate;
      utterance.pitch = config.pitch;
      utterance.volume = 1.0;

      utterance.onend = () => {
        if (queueState.isCancelled) return;
        queueState.activeTimeout = setTimeout(() => {
          speakNext();
        }, 55);
      };

      utterance.onerror = () => {
        if (queueState.isCancelled) return;
        currentQueue = null;
        onError?.();
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  };

  // 1. Check if direct base64 audio was provided
  if (preloadedAudioBase64) {
    cacheAudioForText(clean, preloadedAudioBase64);
    playAudioUri(`data:audio/wav;base64,${preloadedAudioBase64}`);
    return;
  }

  // 2. Check client memory cache
  const cached = clientAudioCache.get(clean);
  if (cached) {
    playAudioUri(`data:audio/wav;base64,${cached}`);
    return;
  }

  // 3. Special case: welcome voice asset
  if (clean.includes("I'm Tutorly, your book learning buddy")) {
    playAudioUri('/welcome_voice.wav');
    return;
  }

  // 4. If remote TTS is circuit-broken due to quota exhaustion, instantly use natural Web Speech synthesis
  if (clientTtsDisabled && Date.now() < clientTtsDisabledUntil) {
    fallbackToSpeechSynthesis();
    return;
  }

  // 5. Fetch high-fidelity Studio Voice from server
  const controller = new AbortController();
  currentAbortController = controller;

  fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: clean, style }),
    signal: controller.signal,
  })
    .then((res) => {
      if (!res.ok) {
        if (res.status === 429) {
          clientTtsDisabled = true;
          clientTtsDisabledUntil = Date.now() + 60 * 60 * 1000;
          try {
            window.sessionStorage?.setItem('tutorly_tts_exhausted', String(clientTtsDisabledUntil));
          } catch {}
        }
        throw new Error('TTS server error');
      }
      return res.json();
    })
    .then((data) => {
      currentAbortController = null;
      if (data?.quotaExhausted) {
        clientTtsDisabled = true;
        clientTtsDisabledUntil = Date.now() + 60 * 60 * 1000; // 1 hour
        try {
          window.sessionStorage?.setItem('tutorly_tts_exhausted', String(clientTtsDisabledUntil));
        } catch {}
      }

      if (data?.audio) {
        cacheAudioForText(clean, data.audio);
        playAudioUri(`data:audio/wav;base64,${data.audio}`);
      } else {
        fallbackToSpeechSynthesis();
      }
    })
    .catch((err) => {
      if (controller.signal.aborted) return;
      currentAbortController = null;
      // On connection error, back off remote TTS briefly
      clientTtsDisabled = true;
      clientTtsDisabledUntil = Date.now() + 5 * 60 * 1000;
      fallbackToSpeechSynthesis();
    });
}
