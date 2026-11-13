import React, { useState, useEffect } from 'react';
import { Menu, User } from 'lucide-react';
import { SessionProvider, useSession } from './context/SessionContext.tsx';
import { WelcomeOnboarding } from './components/onboarding/WelcomeOnboarding.tsx';
import { LearningHome } from './components/home/LearningHome.tsx';
import { ActiveSessionView } from './components/session/ActiveSessionView.tsx';
import { CurriculumViewer } from './components/curriculum/CurriculumViewer.tsx';
import { EverydayViewer } from './components/everyday/EverydayViewer.tsx';
import { ExerciseEngine } from './components/exercises/ExerciseEngine.tsx';
import { PersonalizedReview } from './components/review/PersonalizedReview.tsx';
import { SettingsView } from './components/settings/SettingsView.tsx';
import { SideDrawer, ActiveTab } from './components/navigation/SideDrawer.tsx';
import { AssistantPage } from './components/assistant/AssistantPage.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { SentenceItem } from './data/curriculumData.ts';

function getInitialTabFromUrl(): ActiveTab {
  if (typeof window !== 'undefined' && window.location.pathname === '/assistant') {
    return 'assistant';
  }
  return 'home';
}

function AppContent() {
  const {
    hasCompletedOnboarding,
    currentUser,
    isSessionActive,
    selectedLesson
  } = useSession();

  const [activeTab, setActiveTab] = useState<ActiveTab>(getInitialTabFromUrl);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeSentence, setActiveSentence] = useState<SentenceItem | null>(null);

  const navigateTo = (tab: ActiveTab) => {
    setActiveTab(tab);
    const targetPath = tab === 'assistant' ? '/assistant' : '/';
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState({ tab }, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getInitialTabFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleOpenAssistant = (sentence?: SentenceItem) => {
    setActiveSentence(sentence ?? null);
    navigateTo('assistant');
  };

  // Show welcome onboarding ONLY on first visit (or when replayed from settings),
  // unless user navigated directly to /assistant
  if (!hasCompletedOnboarding && activeTab !== 'assistant') {
    return <WelcomeOnboarding />;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans" dir="rtl">
      {/* Top Bar Contract: 3 Zones: Brand — Nav Links — Primary Account & Menu */}
      <header className="sticky top-0 z-40 glass-nav px-4 sm:px-8 py-3.5 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => navigateTo('home')}
          className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:opacity-80 transition-opacity"
        >
          MAHARAH · مهارة
        </button>

        {/* Zone 2: Clean Single-Line Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          {[
            { id: 'home' as ActiveTab, label: 'الرئيسية' },
            { id: 'curriculum' as ActiveTab, label: 'منهج حضرموت' },
            { id: 'everyday' as ActiveTab, label: 'الإنجليزية اليومية' },
            { id: 'exercises' as ActiveTab, label: 'التمارين' },
            { id: 'review' as ActiveTab, label: 'المراجعة' },
            { id: 'assistant' as ActiveTab, label: 'المساعد الذكي' }
          ].map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => (item.id === 'assistant' ? handleOpenAssistant() : navigateTo(item.id))}
              className={`py-1 whitespace-nowrap shrink-0 transition-colors border-b-2 ${
                activeTab === item.id
                  ? 'text-slate-900 font-semibold border-sky-600'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Auth CTA + Drawer Menu Trigger */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsAuthOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F0F7FA] hover:bg-sky-100 text-slate-900 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <User className="w-3.5 h-3.5 text-sky-700" />
            <span>{currentUser ? currentUser.fullName.split(' ')[0] : 'حساب الطالب'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="فتح القائمة"
            className="p-2 text-slate-700 hover:text-slate-900 hover:bg-[#F0F7FA] rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Menu className="w-5 h-5" />
            <span className="text-xs font-medium hidden sm:inline">القائمة</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {activeTab === 'home' &&
          (isSessionActive ? (
            <ActiveSessionView
              onOpenAssistantWithContext={sentence => handleOpenAssistant(sentence)}
              onSessionExit={() => navigateTo('home')}
            />
          ) : (
            <LearningHome
              onStartActiveSession={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              onSentenceSelected={s => setActiveSentence(s)}
            />
          ))}

        {activeTab === 'curriculum' && (
          <CurriculumViewer onOpenAssistant={handleOpenAssistant} />
        )}

        {activeTab === 'everyday' && (
          <EverydayViewer onOpenAssistant={handleOpenAssistant} />
        )}

        {activeTab === 'exercises' && (
          <ExerciseEngine onOpenAssistant={handleOpenAssistant} />
        )}

        {activeTab === 'review' && (
          <PersonalizedReview onOpenAssistant={handleOpenAssistant} />
        )}

        {activeTab === 'assistant' && (
          <AssistantPage
            lessonContextSentence={activeSentence}
            lessonTitleAr={selectedLesson?.titleAr}
            onBackToLearning={() => navigateTo('home')}
          />
        )}

        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Slide-out Navigation Drawer */}
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeTab={activeTab}
        onSelectTab={tab => (tab === 'assistant' ? handleOpenAssistant() : navigateTo(tab))}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Student Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Minimal Footer */}
      {activeTab !== 'assistant' && (
        <footer className="border-t border-slate-100 py-6 px-4 text-center text-xs text-slate-400 bg-white">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>© 2026 MAHARAH · مهارة — منصة تعلم الإنجليزية لطلاب حضرموت والإنجليزية اليومية</p>
            <div className="flex items-center gap-4 text-slate-500">
              <button
                type="button"
                onClick={() => navigateTo('curriculum')}
                className="hover:text-slate-900"
              >
                منهج حضرموت
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => handleOpenAssistant()}
                className="hover:text-slate-900"
              >
                المساعد الذكي
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => navigateTo('settings')}
                className="hover:text-slate-900"
              >
                الإعدادات
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
}
