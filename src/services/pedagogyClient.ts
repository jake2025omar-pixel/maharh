import type {
  CEFRLevel,
  DeepExplanationResult,
  DynamicExampleItem,
  DeepVocabularyProfile,
  WritingEvaluationResult,
  AdaptiveGeneratedExercise,
  MistakeDiagnosisResult,
  ConversationTurnResult
} from '../server/pedagogyService.ts';

export type {
  CEFRLevel,
  DeepExplanationResult,
  DynamicExampleItem,
  DeepVocabularyProfile,
  WritingEvaluationResult,
  AdaptiveGeneratedExercise,
  MistakeDiagnosisResult,
  ConversationTurnResult
};

async function postJson<T>(url: string, body: Record<string, any>): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || `تعذر إتمام الطلب (${res.status})`);
  }
  return data as T;
}

export const fetchDeepTopicExplanation = (params: {
  topicTitleAr: string;
  topicTitleEn: string;
  cefrLevel: CEFRLevel;
  focusQuestion?: string;
}): Promise<DeepExplanationResult> => {
  return postJson<DeepExplanationResult>('/api/pedagogy/explain-deep', params);
};

export const fetchUnlimitedExamples = (params: {
  topicTitleAr: string;
  topicTitleEn: string;
  cefrLevel: CEFRLevel;
  contextDomain?: string;
  count?: number;
  excludeSentences?: string[];
}): Promise<{ examples: DynamicExampleItem[] }> => {
  return postJson<{ examples: DynamicExampleItem[] }>('/api/pedagogy/examples', params);
};

export const fetchDeepVocabularyProfile = (params: {
  word: string;
  sentenceContext?: string;
  cefrLevel: CEFRLevel;
}): Promise<DeepVocabularyProfile> => {
  return postJson<DeepVocabularyProfile>('/api/pedagogy/vocabulary-deep', params);
};

export const evaluateStudentWritingRequest = (params: {
  studentText: string;
  taskPromptAr?: string;
  targetGrammarRule?: string;
  cefrLevel: CEFRLevel;
  writingMode?: 'sentence' | 'paragraph' | 'email' | 'essay' | 'report';
}): Promise<WritingEvaluationResult> => {
  return postJson<WritingEvaluationResult>('/api/pedagogy/evaluate-writing', params);
};

export const fetchAdaptiveExercise = (params: {
  topicId: string;
  topicTitleAr: string;
  topicTitleEn: string;
  cefrLevel: CEFRLevel;
  weakCategories?: string[];
  previousPrompts?: string[];
}): Promise<AdaptiveGeneratedExercise> => {
  return postJson<AdaptiveGeneratedExercise>('/api/pedagogy/adaptive-exercise', params);
};

export const fetchMistakeDiagnosis = (params: {
  expectedEnglish: string;
  studentAnswer: string;
  arabicTranslation: string;
  topicTitleAr: string;
  cefrLevel: CEFRLevel;
  mistakeCount?: number;
}): Promise<MistakeDiagnosisResult> => {
  return postJson<MistakeDiagnosisResult>('/api/pedagogy/diagnose-mistake', params);
};

export const sendDynamicConversationTurn = (params: {
  scenarioTitleAr: string;
  scenarioTitleEn: string;
  cefrLevel: CEFRLevel;
  studentMessageEn: string;
  history?: { role: 'student' | 'partner'; text: string }[];
}): Promise<ConversationTurnResult> => {
  return postJson<ConversationTurnResult>('/api/pedagogy/conversation-turn', params);
};
