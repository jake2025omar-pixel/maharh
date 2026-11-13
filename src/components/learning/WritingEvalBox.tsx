import React, { useState } from 'react';
import { PenTool, Loader2, CheckCircle2, AlertTriangle, Volume2, Sparkles } from 'lucide-react';
import { useSession } from '../../context/SessionContext.tsx';
import {
  evaluateStudentWritingRequest,
  WritingEvaluationResult
} from '../../services/pedagogyClient.ts';
import { ERROR_CATEGORY_LABELS_AR } from '../../services/storageService.ts';
import { playEnglishAudio } from '../../services/audioService.ts';

interface WritingEvalBoxProps {
  taskPromptAr?: string;
  targetGrammarRule?: string;
  defaultMode?: 'sentence' | 'paragraph' | 'email' | 'essay' | 'report';
  placeholderEn?: string;
  onEvaluated?: (result: WritingEvaluationResult) => void;
}

const MODE_LABELS: { id: 'sentence' | 'paragraph' | 'email' | 'essay' | 'report'; label: string }[] = [
  { id: 'sentence', label: 'جملة تطبيقية' },
  { id: 'paragraph', label: 'فقرة مترابطة' },
  { id: 'email', label: 'بريد رسمي' },
  { id: 'essay', label: 'مقال تحليلي' },
  { id: 'report', label: 'تقرير' }
];

export const WritingEvalBox: React.FC<WritingEvalBoxProps> = ({
  taskPromptAr,
  targetGrammarRule,
  defaultMode = 'sentence',
  placeholderEn = 'Write your own English sentence or paragraph here...',
  onEvaluated
}) => {
  const { progress, recordSkillResult } = useSession();
  const [writingMode, setWritingMode] = useState<'sentence' | 'paragraph' | 'email' | 'essay' | 'report'>(
    defaultMode
  );
  const [studentText, setStudentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<WritingEvaluationResult | null>(null);

  const handleEvaluate = async () => {
    const trimmed = studentText.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const result = await evaluateStudentWritingRequest({
        studentText: trimmed,
        taskPromptAr,
        targetGrammarRule,
        cefrLevel: progress.cefrLevel,
        writingMode
      });
      setEvaluation(result);

      const primaryCat = result.detectedErrorCategories?.[0];
      recordSkillResult(
        'writing',
        result.isAcceptable,
        result.isAcceptable ? undefined : primaryCat || 'other',
        primaryCat ? ERROR_CATEGORY_LABELS_AR[primaryCat] : undefined,
        trimmed.slice(0, 120)
      );

      onEvaluated?.(result);
    } catch (err: any) {
      setErrorMsg(err?.message || 'تعذر تقييم النص حالياً، تأكد من الاتصال بالخادم.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="surface-icy rounded-2xl p-5 space-y-4 text-right">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PenTool className="w-4 h-4 text-sky-700" />
          <h4 className="text-sm font-bold text-slate-900">استوديو الكتابة والتصحيح الأكاديمي</h4>
        </div>

        <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/80">
          {MODE_LABELS.map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => setWritingMode(m.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                writingMode === m.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {taskPromptAr && (
        <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-3 rounded-xl border border-sky-100">
          <strong>المهمة المطلوبة:</strong> {taskPromptAr}
        </p>
      )}

      <textarea
        value={studentText}
        onChange={e => setStudentText(e.target.value)}
        placeholder={placeholderEn}
        dir="ltr"
        rows={writingMode === 'sentence' ? 2 : 4}
        className="w-full p-4 rounded-2xl border border-slate-200 focus:border-sky-400 focus:outline-none bg-white text-sm text-slate-900 font-latin leading-relaxed"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[11px] text-slate-500">
          المستوى المستهدف للتقييم: <strong className="font-latin">{progress.cefrLevel}</strong>
        </span>

        <button
          type="button"
          onClick={handleEvaluate}
          disabled={!studentText.trim() || loading}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 disabled:opacity-45 transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>جارٍ تحليل الأسلوب والقواعد...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-sky-300" />
              <span>تصحيح وتحليل الأستاذ</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
          {errorMsg}
        </div>
      )}

      {evaluation && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold">
              {evaluation.isAcceptable ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-900">صياغة سليمة وموفقة!</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-900">صياغة جيدة تحتاج لبعض التنقيح الدقيق</span>
                </>
              )}
            </div>
            <span className="text-xs text-slate-500 font-latin">
              Estimated CEFR: <strong className="text-slate-900">{evaluation.estimatedCEFR}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#F0F7FA] border border-sky-100 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900">الصياغة المصححة</span>
                <button
                  type="button"
                  onClick={() => playEnglishAudio(evaluation.correctedVersionEn)}
                  className="p-1.5 rounded-lg bg-white text-sky-700 hover:bg-sky-50"
                  title="استماع للصياغة المصححة"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-sm font-semibold text-slate-900 font-latin leading-relaxed" dir="ltr">
                {evaluation.correctedVersionEn}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900">صياغة طبيعية أرقى (Natural Upgrade)</span>
                <button
                  type="button"
                  onClick={() => playEnglishAudio(evaluation.naturalUpgradeEn)}
                  className="p-1.5 rounded-lg bg-white text-sky-700 hover:bg-sky-50"
                  title="استماع للصياغة الطبيعية"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-sm font-semibold text-slate-900 font-latin leading-relaxed" dir="ltr">
                {evaluation.naturalUpgradeEn}
              </p>
              {evaluation.naturalUpgradeAr && (
                <p className="text-xs text-slate-600 leading-relaxed">{evaluation.naturalUpgradeAr}</p>
              )}
            </div>
          </div>

          {evaluation.overallFeedbackAr && (
            <p className="text-xs text-slate-700 leading-relaxed">{evaluation.overallFeedbackAr}</p>
          )}

          {evaluation.detailedCorrections?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-900">تحليل النقاط التصحيحية (لماذا حدث الخطأ؟)</p>
              <div className="space-y-2">
                {evaluation.detailedCorrections.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/80 text-xs space-y-1"
                  >
                    <div className="flex flex-wrap items-center gap-2 font-latin" dir="ltr">
                      <span className="line-through text-red-700">{c.originalSegment}</span>
                      <span className="text-slate-400">→</span>
                      <span className="font-bold text-emerald-800">{c.correctedSegment}</span>
                      <span className="text-[11px] text-slate-500" dir="rtl">({c.errorTypeAr})</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{c.whyWrongAr}</p>
                    {c.ruleTipAr && (
                      <p className="text-sky-900 text-[11px] font-medium">القاعدة: {c.ruleTipAr}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {evaluation.nextStepPracticeAr && (
            <p className="text-xs text-sky-900 bg-[#F0F7FA]/80 p-3 rounded-xl border border-sky-100">
              <strong>الخطوة التطبيقية المقترحة:</strong> {evaluation.nextStepPracticeAr}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
