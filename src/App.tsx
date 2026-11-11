import React, { useState } from 'react';
import {
  Menu,
  Sparkles,
  GraduationCap,
  BookOpen,
  Coffee,
  Repeat,
  Settings,
  HelpCircle,
  Home
} from 'lucide-react';
import { SessionProvider, useSession } from './context/SessionContext.tsx';
import { SessionFlow } from './components/session/SessionFlow.tsx';
import { CurriculumViewer } from './components/curriculum/CurriculumViewer.tsx';
import { EverydayViewer } from './components/everyday/EverydayViewer.tsx';
import { ExerciseEngine } from './components/exercises/ExerciseEngine.tsx';
import { PersonalizedReview } from './components/review/PersonalizedReview.tsx';
import { SettingsView } from './components/settings/SettingsView.tsx';
import { SideDrawer, ActiveTab } from './components/navigation/SideDrawer.tsx';
import { CatCompanion } from './components/companion/CatCompanion.tsx';
import { SentenceItem } from './data/curriculumData.ts';

function AppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCompanionOpen, setIsCompanionOpen] = useState(false);
  const [activeSentence, setActiveSentence] = useState<SentenceItem | null>(null);

  const handleOpenCompanion = () => {
    setIsCompanionOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] text-stone-900 flex flex-col font-sans" dir="rtl">
      {/* Top Bar Contract: 3 Zones: Brand — Nav Links — 1 Primary Action */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setActiveTab('home')}
          className="text-lg sm:text-xl font-extrabold tracking-tight text-stone-900 whitespace-nowrap shrink-0 flex items-center gap-2 hover:opacity-85 transition-opacity"
        >
          <span className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center text-sm font-extrabold">
            م
          </span>
          <span>MAHARAH | مهارة</span>
        </button>

        {/* Zone 2: Clean single-line nav links with subtle hover underlines */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
          <button
            onClick={() => setActiveTab('home')}
            className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'home' ? 'text-amber-800 font-bold border-b-2 border-amber-600' : ''
            }`}
          >
            الرئيسية
          </button>
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'curriculum' ? 'text-amber-800 font-bold border-b-2 border-amber-600' : ''
            }`}
          >
            منهج حضرموت (الصف 11)
          </button>
          <button
            onClick={() => setActiveTab('everyday')}
            className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'everyday' ? 'text-amber-800 font-bold border-b-2 border-amber-600' : ''
            }`}
          >
            الإنجليزية اليومية
          </button>
          <button
            onClick={() => setActiveTab('exercises')}
            className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'exercises' ? 'text-amber-800 font-bold border-b-2 border-amber-600' : ''
            }`}
          >
            التمارين التفاعلية
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'review' ? 'text-amber-800 font-bold border-b-2 border-amber-600' : ''
            }`}
          >
            المراجعة المخصصة
          </button>
        </nav>

        {/* Zone 3: 1 primary action (or menu trigger) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsCompanionOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-stone-900 bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors whitespace-nowrap shrink-0 border border-amber-300/80"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>اسأل فرهود 🐱</span>
          </button>

          <button
            onClick={() => setIsDrawerOpen(true)}
            aria-label="فتح القائمة الجانبية"
            className="p-2 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Menu className="w-5 h-5" />
            <span className="text-xs font-semibold hidden sm:inline">القائمة</span>
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 pb-16">
        {activeTab === 'home' && (
          <SessionFlow
            onOpenCompanion={handleOpenCompanion}
            onSentenceSelected={setActiveSentence}
          />
        )}
        {activeTab === 'curriculum' && (
          <CurriculumViewer
            onOpenCompanion={handleOpenCompanion}
            onSentenceSelected={setActiveSentence}
          />
        )}
        {activeTab === 'everyday' && (
          <EverydayViewer
            onOpenCompanion={handleOpenCompanion}
            onSentenceSelected={setActiveSentence}
          />
        )}
        {activeTab === 'exercises' && (
          <ExerciseEngine onOpenCompanion={handleOpenCompanion} />
        )}
        {activeTab === 'review' && (
          <PersonalizedReview onOpenCompanion={handleOpenCompanion} />
        )}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Hidden Side Navigation Drawer */}
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenCompanion={handleOpenCompanion}
      />

      {/* Independent 2D Cat Companion */}
      <CatCompanion
        currentSentence={activeSentence}
        isOpen={isCompanionOpen}
        onToggle={() => setIsCompanionOpen(prev => !prev)}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-stone-200/60 py-6 px-4 text-center text-xs text-stone-400 bg-white/50">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 MAHARAH (مهارة) — منصة تعليم الإنجليزية الرسمية لطلاب حضرموت والإنجليزية اليومية.</p>
          <div className="flex items-center gap-4 text-stone-500">
            <button onClick={() => setActiveTab('settings')} className="hover:text-stone-800">
              الإعدادات
            </button>
            <span>•</span>
            <button onClick={() => setActiveTab('curriculum')} className="hover:text-stone-800">
              كتيّب المنهج
            </button>
            <span>•</span>
            <button onClick={handleOpenCompanion} className="hover:text-stone-800">
              رفيق مهارة الذكي
            </button>
          </div>
        </div>
      </footer>
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
