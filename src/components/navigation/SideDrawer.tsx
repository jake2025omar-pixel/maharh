import React from 'react';
import {
  X,
  Home,
  BookMarked,
  MessageSquare,
  Sparkles,
  Repeat,
  Settings,
  HelpCircle,
  Clock,
  Layers,
  GraduationCap
} from 'lucide-react';
import { useSession } from '../../context/SessionContext.tsx';

export type ActiveTab =
  | 'home'
  | 'curriculum'
  | 'everyday'
  | 'exercises'
  | 'review'
  | 'settings';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenCompanion: () => void;
}

export const SideDrawer: React.FC<SideDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  onOpenCompanion
}) => {
  const { progress } = useSession();

  const navItems = [
    {
      id: 'home' as ActiveTab,
      labelAr: 'الرئيسية وجلسة التعلم',
      labelEn: 'Home & Learning Sessions',
      descAr: 'بدء الجلسة الذكية وتقسيم الوقت إلى أربعة أرباع متكافئة',
      icon: Home
    },
    {
      id: 'curriculum' as ActiveTab,
      labelAr: 'مقرر حضرموت (الصف 11)',
      labelEn: 'Yemeni Curriculum (Hadramout)',
      descAr: 'كتيّب المراجعة الشاملة لجميع وحدات وقواعد الصف الحادي عشر',
      icon: GraduationCap,
      badge: '12 وحدة'
    },
    {
      id: 'everyday' as ActiveTab,
      labelAr: 'الإنجليزية اليومية الحياتية',
      labelEn: 'Practical Everyday English',
      descAr: 'محادثات طبيعية، مواقف السفر، التسوق، والتعاملات الحقيقية',
      icon: BookMarked,
      badge: 'مكتبة حية'
    },
    {
      id: 'exercises' as ActiveTab,
      labelAr: 'محرك التمارين التفاعلية',
      labelEn: 'Interactive Exercises Hub',
      descAr: '15 نمط تمرين تفاعلي (توصيل، تهجئة، إعادة ترتيب، استماع ونطق)',
      icon: Sparkles,
      badge: `${progress.totalExercisesCompleted} محلولة`
    },
    {
      id: 'review' as ActiveTab,
      labelAr: 'المراجعة المخصصة',
      labelEn: 'Personalized Review Deck',
      descAr: 'مراجعة الجمل والأخطاء التي تحتاج إلى تثبيت بالتكرار المتباعد',
      icon: Repeat,
      badge: `${progress.reviewDeck.filter(r => !r.mastered).length} للمراجعة`
    },
    {
      id: 'settings' as ActiveTab,
      labelAr: 'الإعدادات والمستوى',
      labelEn: 'Settings & Preferences',
      descAr: 'تحديد المستوى (مبتدئ، متوسط، متقدم) وتهيئة مفتاح جيميناي',
      icon: Settings
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" dir="rtl">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Container (Slides from right in Arabic RTL) */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-white shadow-2xl border-l border-stone-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-900 font-extrabold text-lg">
                م
              </div>
              <div>
                <h2 className="font-extrabold text-stone-900 text-lg tracking-tight">MAHARAH | مهارة</h2>
                <p className="text-xs text-stone-500">منصة تعلم الإنجليزية الذكية</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Level Pill */}
          <div className="px-6 py-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between text-xs text-stone-600">
            <span>المستوى الدراسي المعتمد:</span>
            <span className="font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
              {progress.level === 'beginner' ? 'مبتدئ' : progress.level === 'intermediate' ? 'متوسط' : 'متقدم'}
            </span>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`w-full text-right p-3.5 rounded-2xl transition-all flex items-start gap-3.5 group ${
                    isActive
                      ? 'bg-stone-100 text-stone-900 shadow-2xs'
                      : 'hover:bg-stone-50 text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                      isActive ? 'bg-amber-600 text-white shadow-xs' : 'bg-stone-100 text-stone-600 group-hover:bg-amber-100 group-hover:text-amber-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`font-bold text-sm ${isActive ? 'text-stone-900' : 'text-stone-800'}`}>
                        {item.labelAr}
                      </p>
                      {item.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-200/80 text-stone-700 font-medium">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.descAr}
                    </p>
                  </div>
                </button>
              );
            })}

            {/* Quick Action: Open Cat Companion */}
            <div className="pt-4 mt-4 border-t border-stone-100">
              <button
                onClick={() => {
                  onClose();
                  onOpenCompanion();
                }}
                className="w-full p-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-right flex items-center justify-between gap-3 shadow-md transition-all active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-amber-100 ring-2 ring-amber-400 shrink-0">
                    <img
                      src="/src/assets/images/cat_companion_fullbody_1794437148306.jpg"
                      alt="فرهود"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-stone-100">فرهود — الرفيق الذكي</p>
                    <p className="text-xs text-amber-200">محادثة وتوضيح فوري</p>
                  </div>
                </div>
                <Sparkles className="w-5 h-5 text-amber-400" />
              </button>
            </div>
          </div>

          {/* Footer Info */}
          <div className="p-4 border-t border-stone-100 bg-stone-50/50 text-center">
            <p className="text-[11px] text-stone-400">
              MAHARAH 3.0 • منهج حضرموت والإنجليزية اليومية
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
