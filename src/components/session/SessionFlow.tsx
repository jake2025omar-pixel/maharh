import React, { useState } from 'react';
import {
  Clock,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Headphones,
  BookOpen,
  Mic,
  Sparkles,
  Volume2,
  CheckCircle2,
  Bookmark,
  Share2,
  Check,
  AlertCircle,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { useSession, DURATION_OPTIONS, SESSION_QUARTERS, QuarterType } from '../../context/SessionContext.tsx';
import { HADRAMOUT_CURRICULUM_TOPICS, SentenceItem } from '../../data/curriculumData.ts';
import { EVERYDAY_ENGLISH_CATEGORIES, ALL_SENTENCES } from '../../data/everydayData.ts';
import { playEnglishAudio, startListeningForSpeech } from '../../services/audioService.ts';
import { toggleSaveSentence } from '../../services/storageService.ts';

interface SessionFlowProps {
  onOpenCompanion: () => void;
  onSentenceSelected: (sentence: SentenceItem) => void;
}

export const SessionFlow: React.FC<SessionFlowProps> = ({
  onOpenCompanion,
  onSentenceSelected
}) => {
  const {
    progress,
    selectedDurationMinutes,
    setSelectedDurationMinutes,
    isSessionActive,
    isPaused,
    currentQuarter,
    quarterSecondsTotal,
    quarterSecondsElapsed,
    quarterTimeRemainingSeconds,
    isQuarterRecommendedTimeEnded,
    startSession,
    nextQuarter,
    prevQuarter,
    goToQuarter,
    togglePause,
    endSession,
    markSentenceCompleted,
    setTrack
  } = useSession();

  // Pick sentences matching the active track and level
  const activeSentences = ALL_SENTENCES.filter(
    s => s.source === progress.activeTrack && (s.level === progress.level || progress.level === 'intermediate')
  );

  const [activeSentenceIndex, setActiveSentenceIndex] = useState(0);
  const currentSentence = activeSentences[activeSentenceIndex] || ALL_SENTENCES[0];

  // Speech recording state for Quarter 3 (Speaking)
  const [isRecording, setIsRecording] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [speechFeedback, setSpeechFeedback] = useState<{ score: number; text: string } | null>(null);
  const [speechController, setSpeechController] = useState<{ stop: () => void } | null>(null);

  // Inform companion whenever active sentence changes
  React.useEffect(() => {
    if (currentSentence) {
      onSentenceSelected(currentSentence);
    }
  }, [currentSentence, onSentenceSelected]);

  const isSaved = progress.savedSentenceIds.includes(currentSentence?.id || '');

  const formatSeconds = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePlayAudio = (rate = 0.9) => {
    if (currentSentence) {
      playEnglishAudio(currentSentence.english, rate);
    }
  };

  const handleStartSpeaking = () => {
    if (isRecording && speechController) {
      speechController.stop();
      setIsRecording(false);
      return;
    }

    setSpeechFeedback(null);
    setSpeechTranscript('');
    setIsRecording(true);

    const controller = startListeningForSpeech(
      result => {
        setSpeechTranscript(result.transcript);
        // Calculate similarity with target English sentence
        const targetClean = currentSentence.english.toLowerCase().replace(/[^a-z0-9]/g, '');
        const actualClean = result.transcript.toLowerCase().replace(/[^a-z0-9]/g, '');
        const isMatch = targetClean.includes(actualClean) || actualClean.includes(targetClean);

        setSpeechFeedback({
          score: isMatch ? 100 : 75,
          text: isMatch ? 'ممتاز جداً! نطق سليم وواضح للجملة.' : 'محاولة جيدة! استمع مجدداً للتسجيل وحاول نطق الكلمات بوضوح.'
        });
        setIsRecording(false);
      },
      err => {
        setSpeechFeedback({
          score: 50,
          text: err
        });
        setIsRecording(false);
      },
      () => {
        setIsRecording(false);
      }
    );

    setSpeechController(controller);
  };

  // Step 1 & 2: Welcome & Duration Selection Screen
  if (!isSessionActive) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6" dir="rtl">
        {/* Welcome Hero Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm text-right relative overflow-hidden mb-8">
          <div className="max-w-xl relative z-10">
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full mb-3 inline-block">
              أهلاً بك في منصة مهارة (MAHARAH) 3.0
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight leading-snug">
              تعلّم الإنجليزية عبر الجمل الكاملة وسياقات الحياة والمناهج
            </h1>
            <p className="text-stone-600 text-sm sm:text-base mt-2.5 leading-relaxed">
              منهج متكامل يجمع بين كتيّب المراجعة الشاملة لطلاب الصف الحادي عشر في حضرموت، ومكتبة الإنجليزية اليومية الحياتية، بمساعدة رفيقك الذكي جيميناي.
            </p>

            {/* Active Track Selection */}
            <div className="mt-6 flex flex-wrap gap-2.5">
              <button
                onClick={() => setTrack('hadramout_curriculum')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  progress.activeTrack === 'hadramout_curriculum'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <span>📘 مقرر الصف 11 (حضرموت)</span>
              </button>
              <button
                onClick={() => setTrack('everyday_english')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  progress.activeTrack === 'everyday_english'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <span>☕ الإنجليزية اليومية الحياتية</span>
              </button>
            </div>
          </div>

          {/* Banner Graphic Silhouette */}
          <div className="hidden lg:block absolute -left-6 -bottom-6 w-72 h-72 opacity-95 pointer-events-none">
            <img
              src="/src/assets/images/curriculum_hadramout_banner_1794437148944.jpg"
              alt="حضرموت والتعليم"
              className="w-full h-full object-cover rounded-3xl"
            />
          </div>
        </div>

        {/* Step 2: Choose Learning Duration */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm text-right">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700 font-bold text-sm">
              2
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900">
                اختر مدة الجلسة التعليمية
              </h2>
              <p className="text-xs text-stone-500">
                تقوم منصة مهارة بتقسيم وقتك تلقائياً إلى 4 أرباع متكافئة بدقة الثواني دون أي ضغط.
              </p>
            </div>
          </div>

          {/* Duration Pills Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
            {DURATION_OPTIONS.map(mins => {
              const isSelected = selectedDurationMinutes === mins;
              const quarterSecs = Math.round((mins * 60) / 4);
              const qMins = Math.floor(quarterSecs / 60);
              const qSecs = quarterSecs % 60;

              return (
                <button
                  key={mins}
                  onClick={() => setSelectedDurationMinutes(mins)}
                  className={`p-3.5 rounded-2xl border text-center transition-all ${
                    isSelected
                      ? 'border-amber-600 bg-amber-50/60 shadow-xs ring-1 ring-amber-500'
                      : 'border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50'
                  }`}
                >
                  <span className="block text-xl font-extrabold text-stone-900 font-latin">
                    {mins} <span className="text-xs font-normal text-stone-500">دقيقة</span>
                  </span>
                  <span className="block text-[11px] text-stone-500 mt-1 font-latin">
                    {qMins > 0 ? `${qMins}د ` : ''}{qSecs > 0 ? `${qSecs}ث ` : ''}لكل ربع
                  </span>
                </button>
              );
            })}
          </div>

          {/* 4 Quarters Breakdown Preview */}
          <div className="mt-8 p-5 bg-stone-50 rounded-2xl border border-stone-200/60">
            <h3 className="text-xs font-bold text-stone-700 mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              توزيع جلستك المعتمدة ({selectedDurationMinutes} دقيقة):
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              {[1, 2, 3, 4].map(q => {
                const info = SESSION_QUARTERS[q as QuarterType];
                const quarterSecs = Math.round((selectedDurationMinutes * 60) / 4);
                return (
                  <div key={q} className="bg-white p-3 rounded-xl border border-stone-200/80 text-right">
                    <span className="text-[10px] text-amber-800 font-bold block mb-1">الربع {q} ({formatSeconds(quarterSecs)})</span>
                    <p className="font-bold text-stone-900">{info.titleAr}</p>
                    <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">{info.targetFocusAr}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Launch Session Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={() => startSession(selectedDurationMinutes)}
              className="w-full sm:w-auto px-8 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>ابدأ الجلسة الآن ({selectedDurationMinutes} دقيقة)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Session Running Screen (Divided into 4 Quarters)
  const quarterInfo = SESSION_QUARTERS[currentQuarter];

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6" dir="rtl">
      {/* Session Header & Non-Punitive Timer Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200/80 shadow-xs mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Quarter Indicators */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map(q => {
              const isActive = currentQuarter === q;
              const isPast = currentQuarter > q;
              return (
                <button
                  key={q}
                  onClick={() => goToQuarter(q as QuarterType)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : isPast
                      ? 'bg-stone-200 text-stone-700'
                      : 'bg-stone-100 text-stone-400 hover:bg-stone-200 hover:text-stone-700'
                  }`}
                >
                  <span>الربع {q}</span>
                  {isPast && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-stone-500 block">الوقت المتبقي للربع</span>
              <span className="text-lg font-extrabold text-stone-900 font-latin tabular-nums">
                {formatSeconds(quarterTimeRemainingSeconds)}
              </span>
            </div>

            <button
              onClick={togglePause}
              className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
              title={isPaused ? 'استئناف' : 'إيقاف مؤقت'}
            >
              {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
            </button>

            <button
              onClick={endSession}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              إنهاء الجلسة
            </button>
          </div>
        </div>

        {/* Recommended Duration Ended Alert (Non-punitive) */}
        {isQuarterRecommendedTimeEnded && (
          <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
              <p>
                <strong>اكتمل الوقت الموصى به لهذا الربع!</strong> خذ وقتك كاملاً لإنهاء نشاطك الحالي دون أي استعجال، ثم انتقل للربع التالي عندما تكون مستعداً.
              </p>
            </div>
            {currentQuarter < 4 && (
              <button
                onClick={nextQuarter}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shrink-0 transition-colors"
              >
                انتقل للربع {currentQuarter + 1}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Learning Canvas based on Current Quarter */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm text-right">
        {/* Quarter Banner Header */}
        <div className="border-b border-stone-100 pb-5 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                الربع {currentQuarter} من 4
              </span>
              <h2 className="text-xl font-extrabold text-stone-900">{quarterInfo.titleAr}</h2>
            </div>
            <p className="text-xs text-stone-500">{quarterInfo.descriptionAr}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleSaveSentence(currentSentence.id)}
              className={`p-2 rounded-xl border text-xs flex items-center gap-1 transition-colors ${
                isSaved ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold' : 'border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
              title="حفظ الجملة في المراجعة"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'محفوظة' : 'حفظ الجملة'}</span>
            </button>

            <button
              onClick={onOpenCompanion}
              className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>اسأل فرهود عن هذه الجملة</span>
            </button>
          </div>
        </div>

        {/* Sentence Card with English & Arabic */}
        <div className="bg-stone-50 p-6 sm:p-8 rounded-3xl border border-stone-200/80 text-center my-6">
          <span className="text-[11px] font-bold text-stone-500 block mb-3">
            {currentSentence.topicNameAr} ({currentSentence.topicNameEn})
          </span>

          {/* Primary English Sentence */}
          <div className="my-4">
            <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-stone-900 font-latin leading-relaxed" dir="ltr">
              "{currentSentence.english}"
            </p>
          </div>

          {/* Primary Arabic Translation */}
          <div className="mt-3 pt-3 border-t border-stone-200/60 max-w-xl mx-auto">
            <p className="text-base sm:text-lg font-bold text-stone-800 leading-normal">
              "{currentSentence.arabic}"
            </p>
          </div>

          {/* Context Explanation */}
          {currentSentence.contextAr && (
            <p className="text-xs text-stone-500 mt-2 max-w-md mx-auto leading-relaxed">
              💡 {currentSentence.contextAr}
            </p>
          )}

          {/* Audio Controls */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => handlePlayAudio(0.9)}
              className="px-5 py-2.5 bg-white hover:bg-stone-100 text-stone-900 font-bold text-xs rounded-xl border border-stone-200 shadow-2xs flex items-center gap-2 transition-all active:scale-95"
            >
              <Volume2 className="w-4 h-4 text-amber-600" />
              <span>استمع بالنطق الطبيعي</span>
            </button>
            <button
              onClick={() => handlePlayAudio(0.75)}
              className="px-4 py-2 bg-white hover:bg-stone-100 text-stone-700 text-xs rounded-xl border border-stone-200 shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <span>نطق بطيء للتدريب</span>
            </button>
          </div>
        </div>

        {/* Quarter-Specific Activities */}
        {currentQuarter === 1 && (
          /* Quarter 1: Listening Immersion */
          <div className="mt-6 p-5 bg-white rounded-2xl border border-stone-200 text-right">
            <h4 className="text-xs font-bold text-stone-700 mb-2">تعليمات جلسة الاستماع:</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              استمع للجملة 3 مرات متتالية. ركز في المرة الأولى على الفكرة العامة، وفي المرة الثانية على نبرة السؤال أو التوكيد، وفي المرة الثالثة على مخارج الحروف الصعبة.
            </p>
          </div>
        )}

        {currentQuarter === 2 && (
          /* Quarter 2: Reading & Vocabulary Breakdown */
          <div className="mt-6 p-5 bg-white rounded-2xl border border-stone-200 text-right">
            <h4 className="text-xs font-bold text-stone-700 mb-3">المفردات وتراكيب الجملة:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {currentSentence.vocabulary.map((v, i) => (
                <div key={i} className="p-2.5 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between">
                  <span className="font-bold text-stone-900 font-latin" dir="ltr">{v.word}</span>
                  <span className="text-stone-600">{v.meaningAr}</span>
                </div>
              ))}
            </div>

            {currentSentence.pdfReference && (
              <div className="mt-4 p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-[11px] text-amber-900">
                <span className="font-bold">📘 مرجع كتيّب المنهج (ص {currentSentence.pdfReference.pageNumber}):</span> {currentSentence.pdfReference.quoteAr}
              </div>
            )}
          </div>
        )}

        {currentQuarter === 3 && (
          /* Quarter 3: Speaking & Pronunciation Practice */
          <div className="mt-6 p-5 bg-white rounded-2xl border border-stone-200 text-center">
            <h4 className="text-sm font-bold text-stone-800 mb-2">تدرّب على نطق هذه الجملة بصوتك:</h4>
            <p className="text-xs text-stone-500 mb-4">
              اضغط على زر الميكروفون، انطق الجملة بالإنجليزية بوضوح، وسنقيم تطابق مخارج الصوت.
            </p>

            <button
              onClick={handleStartSpeaking}
              className={`p-4 rounded-full text-white shadow-md transition-all active:scale-95 ${
                isRecording ? 'bg-red-600 animate-pulse ring-4 ring-red-200' : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              <Mic className="w-6 h-6" />
            </button>
            <p className="text-xs font-bold mt-2 text-stone-700">
              {isRecording ? 'جاري الاستماع لصوتك... تحدث الآن' : 'اضغط للتحدث'}
            </p>

            {speechTranscript && (
              <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                <span className="text-stone-500 block">ما التقطه النظام:</span>
                <p className="font-bold text-stone-900 font-latin mt-1">"{speechTranscript}"</p>
              </div>
            )}

            {speechFeedback && (
              <div className={`mt-3 p-3 rounded-xl border text-xs ${
                speechFeedback.score >= 80 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <p className="font-bold">{speechFeedback.text}</p>
              </div>
            )}
          </div>
        )}

        {currentQuarter === 4 && (
          /* Quarter 4: Prompt to open exercises */
          <div className="mt-6 p-5 bg-amber-50/70 rounded-2xl border border-amber-200 text-right">
            <h4 className="text-sm font-bold text-amber-900 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              الربع الرابع: التمارين المكثفة
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed mb-4">
              طبّق ما تعلمته في هذه الجلسة عبر التمارين التفاعلية المتنوعة (الاختيارات، التوصيل، التهجئة، وإعادة الترتيب).
            </p>
            <button
              onClick={() => {
                markSentenceCompleted(currentSentence.id);
                // Can trigger exercise mode
              }}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              انتقل لتمارين هذا الدرس
            </button>
          </div>
        )}

        {/* Navigation between Sentences */}
        <div className="mt-8 pt-5 border-t border-stone-100 flex items-center justify-between">
          <button
            onClick={() => {
              if (activeSentenceIndex > 0) {
                setActiveSentenceIndex(prev => prev - 1);
              }
            }}
            disabled={activeSentenceIndex === 0}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 disabled:opacity-40 transition-colors flex items-center gap-1"
          >
            <ChevronRight className="w-4 h-4" />
            <span>الجملة السابقة</span>
          </button>

          <span className="text-xs text-stone-400 font-latin">
            {activeSentenceIndex + 1} / {activeSentences.length}
          </span>

          <button
            onClick={() => {
              markSentenceCompleted(currentSentence.id);
              if (activeSentenceIndex < activeSentences.length - 1) {
                setActiveSentenceIndex(prev => prev + 1);
              } else if (currentQuarter < 4) {
                nextQuarter();
              }
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white transition-colors flex items-center gap-1"
          >
            <span>الجملة التالية</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
