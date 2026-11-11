import React, { useState } from 'react';
import {
  GraduationCap,
  Volume2,
  Bookmark,
  Sparkles,
  Search,
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';
import { HADRAMOUT_CURRICULUM_TOPICS, CurriculumTopic, SentenceItem } from '../../data/curriculumData.ts';
import { playEnglishAudio } from '../../services/audioService.ts';
import { toggleSaveSentence } from '../../services/storageService.ts';
import { useSession } from '../../context/SessionContext.tsx';

interface CurriculumViewerProps {
  onOpenCompanion: () => void;
  onSentenceSelected: (sentence: SentenceItem) => void;
}

export const CurriculumViewer: React.FC<CurriculumViewerProps> = ({
  onOpenCompanion,
  onSentenceSelected
}) => {
  const { progress } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(HADRAMOUT_CURRICULUM_TOPICS[0].id);

  const filteredTopics = HADRAMOUT_CURRICULUM_TOPICS.filter(topic => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      topic.titleAr.includes(q) ||
      topic.titleEn.toLowerCase().includes(q) ||
      topic.sentences.some(s => s.english.toLowerCase().includes(q) || s.arabic.includes(q))
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
                المرجع الرسمي المعتمد
              </span>
              <span className="text-xs text-stone-500">الوحدات من 1 إلى 12</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              مقرر الصف الحادي عشر — المنهج اليمني (حضرموت)
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-2xl leading-relaxed">
              استعراض شامل لكتيّب المراجعة الرسمية الصادر لمدارس حضرموت: القواعد، المصطلحات، نصوص القراءة، واختبارات الشهادة السابقة بالكامل.
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
            <GraduationCap className="w-8 h-8 text-amber-700" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-6 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث في دروس أو قواعد أو جمل منهج حضرموت..."
            className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3 pr-11 pl-4 text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-amber-600 transition-colors"
          />
          <Search className="w-5 h-5 text-stone-400 absolute right-3.5 top-3.5" />
        </div>
      </div>

      {/* Topics Accordion List */}
      <div className="space-y-4">
        {filteredTopics.map(topic => {
          const isExpanded = expandedTopicId === topic.id;
          return (
            <div
              key={topic.id}
              className="bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-2xs transition-all text-right"
            >
              {/* Accordion Header */}
              <button
                onClick={() => setExpandedTopicId(isExpanded ? null : topic.id)}
                className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 text-right hover:bg-stone-50/50 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-amber-900 flex items-center justify-center font-bold text-sm shrink-0">
                    {topic.unit}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-stone-900">{topic.titleAr}</h3>
                      <span className="text-[11px] text-stone-400 font-latin hidden sm:inline">({topic.titleEn})</span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">{topic.summaryAr}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg">
                    {topic.pdfPages}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-stone-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-stone-400" />
                  )}
                </div>
              </button>

              {/* Accordion Content */}
              {isExpanded && (
                <div className="px-5 pb-6 sm:px-6 pt-2 border-t border-stone-100 space-y-4">
                  <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/60 text-xs text-amber-900 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold mb-1">📘 توثيق كتيّب مراجعة حضرموت:</p>
                      <p className="opacity-90 leading-relaxed">
                        هذه الوحدة معتمدة رسمياً في الاختبارات الوزارية لطلاب الصف الحادي عشر في ثانويات حضرموت (المكلا، سيئون، الشحر، وتريم).
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onSentenceSelected(topic.sentences[0]);
                        onOpenCompanion();
                      }}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shrink-0 transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>اسأل عن هذا الدرس</span>
                    </button>
                  </div>

                  {/* Sentences Cards */}
                  <div className="space-y-3">
                    {topic.sentences.map(sentence => {
                      const isSaved = progress.savedSentenceIds.includes(sentence.id);
                      return (
                        <div
                          key={sentence.id}
                          className="p-4 sm:p-5 rounded-2xl border border-stone-200 bg-stone-50/60 hover:bg-stone-50 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                            <span className="text-[11px] text-amber-800 font-bold bg-white px-2 py-0.5 rounded-md border border-stone-200">
                              {sentence.level === 'beginner' ? 'مستوى مبتدئ' : sentence.level === 'intermediate' ? 'مستوى متوسط' : 'مستوى متقدم'}
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
                            </div>
                          </div>

                          {/* English Sentence */}
                          <p className="text-base sm:text-lg font-bold text-stone-900 font-latin leading-relaxed" dir="ltr">
                            "{sentence.english}"
                          </p>

                          {/* Arabic Translation */}
                          <p className="text-sm font-semibold text-stone-700 mt-1.5">
                            "{sentence.arabic}"
                          </p>

                          {/* Context */}
                          {sentence.contextAr && (
                            <p className="text-xs text-stone-500 mt-1">
                              💡 {sentence.contextAr}
                            </p>
                          )}

                          {/* Key Vocabulary Chips */}
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
