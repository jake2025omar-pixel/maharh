export interface ReviewItem {
  id: string;
  sentenceId: string;
  english: string;
  arabic: string;
  topicTitleAr: string;
  mistakeReasonAr: string;
  addedAt: string;
  reviewCount: number;
  mastered: boolean;
}

export interface UserProgress {
  level: 'beginner' | 'intermediate' | 'advanced';
  selectedDurationMinutes: number;
  activeTrack: 'hadramout_curriculum' | 'everyday_english';
  completedSentenceIds: string[];
  savedSentenceIds: string[];
  totalExercisesCompleted: number;
  correctExercisesCount: number;
  reviewDeck: ReviewItem[];
  currentSession: {
    startTime: string;
    durationMinutes: number;
    currentQuarter: number; // 1: Listening, 2: Reading & Understanding, 3: Pronunciation & Speaking, 4: Exercises
    elapsedSeconds: number;
    completedQuarters: number[];
  } | null;
}

const STORAGE_KEY = 'maharah_user_progress_v3';

const DEFAULT_PROGRESS: UserProgress = {
  level: 'beginner',
  selectedDurationMinutes: 20,
  activeTrack: 'hadramout_curriculum',
  completedSentenceIds: [],
  savedSentenceIds: [],
  totalExercisesCompleted: 0,
  correctExercisesCount: 0,
  reviewDeck: [],
  currentSession: null
};

export const loadUserProgress = (): UserProgress => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PROGRESS, ...parsed };
  } catch (e) {
    console.error('Failed to load user progress', e);
    return DEFAULT_PROGRESS;
  }
};

export const saveUserProgress = (progress: UserProgress): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save user progress', e);
  }
};

export const addMistakeToReviewDeck = (
  sentenceId: string,
  english: string,
  arabic: string,
  topicTitleAr: string,
  mistakeReasonAr: string
): void => {
  const current = loadUserProgress();
  const existingIdx = current.reviewDeck.findIndex(item => item.sentenceId === sentenceId);
  if (existingIdx >= 0) {
    current.reviewDeck[existingIdx].reviewCount += 1;
    current.reviewDeck[existingIdx].mastered = false;
    current.reviewDeck[existingIdx].mistakeReasonAr = mistakeReasonAr;
  } else {
    current.reviewDeck.unshift({
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sentenceId,
      english,
      arabic,
      topicTitleAr,
      mistakeReasonAr,
      addedAt: new Date().toISOString(),
      reviewCount: 1,
      mastered: false
    });
  }
  saveUserProgress(current);
};

export const markReviewItemMastered = (reviewId: string): void => {
  const current = loadUserProgress();
  const item = current.reviewDeck.find(r => r.id === reviewId);
  if (item) {
    item.mastered = true;
    saveUserProgress(current);
  }
};

export const toggleSaveSentence = (sentenceId: string): boolean => {
  const current = loadUserProgress();
  const exists = current.savedSentenceIds.includes(sentenceId);
  if (exists) {
    current.savedSentenceIds = current.savedSentenceIds.filter(id => id !== sentenceId);
  } else {
    current.savedSentenceIds.push(sentenceId);
  }
  saveUserProgress(current);
  return !exists;
};
