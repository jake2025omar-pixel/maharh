import React, { useState, useRef } from 'react';
import {
  Mic,
  Square,
  Volume2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import {
  playEnglishAudio,
  startRealMicrophoneCapture,
  assessSpokenTranscript,
  PronunciationAssessment,
  RealMicCaptureSession
} from '../../services/audioService.ts';
import { useSession } from '../../context/SessionContext.tsx';

interface SpeechPracticePanelProps {
  expectedSentence: string;
  arabicTranslation: string;
  lessonId?: string;
  onResultRecorded?: (assessment: PronunciationAssessment) => void;
}

export const SpeechPracticePanel: React.FC<SpeechPracticePanelProps> = ({
  expectedSentence,
  arabicTranslation,
  lessonId = 'practice',
  onResultRecorded
}) => {
  const { currentUser } = useSession();
  const [micStatus, setMicStatus] = useState<'idle' | 'requesting_permission' | 'recording' | 'processing' | 'done' | 'error'>('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const [interimText, setInterimText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [assessment, setAssessment] = useState<PronunciationAssessment | null>(null);
  const captureRef = useRef<RealMicCaptureSession | null>(null);

  const handleToggleMic = async () => {
    if (micStatus === 'recording' && captureRef.current) {
      captureRef.current.stop();
      return;
    }

    setErrorMessage('');
    setInterimText('');
    setAssessment(null);

    const session = await startRealMicrophoneCapture({
      lang: 'en-US',
      expectedSentence,
      onStatusChange: status => setMicStatus(status),
      onLevel: lvl => setAudioLevel(lvl),
      onInterimTranscript: txt => setInterimText(txt),
      onResult: (transcript, confidence, recordedAudioUrl) => {
        const result = assessSpokenTranscript(expectedSentence, transcript, confidence, recordedAudioUrl);
        setAssessment(result);
        onResultRecorded?.(result);

        if (currentUser?.id) {
          fetch('/api/speech/attempt', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(currentUser.accessToken ? { Authorization: `Bearer ${currentUser.accessToken}` } : {})
            },
            body: JSON.stringify({
              studentId: currentUser.id,
              lessonId,
              expectedSentence,
              recognizedTranscript: result.recognizedTranscript,
              recognitionConfidence: result.recognitionConfidence ?? 0,
              matchedWords: result.matchedWordsCount,
              totalExpectedWords: result.totalExpectedWords,
              missingWords: result.missingWords,
              incorrectWords: result.incorrectWords
            })
          }).catch(() => {});
        }
      },
      onError: errMsg => {
        setErrorMessage(errMsg);
      }
    });

    captureRef.current = session;
  };

  return (
    <div className="space-y-5">
      {/* Target Sentence Reference */}
      <div className="surface-icy rounded-2xl p-5 text-center space-y-2.5">
        <p className="text-xs font-medium text-slate-500">الجملة المطلوب نطقها بصوت واضح</p>
        <p className="text-lg sm:text-xl font-semibold text-slate-900 font-latin leading-relaxed" dir="ltr">
          {expectedSentence}
        </p>
        <p className="text-sm text-slate-600">{arabicTranslation}</p>

        <div className="pt-2 flex items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={() => playEnglishAudio(expectedSentence, 0.9)}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-sky-300 text-xs font-medium text-slate-800 flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Volume2 className="w-4 h-4 text-sky-600" />
            <span>استمع للنطق</span>
          </button>
          <button
            type="button"
            onClick={() => playEnglishAudio(expectedSentence, 0.72)}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-sky-300 text-xs font-medium text-slate-600 transition-colors whitespace-nowrap"
          >
            <span>نطق بطيء</span>
          </button>
        </div>
      </div>

      {/* Microphone Control Stage */}
      <div className="flex flex-col items-center justify-center py-4 space-y-3">
        <button
          type="button"
          onClick={handleToggleMic}
          disabled={micStatus === 'requesting_permission' || micStatus === 'processing'}
          aria-label={micStatus === 'recording' ? 'إيقاف التسجيل' : 'بدء التسجيل الصوتي'}
          className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center transition-all shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
            micStatus === 'recording'
              ? 'bg-slate-900 text-white ring-4 ring-sky-200 scale-105'
              : 'bg-sky-600 hover:bg-sky-700 text-white active:scale-95'
          } disabled:opacity-60`}
        >
          {micStatus === 'requesting_permission' || micStatus === 'processing' ? (
            <Loader2 className="w-7 h-7 animate-spin" />
          ) : micStatus === 'recording' ? (
            <Square className="w-6 h-6 fill-current" />
          ) : (
            <Mic className="w-7 h-7" />
          )}
        </button>

        {/* Live Recording Status & Authentic Input Level Meter */}
        <div className="text-center space-y-2 w-full max-w-xs">
          <p className="text-xs font-medium text-slate-700">
            {micStatus === 'idle' && 'اضغط على الميكروفون ثم انطق الجملة بالإنجليزية'}
            {micStatus === 'requesting_permission' && 'جاري طلب إذن استخدام الميكروفون...'}
            {micStatus === 'recording' && 'جاري التسجيل... انطق الجملة ثم اضغط إيقاف'}
            {micStatus === 'processing' && 'جاري تحليل الصوت والتعرف على الكلمات...'}
            {micStatus === 'done' && 'اكتمل تحليل التسجيل'}
            {micStatus === 'error' && 'تعذر التقاط التسجيل الصوتي'}
          </p>

          {micStatus === 'recording' && (
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-sky-500 transition-all duration-75 rounded-full"
                style={{ width: `${Math.max(8, Math.round(audioLevel * 100))}%` }}
              />
            </div>
          )}

          {interimText && micStatus === 'recording' && (
            <p className="text-xs font-latin text-slate-500 italic" dir="ltr">
              "{interimText}"
            </p>
          )}
        </div>
      </div>

      {/* Explicit Permission / Device / Network Error State */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200/80 text-right flex items-start gap-3 text-xs text-red-900">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">{errorMessage}</p>
            <button
              type="button"
              onClick={handleToggleMic}
              className="text-red-700 underline font-medium hover:text-red-900"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      )}

      {/* Word-by-Word Pronunciation Comparison Output */}
      {assessment && (
        <div className="surface-card rounded-2xl p-5 space-y-4 text-right">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-sky-600" />
              <span>نتيجة تحليل الكلام المنطوق</span>
            </div>

            <div className="text-xs text-slate-500 font-numeric flex items-center gap-2">
              <span>
                الكلمات المتطابقة: {assessment.matchedWordsCount}/{assessment.totalExpectedWords}
              </span>
              {assessment.confidenceAvailable && assessment.recognitionConfidence !== null && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    ثقة التعرف الصوتي: {Math.round(assessment.recognitionConfidence * 100)}%
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Recognized Transcript */}
          <div className="surface-icy rounded-xl p-3.5 space-y-1">
            <span className="text-[11px] text-slate-500 block">ما تم التقاطه من صوتك:</span>
            <p className="text-sm font-semibold text-slate-900 font-latin" dir="ltr">
              "{assessment.recognizedTranscript || '—'}"
            </p>
          </div>

          {/* Word-by-word visual alignment */}
          <div>
            <p className="text-xs font-medium text-slate-600 mb-2">مقارنة الكلمات المطلوبة:</p>
            <div className="flex flex-wrap gap-2 justify-end" dir="ltr">
              {assessment.wordComparisons.map((wc, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-latin ${
                    wc.status === 'matched'
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 font-semibold'
                      : wc.status === 'incorrect'
                      ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                      : 'bg-red-50/70 border-red-200 text-red-800 border-dashed'
                  }`}
                >
                  <span>{wc.expected}</span>
                  {wc.status === 'incorrect' && wc.recognized && (
                    <span className="text-[10px] block text-amber-700">سُمعت: {wc.recognized}</span>
                  )}
                  {wc.status === 'missing' && (
                    <span className="text-[10px] block text-red-600">مفقودة</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Constructive Feedback */}
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
            {assessment.feedbackAr}
          </p>

          {/* Student Recording Playback & Retry */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {assessment.recordedAudioUrl && (
              <audio controls src={assessment.recordedAudioUrl} className="h-9 max-w-full" />
            )}

            <button
              type="button"
              onClick={handleToggleMic}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>سجل محاولة جديدة</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
