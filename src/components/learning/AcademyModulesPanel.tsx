import React, { useState } from 'react';
import {
  BookOpen,
  Volume2,
  Mic,
  PenTool,
  Sparkles,
  Loader2,
  CheckCircle2,
  Plus,
  XCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  CEFR_LEVEL_SPECS,
  COMPREHENSIVE_GRAMMAR_CURRICULUM,
  PHONETICS_PHONOLOGY_MODULES,
  READING_WRITING_ACADEMY,
  ComprehensiveGrammarUnit
} from '../../data/cefrCurriculumData.ts';
import { useSession } from '../../context/SessionContext.tsx';
import { playEnglishAudio } from '../../services/audioService.ts';
import {
  fetchDeepTopicExplanation,
  fetchUnlimitedExamples,
  DeepExplanationResult,
  DynamicExampleItem
} from '../../services/pedagogyClient.ts';
import { SpeechPracticePanel } from '../speech/SpeechPracticePanel.tsx';
import { WritingEvalBox } from './WritingEvalBox.tsx';
import { LexicalDeepModal } from './LexicalDeepModal.tsx';

type AcademyTab = 'grammar' | 'phonetics' | 'reading_writing';

export const AcademyModulesPanel: React.FC = () => {
  const { progress, markGrammarUnitMastered, recordSkillResult, setCefrLevel } = useSession();

  const [activePillar, setActivePillar] = useState<AcademyTab>('grammar');

  // Grammar Compendium State
  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    COMPREHENSIVE_GRAMMAR_CURRICULUM[0].id
  );
  const [grammarStage, setGrammarStage] = useState<number>(1);
  const [deepExpByUnit, setDeepExpByUnit] = useState<Record<string, DeepExplanationResult>>({});
  const [loadingDeepExp, setLoadingDeepExp] = useState(false);
  const [extraExamplesByUnit, setExtraExamplesByUnit] = useState<Record<string, DynamicExampleItem[]>>({});
  const [loadingExamples, setLoadingExamples] = useState(false);
  const [grammarError, setGrammarError] = useState<string | null>(null);
  const [compSelectedOpt, setCompSelectedOpt] = useState<string | null>(null);
  const [compChecked, setCompChecked] = useState(false);

  // Phonetics Lab State
  const [selectedPhoneticsId, setSelectedPhoneticsId] = useState<string>(
    PHONETICS_PHONOLOGY_MODULES[0].id
  );
  const [minimalPairTestIdx, setMinimalPairTestIdx] = useState<number>(0);
  const [minimalPairTargetWord, setMinimalPairTargetWord] = useState<'A' | 'B'>('A');
  const [minimalPairFeedback, setMinimalPairFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Reading & Writing State
  const [selectedPassageId, setSelectedPassageId] = useState<string>(
    READING_WRITING_ACADEMY.readingPassages[0].id
  );
  const [showArabicPassage, setShowArabicPassage] = useState(false);
  const [passageAnswers, setPassageAnswers] = useState<Record<number, string>>({});
  const [passageChecked, setPassageChecked] = useState(false);
  const [selectedFrameworkIdx, setSelectedFrameworkIdx] = useState<number>(0);

  // Lexical Deep Modal State
  const [lexicalModalTarget, setLexicalModalTarget] = useState<{
    word: string;
    meaningAr?: string;
    context?: string;
  } | null>(null);

  const selectedUnit: ComprehensiveGrammarUnit =
    COMPREHENSIVE_GRAMMAR_CURRICULUM.find(u => u.id === selectedUnitId) ||
    COMPREHENSIVE_GRAMMAR_CURRICULUM[0];

  const activeCefrSpec =
    CEFR_LEVEL_SPECS.find(c => c.code === progress.cefrLevel) || CEFR_LEVEL_SPECS[1];

  const handleSelectUnit = (id: string) => {
    setSelectedUnitId(id);
    setGrammarStage(1);
    setCompSelectedOpt(null);
    setCompChecked(false);
    setGrammarError(null);
  };

  const handleLoadDeepExplanation = async () => {
    setLoadingDeepExp(true);
    setGrammarError(null);
    try {
      const res = await fetchDeepTopicExplanation({
        topicTitleAr: selectedUnit.titleAr,
        topicTitleEn: selectedUnit.titleEn,
        cefrLevel: progress.cefrLevel
      });
      setDeepExpByUnit(prev => ({ ...prev, [selectedUnit.id]: res }));
    } catch (err: any) {
      setGrammarError(err?.message || 'تعذر الاتصال بخادم الشرح العميق.');
    } finally {
      setLoadingDeepExp(false);
    }
  };

  const handleGenerateMoreExamples = async () => {
    setLoadingExamples(true);
    setGrammarError(null);
    const existingDynamic = extraExamplesByUnit[selectedUnit.id] || [];
    const excludeSentences = [
      ...selectedUnit.coreExamples.map(e => e.english),
      ...existingDynamic.map(e => e.english)
    ];

    try {
      const res = await fetchUnlimitedExamples({
        topicTitleAr: selectedUnit.titleAr,
        topicTitleEn: selectedUnit.titleEn,
        cefrLevel: progress.cefrLevel,
        contextDomain: selectedUnit.categoryAr,
        count: 5,
        excludeSentences
      });
      setExtraExamplesByUnit(prev => ({
        ...prev,
        [selectedUnit.id]: [...(prev[selectedUnit.id] || []), ...(res.examples || [])]
      }));
    } catch (err: any) {
      setGrammarError(err?.message || 'تعذر توليد أمثلة إضافية حالياً.');
    } finally {
      setLoadingExamples(false);
    }
  };

  const selectedPhonetics =
    PHONETICS_PHONOLOGY_MODULES.find(m => m.id === selectedPhoneticsId) ||
    PHONETICS_PHONOLOGY_MODULES[0];

  const activeMinimalPair =
    selectedPhonetics.minimalPairs[minimalPairTestIdx] || selectedPhonetics.minimalPairs[0];

  const activePassage =
    READING_WRITING_ACADEMY.readingPassages.find(p => p.id === selectedPassageId) ||
    READING_WRITING_ACADEMY.readingPassages[0];

  const activeWritingFramework =
    READING_WRITING_ACADEMY.writingFrameworks[selectedFrameworkIdx] ||
    READING_WRITING_ACADEMY.writingFrameworks[0];

  const unitDeep = deepExpByUnit[selectedUnit.id];
  const unitDynamicExamples = extraExamplesByUnit[selectedUnit.id] || [];

  return (
    <div className="space-y-6" dir="rtl">
      {/* CEFR Level Strip & Pillar Navigation */}
      <div className="surface-card rounded-3xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-sky-700">
              أكاديمية اللغة الإنجليزية الشاملة · الإطار الأوروبي CEFR (A1–C2)
            </p>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">{activeCefrSpec.titleAr}</h2>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">{activeCefrSpec.summaryAr}</p>
          </div>

          <div className="flex items-center gap-1 bg-[#F0F7FA] p-1 rounded-2xl border border-sky-100 shrink-0" dir="ltr">
            {CEFR_LEVEL_SPECS.map(spec => (
              <button
                key={spec.code}
                type="button"
                onClick={() => setCefrLevel(spec.code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-latin transition-colors ${
                  progress.cefrLevel === spec.code
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {spec.code}
              </button>
            ))}
          </div>
        </div>

        {/* Three Academy Pillars */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActivePillar('grammar')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
              activePillar === 'grammar'
                ? 'bg-slate-900 text-white'
                : 'bg-[#F0F7FA] text-slate-700 hover:bg-sky-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>موسوعة القواعد الكاملة</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePillar('phonetics')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
              activePillar === 'phonetics'
                ? 'bg-slate-900 text-white'
                : 'bg-[#F0F7FA] text-slate-700 hover:bg-sky-100'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>مختبر الصوتيات والنطق (IPA)</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePillar('reading_writing')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
              activePillar === 'reading_writing'
                ? 'bg-slate-900 text-white'
                : 'bg-[#F0F7FA] text-slate-700 hover:bg-sky-100'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>القراءة التحليلية والكتابة</span>
          </button>
        </div>
      </div>

      {/* PILLAR 1: COMPREHENSIVE GRAMMAR COMPENDIUM */}
      {activePillar === 'grammar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Curriculum Topics List */}
          <div className="lg:col-span-4 space-y-2.5">
            {COMPREHENSIVE_GRAMMAR_CURRICULUM.map(unit => {
              const isSelected = unit.id === selectedUnit.id;
              const isMastered = progress.masteredGrammarIds.includes(unit.id);
              return (
                <button
                  key={unit.id}
                  type="button"
                  onClick={() => handleSelectUnit(unit.id)}
                  className={`w-full p-4 rounded-2xl border text-right transition-all space-y-1 ${
                    isSelected
                      ? 'bg-[#F0F7FA] border-sky-400 shadow-2xs'
                      : 'bg-white border-slate-200/80 hover:border-sky-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
                    <span>
                      {unit.categoryAr} · <strong className="font-latin text-sky-700">{unit.cefr}</strong>
                    </span>
                    {isMastered && (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>متقن</span>
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-slate-900 leading-snug">{unit.titleAr}</p>
                </button>
              );
            })}
          </div>

          {/* Progressive Disclosure Staged Lesson Canvas */}
          <div className="lg:col-span-8 surface-card rounded-3xl p-6 sm:p-7 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <span className="text-xs text-sky-700 font-semibold">
                  {selectedUnit.categoryAr} · مستوى {selectedUnit.cefr}
                </span>
                <h3 className="text-xl font-bold text-slate-900">{selectedUnit.titleAr}</h3>
                <p className="text-xs text-slate-500 font-latin" dir="ltr">
                  {selectedUnit.titleEn}
                </p>
              </div>
            </div>

            {/* 5 Progressive Disclosure Stage Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {[
                { step: 1, label: '١. المفهوم والصيغة' },
                { step: 2, label: '٢. الإثبات والنفي والشواذ' },
                { step: 3, label: '٣. المقارنة والأخطاء' },
                { step: 4, label: '٤. أمثلة لا محدودة' },
                { step: 5, label: '٥. التطبيق والتحقق' }
              ].map(tab => (
                <button
                  key={tab.step}
                  type="button"
                  onClick={() => setGrammarStage(tab.step)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    grammarStage === tab.step
                      ? 'bg-slate-900 text-white'
                      : 'bg-[#F0F7FA] text-slate-700 hover:bg-sky-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {grammarError && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                {grammarError}
              </div>
            )}

            {/* Stage 1: Core Concept, Purpose & Formula */}
            {grammarStage === 1 && (
              <div className="space-y-4">
                <div className="surface-icy rounded-2xl p-5 space-y-2">
                  <h4 className="text-sm font-bold text-slate-900">المفهوم الأساسي للقاعدة</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">{selectedUnit.conceptAr}</p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200/80 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900">الغرض التواصلي ومتى نستخدمها</h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{selectedUnit.purposeAr}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-1">
                  <span className="text-[11px] text-sky-300 block">البنية الصياغية (Formula)</span>
                  <p className="font-latin font-semibold text-sm sm:text-base" dir="ltr">
                    {selectedUnit.formulaEn}
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleLoadDeepExplanation}
                    disabled={loadingDeepExp}
                    className="px-4 py-2.5 rounded-xl bg-[#F0F7FA] hover:bg-sky-100 border border-sky-200 text-slate-900 text-xs font-semibold flex items-center gap-2 transition-colors"
                  >
                    {loadingDeepExp ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-700" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-sky-700" />
                    )}
                    <span>استدعاء شرح الأستاذ الأكاديمي المتخصص (حسب مستواك {progress.cefrLevel})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGrammarStage(2)}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-1"
                  >
                    <span>المرحلة التالية</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>

                {unitDeep && (
                  <div className="p-5 rounded-2xl border border-sky-200 bg-[#F0F7FA]/60 space-y-3 text-xs text-slate-800 leading-relaxed">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-sm text-slate-900">التعمق اللغوي المخصص لمستوى {progress.cefrLevel}</h4>
                      <span className="font-latin text-slate-500">{unitDeep.cefrRange}</span>
                    </div>
                    <p>{unitDeep.coreConceptAr}</p>
                    <p><strong>الغرض التواصلي:</strong> {unitDeep.linguisticPurposeAr}</p>
                    <p><strong>الصيغة الأساسية:</strong> <span className="font-latin font-semibold" dir="ltr">{unitDeep.structureFormulaEn}</span></p>
                    {unitDeep.stages?.length > 0 && (
                      <div className="space-y-2 pt-1">
                        {unitDeep.stages.map((st, si) => (
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
                    {unitDeep.comparisonNoteAr && (
                      <p><strong>المقارنة اللغوية:</strong> {unitDeep.comparisonNoteAr}</p>
                    )}
                    {unitDeep.exceptionsAndMistakes?.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <p className="font-bold text-slate-900">استثناءات وأخطاء متكررة:</p>
                        {unitDeep.exceptionsAndMistakes.map((em, ei) => (
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
              </div>
            )}

            {/* Stage 2: Affirmative, Negative, Questions, Morphology, Exceptions */}
            {grammarStage === 2 && (
              <div className="space-y-3.5 text-xs sm:text-sm">
                <div className="p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
                  <h4 className="font-bold text-slate-900">صيغة الإثبات (Affirmative)</h4>
                  <p className="text-slate-700 leading-relaxed">{selectedUnit.affirmativeAr}</p>
                </div>
                <div className="p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
                  <h4 className="font-bold text-slate-900">صيغة النفي (Negative)</h4>
                  <p className="text-slate-700 leading-relaxed">{selectedUnit.negativeAr}</p>
                </div>
                <div className="p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
                  <h4 className="font-bold text-slate-900">السؤال والإجابات المختصرة</h4>
                  <p className="text-slate-700 leading-relaxed">{selectedUnit.questionAndShortAnswersAr}</p>
                </div>
                <div className="p-4 rounded-2xl surface-icy space-y-1.5">
                  <h4 className="font-bold text-slate-900">قواعد الإملاء وتصريف النهايات</h4>
                  <p className="text-slate-700 leading-relaxed">{selectedUnit.morphologyAndSpellingAr}</p>
                </div>
                <div className="p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
                  <h4 className="font-bold text-slate-900">المؤشرات الزمنية والاستثناءات والسجل اللغوي</h4>
                  <p className="text-slate-700 leading-relaxed">
                    <strong>الكلمات الدالة:</strong> {selectedUnit.usageMarkersAr}
                  </p>
                  <p className="text-slate-700 leading-relaxed">
                    <strong>الحالات الخاصة:</strong> {selectedUnit.exceptionsAndSpecialCasesAr}
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    <strong>الرسمي وغير الرسمي:</strong> {selectedUnit.registerNoteAr}
                  </p>
                </div>
              </div>
            )}

            {/* Stage 3: Contrastive Comparison & Common Arabic-L1 Mistakes */}
            {grammarStage === 3 && (
              <div className="space-y-4">
                <div className="surface-icy rounded-2xl p-5 space-y-2">
                  <h4 className="text-sm font-bold text-slate-900">المقارنة اللغوية الدقيقة</h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {selectedUnit.comparisonNoteAr}
                  </p>
                </div>

                <div className="space-y-2.5">
                  <h4 className="text-sm font-bold text-slate-900">الأخطاء الشائعة وجذورها اللغوية</h4>
                  {selectedUnit.commonMistakes.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-2 text-xs"
                    >
                      <div className="flex flex-wrap items-center gap-2 font-latin" dir="ltr">
                        <span className="line-through text-red-700 font-semibold">{m.wrongEn}</span>
                        <span className="text-slate-400">→</span>
                        <span className="text-emerald-800 font-bold">{m.rightEn}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{m.whyAr}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stage 4: Core Examples + Unlimited Dynamic Expansion */}
            {grammarStage === 4 && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">نماذج تطبيقية مشروحة</h4>
                    <p className="text-xs text-slate-500">
                      انقر على أي كلمة داخل الأمثلة لفتح بطاقتها الصوتية والمعجمية (IPA والمتلازمات).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateMoreExamples}
                    disabled={loadingExamples}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {loadingExamples ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span>توليد أمثلة جديدة غير محدودة</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {selectedUnit.coreExamples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-slate-200/80 bg-[#F0F7FA]/40 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-sky-700">{ex.typeAr}</span>
                        <button
                          type="button"
                          onClick={() => playEnglishAudio(ex.english)}
                          className="p-2 rounded-xl bg-white border border-slate-200 hover:border-sky-300 text-sky-700"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-base font-bold text-slate-900 font-latin leading-relaxed" dir="ltr">
                        {ex.english}
                      </p>
                      <p className="text-sm font-medium text-slate-700">{ex.arabic}</p>
                      <p className="text-xs text-slate-500">{ex.breakdownAr}</p>
                    </div>
                  ))}

                  {unitDynamicExamples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-sky-200 bg-white space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-500">
                          مثال مولّد إضافي · {ex.register}
                        </span>
                        <button
                          type="button"
                          onClick={() => playEnglishAudio(ex.english)}
                          className="p-2 rounded-xl bg-[#F0F7FA] text-sky-700 hover:bg-sky-100"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-base font-bold text-slate-900 font-latin leading-relaxed" dir="ltr">
                        {ex.english}
                      </p>
                      <p className="text-sm font-medium text-slate-700">{ex.arabic}</p>
                      <p className="text-xs text-slate-600">{ex.grammarBreakdownAr}</p>

                      {ex.keyVocabulary?.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {ex.keyVocabulary.map((v, vi) => (
                            <button
                              key={vi}
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
                              <span className="text-slate-500 font-latin" dir="ltr">
                                {v.ipa}
                              </span>
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

            {/* Stage 5: Comprehension Verification & Original Sentence Production */}
            {grammarStage === 5 && (
              <div className="space-y-5">
                {!unitDeep ? (
                  <div className="surface-icy rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs sm:text-sm text-slate-700">
                      هل ترغب بتوليد سؤال تحقق سريع من القاعدة مع تحليل الأسلوب؟
                    </p>
                    <button
                      type="button"
                      onClick={handleLoadDeepExplanation}
                      disabled={loadingDeepExp}
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-2"
                    >
                      {loadingDeepExp && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>توليد سؤال تحقق</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="text-sm font-bold text-slate-900">سؤال التحقق من الفهم</h4>
                    <p className="text-xs sm:text-sm text-slate-800">{unitDeep.comprehensionCheckQuestion.questionAr}</p>
                    {unitDeep.comprehensionCheckQuestion.promptEn && (
                      <p className="text-sm font-latin font-semibold text-slate-900 surface-icy p-3 rounded-xl" dir="ltr">
                        {unitDeep.comprehensionCheckQuestion.promptEn}
                      </p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {unitDeep.comprehensionCheckQuestion.options.map(opt => {
                        const isSelected = compSelectedOpt === opt;
                        const isRight = opt === unitDeep.comprehensionCheckQuestion.correctAnswer;
                        return (
                          <button
                            key={opt}
                            type="button"
                            disabled={compChecked}
                            onClick={() => setCompSelectedOpt(opt)}
                            className={`p-3 rounded-xl border text-left font-latin text-xs font-semibold transition-colors ${
                              compChecked && isRight
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                                : compChecked && isSelected
                                ? 'bg-red-50 border-red-400 text-red-900'
                                : isSelected
                                ? 'bg-[#F0F7FA] border-sky-500 text-slate-900'
                                : 'bg-white border-slate-200 hover:border-sky-200 text-slate-800'
                            }`}
                            dir="ltr"
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {!compChecked ? (
                      <button
                        type="button"
                        disabled={!compSelectedOpt}
                        onClick={() => {
                          const ok = compSelectedOpt === unitDeep.comprehensionCheckQuestion.correctAnswer;
                          setCompChecked(true);
                          recordSkillResult('grammar', ok, ok ? undefined : 'tense_agreement');
                          if (ok) markGrammarUnitMastered(selectedUnit.id);
                        }}
                        className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold disabled:opacity-40"
                      >
                        تحقق من الفهم
                      </button>
                    ) : (
                      <p className="text-xs text-slate-700 bg-[#F0F7FA] p-3 rounded-xl">
                        {unitDeep.comprehensionCheckQuestion.explanationAr}
                      </p>
                    )}
                  </div>
                )}

                <WritingEvalBox
                  taskPromptAr={`اكتب جملة أو جملتين أصيلتين من إنشائك تطبق فيهما قاعدة "${selectedUnit.titleAr}".`}
                  targetGrammarRule={selectedUnit.titleEn}
                  defaultMode="sentence"
                  onEvaluated={res => {
                    if (res.isAcceptable) {
                      markGrammarUnitMastered(selectedUnit.id);
                    }
                  }}
                />
              </div>
            )}

            {/* Stage Footer Nav */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                disabled={grammarStage <= 1}
                onClick={() => setGrammarStage(s => Math.max(1, s - 1))}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 disabled:opacity-40 flex items-center gap-1"
              >
                <ChevronRight className="w-4 h-4" />
                <span>المرحلة السابقة</span>
              </button>
              <button
                type="button"
                disabled={grammarStage >= 5}
                onClick={() => setGrammarStage(s => Math.min(5, s + 1))}
                className="px-3.5 py-2 rounded-xl bg-[#F0F7FA] hover:bg-sky-100 text-slate-900 text-xs font-semibold disabled:opacity-40 flex items-center gap-1"
              >
                <span>المرحلة التالية</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PILLAR 2: PHONETICS & IPA ARTICULATION LAB */}
      {activePillar === 'phonetics' && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {PHONETICS_PHONOLOGY_MODULES.map(mod => (
              <button
                key={mod.id}
                type="button"
                onClick={() => {
                  setSelectedPhoneticsId(mod.id);
                  setMinimalPairTestIdx(0);
                  setMinimalPairFeedback(null);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  selectedPhonetics.id === mod.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-sky-300'
                }`}
              >
                {mod.titleAr}
              </button>
            ))}
          </div>

          <div className="surface-card rounded-3xl p-6 sm:p-7 space-y-6">
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">{selectedPhonetics.titleAr}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{selectedPhonetics.summaryAr}</p>
              <div className="surface-icy rounded-2xl p-4 text-xs text-slate-800 leading-relaxed">
                <strong>آلية النطق ومخارج الأصوات:</strong> {selectedPhonetics.articulatoryMechanicsAr}
              </div>
            </div>

            {/* Phoneme Rows */}
            <div className="space-y-3">
              {selectedPhonetics.phonemeRows.map((row, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-latin font-bold text-base text-sky-800" dir="ltr">
                      {row.symbol}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">{row.labelAr}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{row.productionTipAr}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {row.examples.map((ex, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-[#F0F7FA]/65 border border-sky-100 flex items-center justify-between gap-2"
                      >
                        <div>
                          <p className="font-latin font-bold text-sm text-slate-900" dir="ltr">
                            {ex.word}
                          </p>
                          <p className="font-latin text-xs text-slate-500" dir="ltr">
                            {ex.ipa}
                          </p>
                          <p className="text-xs text-slate-700 mt-0.5">{ex.arabic}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => playEnglishAudio(ex.word.replace('/', ','))}
                          className="p-2 rounded-xl bg-white text-sky-700 hover:bg-sky-50 border border-slate-200 shrink-0"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Minimal Pair Audio Discrimination & Mic Check */}
            {activeMinimalPair && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div className="surface-icy rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900">اختبار التمييز السمعي (Minimal Pairs)</h4>
                    <button
                      type="button"
                      onClick={() => {
                        const target = minimalPairTargetWord === 'A' ? activeMinimalPair.wordA : activeMinimalPair.wordB;
                        playEnglishAudio(target.replace(/[↘↗()]/g, ''), 0.85);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>استمع وحدد الكلمة</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3" dir="ltr">
                    {[
                      { key: 'A' as const, word: activeMinimalPair.wordA, ipa: activeMinimalPair.ipaA, ar: activeMinimalPair.meaningA },
                      { key: 'B' as const, word: activeMinimalPair.wordB, ipa: activeMinimalPair.ipaB, ar: activeMinimalPair.meaningB }
                    ].map(pair => (
                      <button
                        key={pair.key}
                        type="button"
                        onClick={() => {
                          const ok = pair.key === minimalPairTargetWord;
                          setMinimalPairFeedback(ok ? 'correct' : 'wrong');
                          recordSkillResult('pronunciation', ok, ok ? undefined : 'pronunciation');
                        }}
                        className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-sky-400 text-center space-y-1 transition-colors"
                      >
                        <p className="font-latin font-bold text-sm text-slate-900">{pair.word}</p>
                        <p className="font-latin text-xs text-slate-500">{pair.ipa}</p>
                        <p className="text-xs text-slate-600" dir="rtl">{pair.ar}</p>
                      </button>
                    ))}
                  </div>

                  {minimalPairFeedback && (
                    <div className="text-xs flex items-center justify-between gap-2 bg-white p-3 rounded-xl border border-slate-200">
                      <span className={minimalPairFeedback === 'correct' ? 'text-emerald-700 font-bold' : 'text-amber-800 font-semibold'}>
                        {minimalPairFeedback === 'correct'
                          ? 'تمييز سمعي دقيق!'
                          : `الكلمة المنطوقة كانت: ${minimalPairTargetWord === 'A' ? activeMinimalPair.wordA : activeMinimalPair.wordB}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setMinimalPairFeedback(null);
                          setMinimalPairTargetWord(prev => (prev === 'A' ? 'B' : 'A'));
                          setMinimalPairTestIdx(i => (i + 1) % selectedPhonetics.minimalPairs.length);
                        }}
                        className="text-sky-700 font-semibold hover:underline"
                      >
                        جولة أخرى
                      </button>
                    </div>
                  )}

                  <p className="text-xs text-slate-600">{activeMinimalPair.contrastNoteAr}</p>
                </div>

                <div>
                  <SpeechPracticePanel
                    expectedSentence={activeMinimalPair.wordA.replace(/[↘↗()]/g, '')}
                    arabicTranslation={activeMinimalPair.meaningA}
                    lessonId={selectedPhonetics.id}
                    onResultRecorded={assessment => {
                      const ok = assessment.matchedWordsCount >= 1;
                      recordSkillResult('pronunciation', ok, ok ? undefined : 'pronunciation');
                    }}
                  />
                </div>
              </div>
            )}

            <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <strong>الفرق بين البريطانية والأمريكية:</strong> {selectedPhonetics.ukVsUsNoteAr}
            </p>
          </div>
        </div>
      )}

      {/* PILLAR 3: READING & WRITING ACADEMY */}
      {activePillar === 'reading_writing' && (
        <div className="space-y-6">
          {/* Reading Comprehension Section */}
          <div className="surface-card rounded-3xl p-6 sm:p-7 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">القراءة التحليلية والاستنتاج</h3>
                <p className="text-xs text-slate-500">تحليل النصوص المتدرجة، استنتاج المعاني من السياق، وفهم النبرة.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {READING_WRITING_ACADEMY.readingPassages.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedPassageId(p.id);
                      setPassageAnswers({});
                      setPassageChecked(false);
                      setShowArabicPassage(false);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      activePassage.id === p.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-[#F0F7FA] text-slate-700 hover:bg-sky-100'
                    }`}
                  >
                    {p.titleAr} ({p.cefr})
                  </button>
                ))}
              </div>
            </div>

            <div className="surface-icy rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-sky-800">{activePassage.genreAr}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => playEnglishAudio(activePassage.passageEn, 0.9)}
                    className="p-2 rounded-xl bg-white text-sky-700 border border-slate-200"
                    title="استماع للنص كاملاً"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowArabicPassage(v => !v)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700"
                  >
                    {showArabicPassage ? 'إخفاء الترجمة' : 'عرض الترجمة العربية'}
                  </button>
                </div>
              </div>

              <p className="text-base font-bold text-slate-900 font-latin" dir="ltr">
                {activePassage.titleEn}
              </p>
              <p className="text-sm sm:text-base font-latin text-slate-800 leading-relaxed" dir="ltr">
                {activePassage.passageEn}
              </p>

              {showArabicPassage && (
                <p className="text-xs sm:text-sm text-slate-700 pt-3 border-t border-sky-200/70 leading-relaxed">
                  {activePassage.passageAr}
                </p>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                {activePassage.keyVocabulary.map((kv, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() =>
                      setLexicalModalTarget({
                        word: kv.word,
                        meaningAr: kv.meaningAr,
                        context: activePassage.passageEn
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white hover:bg-sky-50 border border-slate-200 text-xs"
                  >
                    <strong className="font-latin text-slate-900" dir="ltr">{kv.word}</strong>
                    <span className="font-latin text-slate-500" dir="ltr">{kv.ipa}</span>
                    <span className="text-slate-700">{kv.meaningAr}</span>
                  </button>
                ))}
              </div>
            </div>

            {activePassage.comprehensionQuestions.map((q, qIdx) => (
              <div key={qIdx} className="p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <p className="text-xs text-sky-700 font-semibold">{q.skillTagAr}</p>
                <p className="text-sm font-bold text-slate-900">{q.questionAr}</p>
                <div className="space-y-2">
                  {q.options.map(opt => {
                    const selected = passageAnswers[qIdx] === opt;
                    const isRight = opt === q.correctAnswer;
                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={passageChecked}
                        onClick={() => setPassageAnswers(prev => ({ ...prev, [qIdx]: opt }))}
                        className={`w-full p-3 rounded-xl border text-right text-xs sm:text-sm transition-colors ${
                          passageChecked && isRight
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold'
                            : passageChecked && selected
                            ? 'bg-red-50 border-red-400 text-red-900'
                            : selected
                            ? 'bg-[#F0F7FA] border-sky-500 text-slate-900 font-semibold'
                            : 'bg-white border-slate-200 hover:border-sky-200 text-slate-800'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {passageChecked && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                    <strong>التحليل:</strong> {q.explanationAr} — {activePassage.toneAndInferenceAr}
                  </p>
                )}
              </div>
            ))}

            {!passageChecked && (
              <button
                type="button"
                onClick={() => {
                  setPassageChecked(true);
                  activePassage.comprehensionQuestions.forEach((q, idx) => {
                    const ok = passageAnswers[idx] === q.correctAnswer;
                    recordSkillResult('reading', ok, ok ? undefined : 'vocabulary_choice');
                  });
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold"
              >
                تحقق من فهم النص
              </button>
            )}
          </div>

          {/* Guided Writing Frameworks + Live Writing Evaluation */}
          <div className="surface-card rounded-3xl p-6 sm:p-7 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">ورشة الكتابة الأكاديمية والمهنية</h3>
                <p className="text-xs text-slate-500">تدرّب على بناء الفقرات والبريد الرسمي والمقال مع تقييم شامل.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {READING_WRITING_ACADEMY.writingFrameworks.map((fw, idx) => (
                  <button
                    key={fw.id}
                    type="button"
                    onClick={() => setSelectedFrameworkIdx(idx)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      selectedFrameworkIdx === idx
                        ? 'bg-slate-900 text-white'
                        : 'bg-[#F0F7FA] text-slate-700 hover:bg-sky-100'
                    }`}
                  >
                    {fw.titleAr}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900">خطة البناء الهيكلي</h4>
                <ul className="space-y-1.5 text-slate-700 list-disc pr-4 leading-relaxed">
                  {activeWritingFramework.structureGuideAr.map((g, i) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
                <p className="pt-2 text-slate-600">
                  <strong>أدوات الربط:</strong>{' '}
                  <span className="font-latin text-sky-800" dir="ltr">
                    {activeWritingFramework.cohesionToolsEn.join(' · ')}
                  </span>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-slate-900">نموذج إرشادي للمحاكاة</h4>
                  <button
                    type="button"
                    onClick={() => playEnglishAudio(activeWritingFramework.modelPreviewEn)}
                    className="p-1.5 rounded-lg bg-white text-sky-700 border border-slate-200"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="font-latin text-slate-800 leading-relaxed" dir="ltr">
                  {activeWritingFramework.modelPreviewEn}
                </p>
                <p className="text-slate-600 leading-relaxed">{activeWritingFramework.modelPreviewAr}</p>
              </div>
            </div>

            <WritingEvalBox
              key={activeWritingFramework.id}
              taskPromptAr={activeWritingFramework.sampleTaskAr}
              targetGrammarRule={activeWritingFramework.titleEn}
              defaultMode={activeWritingFramework.mode}
            />
          </div>
        </div>
      )}

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
