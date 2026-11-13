import React, { useState } from 'react';
import {
  Repeat,
  CheckCircle2,
  Volume2,
  Check,
  Sparkles,
  Loader2,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useSession } from '../../context/SessionContext.tsx';
import { playEnglishAudio } from '../../services/audioService.ts';
import { ALL_SENTENCES } from '../../data/everydayData.ts';
import { SentenceItem } from '../../data/curriculumData.ts';
import { isReviewItemDue } from '../../services/storageService.ts';
import { fetchMistakeDiagnosis, MistakeDiagnosisResult } from '../../services/pedagogyClient.ts';

interface PersonalizedReviewProps {
  onOpenAssistant: (sentence?: SentenceItem) => void;
}

export const PersonalizedReview: React.FC<PersonalizedReviewProps> = ({ onOpenAssistant }) => {
  const { progress, resolveReviewMistake } = useSession();
  const [filter, setFilter] = useState<'all' | 'mistakes' | 'saved'>('all');
  const [showPatterns, setShowPatterns] = useState(false);

  // Verification check state per review item before marking mastered
  const [verifyingItemId, setVerifyingItemId] = useState<string | null>(null);
  const [verifyDiagByItem, setVerifyDiagByItem] = useState<Record<string, MistakeDiagnosisResult>>({});
  const [loadingVerifyId, setLoadingVerifyId] = useState<string | null>(null);
  const [verifyChoiceByItem, setVerifyChoiceByItem] = useState<Record<string, string>>({});
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const mistakes = progress.reviewDeck;
  const dueMistakesCount = mistakes.filter(isReviewItemDue).length;
  const savedSentences = ALL_SENTENCES.filter(s => progress.savedSentenceIds.includes(s.id));
  const recurringPatterns = Object.values(progress.errorPatterns).sort((a, b) => b.count - a.count);

  const handleStartVerifyCheck = async (
    reviewId: string,
    english: string,
    arabic: string,
    topicTitleAr: string
  ) => {
    setVerifyingItemId(reviewId);
    setVerifyError(null);
    if (verifyDiagByItem[reviewId]) return;

    setLoadingVerifyId(reviewId);
    try {
      const diag = await fetchMistakeDiagnosis({
        expectedEnglish: english,
        studentAnswer: '(needs spaced-repetition verification)',
        arabicTranslation: arabic,
        topicTitleAr,
        cefrLevel: progress.cefrLevel
      });
      setVerifyDiagByItem(prev => ({ ...prev, [reviewId]: diag }));
    } catch (err: any) {
      setVerifyError(err?.message || 'تعذر تحميل سؤال التحقق، يمكنك إعادة المحاولة.');
    } finally {
      setLoadingVerifyId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8" dir="rtl">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 text-right space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-sky-700">
              المراجعة الذكية والتكرار المتباعد · مستحقة اليوم: {dueMistakesCount}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              سجل المراجعة والجمل المحفوظة
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              تُجدوَل العناصر هنا وفق التكرار المتباعد مع تحليل لأنماط الأخطاء المتكررة واختبار تحقق قصير قبل اعتماد الإتقان.
            </p>
          </div>

          <div className="w-14 h-14 rounded-2xl surface-icy flex items-center justify-center shrink-0">
            <Repeat className="w-7 h-7 text-sky-700" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-sky-300'
              }`}
            >
              الكل ({mistakes.length + savedSentences.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('mistakes')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                filter === 'mistakes'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-sky-300'
              }`}
            >
              تحتاج للمراجعة ({mistakes.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('saved')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                filter === 'saved'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-sky-300'
              }`}
            >
              الجمل المحفوظة ({savedSentences.length})
            </button>
          </div>

          {recurringPatterns.length > 0 && (
            <button
              type="button"
              onClick={() => setShowPatterns(v => !v)}
              className="px-3.5 py-2 rounded-xl bg-[#F0F7FA] border border-sky-200 text-xs font-semibold text-slate-900 flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>{showPatterns ? 'إخفاء تحليل الأنماط' : `تحليل الأنماط المتكررة (${recurringPatterns.length})`}</span>
            </button>
          )}
        </div>

        {/* Collapsible Recurring Error Patterns Summary */}
        {showPatterns && recurringPatterns.length > 0 && (
          <div className="surface-icy rounded-2xl p-4 sm:p-5 space-y-3 border border-sky-200/70">
            <h3 className="text-xs font-bold text-slate-900">
              الأنماط اللغوية التي تحتاج لتركيز إضافي بناءً على محاولاتك الفعلية:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {recurringPatterns.map(pat => (
                <div
                  key={pat.category}
                  className="p-3 rounded-xl bg-white border border-slate-200/80 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-slate-900">{pat.categoryAr}</strong>
                    <span className="font-numeric text-amber-800 font-semibold">
                      {pat.count} {pat.count === 1 ? 'مرة' : 'مرات'}
                    </span>
                  </div>
                  {pat.recentExamples[0] && (
                    <p className="text-slate-500 font-latin truncate" dir="ltr">
                      {pat.recentExamples[0]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {verifyError && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
          {verifyError}
        </div>
      )}

      {/* Review Items Feed */}
      <div className="space-y-4">
        {mistakes.length === 0 && savedSentences.length === 0 ? (
          <div className="p-12 surface-card rounded-3xl text-center space-y-3">
            <div className="w-12 h-12 surface-icy rounded-2xl flex items-center justify-center mx-auto text-sky-700">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">سجل المراجعة فارغ حالياً</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              عند حفظ الجمل أو وجود إجابة غير دقيقة في التمارين، ستظهر هنا لتتمكن من مراجعتها وإتقانها.
            </p>
          </div>
        ) : (
          <>
            {(filter === 'all' || filter === 'mistakes') &&
              mistakes.map(item => {
                const isDue = isReviewItemDue(item);
                const isVerifying = verifyingItemId === item.id;
                const diag = verifyDiagByItem[item.id];
                const selectedVerifyChoice = verifyChoiceByItem[item.id];

                return (
                  <div
                    key={item.id}
                    className={`p-5 sm:p-6 surface-card rounded-3xl text-right space-y-3 ${
                      item.mastered ? 'bg-emerald-50/30 border-emerald-200' : ''
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                        <span>{item.topicTitleAr}</span>
                        <span aria-hidden="true">·</span>
                        <span>مرات التكرار: {item.reviewCount}</span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1 text-sky-800">
                          <Clock className="w-3 h-3" />
                          <span>
                            {item.mastered
                              ? `مجدولة للمراجعة بعد ${item.intervalDays || 3} أيام`
                              : isDue
                              ? 'مستحقة للمراجعة اليوم'
                              : `مراجعة مجدولة خلال ${item.intervalDays || 1} يوم`}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => playEnglishAudio(item.english)}
                          className="p-2 rounded-xl bg-[#F0F7FA] hover:bg-sky-100 text-sky-700 transition-colors"
                          title="استماع للنطق"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onOpenAssistant({
                              id: item.id,
                              topicId: item.id,
                              english: item.english,
                              arabic: item.arabic,
                              source: 'hadramout_curriculum',
                              level: 'intermediate',
                              topicNameAr: item.topicTitleAr,
                              topicNameEn: item.topicTitleAr,
                              contextAr: item.mistakeReasonAr,
                              vocabulary: []
                            })
                          }
                          className="p-2 rounded-xl bg-white border border-slate-200 hover:border-sky-300 text-sky-700 transition-colors"
                          title="اسأل المساعد"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>

                        {!item.mastered ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleStartVerifyCheck(
                                item.id,
                                item.english,
                                item.arabic,
                                item.topicTitleAr
                              )
                            }
                            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>تحقق ثم أتقنتها</span>
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>تم الإتقان</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-base sm:text-lg font-bold text-slate-900 font-latin leading-relaxed" dir="ltr">
                      {item.english}
                    </p>

                    <p className="text-sm font-medium text-slate-700">{item.arabic}</p>

                    {item.mistakeReasonAr && (
                      <div className="p-3.5 surface-icy rounded-2xl text-xs text-slate-600 space-y-1">
                        <p className="font-semibold text-slate-900">توضيح القاعدة:</p>
                        <p>{item.mistakeReasonAr}</p>
                      </div>
                    )}

                    {/* Verification Gate before Mastery */}
                    {isVerifying && !item.mastered && (
                      <div className="p-4 rounded-2xl border border-sky-200 bg-white space-y-3 text-xs">
                        {loadingVerifyId === item.id ? (
                          <div className="flex items-center gap-2 text-slate-600">
                            <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                            <span>جارٍ تجهيز سؤال التحقق للتثبيت...</span>
                          </div>
                        ) : diag?.verificationQuestion ? (
                          <>
                            <p className="font-bold text-slate-900">
                              تحقق من الفهم لاعتماد الإتقان: {diag.verificationQuestion.questionAr}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {diag.verificationQuestion.options.map(opt => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() =>
                                    setVerifyChoiceByItem(prev => ({ ...prev, [item.id]: opt }))
                                  }
                                  dir="ltr"
                                  className={`p-2.5 rounded-xl border text-left font-latin font-semibold ${
                                    selectedVerifyChoice === opt
                                      ? 'bg-[#F0F7FA] border-sky-500 text-slate-900'
                                      : 'bg-white border-slate-200 text-slate-800'
                                  }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                disabled={!selectedVerifyChoice}
                                onClick={() => {
                                  const passed =
                                    selectedVerifyChoice === diag.verificationQuestion.correctAnswer;
                                  resolveReviewMistake(item.id, passed);
                                  setVerifyingItemId(null);
                                }}
                                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold disabled:opacity-40"
                              >
                                تأكيد الإجابة
                              </button>
                              <button
                                type="button"
                                onClick={() => setVerifyingItemId(null)}
                                className="px-3 py-2 text-slate-500 hover:text-slate-800"
                              >
                                إلغاء
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-slate-600">
                              أكّد أنك راجعت الجملة وتستطيع استخدامها بشكل صحيح الآن:
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                resolveReviewMistake(item.id, true);
                                setVerifyingItemId(null);
                              }}
                              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold shrink-0"
                            >
                              تأكيد الإتقان
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

            {(filter === 'all' || filter === 'saved') &&
              savedSentences.map(sentence => (
                <div
                  key={sentence.id}
                  className="p-5 sm:p-6 surface-card rounded-3xl text-right space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-500 font-medium">
                      جملة محفوظة · {sentence.topicNameAr}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => playEnglishAudio(sentence.english)}
                        className="p-2 rounded-xl bg-[#F0F7FA] hover:bg-sky-100 text-sky-700 transition-colors"
                        title="استماع للنطق"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenAssistant(sentence)}
                        className="p-2 rounded-xl bg-white border border-slate-200 hover:border-sky-300 text-sky-700 transition-colors"
                        title="اسأل المساعد"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-base sm:text-lg font-bold text-slate-900 font-latin leading-relaxed" dir="ltr">
                    {sentence.english}
                  </p>

                  <p className="text-sm font-medium text-slate-700">{sentence.arabic}</p>

                  {sentence.contextAr && (
                    <p className="text-xs text-slate-500 leading-relaxed">{sentence.contextAr}</p>
                  )}
                </div>
              ))}
          </>
        )}
      </div>
    </div>
  );
};

