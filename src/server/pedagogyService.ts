import { GoogleGenAI, Type } from '@google/genai';
import {
  getConfiguredGeminiModel,
  hasConfiguredGeminiKey,
  geminiMetrics
} from './geminiService.ts';
import { searchCurriculumKnowledge } from './curriculumIndex.ts';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

const getAiClient = (): GoogleGenAI | null => {
  if (!hasConfiguredGeminiKey()) return null;
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const PROFESSOR_CORE_DIRECTIVE = `
You are an elite University Professor of Applied Linguistics, Second Language Acquisition (SLA), English Grammar, Phonetics & Phonology, Lexicology, Academic Writing, and Educational Psychology teaching on the MAHARAH (مهارة) institution platform.
Your students are Arabic-speaking learners (including Grade 11 Hadramout Yemeni curriculum students and general CEFR A1-C2 learners).

Mandatory Academic & Pedagogical Standards:
1. Never give shallow, surface-level, or 2-line explanations when true mastery is needed.
2. Always organize complex linguistic concepts clearly:
   - What it is & why it exists (communicative purpose)
   - Exact grammatical formula / structural mechanics
   - Affirmative, Negative, Questions, Short Answers
   - Morphology / spelling / third-person singular rules / register shifts
   - Exceptions, contrasts with confusing structures, and common Arabic-speaker interference mistakes (L1 negative transfer).
3. Every English sentence MUST be paired with an accurate, natural Arabic translation.
4. Keep English sentences 100% authentic, idiomatic, grammatically accurate, and calibrated to the requested CEFR level (A1, A2, B1, B2, C1, or C2).
5. Always investigate *why* a student error happens, not merely what the answer is.
6. Return valid, strictly matching JSON according to the responseSchema.
`.trim();

function parseSafeJson<T>(raw: string | undefined, fallbackMsg: string): T {
  if (!raw || !raw.trim()) {
    throw new Error(fallbackMsg);
  }
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  return JSON.parse(cleaned) as T;
}

function handleGeminiCallError(err: any): never {
  geminiMetrics.failedRequests += 1;
  const rawMsg = String(err?.message || '');
  const isQuota =
    rawMsg.includes('429') ||
    rawMsg.includes('RESOURCE_EXHAUSTED') ||
    rawMsg.toLowerCase().includes('quota');
  if (isQuota) {
    throw new Error('تم استهلاك الحد المسموح لطلبات Gemini حالياً (429). يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.');
  }
  throw new Error('تعذر توليد المحتوى التعليمي من نموذج Gemini حالياً. يرجى المحاولة بعد قليل.');
}

async function runStructuredGemini<T>(prompt: string, responseSchema: any): Promise<T> {
  const ai = getAiClient();
  if (!ai) {
    throw new Error('ميزة التوليد التعليمي عبر Gemini بانتظار تهيئة مفتاح GEMINI_API_KEY على الخادم.');
  }

  const model = getConfiguredGeminiModel();
  geminiMetrics.totalRequests += 1;
  geminiMetrics.lastCallAt = new Date().toISOString();

  try {
    const generatePromise = ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: PROFESSOR_CORE_DIRECTIVE,
        responseMimeType: 'application/json',
        responseSchema,
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('انتهت مهلة الاتصال بنموذج Gemini')), 55000);
    });

    const response = await Promise.race([generatePromise, timeoutPromise]);
    const parsed = parseSafeJson<T>(response.text, 'لم يُرجع النموذج بيانات JSON صالحة.');
    geminiMetrics.successfulRequests += 1;
    return parsed;
  } catch (err: any) {
    handleGeminiCallError(err);
  }
}

// 1. Deep Professor-Level Topic Explanation (Organized in clear progressive stages)
export interface DeepExplanationResult {
  topicTitleAr: string;
  topicTitleEn: string;
  cefrRange: string;
  coreConceptAr: string;
  linguisticPurposeAr: string;
  structureFormulaEn: string;
  stages: {
    stageTitleAr: string;
    explanationAr: string;
    formulaEn?: string;
    examples: { english: string; arabic: string; analysisAr: string }[];
  }[];
  exceptionsAndMistakes: {
    misconceptionAr: string;
    wrongExampleEn: string;
    correctExampleEn: string;
    whyAr: string;
  }[];
  comparisonNoteAr: string;
  comprehensionCheckQuestion: {
    questionAr: string;
    promptEn: string;
    options: string[];
    correctAnswer: string;
    explanationAr: string;
  };
}

export async function generateDeepTopicExplanation(params: {
  topicTitleAr: string;
  topicTitleEn: string;
  cefrLevel: CEFRLevel;
  focusQuestion?: string;
}): Promise<DeepExplanationResult> {
  const curriculumMatches = searchCurriculumKnowledge(`${params.topicTitleEn} ${params.topicTitleAr}`).slice(0, 2);
  const curriculumContext = curriculumMatches.length
    ? `Official Hadramout Grade 11 Curriculum Reference:\n${curriculumMatches
        .map(m => `Section ${m.sectionNumber} (Page ${m.pageNumber}): ${m.officialContent}`)
        .join('\n')}`
    : '';

  const prompt = `
Teach the topic "${params.topicTitleEn}" (${params.topicTitleAr}) at CEFR level ${params.cefrLevel} like a university linguistics professor.
${curriculumContext}
${params.focusQuestion ? `Student specific confusion/focus: ${params.focusQuestion}` : ''}

Include structured progressive stages covering:
1. Core concept & why this structure exists in English
2. Complete structural mechanics (affirmative, negative, questions, short answers, spelling/morphology rules if applicable)
3. Formal vs informal & written vs spoken usage
4. Deep contrast with confusing structures (e.g. Arabic L1 transfer mistakes or tense confusion)
5. At least 3 common mistakes with exact explanation of WHY learners make them
6. One targeted comprehension check question to verify real understanding.
`.trim();

  const schema = {
    type: Type.OBJECT,
    properties: {
      topicTitleAr: { type: Type.STRING },
      topicTitleEn: { type: Type.STRING },
      cefrRange: { type: Type.STRING },
      coreConceptAr: { type: Type.STRING },
      linguisticPurposeAr: { type: Type.STRING },
      structureFormulaEn: { type: Type.STRING },
      stages: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            stageTitleAr: { type: Type.STRING },
            explanationAr: { type: Type.STRING },
            formulaEn: { type: Type.STRING },
            examples: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  english: { type: Type.STRING },
                  arabic: { type: Type.STRING },
                  analysisAr: { type: Type.STRING },
                },
                required: ['english', 'arabic', 'analysisAr'],
              },
            },
          },
          required: ['stageTitleAr', 'explanationAr', 'examples'],
        },
      },
      exceptionsAndMistakes: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            misconceptionAr: { type: Type.STRING },
            wrongExampleEn: { type: Type.STRING },
            correctExampleEn: { type: Type.STRING },
            whyAr: { type: Type.STRING },
          },
          required: ['misconceptionAr', 'wrongExampleEn', 'correctExampleEn', 'whyAr'],
        },
      },
      comparisonNoteAr: { type: Type.STRING },
      comprehensionCheckQuestion: {
        type: Type.OBJECT,
        properties: {
          questionAr: { type: Type.STRING },
          promptEn: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswer: { type: Type.STRING },
          explanationAr: { type: Type.STRING },
        },
        required: ['questionAr', 'promptEn', 'options', 'correctAnswer', 'explanationAr'],
      },
    },
    required: [
      'topicTitleAr',
      'topicTitleEn',
      'cefrRange',
      'coreConceptAr',
      'linguisticPurposeAr',
      'structureFormulaEn',
      'stages',
      'exceptionsAndMistakes',
      'comparisonNoteAr',
      'comprehensionCheckQuestion',
    ],
  };

  return runStructuredGemini<DeepExplanationResult>(prompt, schema);
}

// 2. Unlimited Dynamic Examples Generator (Never repeats previously seen sentences)
export interface DynamicExampleItem {
  english: string;
  arabic: string;
  contextAr: string;
  register: string;
  grammarBreakdownAr: string;
  keyVocabulary: { word: string; ipa: string; meaningAr: string }[];
}

export async function generateUnlimitedExamples(params: {
  topicTitleAr: string;
  topicTitleEn: string;
  cefrLevel: CEFRLevel;
  contextDomain?: string;
  count?: number;
  excludeSentences?: string[];
}): Promise<{ examples: DynamicExampleItem[] }> {
  const requestedCount = Math.min(Math.max(params.count || 6, 3), 10);
  const excludeBlock =
    params.excludeSentences && params.excludeSentences.length > 0
      ? `Do NOT repeat or closely paraphrase any of these already-seen sentences:\n${params.excludeSentences
          .slice(-25)
          .map(s => `- ${s}`)
          .join('\n')}`
      : '';

  const prompt = `
Generate ${requestedCount} completely fresh, authentic, pedagogically rich English example sentences teaching:
Topic: "${params.topicTitleEn}" (${params.topicTitleAr})
Target CEFR Level: ${params.cefrLevel}
Context Domain: ${params.contextDomain || 'Varied real-life, academic, everyday, and formal contexts'}

Requirements:
- Cover diverse sentence structures (affirmative, negative, questions, formal, conversational, complex clauses suitable for ${params.cefrLevel}).
- Provide natural Arabic translation, Arabic situational context, register label (e.g., "محادثة يومية" or "أكاديمي / رسمي"), step-by-step grammatical breakdown in Arabic, and 2-3 key vocabulary items with accurate IPA transcription.
${excludeBlock}
`.trim();

  const schema = {
    type: Type.OBJECT,
    properties: {
      examples: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            english: { type: Type.STRING },
            arabic: { type: Type.STRING },
            contextAr: { type: Type.STRING },
            register: { type: Type.STRING },
            grammarBreakdownAr: { type: Type.STRING },
            keyVocabulary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  ipa: { type: Type.STRING },
                  meaningAr: { type: Type.STRING },
                },
                required: ['word', 'ipa', 'meaningAr'],
              },
            },
          },
          required: ['english', 'arabic', 'contextAr', 'register', 'grammarBreakdownAr', 'keyVocabulary'],
        },
      },
    },
    required: ['examples'],
  };

  return runStructuredGemini<{ examples: DynamicExampleItem[] }>(prompt, schema);
}

// 3. Deep Lexicology / Vocabulary Explorer (IPA, definitions, collocations, derivatives, mistakes)
export interface DeepVocabularyProfile {
  word: string;
  ipaUK: string;
  ipaUS: string;
  partOfSpeech: string;
  cefrLevel: string;
  arabicMeanings: string[];
  englishDefinition: string;
  synonyms: string[];
  antonyms: string[];
  collocations: { phraseEn: string; meaningAr: string }[];
  wordFamily: { form: string; partOfSpeech: string; meaningAr: string }[];
  registerNoteAr: string;
  commonMistakeAr: string;
  examples: { english: string; arabic: string; contextAr: string }[];
}

export async function generateDeepVocabularyProfile(params: {
  word: string;
  sentenceContext?: string;
  cefrLevel: CEFRLevel;
}): Promise<DeepVocabularyProfile> {
  const prompt = `
Provide a complete applied-linguistics vocabulary profile for the English word/expression: "${params.word}"
${params.sentenceContext ? `Context sentence: "${params.sentenceContext}"` : ''}
Student CEFR Level: ${params.cefrLevel}

Include:
- Accurate UK and US IPA transcriptions (e.g., /.../)
- Part of speech & CEFR level
- Multiple Arabic meanings in context + clear English learner definition
- Synonyms, antonyms, natural collocations with Arabic meanings
- Complete word family / morphological derivatives (noun, verb, adjective, adverb forms)
- Register note (formal/informal) in Arabic
- Common Arabic-learner mistake with this word
- 4 varied natural example sentences with Arabic translations.
`.trim();

  const schema = {
    type: Type.OBJECT,
    properties: {
      word: { type: Type.STRING },
      ipaUK: { type: Type.STRING },
      ipaUS: { type: Type.STRING },
      partOfSpeech: { type: Type.STRING },
      cefrLevel: { type: Type.STRING },
      arabicMeanings: { type: Type.ARRAY, items: { type: Type.STRING } },
      englishDefinition: { type: Type.STRING },
      synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
      antonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
      collocations: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            phraseEn: { type: Type.STRING },
            meaningAr: { type: Type.STRING },
          },
          required: ['phraseEn', 'meaningAr'],
        },
      },
      wordFamily: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            form: { type: Type.STRING },
            partOfSpeech: { type: Type.STRING },
            meaningAr: { type: Type.STRING },
          },
          required: ['form', 'partOfSpeech', 'meaningAr'],
        },
      },
      registerNoteAr: { type: Type.STRING },
      commonMistakeAr: { type: Type.STRING },
      examples: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            english: { type: Type.STRING },
            arabic: { type: Type.STRING },
            contextAr: { type: Type.STRING },
          },
          required: ['english', 'arabic', 'contextAr'],
        },
      },
    },
    required: [
      'word',
      'ipaUK',
      'ipaUS',
      'partOfSpeech',
      'cefrLevel',
      'arabicMeanings',
      'englishDefinition',
      'synonyms',
      'antonyms',
      'collocations',
      'wordFamily',
      'registerNoteAr',
      'commonMistakeAr',
      'examples',
    ],
  };

  return runStructuredGemini<DeepVocabularyProfile>(prompt, schema);
}

// 4. Student Sentence & Writing Evaluation + Root-Cause Error Diagnosis
export interface WritingEvaluationResult {
  isAcceptable: boolean;
  estimatedCEFR: CEFRLevel;
  correctedVersionEn: string;
  naturalUpgradeEn: string;
  naturalUpgradeAr: string;
  overallFeedbackAr: string;
  detectedErrorCategories: string[];
  detailedCorrections: {
    originalSegment: string;
    correctedSegment: string;
    errorTypeAr: string;
    whyWrongAr: string;
    ruleTipAr: string;
  }[];
  strengthsAr: string[];
  nextStepPracticeEn: string;
  nextStepPracticeAr: string;
}

export async function evaluateStudentWriting(params: {
  studentText: string;
  taskPromptAr?: string;
  targetGrammarRule?: string;
  cefrLevel: CEFRLevel;
  writingMode?: 'sentence' | 'paragraph' | 'email' | 'essay' | 'report';
}): Promise<WritingEvaluationResult> {
  const prompt = `
Evaluate the following original English writing submitted by an Arabic-speaking student (target CEFR: ${params.cefrLevel}):
Writing Mode: ${params.writingMode || 'sentence'}
${params.taskPromptAr ? `Task Prompt: ${params.taskPromptAr}` : ''}
${params.targetGrammarRule ? `Target Linguistic Focus: ${params.targetGrammarRule}` : ''}

Student's English Text:
"""
${params.studentText}
"""

Provide an honest, encouraging, professor-grade linguistic diagnosis:
1. Classify whether it fulfills the task accurately and estimate its true CEFR quality.
2. Provide an error-free corrected version + a natural, idiomatic native/academic upgrade with Arabic translation.
3. For EVERY grammatical, lexical, spelling, punctuation, or cohesion error, explain WHY it happened (e.g., Arabic L1 literal translation, missing auxiliary, subject-verb agreement, wrong preposition) and teach the underlying rule.
4. Return normalized error category keys in detectedErrorCategories from:
   ["tense_agreement", "word_order", "articles", "prepositions", "spelling_morphology", "passive_voice", "conditionals", "vocabulary_collocation", "punctuation_cohesion"]
5. Give a personalized follow-up writing challenge prompt.
`.trim();

  const schema = {
    type: Type.OBJECT,
    properties: {
      isAcceptable: { type: Type.BOOLEAN },
      estimatedCEFR: { type: Type.STRING },
      correctedVersionEn: { type: Type.STRING },
      naturalUpgradeEn: { type: Type.STRING },
      naturalUpgradeAr: { type: Type.STRING },
      overallFeedbackAr: { type: Type.STRING },
      detectedErrorCategories: { type: Type.ARRAY, items: { type: Type.STRING } },
      detailedCorrections: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            originalSegment: { type: Type.STRING },
            correctedSegment: { type: Type.STRING },
            errorTypeAr: { type: Type.STRING },
            whyWrongAr: { type: Type.STRING },
            ruleTipAr: { type: Type.STRING },
          },
          required: ['originalSegment', 'correctedSegment', 'errorTypeAr', 'whyWrongAr', 'ruleTipAr'],
        },
      },
      strengthsAr: { type: Type.ARRAY, items: { type: Type.STRING } },
      nextStepPracticeEn: { type: Type.STRING },
      nextStepPracticeAr: { type: Type.STRING },
    },
    required: [
      'isAcceptable',
      'estimatedCEFR',
      'correctedVersionEn',
      'naturalUpgradeEn',
      'naturalUpgradeAr',
      'overallFeedbackAr',
      'detectedErrorCategories',
      'detailedCorrections',
      'strengthsAr',
      'nextStepPracticeEn',
      'nextStepPracticeAr',
    ],
  };

  return runStructuredGemini<WritingEvaluationResult>(prompt, schema);
}

// 5. Adaptive Dynamic Exercise Generator (Calibrated to CEFR + Student Weaknesses)
export interface AdaptiveGeneratedExercise {
  id: string;
  topicId: string;
  topicTitleAr: string;
  cefrLevel: CEFRLevel;
  skillFocus: 'grammar' | 'vocabulary' | 'reading' | 'sentence_construction';
  instructionAr: string;
  contextPassageEn?: string;
  contextPassageAr?: string;
  questionAr: string;
  promptEn: string;
  options: { id: string; text: string; distractorReasonAr?: string }[];
  correctOptionId: string;
  englishSentence: string;
  arabicTranslation: string;
  deepExplanationAr: string;
  errorCategory: string;
}

export async function generateAdaptiveExercise(params: {
  topicId: string;
  topicTitleAr: string;
  topicTitleEn: string;
  cefrLevel: CEFRLevel;
  weakCategories?: string[];
  previousPrompts?: string[];
}): Promise<AdaptiveGeneratedExercise> {
  const prompt = `
Create 1 original, challenging, non-repetitive assessment exercise for:
Topic: "${params.topicTitleEn}" (${params.topicTitleAr})
CEFR Level: ${params.cefrLevel}
Student Recurring Weak Areas: ${(params.weakCategories || []).join(', ') || 'General consolidation'}
${
  params.previousPrompts && params.previousPrompts.length > 0
    ? `Avoid repeating these prompts: ${params.previousPrompts.slice(-10).join(' | ')}`
    : ''
}

Design high-diagnostic multiple choice (4 options: opt_a, opt_b, opt_c, opt_d) where distractors reflect authentic learner misconceptions, and provide distractorReasonAr explaining why wrong options fail, plus deepExplanationAr teaching the full rule.
`.trim();

  const schema = {
    type: Type.OBJECT,
    properties: {
      topicTitleAr: { type: Type.STRING },
      cefrLevel: { type: Type.STRING },
      skillFocus: { type: Type.STRING },
      instructionAr: { type: Type.STRING },
      contextPassageEn: { type: Type.STRING },
      contextPassageAr: { type: Type.STRING },
      questionAr: { type: Type.STRING },
      promptEn: { type: Type.STRING },
      options: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            text: { type: Type.STRING },
            distractorReasonAr: { type: Type.STRING },
          },
          required: ['id', 'text'],
        },
      },
      correctOptionId: { type: Type.STRING },
      englishSentence: { type: Type.STRING },
      arabicTranslation: { type: Type.STRING },
      deepExplanationAr: { type: Type.STRING },
      errorCategory: { type: Type.STRING },
    },
    required: [
      'topicTitleAr',
      'cefrLevel',
      'skillFocus',
      'instructionAr',
      'questionAr',
      'promptEn',
      'options',
      'correctOptionId',
      'englishSentence',
      'arabicTranslation',
      'deepExplanationAr',
      'errorCategory',
    ],
  };

  const generated = await runStructuredGemini<Omit<AdaptiveGeneratedExercise, 'id' | 'topicId'>>(prompt, schema);
  return {
    ...generated,
    id: `dyn_ex_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    topicId: params.topicId,
  };
}

// 6. Deep Root-Cause Mistake Investigation + Verification Check
export interface MistakeDiagnosisResult {
  underlyingMisconceptionAr: string;
  contrastRuleAr: string;
  contrastExamples: { wrongEn: string; rightEn: string; arabic: string; reasonAr: string }[];
  verificationQuestion: {
    questionAr: string;
    promptEn: string;
    options: string[];
    correctAnswer: string;
    explanationAr: string;
  };
}

export async function diagnoseStudentMistake(params: {
  expectedEnglish: string;
  studentAnswer: string;
  arabicTranslation: string;
  topicTitleAr: string;
  cefrLevel: CEFRLevel;
  mistakeCount?: number;
}): Promise<MistakeDiagnosisResult> {
  const prompt = `
A student at CEFR ${params.cefrLevel} made ${params.mistakeCount && params.mistakeCount > 1 ? `a REPEATED mistake (${params.mistakeCount} times)` : 'a mistake'} on:
Topic: ${params.topicTitleAr}
Expected English: "${params.expectedEnglish}"
Arabic Meaning: "${params.arabicTranslation}"
Student's Attempt / Confusion: "${params.studentAnswer}"

Investigate WHY the student likely made this mistake (cognitive / L1 Arabic transfer / structural confusion), explain the contrast clearly, give 2 contrasting pairs, and generate 1 fresh verification question (3-4 choices) to test whether they truly grasp the rule now.
`.trim();

  const schema = {
    type: Type.OBJECT,
    properties: {
      underlyingMisconceptionAr: { type: Type.STRING },
      contrastRuleAr: { type: Type.STRING },
      contrastExamples: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            wrongEn: { type: Type.STRING },
            rightEn: { type: Type.STRING },
            arabic: { type: Type.STRING },
            reasonAr: { type: Type.STRING },
          },
          required: ['wrongEn', 'rightEn', 'arabic', 'reasonAr'],
        },
      },
      verificationQuestion: {
        type: Type.OBJECT,
        properties: {
          questionAr: { type: Type.STRING },
          promptEn: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswer: { type: Type.STRING },
          explanationAr: { type: Type.STRING },
        },
        required: ['questionAr', 'promptEn', 'options', 'correctAnswer', 'explanationAr'],
      },
    },
    required: ['underlyingMisconceptionAr', 'contrastRuleAr', 'contrastExamples', 'verificationQuestion'],
  };

  return runStructuredGemini<MistakeDiagnosisResult>(prompt, schema);
}

// 7. Interactive Dynamic Conversation Turn (Natural SLA Roleplay + Coaching)
export interface ConversationTurnResult {
  replyEn: string;
  replyAr: string;
  coachingFeedbackAr: string;
  correctedStudentSentenceEn?: string;
  suggestedFollowUpIdeasAr: string[];
}

export async function runDynamicConversationTurn(params: {
  scenarioTitleAr: string;
  scenarioTitleEn: string;
  cefrLevel: CEFRLevel;
  studentMessageEn: string;
  history?: { role: 'student' | 'partner'; text: string }[];
}): Promise<ConversationTurnResult> {
  const historyStr = (params.history || [])
    .slice(-8)
    .map(h => `${h.role === 'student' ? 'Student' : 'Partner'}: ${h.text}`)
    .join('\n');

  const prompt = `
Conduct a realistic, adaptive communicative English conversation practice turn.
Scenario: ${params.scenarioTitleEn} (${params.scenarioTitleAr})
Student CEFR Level: ${params.cefrLevel}
${historyStr ? `Conversation so far:\n${historyStr}\n` : ''}
Student's latest original utterance: "${params.studentMessageEn}"

Respond naturally in English as the conversation partner (at ${params.cefrLevel} level), translate your response into Arabic, provide constructive professor feedback in Arabic evaluating the student's grammar/vocabulary/register, gently offer a corrected or more natural phrasing if helpful, and suggest 2 communicative ideas for how the student can keep the conversation going.
`.trim();

  const schema = {
    type: Type.OBJECT,
    properties: {
      replyEn: { type: Type.STRING },
      replyAr: { type: Type.STRING },
      coachingFeedbackAr: { type: Type.STRING },
      correctedStudentSentenceEn: { type: Type.STRING },
      suggestedFollowUpIdeasAr: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ['replyEn', 'replyAr', 'coachingFeedbackAr', 'suggestedFollowUpIdeasAr'],
  };

  return runStructuredGemini<ConversationTurnResult>(prompt, schema);
}
