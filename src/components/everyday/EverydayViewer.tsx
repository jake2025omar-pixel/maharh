import React, { useState } from 'react';
import {
  Coffee,
  Volume2,
  Bookmark,
  Sparkles,
  Search,
  MessageCircle,
  Tag,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { EVERYDAY_ENGLISH_CATEGORIES, EverydayCategory } from '../../data/everydayData.ts';
import { SentenceItem } from '../../data/curriculumData.ts';
import { playEnglishAudio } from '../../services/audioService.ts';
import { toggleSaveSentence } from '../../services/storageService.ts';
import { useSession } from '../../context/SessionContext.tsx';

interface EverydayViewerProps {
  onOpenCompanion: () => void;
  onSentenceSelected: (sentence: SentenceItem) => void;
}

export const EverydayViewer: React.FC<EverydayViewerProps> = ({
  onOpenCompanion,
  onSentenceSelected
}) => {
  const { progress } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  const filteredCategories = EVERYDAY_ENGLISH_CATEGORIES.filter(cat => {
    if (selectedCategoryId !== 'all' && cat.id !== selectedCategoryId) return false;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      cat.titleAr.includes(q) ||
      cat.titleEn.toLowerCase().includes(q) ||
      cat.sentences.some(s => s.english.toLowerCase().includes(q) || s.arabic.includes(q))
    );
  });

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6" dir="rtl">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs mb-8 text-right">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                مكتبة الإنجليزية اليومية الحياتية
              </span>
              <span className="text-xs text-stone-500">مواقف واقعية حية</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              تحدث الإنجليزية الطبيعية بثقة وطلاقة
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-2xl leading-relaxed">
              تعلم العبارات والمحادثات التي يستخدمها متحدثو الإنجليزية في حياتهم اليومية: المقاهي، المطارات، الفنادق، بيئة العمل، والمحادثات الرقمية مع الترجمة العربية الكاملة.
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
            <Coffee className="w-8 h-8 text-amber-700" />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          <button
            onClick={() => setSelectedCategoryId('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategoryId === 'all'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            جميع المواقف الحياتية
          </button>
          {EVERYDAY_ENGLISH_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategoryId === cat.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {cat.titleAr}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mt-4 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث عن جملة أو موقف (مثل: قهوة، مطار، تاكسي، بريد إلكتروني)..."
            className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3 pr-11 pl-4 text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-amber-600 transition-colors"
          />
          <Search className="w-5 h-5 text-stone-400 absolute right-3.5 top-3.5" />
        </div>
      </div>

      {/* Categories & Sentences Feed */}
      <div className="space-y-6">
        {filteredCategories.map(category => (
          <div
            key={category.id}
            className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-2xs text-right"
          >
            <div className="border-b border-stone-100 pb-3 mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-stone-900">{category.titleAr}</h3>
                <p className="text-xs text-stone-500 mt-0.5">{category.descriptionAr}</p>
              </div>
              <span className="text-xs text-stone-400 font-latin font-medium">
                {category.titleEn}
              </span>
            </div>

            {/* Sentences in this category */}
            <div className="space-y-3">
              {category.sentences.map(sentence => {
                const isSaved = progress.savedSentenceIds.includes(sentence.id);
                return (
                  <div
                    key={sentence.id}
                    className="p-4 sm:p-5 rounded-2xl border border-stone-200/70 bg-stone-50/50 hover:bg-stone-50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                        {sentence.level === 'beginner' ? 'مبتدئ' : sentence.level === 'intermediate' ? 'متوسط' : 'متقدم'}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => playEnglishAudio(sentence.english)}
                          className="p-1.5 rounded-lg bg-white hover:bg-stone-200 text-stone-700 transition-colors"
                          title="استماع للنطق"
                        >
                          <Volume2 className="w-4 h-4 text-amber-600" />
                        </button>
                        <button
                          onClick={() => toggleSaveSentence(sentence.id)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            isSaved ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-100'
                          }`}
                          title="حفظ الجملة"
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => {
                            onSentenceSelected(sentence);
                            onOpenCompanion();
                          }}
                          className="p-1.5 rounded-lg bg-white hover:bg-stone-200 text-stone-700 border border-stone-200 transition-colors"
                          title="اسأل فرهود"
                        >
                          <Sparkles className="w-4 h-4 text-amber-600" />
                        </button>
                      </div>
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

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {sentence.vocabulary.map((v, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-[11px]"
                        >
                          <strong className="font-latin text-stone-900" dir="ltr">{v.word}:</strong>
                          <span className="text-stone-600">{v.meaningAr}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
