import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Real Database Service Architecture
// Supports:
// 1. Supabase PostgreSQL (Auth + PostgREST) when SUPABASE_URL & SUPABASE_ANON_KEY are configured
// 2. Local File-Backed Persistent Store (data/maharah.store.json) when cloud database credentials are awaiting setup

export interface StudentProfile {
  id: string;
  email: string;
  fullName: string;
  governorate?: string;
  city?: string;
  schoolName?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  activeTrack: 'hadramout_curriculum' | 'everyday_english';
  onboardingCompleted: boolean;
  createdAt: string;
  accessToken?: string;
}

export interface StudentProgressRecord {
  studentId: string;
  completedSentenceIds: string[];
  completedLessonIds: string[];
  savedSentenceIds: string[];
  totalExercisesCompleted: number;
  correctExercisesCount: number;
  currentDurationMinutes: number;
  lastActiveAt: string;
}

export interface ExerciseAttemptRecord {
  id: string;
  studentId: string;
  exerciseId: string;
  exerciseType: string;
  isCorrect: boolean;
  studentAnswer: string;
  targetAnswer: string;
  topicId: string;
  createdAt: string;
}

export interface SpeechAttemptRecord {
  id: string;
  studentId: string;
  lessonId: string;
  expectedSentence: string;
  recognizedTranscript: string;
  recognitionConfidence: number;
  matchedWords: number;
  totalExpectedWords: number;
  missingWords: string[];
  incorrectWords: string[];
  createdAt: string;
}

export interface LearningSessionRecord {
  id: string;
  studentId: string;
  lessonId: string;
  lessonTitle: string;
  durationMinutes: number;
  plannedActivities: { id: string; titleAr: string; durationSeconds: number }[];
  activitiesCompleted: string[];
  totalSecondsElapsed: number;
  track: string;
  startedAt: string;
  endedAt: string;
}

export interface AssistantMessageRecord {
  id: string;
  studentId: string;
  conversationId: string;
  conversationTitle: string;
  role: 'user' | 'assistant';
  message: string;
  groundingSources?: {
    type: 'pdf_curriculum' | 'gemini_explanation' | 'internet_search';
    title: string;
    pageNumber?: number;
    url?: string;
    snippet?: string;
  }[];
  lessonContext?: {
    lessonTitle?: string;
    english?: string;
    arabic?: string;
  } | null;
  modelUsed?: string;
  createdAt: string;
}

interface StoreShape {
  profiles: Record<string, StudentProfile & { passwordHash: string }>;
  progress: Record<string, StudentProgressRecord>;
  attempts: ExerciseAttemptRecord[];
  speechAttempts: SpeechAttemptRecord[];
  sessions: LearningSessionRecord[];
  conversations: AssistantMessageRecord[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'maharah.store.json');

const loadStore = (): StoreShape => {
  try {
    if (!fs.existsSync(STORE_PATH)) {
      return {
        profiles: {},
        progress: {},
        attempts: [],
        speechAttempts: [],
        sessions: [],
        conversations: []
      };
    }
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      profiles: parsed.profiles || {},
      progress: parsed.progress || {},
      attempts: parsed.attempts || [],
      speechAttempts: parsed.speechAttempts || [],
      sessions: parsed.sessions || [],
      conversations: parsed.conversations || []
    };
  } catch (err) {
    console.error('Failed to read persistent store:', err);
    return {
      profiles: {},
      progress: {},
      attempts: [],
      speechAttempts: [],
      sessions: [],
      conversations: []
    };
  }
};

const saveStore = (store: StoreShape): void => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tmpPath = `${STORE_PATH}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(store, null, 2), 'utf-8');
    fs.renameSync(tmpPath, STORE_PATH);
  } catch (err) {
    console.error('Failed to write persistent store:', err);
  }
};

const hashPassword = (password: string): string => {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
};

const verifyPassword = (password: string, stored: string): boolean => {
  const parts = stored.split(':');
  if (parts.length !== 2) return password === stored;
  const [salt, keyHex] = parts;
  const derived = crypto.scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(keyHex, 'hex');
  if (derived.length !== keyBuf.length) return false;
  return crypto.timingSafeEqual(derived, keyBuf);
};

const getSupabaseConfig = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  const isConfigured = Boolean(
    supabaseUrl &&
    supabaseKey &&
    supabaseUrl !== 'MY_SUPABASE_URL' &&
    supabaseKey !== 'MY_SUPABASE_ANON_KEY'
  );
  return { supabaseUrl: supabaseUrl || '', supabaseKey: supabaseKey || '', isConfigured };
};

export const getDatabaseStatus = () => {
  const { supabaseUrl, isConfigured } = getSupabaseConfig();
  const store = loadStore();

  return {
    provider: isConfigured ? 'Supabase PostgreSQL' : 'Local Persistent Store (Awaiting Supabase Cloud Credentials)',
    isConfigured,
    url: isConfigured ? supabaseUrl : null,
    totalRegisteredStudents: Object.keys(store.profiles).length,
    totalRecordedAttempts: store.attempts.length,
    totalSpeechAttempts: store.speechAttempts.length,
    totalRecordedSessions: store.sessions.length
  };
};

export const registerStudent = async (
  email: string,
  password: string,
  fullName: string,
  level: 'beginner' | 'intermediate' | 'advanced' = 'beginner',
  city: string = 'المكلا',
  onboardingCompleted: boolean = false
): Promise<{ success: boolean; profile?: StudentProfile; error?: string }> => {
  const normalizedEmail = email.toLowerCase().trim();
  const { supabaseUrl, supabaseKey, isConfigured } = getSupabaseConfig();

  if (isConfigured) {
    try {
      const res = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
          data: { full_name: fullName, level, city, onboarding_completed: onboardingCompleted }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error_description || data.msg || 'فشل التسجيل في قاعدة البيانات' };
      }

      const userId = data.user?.id || `user_${Date.now()}`;
      const accessToken = data.access_token || data.session?.access_token;

      if (accessToken && data.user?.id) {
        await fetch(`${supabaseUrl}/rest/v1/profiles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${accessToken}`,
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            id: userId,
            email: normalizedEmail,
            full_name: fullName,
            city,
            level,
            onboarding_completed: onboardingCompleted
          })
        });
      }

      const profile: StudentProfile = {
        id: userId,
        email: normalizedEmail,
        fullName,
        city,
        level,
        activeTrack: 'hadramout_curriculum',
        onboardingCompleted,
        createdAt: new Date().toISOString(),
        accessToken
      };

      return { success: true, profile };
    } catch (err: any) {
      return { success: false, error: `خطأ في الاتصال بقاعدة بيانات Supabase: ${err.message}` };
    }
  }

  // Local persistent disk-backed store
  const store = loadStore();
  if (store.profiles[normalizedEmail]) {
    return { success: false, error: 'هذا البريد الإلكتروني مسجل بالفعل' };
  }

  const id = `student_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const profile: StudentProfile = {
    id,
    email: normalizedEmail,
    fullName,
    city,
    level,
    activeTrack: 'hadramout_curriculum',
    onboardingCompleted,
    createdAt: new Date().toISOString()
  };

  store.profiles[normalizedEmail] = { ...profile, passwordHash: hashPassword(password) };
  store.progress[id] = {
    studentId: id,
    completedSentenceIds: [],
    completedLessonIds: [],
    savedSentenceIds: [],
    totalExercisesCompleted: 0,
    correctExercisesCount: 0,
    currentDurationMinutes: 20,
    lastActiveAt: new Date().toISOString()
  };
  saveStore(store);

  return { success: true, profile };
};

export const loginStudent = async (
  email: string,
  password: string
): Promise<{ success: boolean; profile?: StudentProfile; progress?: StudentProgressRecord; error?: string }> => {
  const normalizedEmail = email.toLowerCase().trim();
  const { supabaseUrl, supabaseKey, isConfigured } = getSupabaseConfig();

  if (isConfigured) {
    try {
      const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey
        },
        body: JSON.stringify({ email: normalizedEmail, password })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error_description || 'بيانات الدخول غير صحيحة' };
      }

      const accessToken = data.access_token;
      const userId = data.user?.id;
      let dbProfile: any = null;
      if (accessToken && userId) {
        const pRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=*`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${accessToken}`
          }
        });
        if (pRes.ok) {
          const rows = await pRes.json();
          dbProfile = rows?.[0] || null;
        }
      }

      const profile: StudentProfile = {
        id: userId,
        email: normalizedEmail,
        fullName: dbProfile?.full_name || data.user?.user_metadata?.full_name || 'طالب مهارة',
        city: dbProfile?.city || data.user?.user_metadata?.city || 'المكلا',
        level: dbProfile?.level || data.user?.user_metadata?.level || 'beginner',
        activeTrack: dbProfile?.active_track || 'hadramout_curriculum',
        onboardingCompleted: Boolean(dbProfile?.onboarding_completed ?? data.user?.user_metadata?.onboarding_completed ?? true),
        createdAt: data.user?.created_at || new Date().toISOString(),
        accessToken
      };

      return { success: true, profile };
    } catch (err: any) {
      return { success: false, error: `تعذر الاتصال بـ Supabase: ${err.message}` };
    }
  }

  const store = loadStore();
  const found = store.profiles[normalizedEmail];
  if (!found || !verifyPassword(password, found.passwordHash)) {
    return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
  }

  const { passwordHash: _, ...profile } = found;
  const progress = store.progress[profile.id];
  return { success: true, profile, progress };
};

export const setOnboardingCompleted = async (
  studentId: string,
  completed: boolean,
  accessToken?: string
): Promise<boolean> => {
  const { supabaseUrl, supabaseKey, isConfigured } = getSupabaseConfig();
  if (isConfigured && accessToken) {
    try {
      await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${studentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ onboarding_completed: completed, updated_at: new Date().toISOString() })
      });
      return true;
    } catch {
      return false;
    }
  }

  const store = loadStore();
  for (const key of Object.keys(store.profiles)) {
    if (store.profiles[key].id === studentId) {
      store.profiles[key].onboardingCompleted = completed;
      saveStore(store);
      return true;
    }
  }
  return false;
};

export const recordExerciseAttempt = async (
  attempt: Omit<ExerciseAttemptRecord, 'id' | 'createdAt'>,
  accessToken?: string
): Promise<ExerciseAttemptRecord> => {
  const record: ExerciseAttemptRecord = {
    ...attempt,
    id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString()
  };

  const { supabaseUrl, supabaseKey, isConfigured } = getSupabaseConfig();
  if (isConfigured && accessToken) {
    try {
      await fetch(`${supabaseUrl}/rest/v1/exercise_attempts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          student_id: record.studentId,
          exercise_id: record.exerciseId,
          exercise_type: record.exerciseType,
          is_correct: record.isCorrect,
          student_answer: record.studentAnswer,
          target_answer: record.targetAnswer,
          topic_id: record.topicId
        })
      });
      return record;
    } catch (err) {
      console.error('Supabase attempt insert failed:', err);
    }
  }

  const store = loadStore();
  store.attempts.unshift(record);
  if (store.attempts.length > 2000) store.attempts.length = 2000;

  if (!store.progress[attempt.studentId]) {
    store.progress[attempt.studentId] = {
      studentId: attempt.studentId,
      completedSentenceIds: [],
      completedLessonIds: [],
      savedSentenceIds: [],
      totalExercisesCompleted: 0,
      correctExercisesCount: 0,
      currentDurationMinutes: 20,
      lastActiveAt: new Date().toISOString()
    };
  }

  const prog = store.progress[attempt.studentId];
  prog.totalExercisesCompleted += 1;
  if (attempt.isCorrect) prog.correctExercisesCount += 1;
  prog.lastActiveAt = new Date().toISOString();
  saveStore(store);

  return record;
};

export const recordSpeechAttempt = async (
  attempt: Omit<SpeechAttemptRecord, 'id' | 'createdAt'>,
  accessToken?: string
): Promise<SpeechAttemptRecord> => {
  const record: SpeechAttemptRecord = {
    ...attempt,
    id: `spk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString()
  };

  const { supabaseUrl, supabaseKey, isConfigured } = getSupabaseConfig();
  if (isConfigured && accessToken) {
    try {
      await fetch(`${supabaseUrl}/rest/v1/speech_attempts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          student_id: record.studentId,
          lesson_id: record.lessonId,
          expected_sentence: record.expectedSentence,
          recognized_transcript: record.recognizedTranscript,
          recognition_confidence: record.recognitionConfidence,
          matched_words: record.matchedWords,
          total_expected_words: record.totalExpectedWords,
          missing_words: record.missingWords,
          incorrect_words: record.incorrectWords
        })
      });
      return record;
    } catch (err) {
      console.error('Supabase speech attempt insert failed:', err);
    }
  }

  const store = loadStore();
  store.speechAttempts.unshift(record);
  if (store.speechAttempts.length > 1000) store.speechAttempts.length = 1000;
  saveStore(store);

  return record;
};

export const recordLearningSession = async (
  session: Omit<LearningSessionRecord, 'id'>,
  accessToken?: string
): Promise<LearningSessionRecord> => {
  const record: LearningSessionRecord = {
    ...session,
    id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
  };

  const { supabaseUrl, supabaseKey, isConfigured } = getSupabaseConfig();
  if (isConfigured && accessToken) {
    try {
      await fetch(`${supabaseUrl}/rest/v1/learning_sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          student_id: record.studentId,
          lesson_id: record.lessonId,
          lesson_title: record.lessonTitle,
          duration_minutes: record.durationMinutes,
          planned_activities: record.plannedActivities,
          activities_completed: record.activitiesCompleted,
          total_seconds_elapsed: record.totalSecondsElapsed,
          track: record.track,
          started_at: record.startedAt,
          ended_at: record.endedAt
        })
      });
      return record;
    } catch (err) {
      console.error('Supabase session insert failed:', err);
    }
  }

  const store = loadStore();
  store.sessions.unshift(record);
  if (store.sessions.length > 500) store.sessions.length = 500;

  if (store.progress[record.studentId] && record.lessonId && !store.progress[record.studentId].completedLessonIds.includes(record.lessonId)) {
    if (record.activitiesCompleted.length > 0) {
      store.progress[record.studentId].completedLessonIds.push(record.lessonId);
    }
  }
  saveStore(store);

  return record;
};

export const saveConversationMessage = async (
  msg: Omit<AssistantMessageRecord, 'id' | 'createdAt'>,
  accessToken?: string
): Promise<AssistantMessageRecord> => {
  const record: AssistantMessageRecord = {
    ...msg,
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString()
  };

  const { supabaseUrl, supabaseKey, isConfigured } = getSupabaseConfig();
  if (isConfigured && accessToken) {
    try {
      await fetch(`${supabaseUrl}/rest/v1/companion_conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          student_id: record.studentId,
          conversation_id: record.conversationId,
          conversation_title: record.conversationTitle,
          role: record.role,
          message: record.message,
          grounding_sources: record.groundingSources || [],
          lesson_context: record.lessonContext || null,
          model_used: record.modelUsed || 'gemini-4-hydrogen'
        })
      });
      return record;
    } catch (err) {
      console.error('Supabase message insert failed:', err);
    }
  }

  const store = loadStore();
  store.conversations.push(record);
  if (store.conversations.length > 2500) {
    store.conversations = store.conversations.slice(-2500);
  }
  saveStore(store);

  return record;
};

export const getConversationsForStudent = async (
  studentId: string,
  accessToken?: string
): Promise<AssistantMessageRecord[]> => {
  const { supabaseUrl, supabaseKey, isConfigured } = getSupabaseConfig();
  if (isConfigured && accessToken) {
    try {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/companion_conversations?student_id=eq.${studentId}&order=created_at.asc`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      if (res.ok) {
        const rows = await res.json();
        return rows.map((r: any) => ({
          id: r.id,
          studentId: r.student_id,
          conversationId: r.conversation_id,
          conversationTitle: r.conversation_title || 'محادثة',
          role: r.role,
          message: r.message,
          groundingSources: r.grounding_sources,
          lessonContext: r.lesson_context,
          modelUsed: r.model_used,
          createdAt: r.created_at
        }));
      }
    } catch (err) {
      console.error('Supabase conversation fetch failed:', err);
    }
  }

  const store = loadStore();
  return store.conversations.filter(c => c.studentId === studentId);
};

export const getStudentData = async (studentId: string) => {
  const store = loadStore();
  return {
    progress: store.progress[studentId] || null,
    attempts: store.attempts.filter(a => a.studentId === studentId).slice(0, 50),
    speechAttempts: store.speechAttempts.filter(s => s.studentId === studentId).slice(0, 50),
    sessions: store.sessions.filter(s => s.studentId === studentId).slice(0, 30)
  };
};
