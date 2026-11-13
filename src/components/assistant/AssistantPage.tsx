import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Globe,
  ExternalLink,
  BookOpen,
  Plus,
  ArrowRight,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';
import { CircularFaceAvatar, AssistantFaceState } from './CircularFaceAvatar.tsx';
import { useSession } from '../../context/SessionContext.tsx';
import { SentenceItem } from '../../data/curriculumData.ts';
import {
  playSpeechText,
  pauseAudio,
  resumeAudio,
  stopAudio,
  subscribePlaybackStatus,
  isSpeechSynthesisSupported,
  startRealMicrophoneCapture,
  PlaybackStatus,
  RealMicCaptureSession
} from '../../services/audioService.ts';

interface GroundingSource {
  type: 'pdf_curriculum' | 'gemini_explanation' | 'internet_search';
  title: string;
  pageNumber?: number;
  url?: string;
  snippet?: string;
}

interface TurnEntry {
  role: 'user' | 'model';
  text: string;
}

interface AssistantPageProps {
  lessonContextSentence: SentenceItem | null;
  lessonTitleAr?: string;
  onBackToLearning: () => void;
}

export const AssistantPage: React.FC<AssistantPageProps> = ({
  lessonContextSentence,
  lessonTitleAr,
  onBackToLearning
}) => {
  const { progress, currentUser } = useSession();

  const [conversationId, setConversationId] = useState<string>(() => `voice_${Date.now()}`);
  const [conversationHistory, setConversationHistory] = useState<TurnEntry[]>([]);
  const [lastAssistantReply, setLastAssistantReply] = useState<string>('');
  const [lastGroundingSources, setLastGroundingSources] = useState<GroundingSource[]>([]);
  const [searchUnavailableReason, setSearchUnavailableReason] = useState<string>('');

  const [inputValue, setInputValue] = useState<string>('');
  const [useLessonContext, setUseLessonContext] = useState<boolean>(Boolean(lessonContextSentence));
  const [enableInternetSearch, setEnableInternetSearch] = useState<boolean>(false);
  const [micLang, setMicLang] = useState<'ar-SA' | 'en-US'>('ar-SA');

  const [isRecordingMic, setIsRecordingMic] = useState<boolean>(false);
  const [isProcessingTurn, setIsProcessingTurn] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string>('');

  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>('idle');
  const [justReceivedPulse, setJustReceivedPulse] = useState<boolean>(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  const micSessionRef = useRef<RealMicCaptureSession | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setUseLessonContext(Boolean(lessonContextSentence));
  }, [lessonContextSentence]);

  useEffect(() => {
    fetch('/api/system/status')
      .then(r => r.json())
      .then(d => setHasApiKey(Boolean(d.hasApiKey)))
      .catch(() => setHasApiKey(null));
  }, []);

  useEffect(() => {
    const unsub = subscribePlaybackStatus(status => {
      setPlaybackStatus(status);
    });
    return () => {
      unsub();
      stopAudio();
    };
  }, []);

  const computeFaceState = (): AssistantFaceState => {
    if (isRecordingMic) return 'listening';
    if (isProcessingTurn) return 'processing';
    if (playbackStatus === 'playing') return 'speaking';
    if (justReceivedPulse) return 'received';
    return 'idle';
  };

  const getStatusLabelAr = (): string => {
    if (isRecordingMic) return 'جاري الاستماع لإدخال صوتك في الحقل...';
    if (isProcessingTurn) return 'جاري فهم سؤالك وتجهيز الرد الصوتي...';
    if (playbackStatus === 'playing') return 'المساعد يرد عليك بالصوت الآن';
    if (playbackStatus === 'paused') return 'الرد الصوتي متوقف مؤقتاً';
    if (hasApiKey === false) return 'بانتظار تهيئة GEMINI_API_KEY على الخادم لتشغيل الردود';
    return 'اكتب سؤالك في الحقل بالأسفل وسيرد عليك المساعد بالصوت';
  };

  const speakAssistantReply = (replyText: string) => {
    if (!replyText.trim()) return;
    if (!isSpeechSynthesisSupported()) {
      setErrorBanner('متصفحك لا يدعم تشغيل النطق الصوتي (Speech Synthesis).');
      return;
    }
    playSpeechText(replyText, { lang: 'auto' });
  };

  const handleSendQuestion = async (overrideText?: string) => {
    const text = (overrideText ?? inputValue).trim();
    if (!text || isProcessingTurn) return;

    setErrorBanner('');
    setSearchUnavailableReason('');
    setIsProcessingTurn(true);
    stopAudio();

    if (!overrideText) {
      setInputValue('');
    }

    const updatedHistory: TurnEntry[] = [
      ...conversationHistory,
      { role: 'user', text }
    ];
    setConversationHistory(updatedHistory);

    try {
      const payload = {
        studentId: currentUser?.id,
        conversationId,
        conversationTitle: text.slice(0, 42),
        message: text,
        level: progress.level,
        activeTrack: progress.activeTrack,
        lessonContext:
          useLessonContext && lessonContextSentence
            ? {
                lessonTitleAr: lessonTitleAr || lessonContextSentence.topicNameAr,
                lessonTitleEn: lessonContextSentence.topicNameEn,
                english: lessonContextSentence.english,
                arabic: lessonContextSentence.arabic,
                topicTitleAr: lessonContextSentence.topicNameAr,
                grammarPoint: lessonContextSentence.grammarPoint,
                vocabulary: lessonContextSentence.vocabulary
              }
            : null,
        chatHistory: updatedHistory.slice(-10),
        enableInternetSearch
      };

      const res = await fetch('/api/assistant/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentUser?.accessToken ? { Authorization: `Bearer ${currentUser.accessToken}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `خطأ من الخادم (${res.status})`);
      }

      if (typeof data.hasApiKey === 'boolean') {
        setHasApiKey(data.hasApiKey);
      }

      const replyText = (data.reply || '').trim();
      setLastAssistantReply(replyText);
      setLastGroundingSources(
        Array.isArray(data.groundingSources)
          ? data.groundingSources.filter((s: GroundingSource) => s.type !== 'gemini_explanation')
          : []
      );
      if (data.searchUnavailableReason) {
        setSearchUnavailableReason(data.searchUnavailableReason);
      }

      setConversationHistory(prev => [...prev, { role: 'model', text: replyText }]);

      setJustReceivedPulse(true);
      window.setTimeout(() => setJustReceivedPulse(false), 600);

      if (data.hasApiKey && replyText) {
        speakAssistantReply(replyText);
      }
    } catch (err: any) {
      setErrorBanner(err.message || 'تعذر إرسال سؤالك إلى المساعد الذكي.');
    } finally {
      setIsProcessingTurn(false);
    }
  };

  const handleToggleMicDictation = async () => {
    if (isRecordingMic && micSessionRef.current) {
      micSessionRef.current.stop();
      setIsRecordingMic(false);
      return;
    }

    setErrorBanner('');
    setIsRecordingMic(true);

    const session = await startRealMicrophoneCapture({
      lang: micLang,
      onStatusChange: status => {
        if (status === 'done' || status === 'error') {
          setIsRecordingMic(false);
        }
      },
      onInterimTranscript: txt => setInputValue(txt),
      onResult: transcript => {
        setInputValue(transcript);
        setIsRecordingMic(false);
        inputRef.current?.focus();
      },
      onError: errMsg => {
        setErrorBanner(errMsg);
        setIsRecordingMic(false);
      }
    });

    micSessionRef.current = session;
  };

  const handlePauseOrResume = () => {
    if (playbackStatus === 'playing') pauseAudio();
    else if (playbackStatus === 'paused') resumeAudio();
  };

  const handleStopSpeech = () => {
    stopAudio();
  };

  const handleNewConversation = () => {
    if (isRecordingMic && micSessionRef.current) {
      micSessionRef.current.stop();
    }
    stopAudio();
    setIsRecordingMic(false);
    setIsProcessingTurn(false);
    setErrorBanner('');
    setConversationHistory([]);
    setLastAssistantReply('');
    setLastGroundingSources([]);
    setSearchUnavailableReason('');
    setInputValue('');
    setConversationId(`voice_${Date.now()}`);
    inputRef.current?.focus();
  };

  return (
    <div
      className="min-h-[calc(100vh-65px)] bg-gradient-to-b from-[#F0F7FA]/55 via-white to-white flex flex-col"
      dir="rtl"
    >
      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 flex flex-col">
        {/* Top Assistant Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              stopAudio();
              onBackToLearning();
            }}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-sky-300 text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للتعلم</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setEnableInternetSearch(prev => !prev)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                enableInternetSearch
                  ? 'bg-sky-600 border-sky-600 text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-sky-300'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>بحث الويب</span>
            </button>

            <button
              type="button"
              onClick={handleNewConversation}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>محادثة جديدة</span>
            </button>
          </div>
        </div>

        {/* Centered Stage: Voice-Only Avatar Output + Large Student Input Field (Zero Chat Bubbles) */}
        <div className="flex-1 flex flex-col items-center justify-center py-6 sm:py-10">
          <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 sm:p-10 flex flex-col items-center text-center space-y-6">
            {/* Minimal Circular Face (Only 2 eyes and 1 mouth; mouth moves strictly while speaking audio) */}
            <CircularFaceAvatar
              state={computeFaceState()}
              isSpeakingAudio={playbackStatus === 'playing'}
              size="lg"
            />

            {/* Status Description */}
            <div className="space-y-1.5 max-w-lg">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                المساعد الذكي
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {getStatusLabelAr()}
              </p>
            </div>

            {/* Assistant Voice Controls (Pause / Resume / Stop / Replay) */}
            {(playbackStatus !== 'idle' || Boolean(lastAssistantReply)) && (
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {playbackStatus === 'playing' || playbackStatus === 'paused' ? (
                  <>
                    <button
                      type="button"
                      onClick={handlePauseOrResume}
                      className="px-4 py-2 rounded-xl bg-[#F0F7FA] hover:bg-sky-100 text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
                    >
                      {playbackStatus === 'playing' ? (
                        <Pause className="w-4 h-4 text-sky-700" />
                      ) : (
                        <Play className="w-4 h-4 text-sky-700" />
                      )}
                      <span>{playbackStatus === 'playing' ? 'إيقاف مؤقت' : 'متابعة'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleStopSpeech}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>إيقاف الصوت</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => speakAssistantReply(lastAssistantReply)}
                    className="px-4 py-2 rounded-xl bg-[#F0F7FA] hover:bg-sky-100 text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
                  >
                    <RotateCcw className="w-4 h-4 text-sky-700" />
                    <span>إعادة سماع آخر إجابة</span>
                  </button>
                )}
              </div>
            )}

            {/* Large, Clear Student Input Area (Zero bubbles) */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendQuestion();
              }}
              className="w-full pt-4 border-t border-slate-100 space-y-3 text-right"
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <label htmlFor="student-assistant-input" className="font-medium text-slate-700">
                  حقل سؤالك للمساعد الذكي
                </label>
                <div className="flex items-center gap-1 bg-[#F0F7FA] p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setMicLang('ar-SA')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      micLang === 'ar-SA' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    العربية
                  </button>
                  <button
                    type="button"
                    onClick={() => setMicLang('en-US')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium font-latin transition-colors ${
                      micLang === 'en-US' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              <textarea
                id="student-assistant-input"
                ref={inputRef}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendQuestion();
                  }
                }}
                rows={3}
                disabled={isProcessingTurn}
                placeholder="اكتب سؤالك هنا بوضوح (في المنهج، الإنجليزية، العلوم، البرمجة، أو أي موضوع) وسيجيبك المساعد صوتياً..."
                className="w-full min-h-[108px] bg-white text-slate-900 text-base leading-relaxed p-4 sm:p-5 rounded-2xl border-2 border-slate-200 focus:border-sky-500 focus:outline-none transition-colors resize-none shadow-2xs"
              />

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleToggleMicDictation}
                  disabled={isProcessingTurn}
                  aria-label={isRecordingMic ? 'إيقاف الإملاء الصوتي' : 'تحدث لكتابة سؤالك'}
                  className={`px-4 py-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                    isRecordingMic
                      ? 'bg-slate-900 border-slate-900 text-white ring-4 ring-sky-200'
                      : 'bg-[#F0F7FA] border-sky-100 text-slate-700 hover:bg-sky-100/80'
                  }`}
                >
                  {isRecordingMic ? (
                    <>
                      <Square className="w-4 h-4 fill-current" />
                      <span>إيقاف الميكروفون</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 text-sky-700" />
                      <span>إملاء بالصوت</span>
                    </>
                  )}
                </button>

                <button
                  type="submit"
                  disabled={isProcessingTurn || !inputValue.trim()}
                  className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-40"
                >
                  {isProcessingTurn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري التجهيز...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 rotate-180" />
                      <span>إرسال</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Honest Error Notice */}
            {errorBanner && (
              <div className="w-full p-3.5 rounded-2xl bg-red-50/75 border border-red-200/80 text-xs text-red-900 flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorBanner}</span>
              </div>
            )}

            {searchUnavailableReason && (
              <p className="text-xs text-slate-500 leading-relaxed">{searchUnavailableReason}</p>
            )}

            {/* Optional Attached Lesson Context (Unboxed strip, NOT a chat bubble) */}
            {useLessonContext && lessonContextSentence && (
              <div className="w-full pt-4 border-t border-slate-100 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
                <span className="truncate">
                  السياق: {lessonTitleAr || lessonContextSentence.topicNameAr} ·{' '}
                  <span className="font-latin text-slate-800" dir="ltr">
                    {lessonContextSentence.english}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setUseLessonContext(false)}
                  className="text-slate-500 hover:text-slate-900 flex items-center gap-1 shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>فصل السياق</span>
                </button>
              </div>
            )}

            {/* Verified Grounded Citations / Search Links (Clean unboxed rows when applicable) */}
            {lastGroundingSources.length > 0 && (
              <div className="w-full pt-4 border-t border-slate-100 text-right space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                  <span>المراجع المرتبطة بالإجابة الصوتية</span>
                </div>
                <div className="space-y-1.5">
                  {lastGroundingSources.map((src, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-2 text-slate-700 py-1"
                    >
                      <span className="truncate">
                        {src.title}
                        {src.pageNumber ? ` · صفحة ${src.pageNumber}` : ''}
                      </span>
                      {src.url && (
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-700 hover:text-sky-900 flex items-center gap-1 font-medium shrink-0"
                        >
                          <span>فتح المصدر</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
