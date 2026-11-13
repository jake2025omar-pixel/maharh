import React from 'react';
import {
  X,
  Home,
  BookMarked,
  Sparkles,
  Repeat,
  Settings,
  GraduationCap,
  Bot
} from 'lucide-react';
import { useSession } from '../../context/SessionContext.tsx';
import { HADRAMOUT_CURRICULUM_TOPICS } from '../../data/curriculumData.ts';

export type ActiveTab =
  | 'home'
  | 'curriculum'
  | 'everyday'
  | 'exercises'
  | 'review'
  | 'assistant'
  | 'settings';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAuth: () => void;
}

export const SideDrawer: React.FC<SideDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  onOpenAuth
}) => {
  const { progress, currentUser } = useSession();

  const navItems = [
    {
      id: 'home' as ActiveTab,
      labelAr: 'الرئيسية وجلسات التعلم',
      descAr: 'اختيار الدرس وتحديد المدة وإدارة الأنشطة التفاعلية',
      icon: Home
    },
    {
      id: 'curriculum' as ActiveTab,
      labelAr: 'مقرر حضرموت (الصف 11)',
      descAr: `كتيّب المراجعة الشاملة — ${HADRAMOUT_CURRICULUM_TOPICS.length} قسماً تعليمياً`,
      icon: GraduationCap
    },
    {
      id: 'everyday' as ActiveTab,
      labelAr: 'الإنجليزية اليومية',
      descAr: 'جمل ومواقف واقعية متدرجة عبر المستويات الثلاثة',
      icon: BookMarked
    },
    {
      id: 'exercises' as ActiveTab,
      labelAr: 'التمارين التفاعلية',
      descAr: `${progress.totalExercisesCompleted} تمرين منجز عبر أنماط متعددة`,
      icon: Sparkles
    },
    {
      id: 'review' as ActiveTab,
      labelAr: 'المراجعة المخصصة',
      descAr: `${progress.reviewDeck.filter(r => !r.mastered).length} جملة تحتاج للمراجعة · ${progress.savedSentenceIds.length} محفوظة`,
      icon: Repeat
    },
    {
      id: 'assistant' as ActiveTab,
      labelAr: 'المساعد الذكي',
      descAr: 'اكتب سؤالك في حقل الإدخال ويجيبك المساعد صوتياً مباشرة',
      icon: Bot
    },
    {
      id: 'settings' as ActiveTab,
      labelAr: 'الإعدادات والمستوى',
      descAr: 'تخصيص مستوى التعلم وإعادة عرض شاشة الترحيب',
      icon: Settings
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" dir="rtl">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/35 backdrop-blur-xs transition-opacity"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-white shadow-xl border-l border-slate-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 text-lg tracking-tight">
                MAHARAH · مهارة
              </h2>
              <p className="text-xs text-slate-500">منصة تعلم الإنجليزية</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Student Account Bar */}
          <div className="px-6 py-3.5 bg-[#F0F7FA]/60 border-b border-sky-100 flex items-center justify-between gap-2">
            <div className="min-w-0 text-right">
              <p className="text-xs font-bold text-slate-900 truncate">
                {currentUser ? currentUser.fullName : 'زائر'}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {currentUser
                  ? currentUser.email
                  : `المستوى: ${
                      progress.level === 'beginner'
                        ? 'مبتدئ'
                        : progress.level === 'intermediate'
                        ? 'متوسط'
                        : 'متقدم'
                    }`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="text-xs text-slate-900 bg-white hover:bg-sky-50 px-3 py-1.5 rounded-xl font-semibold border border-slate-200 transition-colors shrink-0"
            >
              {currentUser ? 'الحساب' : 'تسجيل الدخول'}
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`w-full text-right p-3.5 rounded-2xl transition-colors flex items-start gap-3.5 ${
                    isActive
                      ? 'bg-[#F0F7FA] text-slate-900 border border-sky-200/70'
                      : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      isActive ? 'bg-slate-900 text-white' : 'bg-[#F0F7FA] text-sky-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-900">{item.labelAr}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.descAr}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              MAHARAH · منهج حضرموت والإنجليزية اليومية
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
