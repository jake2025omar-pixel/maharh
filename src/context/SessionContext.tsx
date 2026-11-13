import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  loadUserProgress,
  saveUserProgress,
  saveOnboardingState,
  UserProgress,
  CEFRLevel,
  SkillDomain,
  DEFAULT_PROGRESS,
  cefrToTrackLevel,
  trackLevelToCefr,
  addMistakeToReviewDeck,
  markReviewItemMastered,
  scheduleSpacedReview,
  applySkillAssessmentToProgress,
  toggleSaveSentence
} from '../services/storageService.ts';
import {
  LessonDescriptor,
  PlannedActivity,
  generateStudySessionPlan,
  getAllAvailableLessons
} from '../services/sessionPlanner.ts';
import { StudentProfile } from '../server/dbService.ts';

interface SessionContextType {
  progress: UserProgress;
  currentUser: StudentProfile | null;
  setCurrentUser: (user: StudentProfile | null) => void;
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
  resetOnboardingView: () => void;
  setLevel: (lvl: 'beginner' | 'intermediate' | 'advanced') => void;
  setCefrLevel: (cefr: CEFRLevel) => void;
  setTrack: (track: 'hadramout_curriculum' | 'everyday_english') => void;
  selectedDurationMinutes: number;
  setSelectedDurationMinutes: (mins: number) => void;
  // Lesson selection & session runtime
  selectedLesson: LessonDescriptor | null;
  selectLessonForSetup: (lesson: LessonDescriptor | null) => void;
  plannedActivities: PlannedActivity[];
  isSessionActive: boolean;
  isPaused: boolean;
  currentActivityIndex: number;
  currentActivity: PlannedActivity | null;
  activitySecondsElapsed: number;
  activityTimeRemainingSeconds: number;
  isActivityRecommendedTimeEnded: boolean;
  totalSessionSecondsElapsed: number;
  completedActivityIds: string[];
  startPlannedSession: (lesson: LessonDescriptor, durationMins: number) => void;
  nextActivity: () => void;
  prevActivity: () => void;
  goToActivity: (index: number) => void;
  markCurrentActivityDone: () => void;
  togglePause: () => void;
  endSession: () => void;
  markSentenceCompleted: (id: string) => void;
  markLessonCompleted: (lessonId: string) => void;
  markGrammarUnitMastered: (grammarId: string) => void;
  recordSkillResult: (
    domain: SkillDomain,
    isCorrect: boolean,
    errorCategory?: string,
    errorCategoryAr?: string,
    exampleSnippet?: string
  ) => void;
  recordExerciseResult: (
    isCorrect: boolean,
    mistake?: {
      sentenceId: string;
      english: string;
      arabic: string;
      topicTitleAr: string;
      explanationAr: string;
      errorCategory?: string;
    },
    domain?: SkillDomain
  ) => void;
  toggleBookmarkSentence: (sentenceId: string) => void;
  resolveReviewMistake: (reviewId: string, passedCheck?: boolean) => void;
  resetAllProgress: () => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<UserProgress>(() => loadUserProgress());
  const [currentUser, setCurrentUserState] = useState<StudentProfile | null>(() => {
    try {
      const raw = localStorage.getItem('maharah_current_user_v4');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [selectedDurationMinutes, setSelectedDurationMinutesState] = useState<number>(
    progress.selectedDurationMinutes || 15
  );
  const [selectedLesson, setSelectedLesson] = useState<LessonDescriptor | null>(null);
  const [plannedActivities, setPlannedActivities] = useState<PlannedActivity[]>([]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [activitySecondsElapsed, setActivitySecondsElapsed] = useState(0);
  const [totalSessionSecondsElapsed, setTotalSessionSecondsElapsed] = useState(0);
  const [completedActivityIds, setCompletedActivityIds] = useState<string[]>([]);
  const [sessionStartedAt, setSessionStartedAt] = useState<string>('');

  // Sync progress to localStorage
  useEffect(() => {
    saveUserProgress(progress);
  }, [progress]);

  // Keep planned activities preview updated when user adjusts duration on Step 3
  useEffect(() => {
    if (selectedLesson && !isSessionActive) {
      setPlannedActivities(generateStudySessionPlan(selectedLesson, selectedDurationMinutes));
    }
  }, [selectedLesson, selectedDurationMinutes, isSessionActive]);

  const hasCompletedOnboarding = Boolean(
    currentUser ? currentUser.onboardingCompleted || progress.onboardingCompleted : progress.onboardingCompleted
  );

  const setCurrentUser = (user: StudentProfile | null) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem('maharah_current_user_v4', JSON.stringify(user));
      // Sync onboarding if already completed locally
      if (progress.onboardingCompleted && !user.onboardingCompleted) {
        fetch('/api/auth/onboarding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(user.accessToken ? { Authorization: `Bearer ${user.accessToken}` } : {})
          },
          body: JSON.stringify({ studentId: user.id, completed: true })
        }).catch(() => {});
      } else if (user.onboardingCompleted && !progress.onboardingCompleted) {
        saveOnboardingState(true);
        setProgress(prev => ({ ...prev, onboardingCompleted: true }));
      }
      // Load student progress from backend
      fetch(`/api/student/${user.id}/data`)
        .then(r => r.json())
        .then(data => {
          if (data?.progress) {
            setProgress(prev => ({
              ...prev,
              completedLessonIds: data.progress.completedLessonIds || prev.completedLessonIds,
              completedSentenceIds: data.progress.completedSentenceIds || prev.completedSentenceIds,
              totalExercisesCompleted: Math.max(prev.totalExercisesCompleted, data.progress.totalExercisesCompleted || 0),
              correctExercisesCount: Math.max(prev.correctExercisesCount, data.progress.correctExercisesCount || 0)
            }));
          }
        })
        .catch(() => {});
    } else {
      localStorage.removeItem('maharah_current_user_v4');
    }
  };

  const completeOnboarding = () => {
    saveOnboardingState(true);
    setProgress(prev => ({ ...prev, onboardingCompleted: true }));
    if (currentUser) {
      const updated = { ...currentUser, onboardingCompleted: true };
      setCurrentUserState(updated);
      localStorage.setItem('maharah_current_user_v4', JSON.stringify(updated));
      fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentUser.accessToken ? { Authorization: `Bearer ${currentUser.accessToken}` } : {})
        },
        body: JSON.stringify({ studentId: currentUser.id, completed: true })
      }).catch(() => {});
    }
  };

  const resetOnboardingView = () => {
    saveOnboardingState(false);
    setProgress(prev => ({ ...prev, onboardingCompleted: false }));
  };

  const setSelectedDurationMinutes = (mins: number) => {
    setSelectedDurationMinutesState(mins);
    setProgress(prev => ({ ...prev, selectedDurationMinutes: mins }));
  };

  const setLevel = (lvl: 'beginner' | 'intermediate' | 'advanced') => {
    setProgress(prev => ({ ...prev, level: lvl, cefrLevel: trackLevelToCefr(lvl) }));
  };

  const setCefrLevel = (cefr: CEFRLevel) => {
    setProgress(prev => ({ ...prev, cefrLevel: cefr, level: cefrToTrackLevel(cefr) }));
  };

  const setTrack = (track: 'hadramout_curriculum' | 'everyday_english') => {
    setProgress(prev => ({ ...prev, activeTrack: track }));
  };

  const selectLessonForSetup = (lesson: LessonDescriptor | null) => {
    setSelectedLesson(lesson);
    if (lesson) {
      setPlannedActivities(generateStudySessionPlan(lesson, selectedDurationMinutes));
    } else {
      setPlannedActivities([]);
    }
  };

  const startPlannedSession = (lesson: LessonDescriptor, durationMins: number) => {
    const plan = generateStudySessionPlan(lesson, durationMins);
    setSelectedLesson(lesson);
    setSelectedDurationMinutes(durationMins);
    setPlannedActivities(plan);
    setCurrentActivityIndex(0);
    setActivitySecondsElapsed(0);
    setTotalSessionSecondsElapsed(0);
    setCompletedActivityIds([]);
    setSessionStartedAt(new Date().toISOString());
    setIsSessionActive(true);
    setIsPaused(false);
  };

  const currentActivity = plannedActivities[currentActivityIndex] || null;
  const activityDurationSeconds = currentActivity?.durationSeconds || 0;
  const activityTimeRemainingSeconds = Math.max(0, activityDurationSeconds - activitySecondsElapsed);
  const isActivityRecommendedTimeEnded =
    isSessionActive && activityDurationSeconds > 0 && activitySecondsElapsed >= activityDurationSeconds;

  // Non-punitive timer loop
  useEffect(() => {
    if (!isSessionActive || isPaused) return;
    const timer = setInterval(() => {
      setActivitySecondsElapsed(prev => prev + 1);
      setTotalSessionSecondsElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isSessionActive, isPaused]);

  const markSentenceCompleted = (id: string) => {
    setProgress(prev => {
      if (prev.completedSentenceIds.includes(id)) return prev;
      return { ...prev, completedSentenceIds: [...prev.completedSentenceIds, id] };
    });
  };

  const markLessonCompleted = (lessonId: string) => {
    setProgress(prev => {
      if (prev.completedLessonIds.includes(lessonId)) return prev;
      return { ...prev, completedLessonIds: [...prev.completedLessonIds, lessonId] };
    });
  };

  const markCurrentActivityDone = useCallback(() => {
    if (!currentActivity) return;
    setCompletedActivityIds(prev => (prev.includes(currentActivity.id) ? prev : [...prev, currentActivity.id]));
  }, [currentActivity]);

  const persistSessionToBackend = useCallback(
    (finalCompletedIds: string[]) => {
      if (!selectedLesson) return;
      if (finalCompletedIds.length === plannedActivities.length && plannedActivities.length > 0) {
        markLessonCompleted(selectedLesson.id);
      }
      if (currentUser?.id) {
        fetch('/api/sessions/record', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(currentUser.accessToken ? { Authorization: `Bearer ${currentUser.accessToken}` } : {})
          },
          body: JSON.stringify({
            studentId: currentUser.id,
            lessonId: selectedLesson.id,
            lessonTitle: selectedLesson.titleAr,
            durationMinutes: selectedDurationMinutes,
            plannedActivities: plannedActivities.map(a => ({
              id: a.id,
              titleAr: a.titleAr,
              durationSeconds: a.durationSeconds
            })),
            activitiesCompleted: finalCompletedIds,
            totalSecondsElapsed: totalSessionSecondsElapsed,
            track: selectedLesson.source,
            startedAt: sessionStartedAt || new Date().toISOString(),
            endedAt: new Date().toISOString()
          })
        }).catch(() => {});
      }
    },
    [selectedLesson, plannedActivities, currentUser, selectedDurationMinutes, totalSessionSecondsElapsed, sessionStartedAt]
  );

  const endSession = useCallback(() => {
    persistSessionToBackend(completedActivityIds);
    setIsSessionActive(false);
    setIsPaused(false);
    setActivitySecondsElapsed(0);
  }, [completedActivityIds, persistSessionToBackend]);

  const nextActivity = useCallback(() => {
    const nextDone = currentActivity
      ? completedActivityIds.includes(currentActivity.id)
        ? completedActivityIds
        : [...completedActivityIds, currentActivity.id]
      : completedActivityIds;
    setCompletedActivityIds(nextDone);

    if (currentActivityIndex < plannedActivities.length - 1) {
      setCurrentActivityIndex(prev => prev + 1);
      setActivitySecondsElapsed(0);
    } else {
      persistSessionToBackend(nextDone);
      setIsSessionActive(false);
      setIsPaused(false);
      setActivitySecondsElapsed(0);
    }
  }, [currentActivity, completedActivityIds, currentActivityIndex, plannedActivities.length, persistSessionToBackend]);

  const prevActivity = useCallback(() => {
    if (currentActivityIndex > 0) {
      setCurrentActivityIndex(prev => prev - 1);
      setActivitySecondsElapsed(0);
    }
  }, [currentActivityIndex]);

  const goToActivity = useCallback((index: number) => {
    if (index >= 0 && index < plannedActivities.length) {
      setCurrentActivityIndex(index);
      setActivitySecondsElapsed(0);
    }
  }, [plannedActivities.length]);

  const togglePause = () => setIsPaused(prev => !prev);

  const markGrammarUnitMastered = (grammarId: string) => {
    setProgress(prev => {
      if (prev.masteredGrammarIds.includes(grammarId)) return prev;
      return { ...prev, masteredGrammarIds: [...prev.masteredGrammarIds, grammarId] };
    });
  };

  const recordSkillResult = (
    domain: SkillDomain,
    isCorrect: boolean,
    errorCategory?: string,
    errorCategoryAr?: string,
    exampleSnippet?: string
  ) => {
    setProgress(prev => {
      const updated = applySkillAssessmentToProgress(
        prev,
        domain,
        isCorrect,
        errorCategory,
        errorCategoryAr,
        exampleSnippet
      );
      saveUserProgress(updated);
      return updated;
    });
  };

  const recordExerciseResult = (
    isCorrect: boolean,
    mistake?: {
      sentenceId: string;
      english: string;
      arabic: string;
      topicTitleAr: string;
      explanationAr: string;
      errorCategory?: string;
    },
    domain: SkillDomain = 'grammar'
  ) => {
    setProgress(prev => {
      let next: UserProgress = {
        ...prev,
        totalExercisesCompleted: prev.totalExercisesCompleted + 1,
        correctExercisesCount: isCorrect ? prev.correctExercisesCount + 1 : prev.correctExercisesCount
      };
      next = applySkillAssessmentToProgress(
        next,
        domain,
        isCorrect,
        isCorrect ? undefined : mistake?.errorCategory || 'other',
        undefined,
        mistake?.english
      );
      saveUserProgress(next);
      if (!isCorrect && mistake) {
        next = addMistakeToReviewDeck(
          mistake.sentenceId,
          mistake.english,
          mistake.arabic,
          mistake.topicTitleAr,
          mistake.explanationAr,
          mistake.errorCategory
        );
      }
      return next;
    });
  };

  const toggleBookmarkSentence = (sentenceId: string) => {
    const res = toggleSaveSentence(sentenceId);
    setProgress(res.progress);
  };

  const resolveReviewMistake = (reviewId: string, passedCheck?: boolean) => {
    const updated =
      typeof passedCheck === 'boolean'
        ? scheduleSpacedReview(reviewId, passedCheck)
        : markReviewItemMastered(reviewId);
    setProgress(updated);
  };

  const resetAllProgress = () => {
    const fresh: UserProgress = {
      ...DEFAULT_PROGRESS,
      onboardingCompleted: true
    };
    saveUserProgress(fresh);
    setProgress(fresh);
  };

  // Expose helper check for available lessons count
  void getAllAvailableLessons;

  return (
    <SessionContext.Provider
      value={{
        progress,
        currentUser,
        setCurrentUser,
        hasCompletedOnboarding,
        completeOnboarding,
        resetOnboardingView,
        setLevel,
        setCefrLevel,
        setTrack,
        selectedDurationMinutes,
        setSelectedDurationMinutes,
        selectedLesson,
        selectLessonForSetup,
        plannedActivities,
        isSessionActive,
        isPaused,
        currentActivityIndex,
        currentActivity,
        activitySecondsElapsed,
        activityTimeRemainingSeconds,
        isActivityRecommendedTimeEnded,
        totalSessionSecondsElapsed,
        completedActivityIds,
        startPlannedSession,
        nextActivity,
        prevActivity,
        goToActivity,
        markCurrentActivityDone,
        togglePause,
        endSession,
        markSentenceCompleted,
        markLessonCompleted,
        markGrammarUnitMastered,
        recordSkillResult,
        recordExerciseResult,
        toggleBookmarkSentence,
        resolveReviewMistake,
        resetAllProgress
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
