import React, { useState, useMemo } from 'react';
import {
  Play,
  Pause,
  Volume2,
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  XCircle,
  Plus,
  Loader2,
  BookOpen
} from 'lucide-react';
import { useSession } from '../../context/SessionContext.tsx';
import { formatDurationExact } from '../../services/sessionPlanner.ts';
import { playEnglishAudio } from '../../services/audioService.ts';
import { SpeechPracticePanel } from '../speech/SpeechPracticePanel.tsx';
import { SentenceItem } from '../../data/curriculumData.ts';
import { EXERCISES_COLLECTION } from '../../data/exerciseData.ts';
import { ExerciseCardRenderer } from '../exercises/ExerciseEngine.tsx';
import { WritingEvalBox } from '../learning/WritingEvalBox.tsx';
import { LexicalDeepModal } from '../learning/LexicalDeepModal.tsx';
import {
  fetchDeepTopicExplanation,
  fetchUnlimitedExamples,
  fetchAdaptiveExercise,
  fetchMistakeDiagnosis,
  DeepExplanationResult,
  AdaptiveGeneratedExercise,
  MistakeDiagnosisResult
} from '../../services/pedagogyClient.ts';

interface ActiveSessionViewProps {
  onOpenAssistantWithContext: (sentence: SentenceItem) => void;
  onSessionExit: () => void;
}

export const ActiveSessionView: React.FC<ActiveSessionViewProps> = ({
  onOpenAssistantWithContext,
  onSessionExit
}) => {
  const {
    progress,
    selectedLesson,
    plannedActivities,
    currentActivityIndex,
    currentActivity,
    activityTimeRemainingSeconds,
    isActivityRecommendedTimeEnded,
    isPaused,
    completedActivityIds,
    nextActivity,
    prevActivity,
    goToActivity,
    markCurrentActivityDone,
    togglePause,
    endSession,
    markSentenceCompleted,
    toggleBookmarkSentence,
    recordExerciseResult
  } = useSession();

  const [extraSessionSentences, setExtraSessionSentences] = useState<SentenceItem[]>([]);
  const [loadingExtraExamples, setLoadingExtraExamples] = useState(false);

  const baseSentences = selectedLesson?.sentences || [];
  const sentences = useMemo(
    () => [...baseSentences, ...extraSessionSentences],
    [baseSentences, extraSessionSentences]
  );

  const [sentenceIdx, setSentenceIdx] = useState(0);
  const currentSentence = sentences[sentenceIdx] || sentences[0];

  // Deep explanation & lexical modal inside session
  const [deepExplanation, setDeepExplanation] = useState<DeepExplanationResult | null>(null);
  const [loadingDeep, setLoadingDeep] = useState(false);
  const [sessionPedagogyError, setSessionPedagogyError] = useState<string | null>(null);
  const [lexicalTarget, setLexicalTarget] = useState<{
    word: string;
    meaningAr?: string;
    context?: string;
  } | null>(null);

  // Adaptive comprehension check inside session
  const [adaptiveCheck, setAdaptiveCheck] = useState<AdaptiveGeneratedExercise | null>(null);
  const [loadingAdaptive, setLoadingAdaptive] = useState(false);
  const [adaptiveSelected, setAdaptiveSelected] = useState<string | null>(null);
  const [adaptiveChecked, setAdaptiveChecked] = useState(false);

  // Dictation mistake diagnosis
  const [dictationDiagnosis, setDictationDiagnosis] = useState<MistakeDiagnosisResult | null>(null);
  const [loadingDictDiagnosis, setLoadingDictDiagnosis] = useState(false);

  // State for interactive inline activity exercises (spelling, reorder, fill_blank, translation, dictation)
  const [dictationInput, setDictationInput] = useState('');
  const [dictationChecked, setDictationChecked] = useState(false);
  const [dictationCorrect, setDictationCorrect] = useState(false);

  const [spellingLetters, setSpellingLetters] = useState<string[]>([]);
  const [spellingChecked, setSpellingChecked] = useState(false);

  const [reorderWords, setReorderWords] = useState<string[]>([]);
  const [reorderChecked, setReorderChecked] = useState(false);

  const [selectedTranslationIdx, setSelectedTranslationIdx] = useState<number | null>(null);
  const [translationChecked, setTranslationChecked] = useState(false);

  // Pick any curriculum-matching modular exercise if available for this lesson
  const matchingCatalogExercise = useMemo(() => {
    if (!selectedLesson) return null;
    const found = EXERCISES_COLLECTION.find(ex => ex.topicId === selectedLesson.id);
    return found || EXERCISES_COLLECTION[0];
  }, [selectedLesson]);

  // Target spelling word derived deterministically from current sentence vocabulary
  const targetVocabWord = useMemo(() => {
    const firstWord = currentSentence?.vocabulary?.[0]?.word || '';
    const cleaned = firstWord.replace(/[^a-zA-Z]/g, '').toUpperCase();
    return cleaned.length >= 3 ? cleaned : 'ENGLISH';
  }, [currentSentence]);

  const scrambledSpellingPool = useMemo(() => {
    const letters = targetVocabWord.split('');
    return [...letters].sort((a, b) => a.charCodeAt(0) - b.charCodeAt(0));
  }, [targetVocabWord]);

  // Words pool for sentence reorder derived from currentSentence
  const sentenceWords = useMemo(() => {
    if (!currentSentence) return [];
    return currentSentence.english.split(/\s+/).filter(Boolean);
  }, [currentSentence]);

  const scrambledSentenceWords = useMemo(() => {
    return [...sentenceWords].sort((a, b) => a.localeCompare(b));
  }, [sentenceWords]);

  if (!selectedLesson || !currentActivity || !currentSentence) {
    return null;
  }

  const isSaved = progress.savedSentenceIds.includes(currentSentence.id);

  const resetInlineActivityStates = () => {
    setDictationInput('');
    setDictationChecked(false);
    setDictationCorrect(false);
    setDictationDiagnosis(null);
    setSpellingLetters([]);
    setSpellingChecked(false);
    setReorderWords([]);
    setReorderChecked(false);
    setSelectedTranslationIdx(null);
    setTranslationChecked(false);
    setSessionPedagogyError(null);
  };

  const handleLoadDeepExplanation = async () => {
    setLoadingDeep(true);
    setSessionPedagogyError(null);
    try {
      const res = await fetchDeepTopicExplanation({
        topicTitleAr: selectedLesson.titleAr,
        topicTitleEn: selectedLesson.titleEn,
        cefrLevel: progress.cefrLevel
      });
      setDeepExplanation(res);
    } catch (err: any) {
      setSessionPedagogyError(err?.message || 'تعذر تحميل الشرح العميق حالياً.');
    } finally {
      setLoadingDeep(false);
    }
  };

  const handleGenerateMoreSessionExamples = async () => {
    setLoadingExtraExamples(true);
    setSessionPedagogyError(null);
    try {
      const res = await fetchUnlimitedExamples({
        topicTitleAr: selectedLesson.titleAr,
        topicTitleEn: selectedLesson.titleEn,
        cefrLevel: progress.cefrLevel,
        contextDomain: selectedLesson.titleAr,
        count: 4,
        excludeSentences: sentences.map(s => s.english)
      });
      const converted: SentenceItem[] = (res.examples || []).map((ex, i) => ({
        id: `${selectedLesson.id}_dyn_${Date.now()}_${i}`,
        topicId: selectedLesson.id,
        english: ex.english,
        arabic: ex.arabic,
        source: selectedLesson.source,
        level: progress.level,
        topicNameAr: selectedLesson.titleAr,
        topicNameEn: selectedLesson.titleEn,
        contextAr: ex.grammarBreakdownAr,
        vocabulary: (ex.keyVocabulary || []).map(v => ({
          word: v.word,
          meaningAr: `${v.meaningAr} (${v.ipa})`
        }))
      }));
      if (converted.length > 0) {
        const startIdx = sentences.length;
        setExtraSessionSentences(prev => [...prev, ...converted]);
        setSentenceIdx(startIdx);
      }
    } catch (err: any) {
      setSessionPedagogyError(err?.message || 'تعذر توليد أمثلة إضافية حالياً.');
    } finally {
      setLoadingExtraExamples(false);
    }
  };

  const handleLoadAdaptiveCheck = async () => {
    setLoadingAdaptive(true);
    setSessionPedagogyError(null);
    setAdaptiveSelected(null);
    setAdaptiveChecked(false);
    try {
      const weakCategories = Object.values(progress.errorPatterns)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map(p => p.categoryAr);
      const item = await fetchAdaptiveExercise({
        topicId: selectedLesson.id,
        topicTitleAr: selectedLesson.titleAr,
        topicTitleEn: selectedLesson.titleEn,
        cefrLevel: progress.cefrLevel,
        weakCategories
      });
      setAdaptiveCheck(item);
    } catch (err: any) {
      setSessionPedagogyError(err?.message || 'تعذر توليد سؤال التحقق التكيّفي.');
    } finally {
      setLoadingAdaptive(false);
    }
  };

  const handleDiagnoseDictation = async () => {
    setLoadingDictDiagnosis(true);
    try {
      const diag = await fetchMistakeDiagnosis({
        expectedEnglish: currentSentence.english,
        studentAnswer: dictationInput,
        arabicTranslation: currentSentence.arabic,
        topicTitleAr: selectedLesson.titleAr,
        cefrLevel: progress.cefrLevel
      });
      setDictationDiagnosis(diag);
    } catch (err: any) {
      setSessionPedagogyError(err?.message || 'تعذر تحليل الخطأ الإملائي حالياً.');
    } finally {
      setLoadingDictDiagnosis(false);
    }
  };

  const handleExit = () => {
    endSession();
    onSessionExit();
  };

  const renderActivityBody = () => {
    switch (currentActivity.method) {
      case 'listening':
        return (
          <div className="space-y-5">
            <div className="surface-icy rounded-2xl p-6 text-center space-y-4">
              <p className="text-xs font-medium text-slate-500">استمع للجملة الإنجليزية ثم اقرأ معناها العربي</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 font-latin leading-relaxed" dir="ltr">
                {currentSentence.english}
              </p>
              <p className="text-base font-medium text-slate-700">{currentSentence.arabic}</p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    playEnglishAudio(currentSentence.english, 0.92);
                    recordExerciseResult(true, undefined, 'listening');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>استماع طبيعي</span>
                </button>
                <button
                  type="button"
                  onClick={() => playEnglishAudio(currentSentence.english, 0.72)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-sky-300 text-slate-700 text-xs font-semibold transition-colors"
                >
                  <span>استماع بطيء</span>
                </button>
                <button
                  type="button"
                  onClick={handleGenerateMoreSessionExamples}
                  disabled={loadingExtraExamples}
                  className="px-4 py-2.5 rounded-xl bg-white border border-sky-200 hover:bg-sky-50 text-sky-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {loadingExtraExamples ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>أمثلة إضافية</span>
                </button>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              ركّز على إيقاع الجملة ومخارج الكلمات، ثم كرر الاستماع قبل الانتقال للجملة التالية.
            </p>
          </div>
        );

      case 'reading':
      case 'vocabulary':
        return (
          <div className="space-y-5">
            <div className="surface-icy rounded-2xl p-6 space-y-3 text-right">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-slate-500">{currentSentence.topicNameAr}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLoadDeepExplanation}
                    disabled={loadingDeep}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-sky-300 text-xs font-semibold text-slate-800 flex items-center gap-1.5"
                  >
                    {loadingDeep ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BookOpen className="w-3.5 h-3.5 text-sky-700" />}
                    <span>شرح عميق للقاعدة</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateMoreSessionExamples}
                    disabled={loadingExtraExamples}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-sky-300 text-xs font-semibold text-slate-800 flex items-center gap-1.5"
                  >
                    {loadingExtraExamples ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5 text-sky-700" />}
                    <span>أمثلة بلا حدود</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => playEnglishAudio(currentSentence.english)}
                    className="p-2 rounded-xl bg-white border border-slate-200 hover:border-sky-300 text-sky-600"
                    title="استماع"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-lg sm:text-xl font-bold text-slate-900 font-latin leading-relaxed" dir="ltr">
                {currentSentence.english}
              </p>
              <p className="text-sm sm:text-base font-medium text-slate-700">
                {currentSentence.arabic}
              </p>
              {currentSentence.contextAr && (
                <p className="text-xs text-slate-500 pt-2 border-t border-sky-200/60">
                  {currentSentence.contextAr}
                </p>
              )}
              {currentSentence.pdfReference && (
                <p className="text-xs text-sky-800 bg-white/80 p-3 rounded-xl border border-sky-100">
                  مرجع كتيّب المنهج (ص {currentSentence.pdfReference.pageNumber}): {currentSentence.pdfReference.quoteAr}
                </p>
              )}
            </div>

            {deepExplanation && (
              <div className="p-4 rounded-2xl border border-sky-200 bg-white text-xs text-slate-800 space-y-2 leading-relaxed">
                <p className="font-bold text-slate-900">الشرح العميق للموضوع:</p>
                <p>{deepExplanation.coreConceptAr}</p>
                <p><strong>الصيغة:</strong> <span className="font-latin font-semibold" dir="ltr">{deepExplanation.structureFormulaEn}</span></p>
                {deepExplanation.comparisonNoteAr && (
                  <p><strong>المقارنة اللغوية:</strong> {deepExplanation.comparisonNoteAr}</p>
                )}
                {deepExplanation.exceptionsAndMistakes?.[0] && (
                  <p>
                    <strong>خطأ شائع:</strong>{' '}
                    <span className="font-latin" dir="ltr">
                      {deepExplanation.exceptionsAndMistakes[0].wrongExampleEn} → {deepExplanation.exceptionsAndMistakes[0].correctExampleEn}
                    </span>{' '}
                    ({deepExplanation.exceptionsAndMistakes[0].whyAr})
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold text-slate-600">
                مفردات هذه الجملة في السياق (انقر على الكلمة للتحليل الصوتي والمعجمي العميق)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentSentence.vocabulary.map((v, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() =>
                      setLexicalTarget({
                        word: v.word,
                        meaningAr: v.meaningAr,
                        context: currentSentence.english
                      })
                    }
                    className="p-3.5 rounded-2xl bg-white hover:bg-[#F0F7FA] border border-slate-200/80 hover:border-sky-300 flex items-center justify-between gap-2 text-xs transition-colors"
                  >
                    <span className="font-bold text-slate-900 font-latin" dir="ltr">
                      {v.word}
                    </span>
                    <span className="text-slate-600">{v.meaningAr}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'phonetics':
      case 'pronunciation':
      case 'speaking':
        return (
          <div className="space-y-4">
            {currentActivity.method === 'phonetics' && (
              <div className="surface-icy rounded-2xl p-4 text-xs text-slate-700 space-y-1.5">
                <p className="font-bold text-slate-900">ملاحظة الصوتيات والنبر لهذه الجملة:</p>
                <p>
                  استمع بتركيز لنبر الكلمات المهمة والربط الصوتي بين نهاية الكلمة وبداية التي تليها، ثم سجل صوتك بالأسفل لتحليل نطقك كلمة بكلمة.
                </p>
              </div>
            )}
            <SpeechPracticePanel
              expectedSentence={currentSentence.english}
              arabicTranslation={currentSentence.arabic}
              lessonId={selectedLesson.id}
              onResultRecorded={assessment => {
                const success = assessment.matchedWordsCount >= Math.ceil(assessment.totalExpectedWords * 0.7);
                recordExerciseResult(
                  success,
                  success
                    ? undefined
                    : {
                        sentenceId: currentSentence.id,
                        english: currentSentence.english,
                        arabic: currentSentence.arabic,
                        topicTitleAr: selectedLesson.titleAr,
                        explanationAr: 'حاول نطق الجملة بتأنٍّ مع الانتباه لمخارج الحروف.',
                        errorCategory: 'pronunciation'
                      },
                  currentActivity.method === 'speaking' ? 'speaking' : 'pronunciation'
                );
                if (success) markCurrentActivityDone();
              }}
            />
          </div>
        );

      case 'writing_studio':
        return (
          <WritingEvalBox
            taskPromptAr={`اكتب جملة أو فقرة قصيرة أصيلة مستوحاة من درس "${selectedLesson.titleAr}" مستخدماً مفرداته أو قاعدته.`}
            targetGrammarRule={selectedLesson.titleEn}
            defaultMode="sentence"
            onEvaluated={res => {
              if (res.isAcceptable) markCurrentActivityDone();
            }}
          />
        );

      case 'comprehension_check':
        return (
          <div className="space-y-4">
            {!adaptiveCheck ? (
              <div className="surface-icy rounded-2xl p-6 text-center space-y-3">
                <p className="text-sm font-bold text-slate-900">
                  اختبار التحقق التكيّفي لهذا الدرس
                </p>
                <p className="text-xs text-slate-600">
                  يُولّد النظام سؤالاً جديداً يتناسب مع مستواك (<span className="font-latin">{progress.cefrLevel}</span>) للتأكد من فهمك الحقيقي قبل إنهاء الجلسة.
                </p>
                <button
                  type="button"
                  onClick={handleLoadAdaptiveCheck}
                  disabled={loadingAdaptive}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold inline-flex items-center gap-2"
                >
                  {loadingAdaptive ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-sky-300" />}
                  <span>توليد سؤال التحقق الآن</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="surface-icy p-4 rounded-2xl space-y-1.5">
                  <p className="text-sm font-semibold text-slate-900">
                    {adaptiveCheck.questionAr}
                  </p>
                  {adaptiveCheck.promptEn && (
                    <p className="text-sm font-latin font-bold text-slate-800" dir="ltr">
                      {adaptiveCheck.promptEn}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {adaptiveCheck.options.map(opt => {
                    const selected = adaptiveSelected === opt.id;
                    const right = opt.id === adaptiveCheck.correctOptionId;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={adaptiveChecked}
                        onClick={() => setAdaptiveSelected(opt.id)}
                        className={`p-3.5 rounded-2xl border text-left font-latin text-sm font-semibold transition-colors ${
                          adaptiveChecked && right
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                            : adaptiveChecked && selected
                            ? 'border-red-400 bg-red-50 text-red-900'
                            : selected
                            ? 'border-sky-600 bg-[#F0F7FA] text-slate-900'
                            : 'border-slate-200 bg-white hover:border-sky-200 text-slate-800'
                        }`}
                        dir="ltr"
                      >
                        {opt.text}
                      </button>
                    );
                  })}
                </div>
                {!adaptiveChecked ? (
                  <button
                    type="button"
                    disabled={!adaptiveSelected}
                    onClick={() => {
                      const ok = adaptiveSelected === adaptiveCheck.correctOptionId;
                      setAdaptiveChecked(true);
                      recordExerciseResult(
                        ok,
                        ok
                          ? undefined
                          : {
                              sentenceId: `adapt_${Date.now()}`,
                              english: adaptiveCheck.englishSentence,
                              arabic: adaptiveCheck.arabicTranslation,
                              topicTitleAr: selectedLesson.titleAr,
                              explanationAr: adaptiveCheck.deepExplanationAr,
                              errorCategory: 'tense_agreement'
                            },
                        'grammar'
                      );
                      if (ok) markCurrentActivityDone();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold disabled:opacity-40"
                  >
                    تحقق من الإجابة
                  </button>
                ) : (
                  <div className="surface-icy p-4 rounded-2xl text-xs space-y-1.5">
                    <p className="font-bold text-slate-900">{adaptiveCheck.arabicTranslation}</p>
                    <p className="text-slate-700 leading-relaxed">{adaptiveCheck.deepExplanationAr}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'dictation':
        return (
          <div className="space-y-4">
            <div className="surface-icy rounded-2xl p-5 text-center space-y-3">
              <p className="text-xs text-slate-600">استمع للجملة كاملة ثم اكتبها بالإنجليزية بدقة</p>
              <button
                type="button"
                onClick={() => playEnglishAudio(currentSentence.english, 0.85)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-2"
              >
                <Volume2 className="w-4 h-4" />
                <span>تشغيل الجملة للإملاء</span>
              </button>
              <p className="text-xs text-slate-500">المعنى العربي: {currentSentence.arabic}</p>
            </div>

            <textarea
              value={dictationInput}
              onChange={e => setDictationInput(e.target.value)}
              disabled={dictationChecked}
              placeholder="اكتب الجملة الإنجليزية هنا..."
              dir="ltr"
              rows={2}
              className="w-full p-4 rounded-2xl border border-slate-200 focus:border-sky-400 focus:outline-none font-latin text-sm text-slate-900 bg-white"
            />

            {!dictationChecked ? (
              <button
                type="button"
                disabled={!dictationInput.trim()}
                onClick={() => {
                  const cleanA = dictationInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                  const cleanB = currentSentence.english.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                  const ok = cleanA === cleanB;
                  setDictationCorrect(ok);
                  setDictationChecked(true);
                  recordExerciseResult(
                    ok,
                    ok
                      ? undefined
                      : {
                          sentenceId: currentSentence.id,
                          english: currentSentence.english,
                          arabic: currentSentence.arabic,
                          topicTitleAr: currentSentence.topicNameAr,
                          explanationAr:
                            currentSentence.contextAr ||
                            currentSentence.grammarPoint ||
                            'راجع النطق والإملاء الصحيح لهذه الجملة.',
                          errorCategory: 'spelling'
                        },
                    'listening'
                  );
                }}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold disabled:opacity-40"
              >
                تحقق من الكتابة
              </button>
            ) : (
              <div className="space-y-3">
                <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                  dictationCorrect ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-amber-50/70 border-amber-200 text-amber-900'
                }`}>
                  <p className="font-bold flex items-center gap-1.5">
                    {dictationCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-amber-600" />}
                    <span>{dictationCorrect ? 'كتابة إملائية صحيحة!' : 'توجد فروقات إملائية، قارن بالنص الصحيح:'}</span>
                  </p>
                  <p className="font-latin font-semibold" dir="ltr">{currentSentence.english}</p>
                </div>

                {!dictationCorrect && !dictationDiagnosis && (
                  <button
                    type="button"
                    onClick={handleDiagnoseDictation}
                    disabled={loadingDictDiagnosis}
                    className="px-4 py-2 rounded-xl bg-white border border-sky-200 text-xs font-semibold text-sky-900 flex items-center gap-1.5"
                  >
                    {loadingDictDiagnosis ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-sky-600" />}
                    <span>تحليل سبب الخطأ من الأستاذ</span>
                  </button>
                )}

                {dictationDiagnosis && (
                  <div className="p-4 rounded-2xl bg-[#F0F7FA] border border-sky-200 text-xs space-y-1.5 text-slate-800">
                    <p className="font-bold text-slate-900">{dictationDiagnosis.underlyingMisconceptionAr}</p>
                    <p className="text-slate-700 leading-relaxed">{dictationDiagnosis.contrastRuleAr}</p>
                    {dictationDiagnosis.contrastExamples?.slice(0, 2).map((ce, ci) => (
                      <p key={ci} className="font-latin text-slate-800" dir="ltr">
                        <span className="line-through text-red-700">{ce.wrongEn}</span>{' → '}
                        <span className="font-bold text-emerald-800">{ce.rightEn}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'spelling':
        return (
          <div className="space-y-4 text-center">
            <div className="surface-icy rounded-2xl p-4">
              <p className="text-xs text-slate-500">كوّن الكلمة الإنجليزية المطابقة للمعنى:</p>
              <p className="text-base font-bold text-slate-900 mt-1">
                {currentSentence.vocabulary?.[0]?.meaningAr || currentSentence.arabic}
              </p>
            </div>

            <div className="min-h-[54px] p-3 rounded-2xl bg-[#F0F7FA] border border-sky-100 flex items-center justify-center gap-1.5" dir="ltr">
              {spellingLetters.length === 0 ? (
                <span className="text-xs text-slate-400">انقر على الحروف بالترتيب</span>
              ) : (
                spellingLetters.map((ch, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={spellingChecked}
                    onClick={() => setSpellingLetters(prev => prev.filter((_, i) => i !== idx))}
                    className="w-9 h-9 rounded-xl bg-white border border-slate-200 font-latin font-bold text-sm text-slate-900"
                  >
                    {ch}
                  </button>
                ))
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-2" dir="ltr">
              {scrambledSpellingPool.map((ch, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={spellingChecked}
                  onClick={() => setSpellingLetters(prev => [...prev, ch])}
                  className="w-10 h-10 rounded-xl bg-white border border-slate-200 hover:border-sky-300 font-latin font-bold text-sm text-slate-900 shadow-2xs"
                >
                  {ch}
                </button>
              ))}
            </div>

            {!spellingChecked ? (
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSpellingLetters([])}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  مسح
                </button>
                <button
                  type="button"
                  disabled={spellingLetters.length === 0}
                  onClick={() => {
                    const ok = spellingLetters.join('') === targetVocabWord;
                    setSpellingChecked(true);
                    recordExerciseResult(
                      ok,
                      ok
                        ? undefined
                        : {
                            sentenceId: currentSentence.id,
                            english: targetVocabWord,
                            arabic: currentSentence.vocabulary?.[0]?.meaningAr || currentSentence.arabic,
                            topicTitleAr: currentSentence.topicNameAr,
                            explanationAr: 'راجع الحروف والهجاء الصحيح لهذه المفردة.',
                            errorCategory: 'spelling'
                          },
                      'vocabulary'
                    );
                  }}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold disabled:opacity-40"
                >
                  تحقق
                </button>
              </div>
            ) : (
              <p className="text-xs font-semibold text-slate-800">
                الكلمة الصحيحة: <span className="font-latin">{targetVocabWord}</span>
              </p>
            )}
          </div>
        );

      case 'sentence_reorder':
        return (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              رتّب الكلمات لتكوين الجملة الإنجليزية الصحيحة للمعنى: <strong>{currentSentence.arabic}</strong>
            </p>

            <div className="min-h-[56px] p-3 rounded-2xl bg-[#F0F7FA] border border-sky-100 flex flex-wrap gap-2 items-center" dir="ltr">
              {reorderWords.length === 0 ? (
                <span className="text-xs text-slate-400">اضغط على الكلمات بالأسفل لبناء الجملة...</span>
              ) : (
                reorderWords.map((w, i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={reorderChecked}
                    onClick={() => setReorderWords(prev => prev.filter((_, idx) => idx !== i))}
                    className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-latin font-semibold text-slate-900"
                  >
                    {w}
                  </button>
                ))
              )}
            </div>

            <div className="flex flex-wrap gap-2 justify-center" dir="ltr">
              {scrambledSentenceWords.map((w, i) => {
                const usedCount = reorderWords.filter(rw => rw === w).length;
                const totalCount = scrambledSentenceWords.filter(sw => sw === w).length;
                const disabled = reorderChecked || usedCount >= totalCount;
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={disabled}
                    onClick={() => setReorderWords(prev => [...prev, w])}
                    className={`px-3 py-2 rounded-xl text-xs font-latin font-semibold border transition-colors ${
                      disabled
                        ? 'bg-slate-100 border-slate-200 text-slate-400'
                        : 'bg-white border-slate-200 hover:border-sky-300 text-slate-800'
                    }`}
                  >
                    {w}
                  </button>
                );
              })}
            </div>

            {!reorderChecked ? (
              <button
                type="button"
                disabled={reorderWords.length === 0}
                onClick={() => {
                  const ok = reorderWords.join(' ') === sentenceWords.join(' ');
                  setReorderChecked(true);
                  recordExerciseResult(
                    ok,
                    ok
                      ? undefined
                      : {
                          sentenceId: currentSentence.id,
                          english: currentSentence.english,
                          arabic: currentSentence.arabic,
                          topicTitleAr: currentSentence.topicNameAr,
                          explanationAr: 'انتبه لترتيب الفاعل والفعل والمفعول في الجملة الإنجليزية.',
                          errorCategory: 'word_order'
                        },
                    'grammar'
                  );
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold disabled:opacity-40"
              >
                تحقق من الترتيب
              </button>
            ) : (
              <div className="surface-icy p-3.5 rounded-xl text-xs space-y-1">
                <p className="font-semibold text-slate-900">
                  {reorderWords.join(' ') === sentenceWords.join(' ') ? 'ترتيب صحيح!' : 'الترتيب السليم:'}
                </p>
                <p className="font-latin text-slate-700" dir="ltr">{currentSentence.english}</p>
              </div>
            )}
          </div>
        );

      case 'translation': {
        const distractors = sentences.filter(s => s.id !== currentSentence.id).slice(0, 2);
        const options = [
          { text: currentSentence.arabic, isCorrect: true },
          ...distractors.map(d => ({ text: d.arabic, isCorrect: false }))
        ];
        return (
          <div className="space-y-4">
            <div className="surface-icy rounded-2xl p-5 text-center">
              <p className="text-xs text-slate-500 mb-2">اختر الترجمة العربية الدقيقة للجملة التالية:</p>
              <p className="text-lg font-bold text-slate-900 font-latin" dir="ltr">
                {currentSentence.english}
              </p>
            </div>
            <div className="space-y-2">
              {options.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={translationChecked}
                  onClick={() => setSelectedTranslationIdx(idx)}
                  className={`w-full p-3.5 rounded-2xl border text-right text-sm transition-colors ${
                    translationChecked && opt.isCorrect
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold'
                      : selectedTranslationIdx === idx
                      ? 'bg-[#F0F7FA] border-sky-500 text-slate-900 font-semibold'
                      : 'bg-white border-slate-200 hover:border-sky-200 text-slate-800'
                  }`}
                >
                  {opt.text}
                </button>
              ))}
            </div>
            {!translationChecked && (
              <button
                type="button"
                disabled={selectedTranslationIdx === null}
                onClick={() => {
                  const ok = selectedTranslationIdx === 0;
                  setTranslationChecked(true);
                  recordExerciseResult(
                    ok,
                    ok
                      ? undefined
                      : {
                          sentenceId: currentSentence.id,
                          english: currentSentence.english,
                          arabic: currentSentence.arabic,
                          topicTitleAr: currentSentence.topicNameAr,
                          explanationAr: 'انتبه للمعنى السياقي الدقيق للجملة.',
                          errorCategory: 'vocabulary_choice'
                        },
                    'reading'
                  );
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold disabled:opacity-40"
              >
                تحقق من الترجمة
              </button>
            )}
          </div>
        );
      }

      case 'grammar_context':
      case 'choose_word':
      case 'fill_blank':
      case 'match_pairs':
      default:
        return matchingCatalogExercise ? (
          <ExerciseCardRenderer
            exercise={matchingCatalogExercise}
            onCompleted={isCorrect => {
              if (isCorrect) markCurrentActivityDone();
            }}
          />
        ) : null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6" dir="rtl">
      {/* Non-Punitive Activity Progress & Timer Bar */}
      <div className="glass-panel rounded-3xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {plannedActivities.map((act, idx) => {
              const isActive = idx === currentActivityIndex;
              const isDone = completedActivityIds.includes(act.id);
              return (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => {
                    resetInlineActivityStates();
                    goToActivity(idx);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : isDone
                      ? 'bg-[#F0F7FA] text-sky-800 border border-sky-200'
                      : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <span>{act.titleAr}</span>
                  {isDone && <Check className="w-3 h-3" />}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">الوقت الإرشادي للنشاط</span>
              <span className="text-base font-bold font-numeric text-slate-900">
                {formatDurationExact(activityTimeRemainingSeconds)}
              </span>
            </div>

            <button
              type="button"
              onClick={togglePause}
              className="p-2.5 rounded-xl bg-[#F0F7FA] hover:bg-sky-100 text-slate-800 transition-colors"
              title={isPaused ? 'استئناف' : 'إيقاف مؤقت'}
            >
              {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
            </button>

            <button
              type="button"
              onClick={handleExit}
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              إنهاء
            </button>
          </div>
        </div>

        {/* Non-punitive time completion prompt */}
        {isActivityRecommendedTimeEnded && (
          <div className="p-3.5 rounded-2xl bg-[#F0F7FA] border border-sky-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
              <span>
                انتهى الوقت الإرشادي لهذا النشاط — يمكنك إكمال ما بيدك بهدوء دون فقدان أي إجابة.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                resetInlineActivityStates();
                nextActivity();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold shrink-0"
            >
              {currentActivityIndex < plannedActivities.length - 1 ? 'الانتقال للنشاط التالي' : 'إتمام الجلسة'}
            </button>
          </div>
        )}
      </div>

      {/* Main Activity Canvas */}
      <div className="surface-card rounded-3xl p-6 sm:p-8 space-y-6 text-right">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs text-slate-500">
              {selectedLesson.titleAr} · النشاط {currentActivityIndex + 1} من {plannedActivities.length}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
              {currentActivity.titleAr}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleBookmarkSentence(currentSentence.id)}
              className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                isSaved
                  ? 'bg-[#F0F7FA] border-sky-300 text-sky-900'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current text-sky-600' : ''}`} />
              <span>{isSaved ? 'محفوظة' : 'حفظ'}</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenAssistantWithContext(currentSentence)}
              className="px-3.5 py-2 rounded-xl bg-[#F0F7FA] hover:bg-sky-100 border border-sky-200 text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>اسأل المساعد</span>
            </button>
          </div>
        </div>

        {sessionPedagogyError && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            {sessionPedagogyError}
          </div>
        )}

        {/* Dynamic Activity Content */}
        {renderActivityBody()}

        {/* Sentence & Activity Navigation Footer */}
        <div className="pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={sentenceIdx === 0}
              onClick={() => {
                resetInlineActivityStates();
                setSentenceIdx(prev => Math.max(0, prev - 1));
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1"
            >
              <ChevronRight className="w-4 h-4" />
              <span>جملة سابقة</span>
            </button>
            <span className="text-xs font-numeric text-slate-400">
              {sentenceIdx + 1}/{sentences.length}
            </span>
            <button
              type="button"
              disabled={sentenceIdx >= sentences.length - 1}
              onClick={() => {
                markSentenceCompleted(currentSentence.id);
                resetInlineActivityStates();
                setSentenceIdx(prev => Math.min(sentences.length - 1, prev + 1));
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1"
            >
              <span>جملة تالية</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {currentActivityIndex > 0 && (
              <button
                type="button"
                onClick={() => {
                  resetInlineActivityStates();
                  prevActivity();
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                النشاط السابق
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                markSentenceCompleted(currentSentence.id);
                resetInlineActivityStates();
                nextActivity();
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <span>
                {currentActivityIndex < plannedActivities.length - 1
                  ? 'النشاط التالي'
                  : 'إنهاء وحفظ الجلسة'}
              </span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Lexical Deep Modal */}
      <LexicalDeepModal
        word={lexicalTarget?.word || null}
        initialMeaningAr={lexicalTarget?.meaningAr}
        sentenceContext={lexicalTarget?.context}
        cefrLevel={progress.cefrLevel}
        onClose={() => setLexicalTarget(null)}
      />
    </div>
  );
};

