// Browser Text-To-Speech and Speech Recognition service

export const playEnglishAudio = (text: string, rate = 0.9): Promise<void> => {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      resolve();
      return;
    }

    window.speechSynthesis.cancel(); // Stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = rate;

    // Try to pick a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (enVoice) {
      utterance.voice = enVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
};

export const stopAudio = (): void => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

export const startListeningForSpeech = (
  onResult: (result: SpeechRecognitionResult) => void,
  onError: (error: string) => void,
  onEnd: () => void
): { stop: () => void } => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError('متصفحك لا يدعم التعرف على الصوت المباشر. يمكنك التحقق من النطق بمقارنته مع التسجيل الصوتي.');
    return { stop: () => {} };
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const text = event.results[last][0].transcript;
      const confidence = event.results[last][0].confidence || 0.9;
      onResult({ transcript: text, confidence });
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      onError(event.error === 'not-allowed' ? 'تم رفض إذن استخدام الميكروفون' : 'تعذر التقاط الصوت، حاول مجدداً');
    };

    recognition.onend = () => {
      onEnd();
    };

    recognition.start();

    return {
      stop: () => {
        try {
          recognition.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  } catch (err: any) {
    onError('حدث خطأ في تشغيل الميكروفون');
    return { stop: () => {} };
  }
};
