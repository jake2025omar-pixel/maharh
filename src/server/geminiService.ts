import { GoogleGenAI } from '@google/genai';
import { searchCurriculumKnowledge, PDFChunk } from './curriculumIndex.ts';

export interface CompanionRequest {
  message: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  activeTrack?: 'hadramout_curriculum' | 'everyday_english';
  currentSentence?: {
    english: string;
    arabic: string;
    topicTitleAr: string;
    grammarPoint?: string;
    vocabulary?: { word: string; meaningAr: string }[];
  };
  chatHistory?: { role: 'user' | 'model'; parts: { text: string }[] }[];
  enableInternetSearch?: boolean;
}

export interface CompanionResponse {
  reply: string;
  groundingSources: {
    type: 'pdf_curriculum' | 'gemini_explanation' | 'internet_search';
    title: string;
    pageNumber?: number;
    url?: string;
    snippet?: string;
  }[];
  modelUsed: string;
  hasApiKey: boolean;
}

const getGeminiClient = (): GoogleGenAI | null => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

export const handleCompanionQuery = async (req: CompanionRequest): Promise<CompanionResponse> => {
  const {
    message,
    level = 'beginner',
    activeTrack = 'hadramout_curriculum',
    currentSentence,
    chatHistory = [],
    enableInternetSearch = false
  } = req;

  // 1. Search Curriculum Knowledge Base for relevant chunks
  const matchedChunks: PDFChunk[] = searchCurriculumKnowledge(
    `${message} ${currentSentence?.english || ''} ${currentSentence?.topicTitleAr || ''}`
  );

  const ai = getGeminiClient();

  // If no Gemini API key configured, provide reliable offline grounding from the Hadramout knowledge base
  if (!ai) {
    let reply = '';
    const groundingSources: CompanionResponse['groundingSources'] = [];

    if (matchedChunks.length > 0) {
      const topChunk = matchedChunks[0];
      groundingSources.push({
        type: 'pdf_curriculum',
        title: `مقرر الصف الحادي عشر (حضرموت) - ${topChunk.topicAr}`,
        pageNumber: topChunk.page,
        snippet: topChunk.officialGrammarRule
      });

      reply = `مرحباً بك يا صديقي! أنا قطّك التعليمي الرمادي في **مهارة (MAHARAH)** 🐱.\n\n` +
        `📘 **[مأخوذ مباشرة من مقرر الصف الحادي عشر - حضرموت، ${topChunk.topicAr} (ص ${topChunk.page})]**\n\n` +
        `${topChunk.officialGrammarRule}\n\n` +
        `**أمثلة من كتيّب المراجعة الشاملة:**\n` +
        topChunk.examples.map(ex => `• **${ex.en}**\n  ↳ *${ex.ar}*`).join('\n\n') +
        `\n\n💡 **ملاحظة هامة للاختبار:** ${topChunk.hadramoutExamNotes}\n\n` +
        `---\n*ملاحظة: يمكنك تفعيل الاتصال الكامل بذكاء جيميناي عبر إدخال مفتاح GEMINI_API_KEY في لوحة الإعدادات (Settings > Secrets).*`;
    } else {
      reply = `أهلاً بك! أنا رفيقك التعليمي الذكي في منصة **مهارة (MAHARAH)** 🐱.\n\n` +
        (currentSentence
          ? `أرى أنك تدرس حالياً جملة:\n**"${currentSentence.english}"**\n↳ *${currentSentence.arabic}*\n\n` +
            `هذه الجملة تنتمي إلى محور: **${currentSentence.topicTitleAr}**.\n` +
            `إذا أردت معرفة إعرابها أو صياغة جمل مماثلة، اسألني بالتفصيل وسأوضح لك كل جزء مع ترجمته العربية الكاملة!\n\n`
          : `كيف يمكنني مساعدتك اليوم في تعلم الإنجليزية أو مراجعة مقرر الصف الحادي عشر (حضرموت)؟\n\n`) +
        `*ملاحظة: يعمل الرفيق الآن بالاعتماد على قاعدة بيانات كتيّب مراجعة منهج حضرموت الداخلي. لتفعيل كامل ذكاء جيميناي المباشر، أضف مفتاح GEMINI_API_KEY في Settings > Secrets.*`;
    }

    return {
      reply,
      groundingSources,
      modelUsed: 'internal-hadramout-rag-engine',
      hasApiKey: false
    };
  }

  // 2. Format Context for Gemini
  let pdfContextSection = '';
  const groundingSources: CompanionResponse['groundingSources'] = [];

  if (matchedChunks.length > 0) {
    pdfContextSection = matchedChunks.slice(0, 3).map(chunk => {
      groundingSources.push({
        type: 'pdf_curriculum',
        title: `مقرر الصف الحادي عشر - حضرموت: ${chunk.topicAr}`,
        pageNumber: chunk.page,
        snippet: chunk.officialGrammarRule
      });
      return `---
Topic: ${chunk.topicEn} (${chunk.topicAr}) - Unit ${chunk.unit}, Page ${chunk.page}
Official Text: ${chunk.officialText}
Grammar Rule: ${chunk.officialGrammarRule}
Exam Notes: ${chunk.hadramoutExamNotes}
Examples:
${chunk.examples.map(e => `• ${e.en} -> ${e.ar}`).join('\n')}
---`;
    }).join('\n\n');
  }

  const systemInstruction = `
أنت "فرهود" (Farhood) — القط الرمادي التعليمي الذكي لمنصة "مهارة" (MAHARAH 3.0) المتخصصة في تعليم اللغة الإنجليزية للناطقين بالعربية، وبخاصة طلاب منهج الصف الحادي عشر في حضرموت (اليمن) بالإضافة إلى مكتبة الإنجليزية اليومية الحياتية.

شخصيتك:
- ودود، مشجع، صبور، ذكي، تشرح بأسلوب تربوي مبسط ورصين.
- تتحدث باللغة العربية الواضحة وتخاطب الطالب بلطف وتقدير.

قواعد تعليمية صارمة:
1. التعلم القائم على الجمل: أي مثال إنجليزي تذكره يجب دائماً أن ترفقه بترجمة عربية واضحة ومباشرة تحته.
2. التمييز الدقيق لمصادر المعرفة:
   - إذا كانت المعلومة مستندة إلى مقرر حضرموت المستخرج من الـ PDF، افتتح الفقرة بـ:
     📘 **[مأخوذ مباشرة من مقرر الصف الحادي عشر - حضرموت، ص X]**
   - إذا كان شرحاً أو تبسيطاً أو أمثلة إضافية منك كذكاء اصطناعي، ضعها تحت:
     💡 **[شرح وتوضيح تعليمي إضافي من جيميناي]**
   - إذا تم البحث في الإنترنت، ضع النتائج تحت:
     🌐 **[بحث ومعلومات موثوقة من الإنترنت مع المصادر]**
3. لا تختلق مطلقاً معلومات تدعي أنها من كتاب المنهج وهي ليست موجودة فيه.
4. التناسب مع مستوى الطالب: مراعاة مستوى الطالب الحالي (${level}).
`.trim();

  const userPrompt = `
سياق الطالب الحالي في منصة مهارة:
- المسار التعليمي: ${activeTrack === 'hadramout_curriculum' ? 'مقرر الصف الحادي عشر - حضرموت' : 'مكتبة الإنجليزية اليومية'}
- المستوى: ${level}
${currentSentence ? `- الجملة التي يدرسها الطالب الآن: "${currentSentence.english}" (الترجمة: "${currentSentence.arabic}") [محور: ${currentSentence.topicTitleAr}]` : ''}

${pdfContextSection ? `المحتوى المستخرج رسمياً من كتيّب مراجعة المنهج (PDF - Hadramout Curriculum):\n${pdfContextSection}` : 'لا توجد صفحات مطابقة مباشرة في كتيّب المنهج لهذا السؤال؛ اعتمد على المعرفة اللغوية العامة والإنترنت ووضح ذلك للطالب.'}

رسالة أو سؤال الطالب:
"${message}"
`.trim();

  try {
    const config: any = {
      systemInstruction,
    };

    if (enableInternetSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config,
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Gemini API call timed out after 5s')), 5000);
    });

    const response = await Promise.race([generatePromise, timeoutPromise]);

    const reply = response.text || 'عذراً، لم أتمكن من صياغة إجابة في هذه اللحظة. يرجى إعادة المحاولة.';

    // Extract search grounding metadata if available
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
      title: 'شرح تحليلي مدعوم بنموذج Google Gemini 3.8 Flash'
    });

    return {
      reply,
      groundingSources,
      modelUsed: 'gemini-3.8-flash',
      hasApiKey: true
    };
  } catch (err: any) {
    console.warn('Gemini API fallback triggered:', err.message);

    let fallbackReply = '';
    if (matchedChunks.length > 0) {
      const topChunk = matchedChunks[0];
      fallbackReply = `مرحباً بك يا بطل! أنا فرهود 🐱 قطّك التعليمي الرمادي في **مهارة (MAHARAH)**.\n\n` +
        `📘 **[مأخوذ مباشرة من مقرر الصف الحادي عشر - حضرموت، ${topChunk.topicAr} (ص ${topChunk.page})]**\n\n` +
        `${topChunk.officialGrammarRule}\n\n` +
        `**أمثلة مقررة مع الترجمة العربية الكاملة:**\n` +
        topChunk.examples.map(ex => `• **"${ex.en}"**\n  ↳ *${ex.ar}*`).join('\n\n') +
        `\n\n💡 **ملاحظة للامتحان الوزاري بحضرموت:** ${topChunk.hadramoutExamNotes}\n\n` +
        `---\n*ملاحظة: لتفعيل الإجابات الحية من Gemini API، يُرجى التأكد من إضافة مفتاحك في (Settings > Secrets).*`;
    } else {
      fallbackReply = `أهلاً بك يا بطل! أنا فرهود 🐱 رفيقك التعليمي الذكي في منصة **مهارة (MAHARAH)**.\n\n` +
        (currentSentence
          ? `بخصوص الجملة التي تدرسها الآن:\n**"${currentSentence.english}"**\n↳ *${currentSentence.arabic}*\n\n` +
            `هذه الجملة تتبع وحدة: **${currentSentence.topicTitleAr}**.\n` +
            (currentSentence.grammarPoint ? `القاعدة الأساسية: ${currentSentence.grammarPoint}\n\n` : '') +
            (currentSentence.vocabulary && currentSentence.vocabulary.length > 0
              ? `**المفردات المفتاحية في الجملة:**\n` +
                currentSentence.vocabulary.map((v: { word: string; meaningAr: string }) => `• ${v.word}: ${v.meaningAr}`).join('\n')
              : '')
          : `أنا جاهز للإجابة عن أي استفسار في مقرر الصف الحادي عشر في حضرموت أو الإنجليزية اليومية!`);
    }

    return {
      reply: fallbackReply,
      groundingSources,
      modelUsed: 'hadramout-curriculum-rag',
      hasApiKey: false
    };
  }
};
