import express, { type Request, type Response, type NextFunction } from 'express';
import crypto from 'crypto';
import {
  handleCompanionQuery,
  transcribeSpeechAudio,
  hasConfiguredGeminiKey,
  getConfiguredGeminiModel,
  geminiMetrics
} from './geminiService.ts';
import { searchCurriculumKnowledge, OFFICIAL_GRADE_11_HADRAMOUT_PDF } from './curriculumIndex.ts';
import {
  getDatabaseStatus,
  registerStudent,
  loginStudent,
  setOnboardingCompleted,
  recordExerciseAttempt,
  recordSpeechAttempt,
  recordLearningSession,
  saveConversationMessage,
  getConversationsForStudent,
  getStudentData
} from './dbService.ts';
import {
  generateDeepTopicExplanation,
  generateUnlimitedExamples,
  generateDeepVocabularyProfile,
  evaluateStudentWriting,
  generateAdaptiveExercise,
  diagnoseStudentMistake,
  runDynamicConversationTurn,
  type CEFRLevel
} from './pedagogyService.ts';

export const apiRouter = express.Router();

apiRouter.use(express.json({ limit: '10mb' }));

// Simple sliding-window rate limiter & duplicate request guard for AI endpoints
const ipWindowMap = new Map<string, number[]>();
const recentRequestHashes = new Map<string, number>();

const aiRateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequestsPerMin = 20;

  const timestamps = (ipWindowMap.get(clientIp) || []).filter(ts => now - ts < windowMs);
  if (timestamps.length >= maxRequestsPerMin) {
    res.status(429).json({
      error: 'تم تجاوز الحد المسموح للطلبات في الدقيقة. يرجى الانتظار لحظات قبل المحاولة مجدداً.'
    });
    return;
  }
  timestamps.push(now);
  ipWindowMap.set(clientIp, timestamps);

  // Duplicate submission prevention within 2.5 seconds
  const bodyHash = crypto
    .createHash('sha256')
    .update(`${clientIp}:${JSON.stringify(req.body || {})}`)
    .digest('hex');

  const lastSeen = recentRequestHashes.get(bodyHash);
  if (lastSeen && now - lastSeen < 2500) {
    res.status(429).json({
      error: 'تم إرسال نفس الطلب قبل لحظات. يرجى انتظار اكتمال المعالجة.'
    });
    return;
  }
  recentRequestHashes.set(bodyHash, now);

  // Periodic cleanup
  if (recentRequestHashes.size > 500) {
    for (const [k, ts] of recentRequestHashes.entries()) {
      if (now - ts > 10000) recentRequestHashes.delete(k);
    }
  }

  next();
};

apiRouter.get('/system/status', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'MAHARAH 4.0',
    hasApiKey: hasConfiguredGeminiKey(),
    model: getConfiguredGeminiModel(),
    curriculumUnitsCount: OFFICIAL_GRADE_11_HADRAMOUT_PDF.length,
    metrics: geminiMetrics
  });
});

apiRouter.get('/curriculum/search', (req: Request, res: Response) => {
  const q = (req.query.q as string) || '';
  const results = searchCurriculumKnowledge(q);
  res.json({ results });
});

apiRouter.get('/database/status', (_req: Request, res: Response) => {
  res.json(getDatabaseStatus());
});

apiRouter.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, level, city, onboardingCompleted } = req.body;
    if (!email || !password || !fullName) {
      res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور والاسم الكامل حقول مطلوبة' });
      return;
    }
    if (String(password).length < 6) {
      res.status(400).json({ error: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل' });
      return;
    }
    const result = await registerStudent(email, password, fullName, level, city, Boolean(onboardingCompleted));
    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'البريد وكلمة المرور مطلوبان' });
      return;
    }
    const result = await loginStudent(email, password);
    if (!result.success) {
      res.status(401).json({ error: result.error });
      return;
    }
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

apiRouter.post('/auth/onboarding', async (req: Request, res: Response) => {
  try {
    const { studentId, completed } = req.body;
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    if (!studentId) {
      res.status(400).json({ error: 'studentId is required' });
      return;
    }
    const updated = await setOnboardingCompleted(studentId, Boolean(completed), accessToken);
    res.json({ success: updated });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

apiRouter.get('/student/:id/data', async (req: Request, res: Response) => {
  try {
    const studentId = req.params.id;
    const data = await getStudentData(studentId);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

apiRouter.post('/exercises/attempt', async (req: Request, res: Response) => {
  try {
    const { studentId, exerciseId, exerciseType, isCorrect, studentAnswer, targetAnswer, topicId } = req.body;
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    if (!studentId || !exerciseId) {
      res.status(400).json({ error: 'studentId and exerciseId required' });
      return;
    }
    const record = await recordExerciseAttempt(
      {
        studentId,
        exerciseId,
        exerciseType: exerciseType || 'unknown',
        isCorrect: Boolean(isCorrect),
        studentAnswer: studentAnswer || '',
        targetAnswer: targetAnswer || '',
        topicId: topicId || ''
      },
      accessToken
    );
    res.json({ success: true, record });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

apiRouter.post('/speech/attempt', async (req: Request, res: Response) => {
  try {
    const {
      studentId,
      lessonId,
      expectedSentence,
      recognizedTranscript,
      recognitionConfidence,
      matchedWords,
      totalExpectedWords,
      missingWords,
      incorrectWords
    } = req.body;
    const accessToken = req.headers.authorization?.replace('Bearer ', '');

    if (!studentId || !expectedSentence) {
      res.status(400).json({ error: 'studentId and expectedSentence required' });
      return;
    }

    const record = await recordSpeechAttempt(
      {
        studentId,
        lessonId: lessonId || 'practice',
        expectedSentence,
        recognizedTranscript: recognizedTranscript || '',
        recognitionConfidence: Number(recognitionConfidence || 0),
        matchedWords: Number(matchedWords || 0),
        totalExpectedWords: Number(totalExpectedWords || 0),
        missingWords: Array.isArray(missingWords) ? missingWords : [],
        incorrectWords: Array.isArray(incorrectWords) ? incorrectWords : []
      },
      accessToken
    );
    res.json({ success: true, record });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

apiRouter.post('/speech/transcribe', aiRateLimitMiddleware, async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType, expectedSentence } = req.body;
    if (!audioBase64 || typeof audioBase64 !== 'string') {
      res.status(400).json({ error: 'بيانات الصوت مطلوبة للتحويل النصي' });
      return;
    }
    if (!hasConfiguredGeminiKey()) {
      res.status(503).json({
        error: 'خدمة التفريغ الصوتي عبر الخادم بانتظار تهيئة GEMINI_API_KEY.'
      });
      return;
    }
    const result = await transcribeSpeechAudio(audioBase64, mimeType, expectedSentence);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: `فشل تحليل الصوت: ${e.message}` });
  }
});

apiRouter.post('/sessions/record', async (req: Request, res: Response) => {
  try {
    const {
      studentId,
      lessonId,
      lessonTitle,
      durationMinutes,
      plannedActivities,
      activitiesCompleted,
      totalSecondsElapsed,
      track,
      startedAt,
      endedAt
    } = req.body;
    const accessToken = req.headers.authorization?.replace('Bearer ', '');

    if (!studentId || !lessonId) {
      res.status(400).json({ error: 'studentId and lessonId required' });
      return;
    }

    const record = await recordLearningSession(
      {
        studentId,
        lessonId,
        lessonTitle: lessonTitle || lessonId,
        durationMinutes: Number(durationMinutes || 15),
        plannedActivities: Array.isArray(plannedActivities) ? plannedActivities : [],
        activitiesCompleted: Array.isArray(activitiesCompleted) ? activitiesCompleted : [],
        totalSecondsElapsed: Number(totalSecondsElapsed || 0),
        track: track || 'hadramout_curriculum',
        startedAt: startedAt || new Date().toISOString(),
        endedAt: endedAt || new Date().toISOString()
      },
      accessToken
    );
    res.json({ success: true, record });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

apiRouter.get('/assistant/conversations', async (req: Request, res: Response) => {
  try {
    const studentId = req.query.studentId as string;
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    if (!studentId) {
      res.json({ messages: [] });
      return;
    }
    const messages = await getConversationsForStudent(studentId, accessToken);
    res.json({ messages });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

apiRouter.post('/assistant/message', aiRateLimitMiddleware, async (req: Request, res: Response) => {
  try {
    const {
      studentId,
      conversationId,
      conversationTitle,
      message,
      level,
      activeTrack,
      lessonContext,
      chatHistory,
      enableInternetSearch
    } = req.body;
    const accessToken = req.headers.authorization?.replace('Bearer ', '');

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ error: 'الرسالة مطلوبة ولا يمكن أن تكون فارغة' });
      return;
    }

    if (message.length > 4000) {
      res.status(400).json({ error: 'الرسالة طويلة جداً (الحد الأقصى 4000 حرف)' });
      return;
    }

    const result = await handleCompanionQuery({
      message: message.trim(),
      level,
      activeTrack,
      lessonContext,
      chatHistory,
      enableInternetSearch: Boolean(enableInternetSearch)
    });

    if (studentId && conversationId) {
      await saveConversationMessage(
        {
          studentId,
          conversationId,
          conversationTitle: conversationTitle || message.trim().slice(0, 40),
          role: 'user',
          message: message.trim(),
          lessonContext: lessonContext
            ? {
                lessonTitle: lessonContext.lessonTitleAr,
                english: lessonContext.english,
                arabic: lessonContext.arabic
              }
            : null
        },
        accessToken
      );

      if (result.hasApiKey) {
        await saveConversationMessage(
          {
            studentId,
            conversationId,
            conversationTitle: conversationTitle || message.trim().slice(0, 40),
            role: 'assistant',
            message: result.reply,
            groundingSources: result.groundingSources,
            modelUsed: result.modelUsed
          },
          accessToken
        );
      }
    }

    res.json(result);
  } catch (err: any) {
    console.error('API /assistant/message error:', err);
    res.status(502).json({
      error: err.message || 'حدث خطأ أثناء معالجة طلب الذكاء الاصطناعي'
    });
  }
});

// Keep backwards-compatible alias for /api/gemini/companion
apiRouter.post('/gemini/companion', aiRateLimitMiddleware, async (req: Request, res: Response) => {
  try {
    const { message, level, activeTrack, currentSentence, chatHistory, enableInternetSearch } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const result = await handleCompanionQuery({
      message,
      level,
      activeTrack,
      lessonContext: currentSentence
        ? {
            english: currentSentence.english,
            arabic: currentSentence.arabic,
            topicTitleAr: currentSentence.topicTitleAr,
            grammarPoint: currentSentence.grammarPoint,
            vocabulary: currentSentence.vocabulary
          }
        : null,
      chatHistory,
      enableInternetSearch: Boolean(enableInternetSearch)
    });

    res.json(result);
  } catch (err: any) {
    res.status(502).json({
      error: err.message || 'Internal server error while processing AI request'
    });
  }
});

// ==============================================================================
// Advanced Professor-Level Pedagogy & Dynamic Content Generation Endpoints
// ==============================================================================

apiRouter.post('/pedagogy/explain-deep', aiRateLimitMiddleware, async (req: Request, res: Response) => {
  try {
    const { topicTitleAr, topicTitleEn, cefrLevel, focusQuestion } = req.body;
    if (!topicTitleAr || !topicTitleEn) {
      res.status(400).json({ error: 'بيانات الموضوع مطلوبة للشرح العميق' });
      return;
    }
    const result = await generateDeepTopicExplanation({
      topicTitleAr,
      topicTitleEn,
      cefrLevel: (cefrLevel || 'B1') as CEFRLevel,
      focusQuestion
    });
    res.json(result);
  } catch (err: any) {
    res.status(502).json({ error: err.message || 'تعذر توليد الشرح العميق حالياً' });
  }
});

apiRouter.post('/pedagogy/examples', aiRateLimitMiddleware, async (req: Request, res: Response) => {
  try {
    const { topicTitleAr, topicTitleEn, cefrLevel, contextDomain, count, excludeSentences } = req.body;
    if (!topicTitleEn) {
      res.status(400).json({ error: 'عنوان الموضوع مطلوب لتوليد الأمثلة' });
      return;
    }
    const result = await generateUnlimitedExamples({
      topicTitleAr: topicTitleAr || topicTitleEn,
      topicTitleEn,
      cefrLevel: (cefrLevel || 'B1') as CEFRLevel,
      contextDomain,
      count,
      excludeSentences: Array.isArray(excludeSentences) ? excludeSentences : []
    });
    res.json(result);
  } catch (err: any) {
    res.status(502).json({ error: err.message || 'تعذر توليد أمثلة إضافية حالياً' });
  }
});

apiRouter.post('/pedagogy/vocabulary-deep', aiRateLimitMiddleware, async (req: Request, res: Response) => {
  try {
    const { word, sentenceContext, cefrLevel } = req.body;
    if (!word || typeof word !== 'string') {
      res.status(400).json({ error: 'الكلمة الإنجليزية مطلوبة للتحليل المعجمي' });
      return;
    }
    const result = await generateDeepVocabularyProfile({
      word: word.trim(),
      sentenceContext,
      cefrLevel: (cefrLevel || 'B1') as CEFRLevel
    });
    res.json(result);
  } catch (err: any) {
    res.status(502).json({ error: err.message || 'تعذر تحليل المفردة حالياً' });
  }
});

apiRouter.post('/pedagogy/evaluate-writing', aiRateLimitMiddleware, async (req: Request, res: Response) => {
  try {
    const { studentText, taskPromptAr, targetGrammarRule, cefrLevel, writingMode } = req.body;
    if (!studentText || typeof studentText !== 'string' || !studentText.trim()) {
      res.status(400).json({ error: 'يرجى كتابة نص إنجليزي لتقييمه وتصحيحه' });
      return;
    }
    const result = await evaluateStudentWriting({
      studentText: studentText.trim(),
      taskPromptAr,
      targetGrammarRule,
      cefrLevel: (cefrLevel || 'B1') as CEFRLevel,
      writingMode
    });
    res.json(result);
  } catch (err: any) {
    res.status(502).json({ error: err.message || 'تعذر تقييم الكتابة حالياً' });
  }
});

apiRouter.post('/pedagogy/adaptive-exercise', aiRateLimitMiddleware, async (req: Request, res: Response) => {
  try {
    const { topicId, topicTitleAr, topicTitleEn, cefrLevel, weakCategories, previousPrompts } = req.body;
    const result = await generateAdaptiveExercise({
      topicId: topicId || 'general_grammar',
      topicTitleAr: topicTitleAr || 'تطبيق لغوي شامل',
      topicTitleEn: topicTitleEn || 'Comprehensive English Grammar & Usage',
      cefrLevel: (cefrLevel || 'B1') as CEFRLevel,
      weakCategories: Array.isArray(weakCategories) ? weakCategories : [],
      previousPrompts: Array.isArray(previousPrompts) ? previousPrompts : []
    });
    res.json(result);
  } catch (err: any) {
    res.status(502).json({ error: err.message || 'تعذر توليد تمرين تكيّفي حالياً' });
  }
});

apiRouter.post('/pedagogy/diagnose-mistake', aiRateLimitMiddleware, async (req: Request, res: Response) => {
  try {
    const { expectedEnglish, studentAnswer, arabicTranslation, topicTitleAr, cefrLevel, mistakeCount } = req.body;
    if (!expectedEnglish) {
      res.status(400).json({ error: 'النص المطلوب مفقود لتشخيص الخطأ' });
      return;
    }
    const result = await diagnoseStudentMistake({
      expectedEnglish,
      studentAnswer: studentAnswer || 'لم يكتب إجابة مطابقة',
      arabicTranslation: arabicTranslation || '',
      topicTitleAr: topicTitleAr || 'الدرس الحالي',
      cefrLevel: (cefrLevel || 'B1') as CEFRLevel,
      mistakeCount: Number(mistakeCount || 1)
    });
    res.json(result);
  } catch (err: any) {
    res.status(502).json({ error: err.message || 'تعذر تشخيص الخطأ حالياً' });
  }
});

apiRouter.post('/pedagogy/conversation-turn', aiRateLimitMiddleware, async (req: Request, res: Response) => {
  try {
    const { scenarioTitleAr, scenarioTitleEn, cefrLevel, studentMessageEn, history } = req.body;
    if (!studentMessageEn || typeof studentMessageEn !== 'string' || !studentMessageEn.trim()) {
      res.status(400).json({ error: 'اكتب ردك بالإنجليزية للمتابعة في الحوار' });
      return;
    }
    const result = await runDynamicConversationTurn({
      scenarioTitleAr: scenarioTitleAr || 'محادثة طبيعية',
      scenarioTitleEn: scenarioTitleEn || 'Natural English Conversation',
      cefrLevel: (cefrLevel || 'B1') as CEFRLevel,
      studentMessageEn: studentMessageEn.trim(),
      history: Array.isArray(history) ? history : []
    });
    res.json(result);
  } catch (err: any) {
    res.status(502).json({ error: err.message || 'تعذر متابعة الحوار التفاعلي حالياً' });
  }
});

export const apiApp = express();
apiApp.use(express.json({ limit: '10mb' }));
apiApp.use('/api', apiRouter);
