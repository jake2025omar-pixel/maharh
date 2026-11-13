import { GoogleGenAI } from '@google/genai';
import { searchCurriculumKnowledge, type PDFCurriculumSection } from './curriculumIndex.ts';

export interface CompanionRequest {
  message: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  activeTrack?: 'hadramout_curriculum' | 'everyday_english';
  lessonContext?: {
    lessonId?: string;
    lessonTitleAr?: string;
    lessonTitleEn?: string;
    english?: string;
    arabic?: string;
    topicTitleAr?: string;
    grammarPoint?: string;
    exercisePrompt?: string;
    vocabulary?: { word: string; meaningAr: string }[];
  } | null;
  chatHistory?: { role: 'user' | 'model'; text: string }[];
  enableInternetSearch?: boolean;
}

export interface GroundingSource {
  type: 'pdf_curriculum' | 'gemini_explanation' | 'internet_search';
  title: string;
  pageNumber?: number;
  url?: string;
  snippet?: string;
}

export interface CompanionResponse {
  reply: string;
  groundingSources: GroundingSource[];
  modelUsed: string;
  hasApiKey: boolean;
  searchUnavailableReason?: string;
}

// Configurable supported Gemini model (defaults to gemini-4-hydrogen for generateContent)
export const getConfiguredGeminiModel = (): string => {
  const envModel = process.env.GEMINI_MODEL?.trim();
  if (!envModel || envModel.includes('live') || envModel === 'gemini-3.8-live') {
    return 'gemini-4-hydrogen';
  }
  return envModel;
};

export const hasConfiguredGeminiKey = (): boolean => {
  const apiKey = process.env.GEMINI_API_KEY;
  return Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim() !== '');
};

// Server-side API usage metrics (exposed cleanly without revealing secrets)
export const geminiMetrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  searchGroundingCalls: 0,
  transcribeCalls: 0,
  lastCallAt: null as string | null
};

const getGeminiClient = (): GoogleGenAI | null => {
  if (!hasConfiguredGeminiKey()) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Avoid hammering web search grounding when the API key quota is temporarily exhausted
let searchGroundingCooldownUntil = 0;

export const handleCompanionQuery = async (req: CompanionRequest): Promise<CompanionResponse> => {
  const {
    message,
    level = 'beginner',
    activeTrack = 'hadramout_curriculum',
    lessonContext = null,
    chatHistory = [],
    enableInternetSearch = false
  } = req;

  const modelName = getConfiguredGeminiModel();
  const ai = getGeminiClient();

  // Check if Gemini API key is missing: never simulate a successful Gemini connection!
  if (!ai) {
    return {
      reply:
        'ميزة المساعد الذكي (Gemini) بانتظار تهيئة مفتاح GEMINI_API_KEY في إعدادات الخادم السرية. ' +
        'بمجرد إضافة المفتاح على الخادم، سيصبح المساعد قادراً على إجراء محادثات طبيعية شاملة في جميع المجالات مع البحث المباشر.',
      groundingSources: [],
      modelUsed: 'unconfigured',
      hasApiKey: false
    };
  }

  geminiMetrics.totalRequests += 1;
  geminiMetrics.lastCallAt = new Date().toISOString();

  // 1. Retrieve matching chunks from the actual Grade 11 Hadramout PDF index
  const searchSeed = `${message} ${lessonContext?.english || ''} ${lessonContext?.topicTitleAr || ''} ${lessonContext?.lessonTitleAr || ''}`;
  const matchedChunks: PDFCurriculumSection[] = searchCurriculumKnowledge(searchSeed);

  const groundingSources: GroundingSource[] = [];
  let pdfContextSection = '';

  if (matchedChunks.length > 0) {
    pdfContextSection = matchedChunks
      .slice(0, 3)
      .map(chunk => {
        groundingSources.push({
          type: 'pdf_curriculum',
          title: `مقرر الصف الحادي عشر (حضرموت) — ${chunk.titleAr}`,
          pageNumber: chunk.pageNumber,
          snippet: chunk.grammarRulesAr.join(' · ')
        });
        return `---
Topic: ${chunk.titleEn} (${chunk.titleAr}) — Section ${chunk.sectionNumber}, Page ${chunk.pageNumber}
Official Text: ${chunk.officialContent}
Grammar Rules: ${chunk.grammarRulesAr.join('; ')}
Exam Notes: ${chunk.examNotesAr}
Examples:
${chunk.notebookExamples.map(e => `• ${e.en} -> ${e.ar}`).join('\n')}
---`;
      })
      .join('\n\n');
  }

  const systemInstruction = `
أنت أستاذ دكتور متخصص في تعليم اللغة الإنجليزية واللغويات التطبيقية واكتساب اللغة الثانية (Applied Linguistics & SLA) في منصة "مهارة" (MAHARAH).
تتحدث بأسلوب علمي واضح، محايد، منظم، ومباشر، باللغة العربية أو الإنجليزية حسب لغة سؤال المستخدم.

مبادئ أساسية:
1. مساعد معرفي شامل عند الحاجة:
   - إذا سأل الطالب سؤالاً عاماً خارج الإنجليزية (علوم، رياضيات، برمجة، تقنية، تاريخ، أو شؤون عامة)، أجب عنه مباشرة بدقة واحترام دون إجبار المحادثة على العودة لدرس الإنجليزية.
2. معايير الأستاذ الجامعي عند تعليم اللغة الإنجليزية أو المنهج:
   - لا تقدّم شروحاً سطحية أو إجابات مختصرة مخلة إذا كان الموضوع يحتاج تأسيساً عميقاً. اتبع المنهجية: المفهوم والهدف التواصلي ← التركيب والقواعد (الإثبات، النفي، الاستفهام، التهجئة أو الصرف) ← الاستثناءات والفروق الدقيقة ← تحليل الأخطاء الشائعة لدى المتعلم العربي.
   - في المفردات: قدّم النطق الصوتي الدقيق (IPA)، المعنى، المتلازمات اللفظية (Collocations)، العائلة الاشتقاقية، والسياق الرسمي مقابل اليومي.
   - في الصوتيات: اشرح مخارج الأصوات عملياً (وضع اللسان، الشفتين، الأسنان، الفك، وتدفق الهواء) وقارن بالأزواج الصغرى (Minimal Pairs).
   - في تصحيح الجمل والكتابة: شخّص السبب الجذري للخطأ (لماذا وقع الخطأ، وليس مجرد عرض الصواب) وقدّم صياغة طبيعية محسّنة.
   - التزم بقاعدة التعلم القائم على الجمل الكاملة: أرفق ترجمة عربية دقيقة مع كل جملة إنجليزية تعليمية، ووازن الأمثلة المتنوعة.
   - عند الاستناد إلى مقرر الصف الحادي عشر (حضرموت) المرفق (PDF)، اذكر رقم الصفحة واسم القسم بدقة وميّز بين نص المقرر والشرح الإضافي.
3. الصدق العلمي: إذا لم تتوفر معلومة مؤكدة أو كان البحث الخارجي غير متاح، صرّح بذلك بأمانة.
4. التكيف التدريجي: راعِ أن مستوى الطالب المسجل حالياً هو (${level}) واجعل الشرح منطقياً ومتدرجاً دون إغراق عشوائي.
`.trim();

  const contextLines: string[] = [];
  if (lessonContext) {
    contextLines.push(`سياق الدرس المفتوح حالياً (للاستعانة به فقط إذا سأل الطالب عن الدرس):`);
    contextLines.push(`- المسار: ${activeTrack === 'hadramout_curriculum' ? 'مقرر الصف 11 (حضرموت)' : 'الإنجليزية اليومية'}`);
    if (lessonContext.lessonTitleAr) contextLines.push(`- الدرس: ${lessonContext.lessonTitleAr} (${lessonContext.lessonTitleEn || ''})`);
    if (lessonContext.english) contextLines.push(`- الجملة النشطة: "${lessonContext.english}" — الترجمة: "${lessonContext.arabic || ''}"`);
    if (lessonContext.grammarPoint) contextLines.push(`- القاعدة: ${lessonContext.grammarPoint}`);
    if (lessonContext.exercisePrompt) contextLines.push(`- التمرين الحالي: ${lessonContext.exercisePrompt}`);
  } else {
    contextLines.push(`محادثة مستقلة مفتوحة (لا يوجد درس محدد مرتبط بهذه الرسالة).`);
  }

  if (pdfContextSection) {
    contextLines.push(`\nالمقاطع المسترجعة من ملف المنهج الرسمي (content/official-curriculum/grade-11-hadramout.pdf):\n${pdfContextSection}`);
  }

  const contents = [
    ...chatHistory.slice(-10).map(turn => ({
      role: turn.role,
      parts: [{ text: turn.text }]
    })),
    {
      role: 'user' as const,
      parts: [
        {
          text: `${contextLines.join('\n')}\n\nسؤال المستخدم:\n${message}`
        }
      ]
    }
  ];

  let searchUnavailableReason: string | undefined;

  const invokeGemini = async (withSearch: boolean) => {
    const config: any = { systemInstruction };
    if (withSearch) {
      config.tools = [{ googleSearch: {} }];
      geminiMetrics.searchGroundingCalls += 1;
    }

    const generatePromise = ai.models.generateContent({
      model: modelName,
      contents,
      config
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('انتهت مهلة الاتصال بنموذج Gemini')), 30000);
    });

    return await Promise.race([generatePromise, timeoutPromise]);
  };

  try {
    let response;
    if (enableInternetSearch) {
      if (Date.now() < searchGroundingCooldownUntil) {
        searchUnavailableReason =
          'البحث المباشر عبر الويب متوقف مؤقتاً بسبب حد الحصة على خطة API الحالية؛ تمت الإجابة بالاعتماد على معرفة النموذج والمنهج المرفق.';
        response = await invokeGemini(false);
      } else {
        try {
          response = await invokeGemini(true);
        } catch (searchErr: any) {
          const rawMsg = String(searchErr?.message || '');
          const isQuotaError =
            rawMsg.includes('429') ||
            rawMsg.includes('RESOURCE_EXHAUSTED') ||
            rawMsg.toLowerCase().includes('quota');
          if (isQuotaError) {
            // Pause search grounding calls for 5 minutes to avoid repeated 429 quota errors
            searchGroundingCooldownUntil = Date.now() + 5 * 60 * 1000;
          }
          searchUnavailableReason =
            'البحث المباشر عبر الويب غير متاح حالياً بسبب حد الحصة على خطة API الحالية؛ تمت الإجابة بالاعتماد على المعرفة المباشرة للنموذج والمنهج المرفق.';
          response = await invokeGemini(false);
        }
      }
    } else {
      response = await invokeGemini(false);
    }

    const reply = response.text?.trim() || 'لم يتمكن النموذج من توليد إجابة نصية في هذه اللحظة.';

    // Extract verified external web grounding URLs if returned
    const searchMetadata = (response as any).candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (searchMetadata && Array.isArray(searchMetadata)) {
      searchMetadata.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          groundingSources.push({
            type: 'internet_search',
            title: chunk.web.title,
            url: chunk.web.uri,
            snippet: chunk.web.snippet || ''
          });
        }
      });
    }

    groundingSources.push({
      type: 'gemini_explanation',
      title: `استجابة مدعومة من Google Gemini (${modelName})`
    });

    geminiMetrics.successfulRequests += 1;

    return {
      reply,
      groundingSources,
      modelUsed: modelName,
      hasApiKey: true,
      searchUnavailableReason
    };
  } catch (err: any) {
    geminiMetrics.failedRequests += 1;
    const rawMsg = String(err?.message || '');
    const isQuotaError =
      rawMsg.includes('429') ||
      rawMsg.includes('RESOURCE_EXHAUSTED') ||
      rawMsg.toLowerCase().includes('quota');

    if (isQuotaError) {
      throw new Error('تم استهلاك الحد المسموح لطلبات Gemini حالياً (429). يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.');
    }
    throw new Error('تعذر إكمال الاتصال بنموذج Gemini حالياً. يرجى المحاولة بعد قليل.');
  }
};

export const transcribeSpeechAudio = async (
  audioBase64: string,
  mimeType: string,
  expectedSentence?: string
): Promise<{ transcript: string; confidence: number }> => {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error('GEMINI_API_KEY غير مهيأ على الخادم لخدمة التفريغ الصوتي.');
  }

  geminiMetrics.transcribeCalls += 1;
  geminiMetrics.lastCallAt = new Date().toISOString();

  const prompt = expectedSentence
    ? `Transcribe the exact spoken English words from this audio recording faithfully. Do NOT correct mispronunciations or insert words the speaker did not actually say. Target sentence for acoustic context only: "${expectedSentence}". Output ONLY the exact spoken transcript text.`
    : 'Transcribe the exact spoken words from this audio accurately (English or Arabic). Output ONLY the transcript text.';

  const response = await ai.models.generateContent({
    model: 'gemini-3.5-transcribe',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: mimeType || 'audio/webm',
            data: audioBase64
          }
        },
        { text: prompt }
      ]
    }
  });

  const transcript = (response.text || '').trim();
  return {
    transcript,
    confidence: transcript ? 0.88 : 0
  };
};
