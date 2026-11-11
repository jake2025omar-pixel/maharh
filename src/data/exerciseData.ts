export type ExerciseType =
  | 'multiple_choice'
  | 'match_pairs'
  | 'letter_spelling'
  | 'sentence_reorder'
  | 'listen_choose'
  | 'pronunciation_practice'
  | 'translate_en_to_ar'
  | 'translate_ar_to_en'
  | 'fill_blank'
  | 'situation_choice'
  | 'dialogue_complete'
  | 'dictation'
  | 'grammar_context'
  | 'reading_comprehension'
  | 'listening_comprehension';

export interface BaseExercise {
  id: string;
  type: ExerciseType;
  level: 'beginner' | 'intermediate' | 'advanced';
  topicId: string;
  topicTitleAr: string;
  source: 'hadramout_curriculum' | 'everyday_english';
  instructionAr: string;
  englishSentence: string;
  arabicTranslation: string;
  explanationAr: string;
}

export interface MultipleChoiceExercise extends BaseExercise {
  type: 'multiple_choice' | 'grammar_context' | 'situation_choice';
  promptQuestionAr: string;
  options: { id: string; text: string; textAr?: string }[];
  correctOptionId: string;
}

export interface MatchPairsExercise extends BaseExercise {
  type: 'match_pairs';
  pairs: { id: string; english: string; arabic: string }[];
}

export interface LetterSpellingExercise extends BaseExercise {
  type: 'letter_spelling';
  targetWord: string;
  wordMeaningAr: string;
  scrambledLetters: string[];
}

export interface SentenceReorderExercise extends BaseExercise {
  type: 'sentence_reorder';
  words: string[];
  correctOrder: string[];
}

export interface AudioExercise extends BaseExercise {
  type: 'listen_choose' | 'dictation' | 'pronunciation_practice' | 'listening_comprehension';
  audioPrompt: string;
  options?: { id: string; text: string; textAr?: string }[];
  correctOptionId?: string;
  comprehensionQuestionAr?: string;
}

export interface FillBlankExercise extends BaseExercise {
  type: 'fill_blank';
  sentenceWithBlank: string;
  blankMeaningAr: string;
  options: string[];
  correctAnswer: string;
}

export interface TranslationExercise extends BaseExercise {
  type: 'translate_en_to_ar' | 'translate_ar_to_en';
  options: string[];
  correctAnswer: string;
}

export interface DialogueExercise extends BaseExercise {
  type: 'dialogue_complete';
  speakerA: string;
  speakerBBlank: string;
  options: string[];
  correctAnswer: string;
}

export interface ReadingComprehensionExercise extends BaseExercise {
  type: 'reading_comprehension';
  readingPassageEn: string;
  readingPassageAr: string;
  questionAr: string;
  options: string[];
  correctAnswer: string;
}

export type ExerciseItem =
  | MultipleChoiceExercise
  | MatchPairsExercise
  | LetterSpellingExercise
  | SentenceReorderExercise
  | AudioExercise
  | FillBlankExercise
  | TranslationExercise
  | DialogueExercise
  | ReadingComprehensionExercise;

export const EXERCISES_COLLECTION: ExerciseItem[] = [
  // 1. Multiple Choice (Curriculum)
  {
    id: 'ex_1',
    type: 'multiple_choice',
    level: 'beginner',
    topicId: 'school_subjects',
    topicTitleAr: 'المواد الدراسية واختصاراتها',
    source: 'hadramout_curriculum',
    instructionAr: 'اختر الاختصار الرسمي المعتمد لمادة الكيمياء في منهج الصف الحادي عشر:',
    promptQuestionAr: 'ما هو الاختصار الصحيح لمادة Chemistry؟',
    englishSentence: 'We have Chemistry (Chem.) in the school laboratory.',
    arabicTranslation: 'لدينا مادة الكيمياء في مختبر المدرسة.',
    explanationAr: 'في المنهج اليمني، يُعتمد اختصار Chem. لمادة الكيمياء (Chemistry) واختصار Phys. لمادة الفيزياء.',
    options: [
      { id: 'opt_1', text: 'Chem.', textAr: 'كيمياء' },
      { id: 'opt_2', text: 'Chm.', textAr: 'خطأ شائع' },
      { id: 'opt_3', text: 'Chey.', textAr: 'غير صحيح' },
      { id: 'opt_4', text: 'Cmy.', textAr: 'غير صحيح' }
    ],
    correctOptionId: 'opt_1'
  },

  // 2. Match Pairs (Everyday English)
  {
    id: 'ex_2',
    type: 'match_pairs',
    level: 'beginner',
    topicId: 'shopping_ordering_food',
    topicTitleAr: 'التسوق وطلب الطعام',
    source: 'everyday_english',
    instructionAr: 'قم بتوصيل كل تعبير إنجليزي بمعناه العربي الدقيق بالنقر على الزوجين:',
    englishSentence: 'Could we get the bill, and do you accept contactless payment?',
    arabicTranslation: 'هل يمكننا الحصول على الفاتورة، وهل تقبلون الدفع بدون تلامس؟',
    explanationAr: 'هذه المفردات أساسية للتعامل في المطاعم والمتاجر اليومية.',
    pairs: [
      { id: 'p1', english: 'The bill', arabic: 'الفاتورة / الحساب' },
      { id: 'p2', english: 'Contactless payment', arabic: 'الدفع الإلكتروني دون تلامس' },
      { id: 'p3', english: 'Medium cappuccino', arabic: 'كابتشينو بحجم متوسط' },
      { id: 'p4', english: 'Warm croissant', arabic: 'كرواسون دافئ' }
    ]
  },

  // 3. Sentence Reorder (Curriculum: Order of Adjectives)
  {
    id: 'ex_3',
    type: 'sentence_reorder',
    level: 'intermediate',
    topicId: 'order_of_adjectives',
    topicTitleAr: 'ترتيب الصفات (OSASCOMP)',
    source: 'hadramout_curriculum',
    instructionAr: 'رتّب الكلمات الإنجليزية لتكوين جملة صحيحة تتبع قاعدة تسلسل الصفات:',
    englishSentence: 'He bought a beautiful small old Hadrami wooden box.',
    arabicTranslation: 'اشترى صندوقاً خشبياً حضرمياً قديماً صغيراً جميلاً.',
    explanationAr: 'ترتيب الصفات يتبع القاعدة: الرأي (beautiful) ثم الحجم (small) ثم العمر (old) ثم الأصل (Hadrami) ثم المادة (wooden).',
    words: ['He', 'bought', 'a', 'beautiful', 'small', 'old', 'Hadrami', 'wooden', 'box.'],
    correctOrder: ['He', 'bought', 'a', 'beautiful', 'small', 'old', 'Hadrami', 'wooden', 'box.']
  },

  // 4. Letter Spelling (Curriculum: Medical Terms)
  {
    id: 'ex_4',
    type: 'letter_spelling',
    level: 'beginner',
    topicId: 'medical_terms_proverbs',
    topicTitleAr: 'المصطلحات الطبية والأمثال',
    source: 'hadramout_curriculum',
    instructionAr: 'تهجأ الكلمة الإنجليزية التي تعني "الوقاية" باختيار الحروف بالترتيب الصحيح:',
    englishSentence: 'Prevention is better than cure in healthcare.',
    arabicTranslation: 'الوقاية خير من العلاج في الرعاية الصحية.',
    explanationAr: 'كلمة Prevention مشتقة من الفعل prevent بإضافة اللاحقة -tion.',
    targetWord: 'PREVENTION',
    wordMeaningAr: 'الوقاية',
    scrambledLetters: ['P', 'R', 'E', 'V', 'E', 'N', 'T', 'I', 'O', 'N']
  },

  // 5. Fill Blank (Curriculum: Past Connectors)
  {
    id: 'ex_5',
    type: 'fill_blank',
    level: 'intermediate',
    topicId: 'past_connectors',
    topicTitleAr: 'روابط الماضي المستمر والماضي التام',
    source: 'hadramout_curriculum',
    instructionAr: 'اختر الرابط الزمني الصحيح لإكمال الفراغ في الجملة:',
    sentenceWithBlank: '_____ the teacher was explaining the lesson, the lights went out.',
    blankMeaningAr: 'بينما كان المعلم يشرح الدرس، انطفأت الأضواء.',
    englishSentence: 'While the teacher was explaining the lesson, the lights went out.',
    arabicTranslation: 'بينما كان المعلم يشرح الدرس، انطفأت الأضواء.',
    explanationAr: 'نستخدم While عندما يتبعها ماضٍ مستمر (was explaining) للتعبير عن حدث كان قيد الحدوث.',
    options: ['While', 'Before', 'After', 'As soon as'],
    correctAnswer: 'While'
  },

  // 6. Listen & Choose Sentence (Everyday English)
  {
    id: 'ex_6',
    type: 'listen_choose',
    level: 'beginner',
    topicId: 'asking_questions',
    topicTitleAr: 'طرح الأسئلة اليومية',
    source: 'everyday_english',
    instructionAr: 'استمع للتسجيل الصوتي بعناية، ثم حدد الجملة الإنجليزية المطابقة لما سمعته:',
    audioPrompt: 'Could you please tell me what time the grocery store closes tonight?',
    englishSentence: 'Could you please tell me what time the grocery store closes tonight?',
    arabicTranslation: 'هل يمكنك إخباري في أي وقت يغلق متجر البقالة الليلة من فضلك؟',
    explanationAr: 'السؤال غير المباشر المهذب يبدأ بـ Could you please tell me.',
    options: [
      { id: 'a1', text: 'Could you please tell me what time the grocery store closes tonight?', textAr: 'الجملة المطابقة تماماً' },
      { id: 'a2', text: 'Can you tell me what time the train leaves tonight?', textAr: 'جملة مختلفة عن القطار' },
      { id: 'a3', text: 'Would you like to visit the grocery store tomorrow?', textAr: 'جملة دعوة مختلفة' }
    ],
    correctOptionId: 'a1'
  },

  // 7. Pronunciation Practice (Curriculum: Proverb)
  {
    id: 'ex_7',
    type: 'pronunciation_practice',
    level: 'beginner',
    topicId: 'medical_terms_proverbs',
    topicTitleAr: 'المصطلحات الطبية والأمثال',
    source: 'hadramout_curriculum',
    instructionAr: 'استمع إلى النطق الإنجليزي السليم، ثم اضغط على زر الميكروفون وتحدث بالجملة لتقييم نطقك:',
    audioPrompt: 'Prevention is better than cure.',
    englishSentence: 'Prevention is better than cure.',
    arabicTranslation: 'الوقاية خير من العلاج.',
    explanationAr: 'ركز على النطق السليم لكلمة pre-ven-tion وصوت الـ v الخفيف.',
    options: []
  },

  // 8. Translation English to Arabic (Curriculum: Passive Voice)
  {
    id: 'ex_8',
    type: 'translate_en_to_ar',
    level: 'intermediate',
    topicId: 'passive_voice',
    topicTitleAr: 'المبني للمجهول',
    source: 'hadramout_curriculum',
    instructionAr: 'اختر الترجمة العربية الأكثر دقة للجملة الإنجليزية التالية المبنية للمجهول:',
    englishSentence: 'The historic mud-brick towers in Shibam were constructed hundreds of years ago.',
    arabicTranslation: 'شُيّدت الأبراج الطينية التاريخية في شبام منذ مئات السنين.',
    explanationAr: 'الجملة مبنية للمجهول في زمن الماضي البسيط (were constructed)، لذا تترجم إلى الفعل المبني للمجهول (شُيّدت).',
    options: [
      { id: 't1', text: 'شُيّدت الأبراج الطينية التاريخية في شبام منذ مئات السنين.' },
      { id: 't2', text: 'بنى الناس أبراجاً حديثة في شبام العام الماضي.' },
      { id: 't3', text: 'سوف يتم تشييد أبراج طينية في المستقبل في شبام.' }
    ].map(o => o.text),
    correctAnswer: 'شُيّدت الأبراج الطينية التاريخية في شبام منذ مئات السنين.'
  },

  // 9. Translation Arabic to English (Curriculum: Indirect Questions)
  {
    id: 'ex_9',
    type: 'translate_ar_to_en',
    level: 'intermediate',
    topicId: 'direct_indirect_questions',
    topicTitleAr: 'الأسئلة غير المباشرة',
    source: 'hadramout_curriculum',
    instructionAr: 'اختر الصياغة الإنجليزية الصحيحة للسؤال غير المباشر المهذب:',
    englishSentence: 'Could you tell me where the principal office is located?',
    arabicTranslation: 'هل يمكنك إخباري أين يقع مكتب مدير المدرسة؟',
    explanationAr: 'في السؤال غير المباشر، لا نعكس الفاعل والفعل، بل نقول where the office is located وليس where is the office located.',
    options: [
      'Could you tell me where the principal office is located?',
      'Could you tell me where is the principal office located?',
      'Where is located the principal office, tell me please?',
      'Tell me where principal office locating now?'
    ],
    correctAnswer: 'Could you tell me where the principal office is located?'
  },

  // 10. Situation Choice (Everyday English)
  {
    id: 'ex_10',
    type: 'situation_choice',
    level: 'intermediate',
    topicId: 'polite_requests',
    topicTitleAr: 'الطلبات والردود المهذبة',
    source: 'everyday_english',
    instructionAr: 'أنت في اجتماع عمل واضطررت لتأجيل موعد تسليم التقرير. ما هي العبارة المهذبة الأنسب؟',
    promptQuestionAr: 'الموقف: ترغب في طلب تأجيل الموعد ليوم غد بلباقة مهنية:',
    englishSentence: 'Would it be possible to postpone our appointment until tomorrow afternoon?',
    arabicTranslation: 'هل سيكون من الممكن تأجيل موعدنا حتى بعد ظهر الغد؟',
    explanationAr: 'استخدام Would it be possible to... هو التعبير الأرقى والأكثر قبولاً في البيئة الرسمية.',
    options: [
      { id: 's1', text: 'Would it be possible to postpone our appointment until tomorrow afternoon?', textAr: 'الطلب المهذب المناسب' },
      { id: 's2', text: 'I will not come today, see you tomorrow.', textAr: 'أسلوب فظ وجاف' },
      { id: 's3', text: 'Cancel everything right now.', textAr: 'أمر غير ملائم' }
    ],
    correctOptionId: 's1'
  },

  // 11. Dialogue Complete (Everyday English: Food Ordering)
  {
    id: 'ex_11',
    type: 'dialogue_complete',
    level: 'beginner',
    topicId: 'shopping_ordering_food',
    topicTitleAr: 'التسوق وطلب الطعام',
    source: 'everyday_english',
    instructionAr: 'أكمل رد الزبون في المحادثة بطلب القهوة والكرواسون بشكل مهذب:',
    speakerA: 'Barista: "Good morning! What can I get started for you today?"',
    speakerBBlank: 'Customer: "____________________________________"',
    englishSentence: 'Could I have a medium cappuccino and a warm croissant, please?',
    arabicTranslation: 'هل يمكنني الحصول على كابتشينو متوسط وكرواسون دافئ من فضلك؟',
    explanationAr: 'في المحادثات اليومية نستخدم Could I have... please للطلب بأدب.',
    options: [
      'Could I have a medium cappuccino and a warm croissant, please?',
      'Give me bread and coffee now quickly.',
      'I want nothing from your store today.',
      'Where is the airport gate right now?'
    ],
    correctAnswer: 'Could I have a medium cappuccino and a warm croissant, please?'
  },

  // 12. Dictation (Curriculum: Human Skeleton)
  {
    id: 'ex_12',
    type: 'dictation',
    level: 'intermediate',
    topicId: 'human_skeleton_facts',
    topicTitleAr: 'حقائق الهيكل العظمي البشري',
    source: 'hadramout_curriculum',
    instructionAr: 'استمع إلى الجملة الصوتية واكتبها بالكامل بالإنجليزية في مربع النص:',
    audioPrompt: 'The cranium protects the brain.',
    englishSentence: 'The cranium protects the brain.',
    arabicTranslation: 'تحمي الجمجمة الدماغ.',
    explanationAr: 'Cranium تعني عظام الجمجمة وفعل protects يأتي مع المفرد الغائب.',
    options: []
  },

  // 13. Grammar in Context (Curriculum: Conditionals)
  {
    id: 'ex_13',
    type: 'grammar_context',
    level: 'advanced',
    topicId: 'if_conditionals',
    topicTitleAr: 'الجمل الشرطية (If-Conditionals)',
    source: 'hadramout_curriculum',
    instructionAr: 'اختر الصيغة النحوية الصحيحة للجملة الشرطية من النوع الثالث (Third Conditional):',
    promptQuestionAr: 'If we had known about the seminar earlier, we _____ attended it.',
    englishSentence: 'If we had known about the seminar earlier, we would have attended it in Mukalla.',
    arabicTranslation: 'لو كنا قد علمنا بشأن الندوة في وقت أبكر، لكنا قد حضرناها في المكلا.',
    explanationAr: 'في الحالة الشرطية الثالثة (Third Conditional): بعد If نضع Past Perfect (had known)، وفي جواب الشرط نضع would have + p.p (would have attended).',
    options: [
      { id: 'g1', text: 'would have', textAr: 'الصيغة الصحيحة للنوع الثالث' },
      { id: 'g2', text: 'will have', textAr: 'غير صحيحة' },
      { id: 'g3', text: 'would', textAr: 'خاصة بالنوع الثاني فقط' },
      { id: 'g4', text: 'had', textAr: 'فعل مساعد مكرر' }
    ],
    correctOptionId: 'g1'
  },

  // 14. Reading Comprehension (Curriculum: Science Helps Police)
  {
    id: 'ex_14',
    type: 'reading_comprehension',
    level: 'advanced',
    topicId: 'science_helps_police',
    topicTitleAr: 'كيف يساعد العلم الشرطة',
    source: 'hadramout_curriculum',
    instructionAr: 'اقرأ الفقرة العلمية التالية من منهج الصف الحادي عشر ثم أجب عن السؤال:',
    readingPassageEn: 'Forensic scientists analyze latent fingerprints found at crime scenes. Because no two individuals share the identical fingerprint ridge patterns, fingerprint matching remains one of the most reliable methods for identifying suspects in legal investigations.',
    readingPassageAr: 'يحلل علماء الأدلة الجنائية البصمات الخفية في مسرح الجريمة. ولأنه لا يوجد شخصان يتطابقان في نمط خطوط البصمات، يظل فحص البصمات من أكثر الطرق موثوقية لتحديد هوية المشتبه بهم.',
    questionAr: 'لماذا يعتبر فحص البصمات من أكثر الطرق موثوقية للتعرف على المشتبه بهم؟',
    englishSentence: 'Fingerprint matching remains one of the most reliable methods for identifying suspects.',
    arabicTranslation: 'تطابق البصمات يظل إحدى أكثر الطرق موثوقية للتعرف على المشتبه بهم.',
    explanationAr: 'وفقاً للنص، لا يتطابق أي شخصين في نمط خطوط البصمة (No two individuals share identical ridge patterns).',
    options: [
      'Because no two individuals share the identical fingerprint ridge patterns.',
      'Because it is very cheap to test in all schools.',
      'Because criminals leave visible names everywhere.',
      'Because police officers do not need scientific equipment.'
    ],
    correctAnswer: 'Because no two individuals share the identical fingerprint ridge patterns.'
  },

  // 15. Listening Comprehension (Curriculum: Direct Questions)
  {
    id: 'ex_15',
    type: 'listening_comprehension',
    level: 'intermediate',
    topicId: 'direct_indirect_questions',
    topicTitleAr: 'الأسئلة غير المباشرة',
    source: 'hadramout_curriculum',
    instructionAr: 'استمع إلى التسجيل الصوتي للاستفسار المهذب ثم اختر الإجابة الصحيحة عن مغزى السؤال:',
    audioPrompt: 'Could you tell me where the principal office is located?',
    comprehensionQuestionAr: 'عن ماذا يستفسر المتحدث في التسجيل الصوتي؟',
    englishSentence: 'Could you tell me where the principal office is located?',
    arabicTranslation: 'هل يمكنك إخباري أين يقع مكتب مدير المدرسة؟',
    explanationAr: 'السائل يسأل بأدب عن مكان تواجد مكتب المدير (principal office).',
    options: [
      { id: 'lc1', text: 'مكان مكتب مدير المدرسة (Principal Office Location)' },
      { id: 'lc2', text: 'موعد انطلاق حافلة المدرسة' },
      { id: 'lc3', text: 'درجات امتحان مادة الكيمياء' }
    ],
    correctOptionId: 'lc1'
  }
];
