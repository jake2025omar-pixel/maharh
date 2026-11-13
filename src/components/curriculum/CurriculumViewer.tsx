import React, { useState } from 'react';
import {
  GraduationCap,
  Volume2,
  Bookmark,
  Sparkles,
  Search,
  ChevronDown,
  ChevronUp,
  Plus,
  Loader2,
  BookOpen,
  PenTool
} from 'lucide-react';
import { HADRAMOUT_CURRICULUM_TOPICS, SentenceItem } from '../../data/curriculumData.ts';
import { playEnglishAudio } from '../../services/audioService.ts';
import { useSession } from '../../context/SessionContext.tsx';
import {
  fetchDeepTopicExplanation,
  fetchUnlimitedExamples,
  DeepExplanationResult,
  DynamicExampleItem
} from '../../services/pedagogyClient.ts';
import { LexicalDeepModal } from '../learning/LexicalDeepModal.tsx';
import { WritingEvalBox } from '../learning/WritingEvalBox.tsx';

interface CurriculumViewerProps {
  onOpenAssistant: (sentence?: SentenceItem) => void;
}

export const CurriculumViewer: React.FC<CurriculumViewerProps> = ({ onOpenAssistant }) => {
  const { progress, toggleBookmarkSentence } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(
    HADRAMOUT_CURRICULUM_TOPICS[0].id
  );

  // Progressive disclosure deep pedagogy state per topic
  const [deepExpByTopic, setDeepExpByTopic] = useState<Record<string, DeepExplanationResult>>({});
  const [loadingDeepTopicId, setLoadingDeepTopicId] = useState<string | null>(null);
  const [extraExamplesByTopic, setExtraExamplesByTopic] = useState<Record<string, DynamicExampleItem[]>>({});
  const [loadingExamplesTopicId, setLoadingExamplesTopicId] = useState<string | null>(null);
  const [writingTopicId, setWritingTopicId] = useState<string | null>(null);
  const [topicError, setTopicError] = useState<string | null>(null);

  const [lexicalModalTarget, setLexicalModalTarget] = useState<{
    word: string;
    meaningAr?: string;
    context?: string;
  } | null>(null);

  const filteredTopics = HADRAMOUT_CURRICULUM_TOPICS.filter(topic => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      topic.titleAr.includes(q) ||
      topic.titleEn.toLowerCase().includes(q) ||
      topic.sentences.some(s => s.english.toLowerCase().includes(q) || s.arabic.includes(q))
    );
  });

  const handleLoadDeepExplanation = async (topicId: string, titleAr: string, titleEn: string) => {
    setLoadingDeepTopicId(topicId);
    setTopicError(null);
    try {
      const data = await fetchDeepTopicExplanation({
        topicTitleAr: titleAr,
        topicTitleEn: titleEn,
        cefrLevel: progress.cefrLevel
      });
      setDeepExpByTopic(prev => ({ ...prev, [topicId]: data }));
    } catch (err: any) {
      setTopicError(err?.message || 'تعذر تحميل الشرح العميق حالياً.');
    } finally {
      setLoadingDeepTopicId(null);
    }
  };

  const handleGenerateExamples = async (
    topicId: string,
    titleAr: string,
    titleEn: string,
    baseSentences: SentenceItem[]
  ) => {
    setLoadingExamplesTopicId(topicId);
    setTopicError(null);
    const existing = extraExamplesByTopic[topicId] || [];
    const excludeSentences = [
      ...baseSentences.map(s => s.english),
      ...existing.map(e => e.english)
    ];
    try {
      const res = await fetchUnlimitedExamples({
        topicTitleAr: titleAr,
        topicTitleEn: titleEn,
        cefrLevel: progress.cefrLevel,
        contextDomain: 'منهج الصف الحادي عشر (حضرموت)',
        count: 5,
        excludeSentences
      });
      setExtraExamplesByTopic(prev => ({
        ...prev,
        [topicId]: [...(prev[topicId] || []), ...(res.examples || [])]
      }));
    } catch (err: any) {
      setTopicError(err?.message || 'تعذر توليد أمثلة إضافية حالياً.');
    } finally {
      setLoadingExamplesTopicId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8" dir="rtl">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 text-right space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-sky-700">
              المرجع الرسمي المعتمد · {HADRAMOUT_CURRICULUM_TOPICS.length} قسماً تعليمياً
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              مقرر الصف الحادي عشر — المنهج اليمني (حضرموت)
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              كتيّب المراجعة الشاملة لمدارس حضرموت مع الشرح الأكاديمي المعمق، تحليل المفردات صوتياً ومعجمياً، وتوليد أمثلة لا محدودة للتطبيق.
            </p>
          </div>

          <div className="w-14 h-14 rounded-2xl surface-icy flex items-center justify-center shrink-0">
            <GraduationCap className="w-7 h-7 text-sky-700" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث في دروس أو قواعد أو جمل منهج حضرموت..."
            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pr-11 pl-4 text-sm text-slate-900 focus:outline-none focus:border-sky-400 transition-colors"
          />
          <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5" />
        </div>
      </div>

      {/* Topics Accordion List */}
      <div className="space-y-3.5">
        {filteredTopics.map(topic => {
          const isExpanded = expandedTopicId === topic.id;
          const topicDeep = deepExpByTopic[topic.id];
          const topicDynamicExamples = extraExamplesByTopic[topic.id] || [];
          const showWriting = writingTopicId === topic.id;

          return (
            <div
              key={topic.id}
              className="surface-card rounded-3xl overflow-hidden text-right"
            >
              <button
                type="button"
                onClick={() => {
                  setExpandedTopicId(isExpanded ? null : topic.id);
                  setTopicError(null);
                }}
                className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 text-right hover:bg-[#F0F7FA]/50 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#F0F7FA] border border-sky-200/70 text-sky-900 flex items-center justify-center font-bold font-numeric text-sm shrink-0">
                    {topic.unit}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">{topic.titleAr}</h3>
                      <span className="text-xs text-slate-400 font-latin hidden sm:inline">
                        {topic.titleEn}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{topic.summaryAr}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-slate-500 font-numeric">{topic.pdfPages}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-6 sm:px-6 pt-3 border-t border-slate-100 space-y-4">
                  <div className="surface-icy rounded-2xl p-4 text-xs text-slate-700 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="leading-relaxed">
                        مستخرج من كتيّب المراجعة الرسمية للصف الحادي عشر (حضرموت) — {topic.pdfPages}. انقر على أي كلمة للتفصيل الصوتي والمعجمي.
                      </p>
                      <button
                        type="button"
                        onClick={() => onOpenAssistant(topic.sentences[0])}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shrink-0 transition-colors flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-sky-300" />
                        <span>اسأل المساعد عن هذا القسم</span>
                      </button>
                    </div>

                    {/* Progressive Pedagogy Action Strip */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-sky-200/60">
                      <button
                        type="button"
                        onClick={() => handleLoadDeepExplanation(topic.id, topic.titleAr, topic.titleEn)}
                        disabled={loadingDeepTopicId === topic.id}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-sky-50 border border-sky-200 text-slate-900 font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        {loadingDeepTopicId === topic.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-700" />
                        ) : (
                          <BookOpen className="w-3.5 h-3.5 text-sky-700" />
                        )}
                        <span>شرح الأستاذ العميق لهذا القسم</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleGenerateExamples(topic.id, topic.titleAr, topic.titleEn, topic.sentences)
                        }
                        disabled={loadingExamplesTopicId === topic.id}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-sky-50 border border-sky-200 text-slate-900 font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        {loadingExamplesTopicId === topic.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-700" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-sky-700" />
                        )}
                        <span>توليد أمثلة إضافية غير محدودة</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setWritingTopicId(showWriting ? null : topic.id)}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-sky-50 border border-sky-200 text-slate-900 font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <PenTool className="w-3.5 h-3.5 text-sky-700" />
                        <span>{showWriting ? 'إخفاء التطبيق الكتابي' : 'اكتب جملتك وصححها'}</span>
                      </button>
                    </div>
                  </div>

                  {topicError && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                      {topicError}
                    </div>
                  )}

                  {/* Deep Topic Explanation Panel (Progressive Disclosure) */}
                  {topicDeep && (
                    <div className="p-5 rounded-2xl border border-sky-200 bg-[#F0F7FA]/55 space-y-3 text-xs text-slate-800 leading-relaxed">
                      <div className="flex items-center justify-between border-b border-sky-200/60 pb-2">
                        <h4 className="font-bold text-sm text-slate-900">الشرح التحليلي المتكامل للموضوع</h4>
                        <span className="font-latin text-slate-500">{topicDeep.cefrRange || progress.cefrLevel}</span>
                      </div>
                      <p><strong>المفهوم الأساسي:</strong> {topicDeep.coreConceptAr}</p>
                      <p><strong>الغرض اللغوي:</strong> {topicDeep.linguisticPurposeAr}</p>
                      <p><strong>الصيغة والتكوين:</strong> <span className="font-latin text-slate-900 font-semibold" dir="ltr">{topicDeep.structureFormulaEn}</span></p>
                      {topicDeep.stages?.length > 0 && (
                        <div className="space-y-2 pt-1">
                          {topicDeep.stages.map((st, si) => (
                            <div key={si} className="p-3 rounded-xl bg-white border border-sky-100 space-y-1">
                              <p className="font-bold text-slate-900">{st.stageTitleAr}</p>
                              <p className="text-slate-700">{st.explanationAr}</p>
                              {st.formulaEn && (
                                <p className="font-latin text-sky-900 font-semibold" dir="ltr">{st.formulaEn}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {topicDeep.comparisonNoteAr && (
                        <p><strong>المقارنة اللغوية:</strong> {topicDeep.comparisonNoteAr}</p>
                      )}
                      {topicDeep.exceptionsAndMistakes?.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <p className="font-bold text-slate-900">أخطاء شائعة واستثناءات:</p>
                          {topicDeep.exceptionsAndMistakes.map((em, ei) => (
                            <div key={ei} className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-0.5">
                              <p className="font-semibold text-amber-950">{em.misconceptionAr}</p>
                              <p className="font-latin" dir="ltr">
                                <span className="line-through text-red-700">{em.wrongExampleEn}</span>{' → '}
                                <span className="font-bold text-emerald-800">{em.correctExampleEn}</span>
                              </p>
                              <p className="text-slate-700">{em.whyAr}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Inline Writing Application Box */}
                  {showWriting && (
                    <WritingEvalBox
                      taskPromptAr={`طبّق قاعدة أو مفردات درس "${topic.titleAr}" في تكوين جملتين من إنشائك.`}
                      targetGrammarRule={topic.titleEn}
                      defaultMode="sentence"
                    />
                  )}

                  <div className="space-y-3">
                    {topic.sentences.map(sentence => {
                      const isSaved = progress.savedSentenceIds.includes(sentence.id);
                      const levelAr =
                        sentence.level === 'beginner'
                          ? 'مبتدئ'
                          : sentence.level === 'intermediate'
                          ? 'متوسط'
                          : 'متقدم';
                      return (
                        <div
                          key={sentence.id}
                          className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-[#F0F7FA]/35 hover:bg-[#F0F7FA]/60 transition-colors space-y-2.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-slate-500 font-medium">
                              المستوى: {levelAr}
                              {sentence.pdfReference ? ` · صفحة ${sentence.pdfReference.pageNumber}` : ''}
                            </span>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => playEnglishAudio(sentence.english)}
                                className="p-2 rounded-xl bg-white border border-slate-200 hover:border-sky-300 text-sky-700 transition-colors"
                                title="استماع للنطق"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleBookmarkSentence(sentence.id)}
                                className={`p-2 rounded-xl border transition-colors ${
                                  isSaved
                                    ? 'bg-[#F0F7FA] text-sky-800 border-sky-300'
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-sky-200'
                                }`}
                                title="حفظ الجملة"
                              >
                                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current text-sky-600' : ''}`} />
                              </button>
                            </div>
                          </div>

                          <p className="text-base sm:text-lg font-bold text-slate-900 font-latin leading-relaxed" dir="ltr">
                            {sentence.english}
                          </p>

                          <p className="text-sm font-medium text-slate-700">{sentence.arabic}</p>

                          {sentence.contextAr && (
                            <p className="text-xs text-slate-500">{sentence.contextAr}</p>
                          )}

                          {sentence.vocabulary.length > 0 && (
                            <div className="pt-1 flex flex-wrap gap-2">
                              {sentence.vocabulary.map((v, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() =>
                                    setLexicalModalTarget({
                                      word: v.word,
                                      meaningAr: v.meaningAr,
                                      context: sentence.english
                                    })
                                  }
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white hover:bg-sky-50 border border-slate-200/80 hover:border-sky-300 text-xs transition-colors"
                                  title="انقر لتحليل المفردة صوتياً ومعجمياً"
                                >
                                  <strong className="font-latin text-slate-900" dir="ltr">
                                    {v.word}
                                  </strong>
                                  <span className="text-slate-600">{v.meaningAr}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Unlimited Dynamically Generated Examples */}
                    {topicDynamicExamples.map((ex, idx) => (
                      <div
                        key={idx}
                        className="p-4 sm:p-5 rounded-2xl border border-sky-200 bg-white space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-sky-700 font-semibold">
                            مثال تطبيقي مولّد إضافي · {ex.register}
                          </span>
                          <button
                            type="button"
                            onClick={() => playEnglishAudio(ex.english)}
                            className="p-2 rounded-xl bg-[#F0F7FA] hover:bg-sky-100 text-sky-700 transition-colors"
                            title="استماع للنطق"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-base sm:text-lg font-bold text-slate-900 font-latin leading-relaxed" dir="ltr">
                          {ex.english}
                        </p>
                        <p className="text-sm font-medium text-slate-700">{ex.arabic}</p>
                        <p className="text-xs text-slate-500">{ex.grammarBreakdownAr}</p>

                        {ex.keyVocabulary?.length > 0 && (
                          <div className="pt-1 flex flex-wrap gap-2">
                            {ex.keyVocabulary.map((v, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() =>
                                  setLexicalModalTarget({
                                    word: v.word,
                                    meaningAr: v.meaningAr,
                                    context: ex.english
                                  })
                                }
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#F0F7FA] hover:bg-sky-100 border border-sky-200/70 text-xs transition-colors"
                              >
                                <strong className="font-latin text-slate-900" dir="ltr">
                                  {v.word}
                                </strong>
                                <span className="font-latin text-slate-500" dir="ltr">{v.ipa}</span>
                                <span className="text-slate-700">{v.meaningAr}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lexical Deep Modal */}
      <LexicalDeepModal
        word={lexicalModalTarget?.word || null}
        initialMeaningAr={lexicalModalTarget?.meaningAr}
        sentenceContext={lexicalModalTarget?.context}
        cefrLevel={progress.cefrLevel}
        onClose={() => setLexicalModalTarget(null)}
      />
    </div>
  );
};

