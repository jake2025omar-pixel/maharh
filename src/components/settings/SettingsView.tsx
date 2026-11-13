import React, { useState, useEffect } from 'react';
import {
  Settings,
  GraduationCap,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye
} from 'lucide-react';
import { useSession } from '../../context/SessionContext.tsx';
import { DURATION_OPTIONS } from '../../services/sessionPlanner.ts';
import { CEFR_LEVEL_SPECS } from '../../data/cefrCurriculumData.ts';
import { SKILL_DOMAIN_LABELS_AR, SkillDomain } from '../../services/storageService.ts';

export const SettingsView: React.FC = () => {
  const {
    progress,
    setLevel,
    setCefrLevel,
    selectedDurationMinutes,
    setSelectedDurationMinutes,
    resetOnboardingView,
    resetAllProgress
  } = useSession();

  const [systemStatus, setSystemStatus] = useState<{
    hasApiKey: boolean;
    model: string;
    curriculumUnitsCount: number;
  } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetDoneNotice, setResetDoneNotice] = useState(false);

  useEffect(() => {
    fetch('/api/system/status')
      .then(res => res.json())
      .then(data => setSystemStatus(data))
      .catch(() => {});
  }, []);

  const handleConfirmReset = () => {
    resetAllProgress();
    setConfirmReset(false);
    setResetDoneNotice(true);
    setTimeout(() => setResetDoneNotice(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-6" dir="rtl">
      <div className="surface-card rounded-3xl p-6 sm:p-8 text-right space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3.5 border-b border-slate-100 pb-5">
          <div className="w-11 h-11 rounded-2xl surface-icy text-sky-700 flex items-center justify-center shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              إعدادات منصة مهارة (MAHARAH)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              تخصيص المستوى الإطاري CEFR، مدة الجلسة المفضلة، وتقييم إتقان المهارات اللغوية
            </p>
          </div>
        </div>

        {/* 1. CEFR + Track Level Selection */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-sky-600" />
            <span>المستوى الإطاري المستهدف (CEFR A1–C2)</span>
          </h2>
          <p className="text-xs text-slate-500">
            يُكيّف هذا الاختيار عمق الشرح النحوي، مستوى المفردات، وتحديات الكتابة والمحادثة:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {CEFR_LEVEL_SPECS.map(spec => (
              <button
                key={spec.code}
                type="button"
                onClick={() => setCefrLevel(spec.code)}
                className={`p-3.5 rounded-2xl border text-right transition-colors ${
                  progress.cefrLevel === spec.code
                    ? 'border-sky-600 bg-[#F0F7FA] text-slate-900 font-semibold'
                    : 'border-slate-200 bg-white hover:border-sky-200 text-slate-800'
                }`}
              >
                <span className="block text-sm">{spec.titleAr}</span>
                <span className="block text-[11px] text-slate-500 mt-1 font-normal line-clamp-2">
                  {spec.outcomesAr.grammar}
                </span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {[
              {
                id: 'beginner' as const,
                title: 'المبتدئ (Beginner)',
                desc: 'جمل أساسية، تراكيب مباشرة، ونطق هادئ واضح'
              },
              {
                id: 'intermediate' as const,
                title: 'المتوسط (Intermediate)',
                desc: 'قواعد منهج حضرموت، المبني للمجهول، والجمل المركبة'
              },
              {
                id: 'advanced' as const,
                title: 'المتقدم (Advanced)',
                desc: 'تراكيب دقيقة، مصطلحات علمية وطبية، ونطق طبيعي'
              }
            ].map(lvl => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setLevel(lvl.id)}
                className={`p-3.5 rounded-2xl border text-right transition-colors ${
                  progress.level === lvl.id
                    ? 'border-slate-900 bg-slate-900 text-white font-semibold'
                    : 'border-slate-200 bg-white hover:border-sky-200 text-slate-800'
                }`}
              >
                <span className="block text-xs">{lvl.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 1.5 Genuine 7-Domain Skill Mastery Telemetry */}
        <div className="pt-6 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-slate-900">تقييم إتقان المهارات اللغوية السبع</h2>
            <span className="text-[11px] text-slate-500">يُحتسب فقط من التمارين والاختبارات المُقيّمة فعلياً</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(Object.keys(SKILL_DOMAIN_LABELS_AR) as SkillDomain[]).map(domain => {
              const stat = progress.skillMastery[domain];
              const hasData = stat && stat.attempts > 0;
              return (
                <div
                  key={domain}
                  className="p-3.5 rounded-2xl border border-slate-200/80 bg-[#F0F7FA]/45 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">{SKILL_DOMAIN_LABELS_AR[domain]}</span>
                    <span className="font-numeric text-slate-600">
                      {hasData ? `${stat.masteryPercent}% (${stat.correct}/${stat.attempts})` : 'لم يُقيّم بعد'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white rounded-full overflow-hidden border border-slate-200/60">
                    <div
                      className="h-full bg-sky-600 transition-all"
                      style={{ width: `${hasData ? stat.masteryPercent : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Default Duration Preference */}
        <div className="pt-6 border-t border-slate-100 space-y-3">
          <h2 className="text-sm font-bold text-slate-900">المدة الافتراضية لجلسة التعلم</h2>
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map(mins => (
              <button
                key={mins}
                type="button"
                onClick={() => setSelectedDurationMinutes(mins)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold font-numeric transition-colors ${
                  selectedDurationMinutes === mins
                    ? 'bg-slate-900 text-white'
                    : 'bg-[#F0F7FA] text-slate-700 hover:bg-sky-100'
                }`}
              >
                {mins} دقيقة
              </button>
            ))}
          </div>
        </div>

        {/* 3. Server AI Status (Read-Only) */}
        <div className="pt-6 border-t border-slate-100 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>حالة المساعد الذكي والمنهج</span>
            </h2>
            <span
              className={`text-xs font-semibold flex items-center gap-1.5 ${
                systemStatus?.hasApiKey ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {systemStatus?.hasApiKey ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>متصل وجاهز على الخادم</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span>بانتظار التهيئة على الخادم</span>
                </>
              )}
            </span>
          </div>

          <div className="surface-icy rounded-2xl p-4 text-xs text-slate-700 space-y-2 leading-relaxed">
            <p>
              تُدار جميع اتصالات الذكاء الاصطناعي والبحث حصرياً عبر الخادم الخلفي المحمي لمنصة مهارة؛ لا تُحفظ أو تُعرض أي مفاتيح خدمة داخل المتصفح.
            </p>
            {systemStatus && (
              <p className="text-slate-500 font-numeric">
                النموذج المفعّل: <span className="font-latin text-slate-800">{systemStatus.model}</span> · أقسام المنهج المتوفرة: {systemStatus.curriculumUnitsCount}
              </p>
            )}
          </div>
        </div>

        {/* 4. Onboarding Replay & Progress Reset */}
        <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-600 font-numeric">
            <span>التمارين المكتملة: <strong>{progress.totalExercisesCompleted}</strong></span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>
              نسبة الصواب:{' '}
              <strong>
                {progress.totalExercisesCompleted > 0
                  ? Math.round((progress.correctExercisesCount / progress.totalExercisesCompleted) * 100)
                  : 0}
                %
              </strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={resetOnboardingView}
              className="px-4 py-2 rounded-xl bg-[#F0F7FA] hover:bg-sky-100 text-slate-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-sky-700" />
              <span>إعادة عرض شاشة الترحيب</span>
            </button>

            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 rounded-xl border border-red-200/70 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة ضبط التقدم</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl text-xs">
                <span className="text-red-900 font-medium">تأكيد مسح التقدم المحلي؟</span>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="px-2.5 py-1 bg-red-600 text-white rounded-lg font-semibold"
                >
                  نعم، امسح
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2 py-1 text-slate-600 hover:text-slate-900"
                >
                  إلغاء
                </button>
              </div>
            )}
          </div>
        </div>

        {resetDoneNotice && (
          <p className="text-xs text-emerald-700 font-medium text-center">
            تمت إعادة ضبط التقدم المحلي بنجاح.
          </p>
        )}
      </div>
    </div>
  );
};
