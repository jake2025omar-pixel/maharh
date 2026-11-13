import React from 'react';
import { Headphones, PenLine, Mic, Layers, ArrowLeft } from 'lucide-react';
import { useSession } from '../../context/SessionContext.tsx';

export const WelcomeOnboarding: React.FC = () => {
  const { completeOnboarding } = useSession();

  const capabilities = [
    {
      icon: Headphones,
      title: 'الاستماع والفهم',
      desc: 'جمل إنجليزية كاملة في سياقاتها مع الترجمة العربية الواضحة.'
    },
    {
      icon: PenLine,
      title: 'الكتابة والقواعد',
      desc: 'إملاء، ترتيب جمل، وتطبيق قواعد منهج الصف الحادي عشر (حضرموت).'
    },
    {
      icon: Mic,
      title: 'النطق والتحدث',
      desc: 'ممارسة صوتية حقيقية عبر الميكروفون وتحليل فوري للكلمات المنطوقة.'
    },
    {
      icon: Layers,
      title: 'تمارين تفاعلية ومساعد ذكي',
      desc: 'أنشطة متدرجة تتكيف مع وقتك بالإضافة إلى صفحة مستقلة للمساعد الذكي.'
    }
  ];

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-white via-[#F0F7FA]/60 to-white flex items-center justify-center px-4 py-12"
      dir="rtl"
    >
      <div className="glass-panel max-w-2xl w-full rounded-3xl p-8 sm:p-12 text-right space-y-8">
        <div className="space-y-4">
          <p className="text-xs font-semibold text-sky-700 tracking-wide">
            MAHARAH · مهارة
          </p>
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 leading-tight text-balance">
            منصة هادئة ومصممة بعناية لإتقان اللغة الإنجليزية
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
            تجمع مهارة بين المنهج اليمني الرسمي لطلاب الصف الحادي عشر (حضرموت) ومكتبة الإنجليزية اليومية، لتتعلم من خلال الاستماع والكتابة والتحدث والتمارين التفاعلية.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white/85 border border-slate-200/70 space-y-1.5"
              >
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                  <Icon className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>{cap.title}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{cap.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex items-center justify-between gap-4 border-t border-slate-200/60">
          <span className="text-xs text-slate-500">
            ستنتقل مباشرة إلى الدروس في زياراتك القادمة
          </span>

          <button
            type="button"
            onClick={completeOnboarding}
            className="px-7 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-2xl transition-all active:scale-98 flex items-center gap-2 shadow-sm whitespace-nowrap shrink-0"
          >
            <span>ابدأ التعلم</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
