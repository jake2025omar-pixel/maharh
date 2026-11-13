export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type SkillDomain =
  | 'grammar'
  | 'vocabulary'
  | 'pronunciation'
  | 'listening'
  | 'reading'
  | 'writing'
  | 'speaking';

export interface SkillMasteryStats {
  attempts: number;
  correct: number;
  masteryPercent: number;
}

export interface ErrorPatternRecord {
  category: string;
  categoryAr: string;
  count: number;
  lastSeenAt: string;
  recentExamples: string[];
}

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
  nextReviewAt?: string;
  intervalDays?: number;
  repetitionStage?: number;
  errorCategory?: string;
}

export interface UserProgress {
  level: 'beginner' | 'intermediate' | 'advanced';
  cefrLevel: CEFRLevel;
  selectedDurationMinutes: number;
  activeTrack: 'hadramout_curriculum' | 'everyday_english';
  onboardingCompleted: boolean;
  completedLessonIds: string[];
  completedSentenceIds: string[];
  savedSentenceIds: string[];
  masteredGrammarIds: string[];
  totalExercisesCompleted: number;
  correctExercisesCount: number;
  reviewDeck: ReviewItem[];
  skillMastery: Record<SkillDomain, SkillMasteryStats>;
  errorPatterns: Record<string, ErrorPatternRecord>;
}

const STORAGE_KEY = 'maharah_user_progress_v4';
const ONBOARDING_KEY = 'maharah_onboarding_completed_v4';

export const SKILL_DOMAIN_LABELS_AR: Record<SkillDomain, string> = {
  grammar: 'القواعد وبنية الجملة',
  vocabulary: 'المفردات والسياق',
  pronunciation: 'النطق والصوتيات (IPA)',
  listening: 'الاستماع والاستيعاب',
  reading: 'القراءة والتحليل',
  writing: 'الكتابة وبناء الجمل',
  speaking: 'التحدث والتعبير الشفهي'
};

export const ERROR_CATEGORY_LABELS_AR: Record<string, string> = {
  tense_agreement: 'تطابق الزمن وتصريف الأفعال',
  subject_verb_agreement: 'توافق الفاعل مع الفعل',
  articles: 'أدوات التعريف والتنكير (a/an/the)',
  prepositions: 'حروف الجر والسياق',
  word_order: 'ترتيب عناصر الجملة',
  spelling: 'الإملاء والتهجئة',
  vocabulary_choice: 'دقة اختيار المفردة',
  passive_voice: 'صياغة المبني للمجهول',
  conditionals: 'الجمل الشرطية',
  punctuation: 'علامات الترقيم والكتابة',
  pronunciation: 'مخارج الأصوات والنطق',
  other: 'أخطاء نحوية وأسلوبية عامة'
};

export const createEmptySkillMastery = (): Record<SkillDomain, SkillMasteryStats> => ({
  grammar: { attempts: 0, correct: 0, masteryPercent: 0 },
  vocabulary: { attempts: 0, correct: 0, masteryPercent: 0 },
  pronunciation: { attempts: 0, correct: 0, masteryPercent: 0 },
  listening: { attempts: 0, correct: 0, masteryPercent: 0 },
  reading: { attempts: 0, correct: 0, masteryPercent: 0 },
  writing: { attempts: 0, correct: 0, masteryPercent: 0 },
  speaking: { attempts: 0, correct: 0, masteryPercent: 0 }
});

export const cefrToTrackLevel = (cefr: CEFRLevel): 'beginner' | 'intermediate' | 'advanced' => {
  if (cefr === 'A1' || cefr === 'A2') return 'beginner';
  if (cefr === 'B1' || cefr === 'B2') return 'intermediate';
  return 'advanced';
};

export const trackLevelToCefr = (lvl: 'beginner' | 'intermediate' | 'advanced'): CEFRLevel => {
  if (lvl === 'beginner') return 'A2';
  if (lvl === 'intermediate') return 'B1';
  return 'C1';
};

export const DEFAULT_PROGRESS: UserProgress = {
  level: 'beginner',
  cefrLevel: 'A2',
  selectedDurationMinutes: 15,
  activeTrack: 'hadramout_curriculum',
  onboardingCompleted: false,
  completedLessonIds: [],
  completedSentenceIds: [],
  savedSentenceIds: [],
  masteredGrammarIds: [],
  totalExercisesCompleted: 0,
  correctExercisesCount: 0,
  reviewDeck: [],
  skillMastery: createEmptySkillMastery(),
  errorPatterns: {}
};

export const loadOnboardingState = (): boolean => {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
  } catch {
    return false;
  }
};

export const saveOnboardingState = (completed: boolean): void => {
  try {
    if (completed) {
      localStorage.setItem(ONBOARDING_KEY, 'true');
    } else {
      localStorage.removeItem(ONBOARDING_KEY);
    }
  } catch (e) {
    console.error('Failed to save onboarding state', e);
  }
};

export const loadUserProgress = (): UserProgress => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const onboardingFlag = loadOnboardingState();
    if (!raw) return { ...DEFAULT_PROGRESS, onboardingCompleted: onboardingFlag };
    const parsed = JSON.parse(raw);
    const baseSkills = createEmptySkillMastery();
    const mergedSkills: Record<SkillDomain, SkillMasteryStats> = { ...baseSkills };
    if (parsed.skillMastery && typeof parsed.skillMastery === 'object') {
      (Object.keys(baseSkills) as SkillDomain[]).forEach(k => {
        if (parsed.skillMastery[k]) {
          mergedSkills[k] = {
            attempts: Number(parsed.skillMastery[k].attempts) || 0,
            correct: Number(parsed.skillMastery[k].correct) || 0,
            masteryPercent: Number(parsed.skillMastery[k].masteryPercent) || 0
          };
        }
      });
    }
    const level: UserProgress['level'] = parsed.level || 'beginner';
    const cefrLevel: CEFRLevel = parsed.cefrLevel || trackLevelToCefr(level);

    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      level,
      cefrLevel,
      masteredGrammarIds: Array.isArray(parsed.masteredGrammarIds) ? parsed.masteredGrammarIds : [],
      skillMastery: mergedSkills,
      errorPatterns: parsed.errorPatterns && typeof parsed.errorPatterns === 'object' ? parsed.errorPatterns : {},
      onboardingCompleted: Boolean(parsed.onboardingCompleted || onboardingFlag)
    };
  } catch (e) {
    console.error('Failed to load user progress', e);
    return DEFAULT_PROGRESS;
  }
};

export const saveUserProgress = (progress: UserProgress): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    if (progress.onboardingCompleted) {
      saveOnboardingState(true);
    }
  } catch (e) {
    console.error('Failed to save user progress', e);
  }
};

export const addDaysIso = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

export const isReviewItemDue = (item: ReviewItem): boolean => {
  if (item.mastered) return false;
  if (!item.nextReviewAt) return true;
  return new Date(item.nextReviewAt).getTime() <= Date.now();
};

export const addMistakeToReviewDeck = (
  sentenceId: string,
  english: string,
  arabic: string,
  topicTitleAr: string,
  mistakeReasonAr: string,
  errorCategory?: string
): UserProgress => {
  const current = loadUserProgress();
  const existingIdx = current.reviewDeck.findIndex(item => item.sentenceId === sentenceId);
  if (existingIdx >= 0) {
    current.reviewDeck[existingIdx].reviewCount += 1;
    current.reviewDeck[existingIdx].mastered = false;
    current.reviewDeck[existingIdx].mistakeReasonAr = mistakeReasonAr;
    current.reviewDeck[existingIdx].repetitionStage = 0;
    current.reviewDeck[existingIdx].intervalDays = 1;
    current.reviewDeck[existingIdx].nextReviewAt = new Date().toISOString();
    if (errorCategory) {
      current.reviewDeck[existingIdx].errorCategory = errorCategory;
    }
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
      mastered: false,
      repetitionStage: 0,
      intervalDays: 1,
      nextReviewAt: new Date().toISOString(),
      errorCategory
    });
  }
  saveUserProgress(current);
  return current;
};

export const applySkillAssessmentToProgress = (
  current: UserProgress,
  domain: SkillDomain,
  isCorrect: boolean,
  errorCategory?: string,
  errorCategoryAr?: string,
  exampleSnippet?: string
): UserProgress => {
  const prevSkill = current.skillMastery[domain] || { attempts: 0, correct: 0, masteryPercent: 0 };
  const attempts = prevSkill.attempts + 1;
  const correct = isCorrect ? prevSkill.correct + 1 : prevSkill.correct;
  const masteryPercent = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;

  const updatedPatterns = { ...current.errorPatterns };
  if (!isCorrect && errorCategory) {
    const key = errorCategory.trim().toLowerCase().replace(/\s+/g, '_');
    const existing = updatedPatterns[key];
    const labelAr =
      errorCategoryAr || ERROR_CATEGORY_LABELS_AR[key] || errorCategory;
    const snippets = existing ? [...existing.recentExamples] : [];
    if (exampleSnippet && !snippets.includes(exampleSnippet)) {
      snippets.unshift(exampleSnippet);
    }
    updatedPatterns[key] = {
      category: key,
      categoryAr: labelAr,
      count: (existing?.count || 0) + 1,
      lastSeenAt: new Date().toISOString(),
      recentExamples: snippets.slice(0, 4)
    };
  }

  return {
    ...current,
    skillMastery: {
      ...current.skillMastery,
      [domain]: { attempts, correct, masteryPercent }
    },
    errorPatterns: updatedPatterns
  };
};

export const markReviewItemMastered = (reviewId: string): UserProgress => {
  const current = loadUserProgress();
  const item = current.reviewDeck.find(r => r.id === reviewId);
  if (item) {
    const prevStage = item.repetitionStage || 0;
    const intervals = [1, 3, 7, 14, 30];
    const nextStage = Math.min(prevStage + 1, intervals.length - 1);
    const nextInterval = intervals[nextStage];
    item.mastered = true;
    item.repetitionStage = nextStage;
    item.intervalDays = nextInterval;
    item.nextReviewAt = addDaysIso(nextInterval);
    saveUserProgress(current);
  }
  return current;
};

export const scheduleSpacedReview = (reviewId: string, passedCheck: boolean): UserProgress => {
  const current = loadUserProgress();
  const item = current.reviewDeck.find(r => r.id === reviewId);
  if (item) {
    const intervals = [1, 3, 7, 14, 30];
    if (passedCheck) {
      const nextStage = Math.min((item.repetitionStage || 0) + 1, intervals.length - 1);
      const nextDays = intervals[nextStage];
      item.repetitionStage = nextStage;
      item.intervalDays = nextDays;
      item.nextReviewAt = addDaysIso(nextDays);
      item.mastered = true;
    } else {
      item.repetitionStage = 0;
      item.intervalDays = 1;
      item.nextReviewAt = new Date().toISOString();
      item.reviewCount += 1;
      item.mastered = false;
    }
    saveUserProgress(current);
  }
  return current;
};

export const toggleSaveSentence = (sentenceId: string): { saved: boolean; progress: UserProgress } => {
  const current = loadUserProgress();
  const exists = current.savedSentenceIds.includes(sentenceId);
  if (exists) {
    current.savedSentenceIds = current.savedSentenceIds.filter(id => id !== sentenceId);
  } else {
    current.savedSentenceIds.push(sentenceId);
  }
  saveUserProgress(current);
  return { saved: !exists, progress: current };
};

