-- ==============================================================================
-- MAHARAH 4.0 — Supabase PostgreSQL Production Schema & RLS Policies
-- Target Database: PostgreSQL 15+ (Supabase)
-- ==============================================================================

-- 1. Profiles Table (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  governorate TEXT DEFAULT 'Hadramout',
  city TEXT DEFAULT 'Mukalla',
  school_name TEXT,
  level TEXT DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  active_track TEXT DEFAULT 'hadramout_curriculum' CHECK (active_track IN ('hadramout_curriculum', 'everyday_english')),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Student Learning Progress
CREATE TABLE IF NOT EXISTS public.student_progress (
  student_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  completed_sentence_ids TEXT[] DEFAULT '{}',
  completed_lesson_ids TEXT[] DEFAULT '{}',
  saved_sentence_ids TEXT[] DEFAULT '{}',
  total_exercises_completed INTEGER DEFAULT 0,
  correct_exercises_count INTEGER DEFAULT 0,
  current_duration_minutes INTEGER DEFAULT 20,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Exercise Attempts and Results (Every real student attempt)
CREATE TABLE IF NOT EXISTS public.exercise_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  exercise_type TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  student_answer TEXT,
  target_answer TEXT,
  topic_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Speech & Pronunciation Attempts (Real microphone captures & word analysis)
CREATE TABLE IF NOT EXISTS public.speech_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id TEXT,
  expected_sentence TEXT NOT NULL,
  recognized_transcript TEXT NOT NULL,
  recognition_confidence NUMERIC(4,3),
  matched_words INTEGER DEFAULT 0,
  total_expected_words INTEGER DEFAULT 0,
  missing_words TEXT[] DEFAULT '{}',
  incorrect_words TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Saved Sentences (Student bookmarks)
CREATE TABLE IF NOT EXISTS public.saved_sentences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sentence_id TEXT NOT NULL,
  english TEXT NOT NULL,
  arabic TEXT NOT NULL,
  topic_title_ar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, sentence_id)
);

-- 6. AI Conversation History (Real multi-turn dialogues with Gemini Assistant)
CREATE TABLE IF NOT EXISTS public.companion_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  conversation_id TEXT NOT NULL,
  conversation_title TEXT,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  message TEXT NOT NULL,
  grounding_sources JSONB DEFAULT '[]'::jsonb,
  lesson_context JSONB,
  model_used TEXT DEFAULT 'gemini-4-hydrogen',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Learning Sessions Records (Flexible multi-method study sessions)
CREATE TABLE IF NOT EXISTS public.learning_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  lesson_title TEXT,
  duration_minutes INTEGER NOT NULL,
  planned_activities JSONB DEFAULT '[]'::jsonb,
  activities_completed TEXT[] DEFAULT '{}',
  total_seconds_elapsed INTEGER NOT NULL DEFAULT 0,
  track TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- Row-Level Security (RLS) Policies
-- Enforce strict ownership: students can ONLY read and write their own records
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speech_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_sentences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companion_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Progress
CREATE POLICY "Users can view own progress"
  ON public.student_progress FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Users can insert or update own progress"
  ON public.student_progress FOR ALL
  USING (auth.uid() = student_id);

-- Exercise Attempts
CREATE POLICY "Users can view own exercise attempts"
  ON public.exercise_attempts FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Users can insert own exercise attempts"
  ON public.exercise_attempts FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Speech Attempts
CREATE POLICY "Users can view own speech attempts"
  ON public.speech_attempts FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Users can insert own speech attempts"
  ON public.speech_attempts FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Saved Sentences
CREATE POLICY "Users can manage own saved sentences"
  ON public.saved_sentences FOR ALL
  USING (auth.uid() = student_id);

-- Companion Conversations
CREATE POLICY "Users can view own companion conversations"
  ON public.companion_conversations FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Users can insert own companion conversations"
  ON public.companion_conversations FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can delete own companion conversations"
  ON public.companion_conversations FOR DELETE
  USING (auth.uid() = student_id);

-- Learning Sessions
CREATE POLICY "Users can view own learning sessions"
  ON public.learning_sessions FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Users can insert own learning sessions"
  ON public.learning_sessions FOR INSERT
  WITH CHECK (auth.uid() = student_id);
