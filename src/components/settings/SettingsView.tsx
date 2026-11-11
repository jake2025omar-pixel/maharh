import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  Key,
  GraduationCap,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { useSession, DURATION_OPTIONS } from '../../context/SessionContext.tsx';
import { saveUserProgress } from '../../services/storageService.ts';

export const SettingsView: React.FC = () => {
  const { progress, setLevel, selectedDurationMinutes, setSelectedDurationMinutes } = useSession();
  const [systemStatus, setSystemStatus] = useState<{
    hasApiKey: boolean;
    model: string;
    curriculumUnitsCount: number;
  } | null>(null);

  useEffect(() => {
    fetch('/api/system/status')
      .then(res => res.json())
      .then(data => setSystemStatus(data))
      .catch(err => console.error('Status fetch error:', err));
  }, []);

  const handleResetProgress = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في إعادة ضبط تقدمك التعليمي والبدء من جديد؟')) {
      const fresh = {
        level: 'beginner' as const,
        selectedDurationMinutes: 20,
        activeTrack: 'hadramout_curriculum' as const,
        completedSentenceIds: [],
        savedSentenceIds: [],
        totalExercisesCompleted: 0,
        correctExercisesCount: 0,
        reviewDeck: [],
        currentSession: null
      };
      saveUserProgress(fresh);
      window.location.reload();
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6" dir="rtl">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs mb-8 text-right">
        <div className="flex items-center gap-3 mb-6 border-b border-stone-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900">
              إعدادات منصة مهارة (MAHARAH)
            </h1>
            <p className="text-xs text-stone-500">
              تخصيص مستوى التعلم، تهيئة الذكاء الاصطناعي، وإدارة تقدمك
            </p>
          </div>
        </div>

        {/* 1. Level Selection */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-stone-900 mb-2 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-amber-600" />
            المستوى الدراسي المستهدف
          </h2>
          <p className="text-xs text-stone-500 mb-4">
            تتغير صعوبة الجمل، القواعد، وسرعة النطق الصوتي وفقاً لمستواك المختار:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'beginner' as const, title: 'المبتدئ (Beginner)', desc: 'جمل أساسية، تراكيب مباشرة، نطق هادئ وتوضيحي' },
              { id: 'intermediate' as const, title: 'المتوسط (Intermediate)', desc: 'قواعد منهج حضرموت، المبني للمجهول، والجمل المركبة' },
              { id: 'advanced' as const, title: 'المتقدم (Advanced)', desc: 'تراكيب دقيقة، مصطلحات جنائية وطبية، ونطق طبيعي سريع' }
            ].map(lvl => (
              <button
                key={lvl.id}
                onClick={() => setLevel(lvl.id)}
                className={`p-4 rounded-2xl border text-right transition-all ${
                  progress.level === lvl.id
                    ? 'border-amber-600 bg-amber-50/70 shadow-xs ring-1 ring-amber-500 text-amber-950 font-bold'
                    : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-800'
                }`}
              >
                <span className="block text-sm">{lvl.title}</span>
                <span className="block text-[11px] text-stone-500 mt-1 font-normal leading-relaxed">{lvl.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Default Duration Preference */}
        <div className="mb-8 pt-6 border-t border-stone-100">
          <h2 className="text-sm font-bold text-stone-900 mb-2">
            المدة الافتراضية للجلسة اليومية
          </h2>
          <div className="flex flex-wrap gap-2 mt-3">
            {DURATION_OPTIONS.map(mins => (
              <button
                key={mins}
                onClick={() => setSelectedDurationMinutes(mins)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold font-latin transition-all ${
                  selectedDurationMinutes === mins
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {mins} دقيقة
              </button>
            ))}
          </div>
        </div>

        {/* 3. Gemini AI Configuration & Security */}
        <div className="mb-8 pt-6 border-t border-stone-100">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              تكامل الذكاء الاصطناعي (Google Gemini 3.8 Flash)
            </h2>
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                systemStatus?.hasApiKey
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {systemStatus?.hasApiKey ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  مفتاح جيميناي مفعل
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3" />
                  يعمل بالوضع الداخلي المنهجي
                </>
              )}
            </span>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-700 space-y-3 leading-relaxed">
            <p>
              🔒 <strong>الأمان والخصوصية:</strong> يتم تشغيل جميع استدعاءات Google Gemini حصرياً عبر الخادم الخلفي الآمن لمنصة مهارة. لا يُكشف مفتاح API مطلقاً لمتصفح المستخدم ولا يوضع في شفرات الواجهة الأمامية.
            </p>
            <p>
              🔑 <strong>كيفية ضبط مفتاحك الخاص:</strong> لربط مفتاحك الشخصي، انتقل إلى لوحة <strong>Settings &gt; Secrets</strong> في شريط أدوات بيئة AI Studio وأضف المتغير بالاسم التالي:
            </p>
            <div className="p-2.5 bg-stone-900 text-amber-300 font-mono text-xs rounded-xl text-center" dir="ltr">
              GEMINI_API_KEY="AIzaSy..."
            </div>
            <p className="text-stone-500 text-[11px]">
              * إذا لم يتم إدخال المفتاح، ستستمر المنصة بالعمل بسلاسة تامة بالاعتماد على محرك الاسترجاع الذاتي المدمج لكتيّب مراجعة منهج حضرموت.
            </p>
          </div>
        </div>

        {/* 4. Statistics & Reset */}
        <div className="pt-6 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-stone-500">
            <span>التمارين المكتملة: <strong>{progress.totalExercisesCompleted}</strong></span>
            <span className="mx-2">•</span>
            <span>نسبة الصواب: <strong>{progress.totalExercisesCompleted > 0 ? Math.round((progress.correctExercisesCount / progress.totalExercisesCompleted) * 100) : 0}%</strong></span>
          </div>

          <button
            onClick={handleResetProgress}
            className="px-4 py-2 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة ضبط التقدم التعليمي</span>
          </button>
        </div>
      </div>
    </div>
  );
};
