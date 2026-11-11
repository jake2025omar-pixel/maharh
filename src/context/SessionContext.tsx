import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { loadUserProgress, saveUserProgress, UserProgress } from '../services/storageService.ts';

export type QuarterType = 1 | 2 | 3 | 4;

export interface QuarterInfo {
  quarter: QuarterType;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  iconName: string;
  targetFocusAr: string;
}

export const SESSION_QUARTERS: Record<QuarterType, QuarterInfo> = {
  1: {
    quarter: 1,
    titleAr: 'جلسة الاستماع',
    titleEn: 'Listening Session',
    descriptionAr: 'استمع للنطق الأصيل للجمل الكاملة وركّز على نبرات الصوت ومخارج الحروف.',
    iconName: 'Headphones',
    targetFocusAr: 'الاستماع المتكرر للجمل والمصطلحات'
  },
  2: {
    quarter: 2,
    titleAr: 'القراءة وفهم الجمل',
    titleEn: 'Reading & Sentence Comprehension',
    descriptionAr: 'قراءة الجمل وسياقاتها النحوية وفهم الترجمة العربية الدقيقة والمفردات.',
    iconName: 'BookOpen',
    targetFocusAr: 'فهم معاني الجمل وقواعدها في السياق'
  },
  3: {
    quarter: 3,
    titleAr: 'النطق والتحدث',
    titleEn: 'Pronunciation & Speaking',
    descriptionAr: 'تدرب على التحدث بصوتك باللغة الإنجليزية وقارن نطقك بالنطق السليم.',
    iconName: 'Mic',
    targetFocusAr: 'إتقان التحدث بالجملة بطلاقة'
  },
  4: {
    quarter: 4,
    titleAr: 'التمارين المكثفة',
    titleEn: 'Intensive Exercises',
    descriptionAr: 'تطبيق عملي فوري عبر 15 نمطاً تفاعلياً لقياس استيعابك وتثبيت المعلومة.',
    iconName: 'Sparkles',
    targetFocusAr: 'حل التمارين المتنوعة وتثبيت القواعد'
  }
};

export const DURATION_OPTIONS = [5, 10, 15, 20, 30, 35, 40, 45, 50, 60];

interface SessionContextType {
  progress: UserProgress;
  setLevel: (lvl: 'beginner' | 'intermediate' | 'advanced') => void;
  setTrack: (track: 'hadramout_curriculum' | 'everyday_english') => void;
  selectedDurationMinutes: number;
  setSelectedDurationMinutes: (mins: number) => void;
  // Session runtime
  isSessionActive: boolean;
  isPaused: boolean;
  currentQuarter: QuarterType;
  quarterSecondsTotal: number;
  quarterSecondsElapsed: number;
  quarterTimeRemainingSeconds: number;
  isQuarterRecommendedTimeEnded: boolean;
  totalSessionSecondsElapsed: number;
  startSession: (durationMins: number) => void;
  nextQuarter: () => void;
  prevQuarter: () => void;
  goToQuarter: (q: QuarterType) => void;
  togglePause: () => void;
  endSession: () => void;
  markSentenceCompleted: (id: string) => void;
  recordExerciseResult: (isCorrect: boolean) => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<UserProgress>(() => loadUserProgress());
  const [selectedDurationMinutes, setSelectedDurationMinutesState] = useState<number>(
    progress.selectedDurationMinutes || 20
  );
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentQuarter, setCurrentQuarter] = useState<QuarterType>(1);
  const [quarterSecondsElapsed, setQuarterSecondsElapsed] = useState(0);
  const [totalSessionSecondsElapsed, setTotalSessionSecondsElapsed] = useState(0);

  // Sync progress to storage
  useEffect(() => {
    saveUserProgress(progress);
  }, [progress]);

  const setSelectedDurationMinutes = (mins: number) => {
    setSelectedDurationMinutesState(mins);
    setProgress(prev => ({ ...prev, selectedDurationMinutes: mins }));
  };

  const setLevel = (lvl: 'beginner' | 'intermediate' | 'advanced') => {
    setProgress(prev => ({ ...prev, level: lvl }));
  };

  const setTrack = (track: 'hadramout_curriculum' | 'everyday_english') => {
    setProgress(prev => ({ ...prev, activeTrack: track }));
  };

  const markSentenceCompleted = (id: string) => {
    setProgress(prev => {
      if (prev.completedSentenceIds.includes(id)) return prev;
      return {
        ...prev,
        completedSentenceIds: [...prev.completedSentenceIds, id]
      };
    });
  };

  const recordExerciseResult = (isCorrect: boolean) => {
    setProgress(prev => ({
      ...prev,
      totalExercisesCompleted: prev.totalExercisesCompleted + 1,
      correctExercisesCount: isCorrect ? prev.correctExercisesCount + 1 : prev.correctExercisesCount
    }));
  };

  // Duration calculations
  // Total duration in seconds divided by 4:
  const quarterSecondsTotal = Math.round((selectedDurationMinutes * 60) / 4);
  const quarterTimeRemainingSeconds = Math.max(0, quarterSecondsTotal - quarterSecondsElapsed);
  const isQuarterRecommendedTimeEnded = quarterSecondsElapsed >= quarterSecondsTotal;

  // Timer loop
  useEffect(() => {
    if (!isSessionActive || isPaused) return;

    const timer = setInterval(() => {
      setQuarterSecondsElapsed(prev => prev + 1);
      setTotalSessionSecondsElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isSessionActive, isPaused]);

  const startSession = (durationMins: number) => {
    setSelectedDurationMinutes(durationMins);
    setCurrentQuarter(1);
    setQuarterSecondsElapsed(0);
    setTotalSessionSecondsElapsed(0);
    setIsSessionActive(true);
    setIsPaused(false);
  };

  const nextQuarter = useCallback(() => {
    if (currentQuarter < 4) {
      setCurrentQuarter(prev => (prev + 1) as QuarterType);
      setQuarterSecondsElapsed(0);
    } else {
      // Completed all 4 quarters
      endSession();
    }
  }, [currentQuarter]);

  const prevQuarter = useCallback(() => {
    if (currentQuarter > 1) {
      setCurrentQuarter(prev => (prev - 1) as QuarterType);
      setQuarterSecondsElapsed(0);
    }
  }, [currentQuarter]);

  const goToQuarter = useCallback((q: QuarterType) => {
    setCurrentQuarter(q);
    setQuarterSecondsElapsed(0);
  }, []);

  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  const endSession = () => {
    setIsSessionActive(false);
    setIsPaused(false);
    setQuarterSecondsElapsed(0);
  };

  return (
    <SessionContext.Provider
      value={{
        progress,
        setLevel,
        setTrack,
        selectedDurationMinutes,
        setSelectedDurationMinutes,
        isSessionActive,
        isPaused,
        currentQuarter,
        quarterSecondsTotal,
        quarterSecondsElapsed,
        quarterTimeRemainingSeconds,
        isQuarterRecommendedTimeEnded,
        totalSessionSecondsElapsed,
        startSession,
        nextQuarter,
        prevQuarter,
        goToQuarter,
        togglePause,
        endSession,
        markSentenceCompleted,
        recordExerciseResult
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
