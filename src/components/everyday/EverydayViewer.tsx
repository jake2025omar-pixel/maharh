import React, { useState } from 'react';
import {
  Coffee,
  Volume2,
  Bookmark,
  Sparkles,
  Search,
  Plus,
  Loader2,
  MessageSquare,
  Send
} from 'lucide-react';
import { EVERYDAY_ENGLISH_CATEGORIES } from '../../data/everydayData.ts';
import { SentenceItem } from '../../data/curriculumData.ts';
import { playEnglishAudio } from '../../services/audioService.ts';
import { useSession } from '../../context/SessionContext.tsx';
import {
  fetchUnlimitedExamples,
  sendDynamicConversationTurn,
  DynamicExampleItem
} from '../../services/pedagogyClient.ts';
import { LexicalDeepModal } from '../learning/LexicalDeepModal.tsx';

interface EverydayViewerProps {
  onOpenAssistant: (sentence?: SentenceItem) => void;
}

interface RoleplayTurn {
  role: 'student' | 'partner';
  text: string;
  arabic?: string;
  coachingAr?: string;
  betterPhrasing?: string;
  followUpIdeas?: string[];
}

export const EverydayViewer: React.FC<EverydayViewerProps> = ({ onOpenAssistant }) => {
  const { progress, toggleBookmarkSentence, recordSkillResult } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  const [extraByCategory, setExtraByCategory] = useState<Record<string, DynamicExampleItem[]>>({});
  const [loadingCatId, setLoadingCatId] = useState<string | null>(null);
  const [catError, setCatError] = useState<string | null>(null);

  // Live roleplay conversation per category
  const [activeRoleplayCatId, setActiveRoleplayCatId] = useState<string | null>(null);
  const [roleplayInput, setRoleplayInput] = useState('');
  const [roleplayLoading, setRoleplayLoading] = useState(false);
  const [roleplayHistoryByCat, setRoleplayHistoryByCat] = useState<Record<string, RoleplayTurn[]>>({});

  const [lexicalModalTarget, setLexicalModalTarget] = useState<{
    word: string;
    meaningAr?: string;
    context?: string;
  } | null>(null);

  const filteredCategories = EVERYDAY_ENGLISH_CATEGORIES.filter(cat => {
    if (selectedCategoryId !== 'all' && cat.id !== selectedCategoryId) return false;
    const q = searchQuery.toLowerCase().trim();
    const levelMatches = cat.sentences.some(
      s => selectedLevel === 'all' || s.level === selectedLevel
    );
    if (!levelMatches) return false;
    if (!q) return true;
    return (
      cat.titleAr.includes(q) ||
      cat.titleEn.toLowerCase().includes(q) ||
      cat.sentences.some(s => s.english.toLowerCase().includes(q) || s.arabic.includes(q))
    );
  });

  const handleGenerateMoreEveryday = async (
    catId: string,
    titleAr: string,
    titleEn: string,
    baseSentences: SentenceItem[]
  ) => {
    setLoadingCatId(catId);
    setCatError(null);
    const existing = extraByCategory[catId] || [];
    const excludeSentences = [
      ...baseSentences.map(s => s.english),
      ...existing.map(e => e.english)
    ];
    try {
      const res = await fetchUnlimitedExamples({
        topicTitleAr: titleAr,
        topicTitleEn: titleEn,
        cefrLevel: progress.cefrLevel,
        contextDomain: 'مواقف الحياة اليومية والتواصل الطبيعي',
        count: 5,
        excludeSentences
      });
      setExtraByCategory(prev => ({
        ...prev,
        [catId]: [...(prev[catId] || []), ...(res.examples || [])]
      }));
    } catch (err: any) {
      setCatError(err?.message || 'تعذر توليد مواقف إضافية حالياً.');
    } finally {
      setLoadingCatId(null);
    }
  };

  const handleSendRoleplay = async (catId: string, titleAr: string, titleEn: string) => {
    const msg = roleplayInput.trim();
    if (!msg || roleplayLoading) return;

    const prevTurns = roleplayHistoryByCat[catId] || [];
    const studentTurn: RoleplayTurn = { role: 'student', text: msg };
    setRoleplayHistoryByCat(prev => ({ ...prev, [catId]: [...prevTurns, studentTurn] }));
    setRoleplayInput('');
    setRoleplayLoading(true);
    setCatError(null);

    try {
      const res = await sendDynamicConversationTurn({
        scenarioTitleAr: titleAr,
        scenarioTitleEn: titleEn,
        cefrLevel: progress.cefrLevel,
        studentMessageEn: msg,
        history: prevTurns.map(t => ({ role: t.role, text: t.text }))
      });

      const partnerTurn: RoleplayTurn = {
        role: 'partner',
        text: res.replyEn,
        arabic: res.replyAr,
        coachingAr: res.coachingFeedbackAr,
        betterPhrasing: res.correctedStudentSentenceEn,
        followUpIdeas: res.suggestedFollowUpIdeasAr
      };
      setRoleplayHistoryByCat(prev => ({
        ...prev,
        [catId]: [...prevTurns, studentTurn, partnerTurn]
      }));
      playEnglishAudio(res.replyEn, 0.92);
      recordSkillResult('speaking', true);
    } catch (err: any) {
      setCatError(err?.message || 'تعذر تشغيل الحوار التفاعلي حالياً.');
    } finally {
      setRoleplayLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8" dir="rtl">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 text-right space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-sky-700">
              مكتبة الإنجليزية اليومية · مواقف حية للمحادثة
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              تحدث الإنجليزية الطبيعية بثقة في مواقف الحياة
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              جمل كاملة من الحياة اليومية مع إمكانية توليد مواقف لا محدودة وإجراء محادثات تفاعلية حية بتوجيه الأستاذ.
            </p>
          </div>

          <div className="w-14 h-14 rounded-2xl surface-icy flex items-center justify-center shrink-0">
            <Coffee className="w-7 h-7 text-sky-700" />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategoryId('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategoryId === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-sky-300'
            }`}
          >
            جميع المواقف
          </button>
          {EVERYDAY_ENGLISH_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategoryId === cat.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-sky-300'
              }`}
            >
              {cat.titleAr}
            </button>
          ))}
        </div>

        {/* Level Filter & Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shrink-0">
            {[
              { id: 'all' as const, label: 'الكل' },
              { id: 'beginner' as const, label: 'مبتدئ' },
              { id: 'intermediate' as const, label: 'متوسط' },
              { id: 'advanced' as const, label: 'متقدم' }
            ].map(lvl => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setSelectedLevel(lvl.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  selectedLevel === lvl.id
                    ? 'bg-[#F0F7FA] text-sky-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث عن جملة أو موقف..."
              className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 pr-10 pl-4 text-sm text-slate-900 focus:outline-none focus:border-sky-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          </div>
        </div>
      </div>

      {catError && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
          {catError}
        </div>
      )}

      {/* Categories & Sentences Feed */}
      <div className="space-y-6">
        {filteredCategories.map(category => {
          const visibleSentences = category.sentences.filter(s => {
            if (selectedLevel !== 'all' && s.level !== selectedLevel) return false;
            const q = searchQuery.toLowerCase().trim();
            if (!q) return true;
            return (
              category.titleAr.includes(q) ||
              s.english.toLowerCase().includes(q) ||
              s.arabic.includes(q)
            );
          });

          if (visibleSentences.length === 0) return null;

          const extraItems = extraByCategory[category.id] || [];
          const isRoleplayOpen = activeRoleplayCatId === category.id;
          const turns = roleplayHistoryByCat[category.id] || [];

          return (
            <div key={category.id} className="surface-card rounded-3xl p-6 text-right space-y-4">
              <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{category.titleAr}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{category.descriptionAr}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleGenerateMoreEveryday(
                        category.id,
                        category.titleAr,
                        category.titleEn,
                        category.sentences
                      )
                    }
                    disabled={loadingCatId === category.id}
                    className="px-3 py-1.5 rounded-xl bg-[#F0F7FA] hover:bg-sky-100 border border-sky-200/80 text-xs font-semibold text-slate-900 flex items-center gap-1.5 transition-colors"
                  >
                    {loadingCatId === category.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-700" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-sky-700" />
                    )}
                    <span>جمل ومواقف إضافية</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveRoleplayCatId(isRoleplayOpen ? null : category.id)
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      isRoleplayOpen
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-slate-200 hover:border-sky-300 text-slate-800'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>محادثة تفاعلية حية</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Interactive Roleplay Drawer */}
              {isRoleplayOpen && (
                <div className="surface-icy rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between gap-2 border-b border-sky-200/60 pb-2">
                    <p className="text-xs font-bold text-slate-900">
                      حوار تفاعلي مباشر — موقف: {category.titleAr}
                    </p>
                    <span className="text-[11px] text-slate-500">
                      اكتب ردك بالإنجليزية ليقوم الأستاذ بالرد وتصحيح صياغتك
                    </span>
                  </div>

                  {turns.length > 0 && (
                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                      {turns.map((turn, idx) => (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                            turn.role === 'student'
                              ? 'bg-white border-slate-200 text-slate-900'
                              : 'bg-sky-50/70 border-sky-200 text-slate-900'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-[11px] text-sky-800">
                              {turn.role === 'student' ? 'مشاركتك' : 'الشريك المحاور'}
                            </span>
                            {turn.role === 'partner' && (
                              <button
                                type="button"
                                onClick={() => playEnglishAudio(turn.text, 0.92)}
                                className="p-1.5 rounded-lg bg-white text-sky-700 border border-slate-200"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <p className="font-latin font-semibold text-sm text-slate-900" dir="ltr">
                            {turn.text}
                          </p>
                          {turn.arabic && <p className="text-slate-600">{turn.arabic}</p>}
                          {turn.coachingAr && (
                            <div className="text-amber-900 bg-amber-50/80 p-2 rounded-xl border border-amber-200/60 space-y-1">
                              <p>
                                <strong>ملاحظة الأستاذ:</strong> {turn.coachingAr}
                              </p>
                              {turn.betterPhrasing && (
                                <span className="block font-latin font-semibold text-slate-900" dir="ltr">
                                  Natural phrasing: {turn.betterPhrasing}
                                </span>
                              )}
                              {turn.followUpIdeas && turn.followUpIdeas.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {turn.followUpIdeas.map((idea, fi) => (
                                    <span key={fi} className="text-[11px] bg-white px-2 py-0.5 rounded-lg border border-amber-200/70 text-slate-700">
                                      {idea}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={roleplayInput}
                      onChange={e => setRoleplayInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          handleSendRoleplay(category.id, category.titleAr, category.titleEn);
                        }
                      }}
                      placeholder="Write your English reply for this situation..."
                      dir="ltr"
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-latin text-slate-900 focus:outline-none focus:border-sky-400"
                    />
                    <button
                      type="button"
                      disabled={!roleplayInput.trim() || roleplayLoading}
                      onClick={() =>
                        handleSendRoleplay(category.id, category.titleAr, category.titleEn)
                      }
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-45 shrink-0"
                    >
                      {roleplayLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>إرسال</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {visibleSentences.map(sentence => {
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
                          <button
                            type="button"
                            onClick={() => onOpenAssistant(sentence)}
                            className="p-2 rounded-xl bg-white hover:bg-[#F0F7FA] text-sky-700 border border-slate-200 hover:border-sky-300 transition-colors"
                            title="اسأل المساعد الذكي"
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

                {/* Dynamically Generated Unlimited Everyday Sentences */}
                {extraItems.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-2xl border border-sky-200 bg-white space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-sky-700 font-semibold">
                        موقف مولّد إضافي · {ex.register}
                      </span>
                      <button
                        type="button"
                        onClick={() => playEnglishAudio(ex.english)}
                        className="p-2 rounded-xl bg-[#F0F7FA] hover:bg-sky-100 text-sky-700 transition-colors"
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
                            <strong className="font-latin text-slate-900" dir="ltr">{v.word}</strong>
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

