import React, { useState } from 'react';
import {
  Repeat,
  CheckCircle2,
  Volume2,
  RotateCcw,
  Sparkles,
  Bookmark,
  Check,
  AlertTriangle
} from 'lucide-react';
import { useSession } from '../../context/SessionContext.tsx';
import { markReviewItemMastered } from '../../services/storageService.ts';
import { playEnglishAudio } from '../../services/audioService.ts';
import { ALL_SENTENCES } from '../../data/everydayData.ts';

interface PersonalizedReviewProps {
  onOpenCompanion: () => void;
}

export const PersonalizedReview: React.FC<PersonalizedReviewProps> = ({ onOpenCompanion }) => {
  const { progress } = useSession();
  const [filter, setFilter] = useState<'all' | 'mistakes' | 'saved'>('all');

  const mistakes = progress.reviewDeck;
  const savedSentences = ALL_SENTENCES.filter(s => progress.savedSentenceIds.includes(s.id));

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6" dir="rtl">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs mb-8 text-right">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                نظام التكرار المتباعد الذكي
              </span>
              <span className="text-xs text-stone-500">مراجعة نقاط الصعوبة</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              المراجعة المخصصة وتثبيت الجمل
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-2xl leading-relaxed">
              تجمع لك منصة مهارة تلقائياً كل جملة أخطأت فيها في التمارين أو قمت بحفظها، لتتمكن من مراجعتها حتى تصل إلى الإتقان الكامل.
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
            <Repeat className="w-8 h-8 text-amber-700" />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-6 flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === 'all' ? 'bg-amber-600 text-white shadow-xs' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            الكل ({mistakes.length + savedSentences.length})
          </button>
          <button
            onClick={() => setFilter('mistakes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === 'mistakes' ? 'bg-amber-600 text-white shadow-xs' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            أخطاء تحتاج لتثبيت ({mistakes.length})
          </button>
          <button
            onClick={() => setFilter('saved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === 'saved' ? 'bg-amber-600 text-white shadow-xs' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            الجمل المحفوظة ({savedSentences.length})
          </button>
        </div>
      </div>

      {/* Review Items Feed */}
      <div className="space-y-4">
        {mistakes.length === 0 && savedSentences.length === 0 ? (
          <div className="p-12 bg-white rounded-3xl border border-stone-200 text-center">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-amber-700">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-stone-900 text-base">سجل المراجعة فارغ ومتقن!</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto leading-relaxed">
              عند حل التمارين التفاعلية، سيتم إضافة أي سؤال أو قاعدة تحتاج إلى مراجعة إضافية هنا تلقائياً لتعيد التدرب عليها.
            </p>
          </div>
        ) : (
          <>
            {/* Mistakes Section */}
            {(filter === 'all' || filter === 'mistakes') && mistakes.map(item => (
              <div
                key={item.id}
                className={`p-5 bg-white rounded-3xl border transition-all text-right ${
                  item.mastered ? 'border-emerald-200 bg-emerald-50/20' : 'border-amber-200/80 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                      {item.topicTitleAr}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      تكرار الخطأ: {item.reviewCount} مرات
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => playEnglishAudio(item.english)}
                      className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                      title="استماع للنطق"
                    >
                      <Volume2 className="w-4 h-4 text-amber-600" />
                    </button>
                    {!item.mastered ? (
                      <button
                        onClick={() => markReviewItemMastered(item.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>أتقنتها الآن</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تم الإتقان</span>
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-base sm:text-lg font-bold text-stone-900 font-latin leading-relaxed" dir="ltr">
                  "{item.english}"
                </p>

                <p className="text-sm font-semibold text-stone-700 mt-1.5">
                  "{item.arabic}"
                </p>

                {item.mistakeReasonAr && (
                  <div className="mt-3 p-3 bg-stone-50 rounded-xl border border-stone-200/70 text-xs text-stone-600">
                    <p className="font-semibold text-stone-800 mb-0.5">💡 توضيح الخطأ والقاعدة:</p>
                    <p>{item.mistakeReasonAr}</p>
                  </div>
                )}
              </div>
            ))}

            {/* Saved Sentences Section */}
            {(filter === 'all' || filter === 'saved') && savedSentences.map(sentence => (
              <div
                key={sentence.id}
                className="p-5 bg-white rounded-3xl border border-stone-200 shadow-2xs text-right"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-stone-700 bg-stone-100 px-2.5 py-0.5 rounded-full">
                    جملة محفوظة: {sentence.topicNameAr}
                  </span>

                  <button
                    onClick={() => playEnglishAudio(sentence.english)}
                    className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                    title="استماع للنطق"
                  >
                    <Volume2 className="w-4 h-4 text-amber-600" />
                  </button>
                </div>

                <p className="text-base sm:text-lg font-bold text-stone-900 font-latin leading-relaxed" dir="ltr">
                  "{sentence.english}"
                </p>

                <p className="text-sm font-semibold text-stone-700 mt-1.5">
                  "{sentence.arabic}"
                </p>

                {sentence.contextAr && (
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    💡 {sentence.contextAr}
                  </p>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
