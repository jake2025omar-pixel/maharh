import { HADRAMOUT_CURRICULUM_TOPICS, SentenceItem } from '../data/curriculumData.ts';
import { EVERYDAY_ENGLISH_CATEGORIES } from '../data/everydayData.ts';

export type LearningMethodId =
  | 'listening'
  | 'reading'
  | 'spelling'
  | 'vocabulary'
  | 'choose_word'
  | 'fill_blank'
  | 'match_pairs'
  | 'sentence_reorder'
  | 'pronunciation'
  | 'speaking'
  | 'translation'
  | 'grammar_context'
  | 'dictation'
  | 'phonetics'
  | 'writing_studio'
  | 'comprehension_check';

export interface LearningMethodMeta {
  id: LearningMethodId;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  defaultWeight: number;
}

export const LEARNING_METHODS: Record<LearningMethodId, LearningMethodMeta> = {
  listening: {
    id: 'listening',
    titleAr: 'الاستماع للجمل الكاملة',
    titleEn: 'Listening',
    descriptionAr: 'الاستماع للنطق الواضح للجمل ومخارج الحروف بسرعات متعددة.',
    defaultWeight: 18
  },
  reading: {
    id: 'reading',
    titleAr: 'القراءة والشرح المنهجي',
    titleEn: 'Deep Reading & Explanation',
    descriptionAr: 'قراءة الجمل الإنجليزية في سياقها مع شرح الأستاذ العميق وتوليد أمثلة إضافية.',
    defaultWeight: 18
  },
  spelling: {
    id: 'spelling',
    titleAr: 'الكتابة والتهجئة',
    titleEn: 'Writing & Spelling',
    descriptionAr: 'تكوين وتهجئة الكلمات الأساسية من الدرس حرفاً بحرف.',
    defaultWeight: 15
  },
  vocabulary: {
    id: 'vocabulary',
    titleAr: 'تعلم المفردات في سياق الجمل',
    titleEn: 'Vocabulary in Context',
    descriptionAr: 'فهم الكلمات داخل جمل كاملة مع النطق الصوتي (IPA) والمرادفات والمتلازمات.',
    defaultWeight: 16
  },
  choose_word: {
    id: 'choose_word',
    titleAr: 'اختيار الكلمة الصحيحة',
    titleEn: 'Choosing the Correct Word',
    descriptionAr: 'تحديد المفردة أو الاختصار الدقيق المناسب للسياق.',
    defaultWeight: 15
  },
  fill_blank: {
    id: 'fill_blank',
    titleAr: 'إكمال الكلمات الناقصة',
    titleEn: 'Completing Missing Words',
    descriptionAr: 'ملء الفراغ بالكلمة النحوية أو اللغوية الصحيحة داخل الجملة.',
    defaultWeight: 15
  },
  match_pairs: {
    id: 'match_pairs',
    titleAr: 'توصيل الكلمات بالمعاني',
    titleEn: 'Matching Words & Meanings',
    descriptionAr: 'ربط المصطلحات الإنجليزية بمعانيها العربية عبر خطوط توصيل واضحة.',
    defaultWeight: 15
  },
  sentence_reorder: {
    id: 'sentence_reorder',
    titleAr: 'ترتيب الكلمات في جمل صحيحة',
    titleEn: 'Arranging Words into Sentences',
    descriptionAr: 'إعادة بناء الجملة بالترتيب النحوي السليم.',
    defaultWeight: 16
  },
  pronunciation: {
    id: 'pronunciation',
    titleAr: 'التدريب على النطق',
    titleEn: 'Pronunciation Practice',
    descriptionAr: 'تسجيل صوتك عبر الميكروفون وتحليل الكلمات المنطوقة.',
    defaultWeight: 20
  },
  speaking: {
    id: 'speaking',
    titleAr: 'التحدث والإجابة عن الأسئلة',
    titleEn: 'Speaking & Answering Questions',
    descriptionAr: 'قراءة الجمل والإجابة الصوتية الحرة على مواقف الدرس.',
    defaultWeight: 20
  },
  translation: {
    id: 'translation',
    titleAr: 'الترجمة التفاعلية',
    titleEn: 'Translation',
    descriptionAr: 'الترجمة الدقيقة بين الإنجليزية والعربية مع الحفاظ على المعنى.',
    defaultWeight: 15
  },
  grammar_context: {
    id: 'grammar_context',
    titleAr: 'تمارين القواعد في السياق',
    titleEn: 'Grammar in Context',
    descriptionAr: 'تطبيق القواعد النحوية المقررة على جمل واقعية.',
    defaultWeight: 20
  },
  dictation: {
    id: 'dictation',
    titleAr: 'الاستماع وكتابة الجمل الكاملة',
    titleEn: 'Listening & Writing Sentences',
    descriptionAr: 'الاستماع إلى الجملة كاملة وكتابتها إملائياً بدقة.',
    defaultWeight: 18
  },
  phonetics: {
    id: 'phonetics',
    titleAr: 'الصوتيات ومخارج الحروف (IPA)',
    titleEn: 'Phonetics & Articulation',
    descriptionAr: 'تحليل الرموز الصوتية والنبر وتمييز الثنائيات المتقاربة ونطقها.',
    defaultWeight: 16
  },
  writing_studio: {
    id: 'writing_studio',
    titleAr: 'الإنتاج الكتابي وإنشاء الجمل',
    titleEn: 'Original Writing Studio',
    descriptionAr: 'تكوين جمل وفقرات أصيلة حول موضوع الدرس مع تصحيح وتحليل الأستاذ الفوري.',
    defaultWeight: 20
  },
  comprehension_check: {
    id: 'comprehension_check',
    titleAr: 'اختبار التحقق والتثبيت',
    titleEn: 'Mastery Comprehension Check',
    descriptionAr: 'اختبار تكيّفي يقيس فهم القاعدة قبل الانتقال للخطوة التالية.',
    defaultWeight: 18
  }
};

export interface LessonDescriptor {
  id: string;
  source: 'hadramout_curriculum' | 'everyday_english';
  unitLabelAr: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  pdfPages?: string;
  pedagogyType: 'grammar' | 'vocabulary_facts' | 'everyday_dialogue' | 'mixed_verbs';
  sentences: SentenceItem[];
}

export interface PlannedActivity {
  id: string;
  method: LearningMethodId;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  durationSeconds: number;
  weight: number;
}

export const DURATION_OPTIONS = [5, 10, 15, 20, 30, 35, 40, 45, 50, 60];

const GRAMMAR_TOPIC_IDS = new Set([
  'direct_indirect_questions',
  'order_of_adjectives',
  'passive_voice',
  'if_conditionals',
  'past_connectors'
]);

const VERB_MIXED_TOPIC_IDS = new Set(['prefixes_derivatives', 'verbs_irregular']);

export const getAllAvailableLessons = (): LessonDescriptor[] => {
  const officialLessons: LessonDescriptor[] = HADRAMOUT_CURRICULUM_TOPICS.map(t => {
    let pedagogyType: LessonDescriptor['pedagogyType'] = 'vocabulary_facts';
    if (GRAMMAR_TOPIC_IDS.has(t.id)) pedagogyType = 'grammar';
    else if (VERB_MIXED_TOPIC_IDS.has(t.id)) pedagogyType = 'mixed_verbs';

    return {
      id: t.id,
      source: 'hadramout_curriculum',
      unitLabelAr: `القسم ${t.unit}`,
      titleAr: t.titleAr,
      titleEn: t.titleEn,
      descriptionAr: t.summaryAr,
      pdfPages: t.pdfPages,
      pedagogyType,
      sentences: t.sentences
    };
  });

  const everydayLessons: LessonDescriptor[] = EVERYDAY_ENGLISH_CATEGORIES.map((cat, idx) => ({
    id: cat.id,
    source: 'everyday_english',
    unitLabelAr: `موقف ${idx + 1}`,
    titleAr: cat.titleAr,
    titleEn: cat.titleEn,
    descriptionAr: cat.descriptionAr,
    pedagogyType: 'everyday_dialogue',
    sentences: cat.sentences
  }));

  return [...officialLessons, ...everydayLessons];
};

// Select appropriate methods per lesson type and duration — follows the Explain -> Demonstrate -> Practice -> Produce -> Verify cycle
export const generateStudySessionPlan = (
  lesson: LessonDescriptor,
  durationMinutes: number
): PlannedActivity[] => {
  const totalSeconds = Math.max(60, Math.round(durationMinutes * 60));

  let candidatePool: LearningMethodId[] = [];
  switch (lesson.pedagogyType) {
    case 'grammar':
      candidatePool = [
        'reading',
        'grammar_context',
        'sentence_reorder',
        'writing_studio',
        'fill_blank',
        'comprehension_check'
      ];
      break;
    case 'mixed_verbs':
      candidatePool = [
        'vocabulary',
        'choose_word',
        'phonetics',
        'writing_studio',
        'dictation',
        'comprehension_check'
      ];
      break;
    case 'everyday_dialogue':
      candidatePool = [
        'listening',
        'reading',
        'phonetics',
        'pronunciation',
        'writing_studio',
        'speaking'
      ];
      break;
    case 'vocabulary_facts':
    default:
      candidatePool = [
        'vocabulary',
        'listening',
        'phonetics',
        'match_pairs',
        'writing_studio',
        'comprehension_check'
      ];
      break;
  }

  // Determine optimal number of activities for the chosen study duration
  let activityCount = 4;
  if (durationMinutes <= 5) activityCount = 3;
  else if (durationMinutes <= 15) activityCount = 4;
  else if (durationMinutes <= 35) activityCount = 5;
  else activityCount = 6;

  const selectedMethods = candidatePool.slice(0, activityCount);
  const weightSum = selectedMethods.reduce((acc, m) => acc + LEARNING_METHODS[m].defaultWeight, 0);

  // Allocate exact seconds proportionally, then distribute remainder seconds fairly
  const rawSeconds = selectedMethods.map(m => {
    const exact = (LEARNING_METHODS[m].defaultWeight / weightSum) * totalSeconds;
    return {
      method: m,
      floored: Math.floor(exact),
      fraction: exact - Math.floor(exact)
    };
  });

  let allocated = rawSeconds.reduce((acc, item) => acc + item.floored, 0);
  let remainder = totalSeconds - allocated;

  // Sort indices by largest fractional remainder so time distribution is maximally accurate
  const indicesByFraction = rawSeconds
    .map((item, idx) => ({ idx, fraction: item.fraction }))
    .sort((a, b) => b.fraction - a.fraction);

  for (let i = 0; i < remainder; i++) {
    const targetIdx = indicesByFraction[i % indicesByFraction.length].idx;
    rawSeconds[targetIdx].floored += 1;
  }

  return rawSeconds.map((item, index) => {
    const meta = LEARNING_METHODS[item.method];
    return {
      id: `act_${index + 1}_${item.method}`,
      method: item.method,
      titleAr: meta.titleAr,
      titleEn: meta.titleEn,
      descriptionAr: meta.descriptionAr,
      durationSeconds: item.floored,
      weight: meta.defaultWeight
    };
  });
};

export const formatDurationExact = (totalSeconds: number): string => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const formatDurationArabic = (totalSeconds: number): string => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins > 0 && secs > 0) return `${mins} د و ${secs} ث`;
  if (mins > 0) return `${mins} دقيقة`;
  return `${secs} ثانية`;
};
