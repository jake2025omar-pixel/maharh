// Real Text-To-Speech, Microphone Audio Capture, Speech Recognition, and Word-Level Pronunciation Alignment

export type PlaybackStatus = 'idle' | 'playing' | 'paused';

let currentUtterance: SpeechSynthesisUtterance | null = null;
let statusListeners: Set<(status: PlaybackStatus) => void> = new Set();
let currentPlaybackStatus: PlaybackStatus = 'idle';

const notifyPlaybackStatus = (status: PlaybackStatus) => {
  currentPlaybackStatus = status;
  statusListeners.forEach(fn => fn(status));
};

export const subscribePlaybackStatus = (listener: (status: PlaybackStatus) => void): (() => void) => {
  statusListeners.add(listener);
  listener(currentPlaybackStatus);
  return () => {
    statusListeners.delete(listener);
  };
};

export const playSpeechText = (
  text: string,
  options?: { lang?: 'en-US' | 'ar-SA' | 'auto'; rate?: number }
): Promise<void> => {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window) || !text.trim()) {
      notifyPlaybackStatus('idle');
      resolve();
      return;
    }

    window.speechSynthesis.cancel();
    const cleaned = text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*_`#>•]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const utterance = new SpeechSynthesisUtterance(cleaned);

    const hasArabic = /[\u0600-\u06FF]/.test(cleaned);
    const targetLang =
      options?.lang && options.lang !== 'auto'
        ? options.lang
        : hasArabic
        ? 'ar-SA'
        : 'en-US';

    utterance.lang = targetLang;
    utterance.rate = options?.rate ?? (targetLang.startsWith('en') ? 0.92 : 1.0);

    const voices = window.speechSynthesis.getVoices();
    if (targetLang.startsWith('en')) {
      const enVoice = voices.find(
        v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
      ) || voices.find(v => v.lang.startsWith('en'));
      if (enVoice) utterance.voice = enVoice;
    } else {
      const arVoice = voices.find(v => v.lang.startsWith('ar'));
      if (arVoice) utterance.voice = arVoice;
    }

    currentUtterance = utterance;

    utterance.onstart = () => notifyPlaybackStatus('playing');
    utterance.onpause = () => notifyPlaybackStatus('paused');
    utterance.onresume = () => notifyPlaybackStatus('playing');
    utterance.onend = () => {
      currentUtterance = null;
      notifyPlaybackStatus('idle');
      resolve();
    };
    utterance.onerror = () => {
      currentUtterance = null;
      notifyPlaybackStatus('idle');
      resolve();
    };

    notifyPlaybackStatus('playing');
    window.speechSynthesis.speak(utterance);
  });
};

export const playEnglishAudio = (text: string, rate = 0.9): Promise<void> => {
  return playSpeechText(text, { lang: 'en-US', rate });
};

export const pauseAudio = (): void => {
  if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
    window.speechSynthesis.pause();
    notifyPlaybackStatus('paused');
  }
};

export const resumeAudio = (): void => {
  if ('speechSynthesis' in window && window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
    notifyPlaybackStatus('playing');
  }
};

export const stopAudio = (): void => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
  notifyPlaybackStatus('idle');
};

export const isSpeechSynthesisSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

// ==============================================================================
// Real Microphone Audio Capture + Speech Recognition + Gemini Audio Fallback
// ==============================================================================

export interface WordComparisonItem {
  expected: string;
  recognized: string | null;
  status: 'matched' | 'missing' | 'incorrect';
}

export interface PronunciationAssessment {
  expectedSentence: string;
  recognizedTranscript: string;
  recognitionConfidence: number | null; // Genuine recognizer confidence (NOT fake pronunciation score)
  confidenceAvailable: boolean;
  wordComparisons: WordComparisonItem[];
  matchedWordsCount: number;
  totalExpectedWords: number;
  missingWords: string[];
  incorrectWords: string[];
  extraWords: string[];
  feedbackAr: string;
  recordedAudioUrl?: string;
}

const normalizeWord = (w: string): string => {
  return w.toLowerCase().replace(/[^a-z0-9']/g, '');
};

export const assessSpokenTranscript = (
  expectedSentence: string,
  recognizedTranscript: string,
  confidence: number | null,
  recordedAudioUrl?: string
): PronunciationAssessment => {
  const expectedRaw = expectedSentence
    .trim()
    .split(/\s+/)
    .filter(w => normalizeWord(w).length > 0);
  const actualRaw = recognizedTranscript
    .trim()
    .split(/\s+/)
    .filter(w => normalizeWord(w).length > 0);

  const expectedNorm = expectedRaw.map(normalizeWord);
  const actualNorm = actualRaw.map(normalizeWord);

  // Dynamic programming alignment (Levenshtein on word arrays)
  const m = expectedNorm.length;
  const n = actualNorm.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = expectedNorm[i - 1] === actualNorm[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }

  // Backtrack alignment
  const comparisons: WordComparisonItem[] = [];
  const extraWords: string[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] && expectedNorm[i - 1] === actualNorm[j - 1]) {
      comparisons.unshift({
        expected: expectedRaw[i - 1],
        recognized: actualRaw[j - 1],
        status: 'matched'
      });
      i--;
      j--;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      comparisons.unshift({
        expected: expectedRaw[i - 1],
        recognized: actualRaw[j - 1],
        status: 'incorrect'
      });
      i--;
      j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      comparisons.unshift({
        expected: expectedRaw[i - 1],
        recognized: null,
        status: 'missing'
      });
      i--;
    } else if (j > 0) {
      extraWords.unshift(actualRaw[j - 1]);
      j--;
    }
  }

  const matchedWordsCount = comparisons.filter(c => c.status === 'matched').length;
  const missingWords = comparisons.filter(c => c.status === 'missing').map(c => c.expected);
  const incorrectWords = comparisons.filter(c => c.status === 'incorrect').map(c => c.expected);

  let feedbackAr = '';
  if (actualRaw.length === 0) {
    feedbackAr = 'لم يتم التقاط كلمات إنجليزية واضحة في التسجيل. تأكد من التحدث قرب الميكروفون وحاول مجدداً.';
  } else if (matchedWordsCount === expectedRaw.length && incorrectWords.length === 0) {
    feedbackAr = `تم التعرف على جميع الكلمات المتوقعة (${matchedWordsCount} من ${expectedRaw.length}) بوضوح.`;
  } else {
    const parts: string[] = [
      `تم التعرف على ${matchedWordsCount} من أصل ${expectedRaw.length} كلمة مطلوبة.`
    ];
    if (incorrectWords.length > 0) {
      parts.push(`كلمات التُقطت بشكل مختلف عن المطلوب: (${incorrectWords.join('، ')}). استمع إلى النطق البطيء وركز على مخارجها.`);
    }
    if (missingWords.length > 0) {
      parts.push(`كلمات لم تُسمع أو سقطت أثناء النطق: (${missingWords.join('، ')}).`);
    }
    feedbackAr = parts.join(' ');
  }

  return {
    expectedSentence,
    recognizedTranscript,
    recognitionConfidence: confidence !== null && confidence > 0 ? Number(confidence.toFixed(3)) : null,
    confidenceAvailable: confidence !== null && confidence > 0,
    wordComparisons: comparisons,
    matchedWordsCount,
    totalExpectedWords: expectedRaw.length,
    missingWords,
    incorrectWords,
    extraWords,
    feedbackAr,
    recordedAudioUrl
  };
};

export interface RealMicCaptureSession {
  stop: () => void;
}

export interface RealMicCallbacks {
  lang?: 'en-US' | 'ar-SA';
  expectedSentence?: string;
  onStatusChange?: (status: 'requesting_permission' | 'recording' | 'processing' | 'done' | 'error') => void;
  onLevel?: (level01: number) => void;
  onInterimTranscript?: (text: string) => void;
  onResult: (transcript: string, confidence: number | null, recordedAudioUrl?: string) => void;
  onError: (errorMessageAr: string) => void;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const startRealMicrophoneCapture = async (
  callbacks: RealMicCallbacks
): Promise<RealMicCaptureSession> => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    const msg = 'متصفحك الحالي أو سياق الاتصال لا يدعم الوصول للميكروفون. تأكد من فتح المنصة عبر HTTPS.';
    callbacks.onStatusChange?.('error');
    callbacks.onError(msg);
    return { stop: () => {} };
  }

  callbacks.onStatusChange?.('requesting_permission');

  let stream: MediaStream | null = null;
  let audioCtx: AudioContext | null = null;
  let rafId = 0;
  let mediaRecorder: MediaRecorder | null = null;
  let recognition: any = null;
  let stopped = false;

  const chunks: BlobPart[] = [];
  let webSpeechTranscript = '';
  let webSpeechConfidence: number | null = null;
  let webSpeechError: string | null = null;

  const cleanupMedia = () => {
    if (rafId) cancelAnimationFrame(rafId);
    if (audioCtx && audioCtx.state !== 'closed') {
      audioCtx.close().catch(() => {});
    }
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }
  };

  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err: any) {
    let msg = 'تعذر الوصول إلى الميكروفون.';
    if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
      msg = 'تم رفض إذن استخدام الميكروفون. يرجى السماح للمتصفح بالوصول للميكروفون ثم المحاولة مجدداً.';
    } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
      msg = 'لم يتم العثور على جهاز ميكروفون متصل بهذا الجهاز.';
    } else if (err?.name === 'NotReadableError') {
      msg = 'الميكروفون قيد الاستخدام في تطبيق آخر حالياً.';
    }
    callbacks.onStatusChange?.('error');
    callbacks.onError(msg);
    return { stop: () => {} };
  }

  callbacks.onStatusChange?.('recording');

  // Setup live audio level meter
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (stopped) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const avg = sum / dataArray.length;
        callbacks.onLevel?.(Math.min(1, avg / 90));
        rafId = requestAnimationFrame(updateLevel);
      };
      updateLevel();
    }
  } catch {
    // AudioContext visualization optional
  }

  // Start MediaRecorder for real audio capture + server transcription fallback
  try {
    if (typeof MediaRecorder !== 'undefined') {
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };
      mediaRecorder.start();
    }
  } catch {
    mediaRecorder = null;
  }

  // Start Browser Web Speech API if available
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (SpeechRecognition) {
    try {
      recognition = new SpeechRecognition();
      recognition.lang = callbacks.lang || 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        let finalStr = '';
        let interimStr = '';
        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalStr += res[0].transcript + ' ';
            if (typeof res[0].confidence === 'number') {
              webSpeechConfidence = res[0].confidence;
            }
          } else {
            interimStr += res[0].transcript + ' ';
          }
        }
        if (finalStr.trim()) {
          webSpeechTranscript = finalStr.trim();
        }
        if (interimStr.trim()) {
          callbacks.onInterimTranscript?.(interimStr.trim());
        }
      };

      recognition.onerror = (event: any) => {
        webSpeechError = event?.error || 'speech_error';
      };

      recognition.onend = () => {
        if (!stopped) {
          finishCapture();
        }
      };

      recognition.start();
    } catch {
      recognition = null;
    }
  }

  const finishCapture = async () => {
    if (stopped) return;
    stopped = true;
    callbacks.onLevel?.(0);
    callbacks.onStatusChange?.('processing');

    try {
      if (recognition) {
        try {
          recognition.stop();
        } catch {
          // ignore
        }
      }
    } catch {
      // ignore
    }

    const finalizeAudioBlob = (): Promise<Blob | null> => {
      return new Promise(resolve => {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') {
          resolve(chunks.length > 0 ? new Blob(chunks, { type: 'audio/webm' }) : null);
          return;
        }
        mediaRecorder.onstop = () => {
          resolve(chunks.length > 0 ? new Blob(chunks, { type: mediaRecorder?.mimeType || 'audio/webm' }) : null);
        };
        try {
          mediaRecorder.stop();
        } catch {
          resolve(null);
        }
      });
    };

    const audioBlob = await finalizeAudioBlob();
    cleanupMedia();

    const audioUrl = audioBlob ? URL.createObjectURL(audioBlob) : undefined;

    // 1. If Web Speech captured a clear transcript, return it immediately
    if (webSpeechTranscript.trim()) {
      callbacks.onStatusChange?.('done');
      callbacks.onResult(webSpeechTranscript.trim(), webSpeechConfidence, audioUrl);
      return;
    }

    // 2. Otherwise, if we have captured audio, send it to the backend Gemini transcription endpoint
    if (audioBlob && audioBlob.size > 800) {
      try {
        const base64 = await blobToBase64(audioBlob);
        const res = await fetch('/api/speech/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: base64,
            mimeType: audioBlob.type || 'audio/webm',
            expectedSentence: callbacks.expectedSentence
          })
        });
        const data = await res.json();
        if (res.ok && data.transcript) {
          callbacks.onStatusChange?.('done');
          callbacks.onResult(data.transcript, data.confidence ?? null, audioUrl);
          return;
        }
        if (data?.error) {
          callbacks.onStatusChange?.('error');
          callbacks.onError(data.error);
          return;
        }
      } catch {
        // fall through to clear honest error message
      }
    }

    callbacks.onStatusChange?.('error');
    if (webSpeechError === 'no-speech') {
      callbacks.onError('لم يُلتقط صوت واضح أثناء التسجيل. تأكد من التحدث بصوت مسموع ثم أعد المحاولة.');
    } else if (webSpeechError === 'network') {
      callbacks.onError('تعذر الاتصال بخدمة التعرف الصوتي بسبب الشبكة.');
    } else {
      callbacks.onError('لم يتم التعرف على الكلام المسجل. يرجى المحاولة مرة أخرى بوضوح.');
    }
  };

  return {
    stop: () => {
      finishCapture();
    }
  };
};
