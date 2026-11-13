import React, { useState } from 'react';
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  Play,
  CheckCircle2,
  BookOpen,
  Coffee,
  Layers
} from 'lucide-react';
import { useSession } from '../../context/SessionContext.tsx';
import {
  getAllAvailableLessons,
  LessonDescriptor,
  DURATION_OPTIONS,
  formatDurationExact
} from '../../services/sessionPlanner.ts';
import { SentenceItem } from '../../data/curriculumData.ts';
import { AcademyModulesPanel } from '../learning/AcademyModulesPanel.tsx';

interface LearningHomeProps {
  onStartActiveSession: () => void;
  onSentenceSelected: (sentence: SentenceItem) => void;
}

export const LearningHome: React.FC<LearningHomeProps> = ({
  onStartActiveSession,
  onSentenceSelected
}) => {
  const {
    progress,
    setTrack,
    setLevel,
    selectedDurationMinutes,
    setSelectedDurationMinutes,
    selectedLesson,
    selectLessonForSetup,
    plannedActivities,
    startPlannedSession
  } = useSession();

  const [sourceFilter, setSourceFilter] = useState<
    'hadramout_curriculum' | 'everyday_english' | 'comprehensive_academy'
  >(progress.activeTrack);

  const allLessons = getAllAvailableLessons();
  const visibleLessons = allLessons.filter(l => {
    if (l.source !== sourceFilter) return false;
    if (sourceFilter === 'everyday_english') {
      // Filter sentences matching level if everyday, keep categories that have sentences at or near level
      return l.sentences.some(s => s.level === progress.level) || progress.level === 'intermediate';
    }
    return true;
  });

  const handleChooseLesson = (lesson: LessonDescriptor) => {
    setTrack(lesson.source);
    selectLessonForSetup(lesson);
    if (lesson.sentences[0]) {
      onSentenceSelected(lesson.sentences[0]);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // STEP 3: Study Duration Selection & Transparent Activity Plan Preview
  if (selectedLesson) {
    const totalPlannedSeconds = plannedActivities.reduce((acc, a) => acc + a.durationSeconds, 0);

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12" dir="rtl">
        <button
          type="button"
          onClick={() => selectLessonForSetup(null)}
          className="mb-6 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-sky-300 text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى قائمة الدروس</span>
        </button>

        <div className="glass-panel rounded-3xl p-6 sm:p-10 space-y-8 text-right">
          {/* Selected Lesson Summary */}
          <div className="space-y-2 border-b border-slate-200/70 pb-6">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>
                {selectedLesson.source === 'hadramout_curriculum'
                  ? 'المنهج الرسمي · الصف الحادي عشر (حضرموت)'
                  : 'الإنجليزية اليومية الحياتية'}
              </span>
              {selectedLesson.pdfPages && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>المرجع: {selectedLesson.pdfPages}</span>
                </>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              {selectedLesson.titleAr}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
              {selectedLesson.descriptionAr}
            </p>
          </div>

          {/* Duration Picker Grid */}
          <div className="space-y-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                اختر مدة جلسة الدراسة
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                يُوزع الوقت المحدد تلقائياً على الأنشطة المناسبة لطبيعة هذا الدرس بدقة الثواني، والمؤقت إرشادي فقط دون ضغط.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {DURATION_OPTIONS.map(mins => {
                const isSelected = selectedDurationMinutes === mins;
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setSelectedDurationMinutes(mins)}
                    className={`py-3.5 px-3 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                        : 'bg-white border-slate-200 hover:border-sky-300 hover:bg-[#F0F7FA]/50 text-slate-800'
                    }`}
                  >
                    <span className="block text-lg font-bold font-numeric">{mins}</span>
                    <span className={`text-xs ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      دقيقة
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Planned Activities Transparent Preview */}
          <div className="surface-icy rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Clock className="w-4 h-4 text-sky-600" />
                <span>خطة الأنشطة لهذه الجلسة</span>
              </div>
              <span className="text-xs font-numeric text-slate-600">
                المجموع الدقيق: {formatDurationExact(totalPlannedSeconds)} ({selectedDurationMinutes} دقيقة)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {plannedActivities.map((act, index) => (
                <div
                  key={act.id}
                  className="bg-white/90 rounded-2xl p-4 border border-sky-100 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-numeric font-semibold text-sky-700">0{index + 1}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-latin">{act.titleEn}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{act.titleAr}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{act.descriptionAr}</p>
                  </div>
                  <span className="font-numeric text-xs font-semibold text-slate-800 bg-[#F0F7FA] px-2.5 py-1 rounded-lg shrink-0">
                    {formatDurationExact(act.durationSeconds)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Start Session Primary CTA */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="button"
              onClick={() => {
                startPlannedSession(selectedLesson, selectedDurationMinutes);
                onStartActiveSession();
              }}
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-2xl transition-all active:scale-98 flex items-center justify-center gap-2 shadow-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>ابدأ الجلسة الآن ({selectedDurationMinutes} دقيقة)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 1 & 2: Calm Lesson Selection Home Screen
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8" dir="rtl">
      {/* Clean Header & Track Switcher */}
      <div className="space-y-6">
        <div className="space-y-2 max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 text-balance">
            اختر الدرس الذي تود دراسته اليوم
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            دروس منهج الصف الحادي عشر (حضرموت) مستخرجة من الكتيّب الرسمي المعتمد، إلى جانب مكتبة الإنجليزية اليومية وأكاديمية اللغة الشاملة (A1–C2).
          </p>
        </div>

        {/* Clean Segmented Control: Official Curriculum vs Everyday English vs Comprehensive CEFR Academy */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex flex-wrap p-1 rounded-2xl bg-[#F0F7FA] border border-sky-100">
            <button
              type="button"
              onClick={() => {
                setSourceFilter('hadramout_curriculum');
                setTrack('hadramout_curriculum');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                sourceFilter === 'hadramout_curriculum'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-sky-600" />
              <span>المنهج الرسمي (حضرموت)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSourceFilter('everyday_english');
                setTrack('everyday_english');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                sourceFilter === 'everyday_english'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Coffee className="w-4 h-4 text-sky-600" />
              <span>الإنجليزية اليومية</span>
            </button>
            <button
              type="button"
              onClick={() => setSourceFilter('comprehensive_academy')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                sourceFilter === 'comprehensive_academy'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4 text-sky-600" />
              <span>أكاديمية الإنجليزية الشاملة (CEFR)</span>
            </button>
          </div>

          {sourceFilter === 'everyday_english' && (
            <div className="inline-flex p-1 rounded-xl bg-[#F0F7FA] border border-sky-100 text-xs">
              {[
                { id: 'beginner' as const, label: 'مبتدئ' },
                { id: 'intermediate' as const, label: 'متوسط' },
                { id: 'advanced' as const, label: 'متقدم' }
              ].map(lvl => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setLevel(lvl.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    progress.level === lvl.id
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Academy Modules Panel OR Lesson Selection Grid */}
      {sourceFilter === 'comprehensive_academy' ? (
        <AcademyModulesPanel />
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleLessons.map(lesson => {
          const isCompleted = progress.completedLessonIds.includes(lesson.id);
          const completedSentencesInLesson = lesson.sentences.filter(s =>
            progress.completedSentenceIds.includes(s.id)
          ).length;
          const hasRealProgress = isCompleted || completedSentencesInLesson > 0;

          return (
            <div
              key={lesson.id}
              className="surface-card rounded-3xl p-6 flex flex-col justify-between gap-5 hover:border-sky-200 transition-all text-right"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span>
                    {lesson.unitLabelAr}
                    {lesson.pdfPages ? ` · ${lesson.pdfPages}` : ''}
                  </span>
                  {hasRealProgress && (
                    <span className="text-sky-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        {isCompleted
                          ? 'تمت دراسته'
                          : `${completedSentencesInLesson}/${lesson.sentences.length} جمل`}
                      </span>
                    </span>
                  )}
                </div>

                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {lesson.titleAr}
                </h2>

                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-2">
                  {lesson.descriptionAr}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-xs font-latin text-slate-400 truncate max-w-[55%]" dir="ltr">
                  {lesson.titleEn}
                </span>

                <button
                  type="button"
                  onClick={() => handleChooseLesson(lesson)}
                  className="px-4 py-2 rounded-xl bg-[#F0F7FA] hover:bg-sky-600 text-slate-900 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <span>ابدأ الدرس</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
