// Structured Indexed Knowledge Base extracted from:
// "English Course Comprehensive Review – Grade 11 – Yemeni Curriculum (Hadramout)"

export interface PDFChunk {
  id: string;
  unit: number;
  topicAr: string;
  topicEn: string;
  page: number;
  officialText: string;
  officialGrammarRule: string;
  hadramoutExamNotes: string;
  examples: { en: string; ar: string }[];
}

export const HADRAMOUT_PDF_KNOWLEDGE_CHUNKS: PDFChunk[] = [
  {
    id: 'pdf_chunk_1',
    unit: 1,
    topicAr: 'المواد الدراسية واختصاراتها الرسمية',
    topicEn: 'School Subjects & Abbreviations',
    page: 3,
    officialText: 'Official abbreviations used in Grade 11 secondary schools in Hadramout: Chem. (Chemistry), Phys. (Physics), Bio. (Biology), Maths (Mathematics), Geog. (Geography), Hist. (History), P.E. (Physical Education), Eng. (English), Art (Art and Crafts), Isl. (Islamic Studies).',
    officialGrammarRule: 'Abbreviations always start with a capital letter and end with a full stop if the last letter is not the same as the full word (e.g., Chem., Phys., but Maths).',
    hadramoutExamNotes: 'يتكرر في امتحانات الشهادة الثانوية بحضرموت في سؤال الربط بين المادة واختصارها.',
    examples: [
      { en: 'We have Chemistry (Chem.) in the laboratory every Sunday.', ar: 'لدينا مادة الكيمياء في المختبر كل يوم أحد.' },
      { en: 'Biology (Bio.) and Physics (Phys.) require practical experiments.', ar: 'تتطلب مادتا الأحياء والفيزياء إجراء تجارب عملية.' }
    ]
  },
  {
    id: 'pdf_chunk_2',
    unit: 2,
    topicAr: 'الأسئلة غير المباشرة المهذبة',
    topicEn: 'Direct and Indirect Questions',
    page: 8,
    officialText: 'Indirect questions are used when speaking to teachers, strangers, or in official inquiries to sound polite and respectful. Word order changes from question order (auxiliary + subject) to statement order (subject + verb).',
    officialGrammarRule: 'Structure: Polite introductory phrase + question word + subject + verb (e.g., Could you tell me where the bank is? NOT where is the bank). When there is no question word (Yes/No questions), use "if" or "whether".',
    hadramoutExamNotes: 'سؤال متكرر سنوياً: Do you know / Could you tell me / I wonder.',
    examples: [
      { en: 'Could you tell me where the principal office is located?', ar: 'هل يمكنك إخباري أين يقع مكتب مدير المدرسة؟' },
      { en: 'Do you know if the bus to Mukalla has already departed?', ar: 'هل تعلم ما إذا كانت حافلة المكلا قد غادرت بالفعل؟' },
      { en: 'I wonder what time the central library in Seiyun opens.', ar: 'أتساءل في أي وقت ستفتح المكتبة المركزية في سيئون.' }
    ]
  },
  {
    id: 'pdf_chunk_3',
    unit: 3,
    topicAr: 'ترتيب الصفات قبل الاسم (OSASCOMP)',
    topicEn: 'Order of Adjectives',
    page: 14,
    officialText: 'When two or more adjectives are used before a noun, they must follow a fixed sequence in Yemeni exams: 1. Opinion, 2. Size, 3. Age, 4. Shape, 5. Color, 6. Origin, 7. Material, 8. Purpose + Noun.',
    officialGrammarRule: 'Order: Opinion (beautiful, lovely) -> Size (small, large) -> Age (ancient, old, new) -> Shape (round, square) -> Color (black, brown) -> Origin (Hadrami, Yemeni) -> Material (wooden, silk, mud-brick) -> Purpose (sleeping, dining) + Noun.',
    hadramoutExamNotes: 'يأتي غالباً في سؤال الاختيار من متعدد: Arrange adjectives in correct sequence.',
    examples: [
      { en: 'He bought a beautiful small ancient Hadrami carved wooden chest.', ar: 'اشترى صندوقاً خشبياً منحوتاً حضرمياً قديماً وصغيراً وجميلاً.' },
      { en: 'She wore an elegant long black silk dress for the graduation ceremony.', ar: 'ارتدت فستاناً من الحرير الأسود الطويل والأنيق لحفل التخرج.' }
    ]
  },
  {
    id: 'pdf_chunk_4',
    unit: 4,
    topicAr: 'المبني للمجهول (Passive Voice)',
    topicEn: 'Passive Voice Forms',
    page: 19,
    officialText: 'The passive voice is used when the action itself is more important than the agent who performed it, or when the agent is unknown. Form: Object + to be (conjugated in the original tense) + Past Participle (V3).',
    officialGrammarRule: 'Present Simple: am/is/are + V3. Past Simple: was/were + V3. Present Perfect: has/have been + V3. Modals: can/must/will + be + V3.',
    hadramoutExamNotes: 'التركيز على تحويل جمل التراث والعمارة مثل مباني شبام التاريخية إلى المبني للمجهول.',
    examples: [
      { en: 'The historic mud-brick towers in Shibam were constructed hundreds of years ago.', ar: 'شُيّدت الأبراج الطينية التاريخية في شبام منذ مئات السنين.' },
      { en: 'Final exam papers are marked carefully by certified teachers in Mukalla.', ar: 'يتم تصحيح أوراق الامتحانات النهائية بعناية بواسطة معلمين معتمدين في المكلا.' }
    ]
  },
  {
    id: 'pdf_chunk_5',
    unit: 5,
    topicAr: 'الجمل الشرطية (الحالات الأربع)',
    topicEn: 'If-Conditionals (Types 0, 1, 2, 3)',
    page: 26,
    officialText: 'Conditionals in Grade 11: Zero (scientific facts & habits): If + Present Simple, Present Simple. First (probable future): If + Present Simple, will + V1. Second (unreal present): If + Past Simple, would + V1. Third (impossible past): If + Past Perfect (had + V3), would have + V3.',
    officialGrammarRule: 'Pay close attention to comma placement when the If-clause starts the sentence. If placed in the middle, no comma is needed.',
    hadramoutExamNotes: 'يُركز واضعو الامتحانات على تصريف الفعل بين قوسين في جملة جواب الشرط.',
    examples: [
      { en: 'If students revise their lessons daily, they achieve top scores in Hadramout schools.', ar: 'إذا راجع الطلاب دروسهم يومياً، يحققون أعلى الدرجات في مدارس حضرموت.' },
      { en: 'If you study the review booklet thoroughly, you will pass the final English exam.', ar: 'إذا درست كتيّب المراجعة جيداً، ستجتاز امتحان الإنجليزية النهائي بنجاح.' },
      { en: 'If we had known about the seminar earlier, we would have attended it in Mukalla.', ar: 'لو كنا قد علمنا بشأن الندوة في وقت أبكر، لكنا قد حضرناها في المكلا.' }
    ]
  },
  {
    id: 'pdf_chunk_6',
    unit: 6,
    topicAr: 'روابط الماضي المستمر والماضي التام',
    topicEn: 'Past Continuous & Past Perfect Connectors',
    page: 33,
    officialText: 'Connectors of time express relationships between two past actions. While and As are followed by the Past Continuous (was/were + -ing). When can be followed by Past Simple. After and As soon as are followed by the Past Perfect (had + V3) to denote the earlier event.',
    officialGrammarRule: 'While + Past Continuous, Past Simple (interrupted action). After / As soon as + Past Perfect (Action 1), Past Simple (Action 2). Before + Past Simple (Action 2), Past Perfect (Action 1).',
    hadramoutExamNotes: 'دائماً يأتي في أسئلة تصحيح الأفعال بين قوسين: While the doctor (examine)...',
    examples: [
      { en: 'While the teacher was explaining the grammar rule, the power went out suddenly.', ar: 'بينما كان المعلم يشرح قاعدة القواعد، انقطعت الكهرباء فجأة.' },
      { en: 'After the engineer had inspected the generator, the electrical grid was restored.', ar: 'بعد أن كان المهندس قد فحص المولد، استعادت الشبكة الكهربائية عملها.' }
    ]
  },
  {
    id: 'pdf_chunk_7',
    unit: 7,
    topicAr: 'الخدمات والأماكن والسلع',
    topicEn: 'Services, Places and Goods',
    page: 40,
    officialText: 'Matching community goods and services: Pharmacy/Chemist (medicines, prescription drugs), Bakery (bread, pastries, flour), Butcher (meat, poultry), Haberdasher (sewing needles, thread, buttons), Post Office (stamps, parcels, registered mail), Clinic (medical diagnoses, checkups).',
    officialGrammarRule: 'Genitive apostrophe-s denotes the shop (the baker\'s, the butcher\'s, the chemist\'s).',
    hadramoutExamNotes: 'سؤال جدول المفردات: Name the place where you can buy stamps / prescription pills.',
    examples: [
      { en: 'You can collect prescribed antibiotics from the local pharmacy on Main Street.', ar: 'يمكنك استلام المضادات الحيوية الموصوفة طبياً من الصيدلية المحلية في الشارع الرئيسي.' },
      { en: 'The carpenter crafted bespoke wooden window frames for the traditional house.', ar: 'صنع النجار إطارات نوافذ خشبية مصممة خصيصاً للمنزل التقليدي.' }
    ]
  },
  {
    id: 'pdf_chunk_8',
    unit: 8,
    topicAr: 'المصطلحات الطبية والأمثال الصحية',
    topicEn: 'Medical Terms & Health Proverbs',
    page: 46,
    officialText: 'Medical unit coverage: Symptoms, Diagnosis, Prescription, Physician, Specialist, Treatment. Key proverb: "Prevention is better than cure" — meaning it is easier and wiser to prevent an illness before it happens than to treat it after onset.',
    officialGrammarRule: 'Comparative adjectives: better than, more essential than. Proverb structures reflect traditional wisdom.',
    hadramoutExamNotes: 'حفظ المثل: Prevention is better than cure مع فهم دلالته.',
    examples: [
      { en: 'Prevention is better than cure, so regular medical check-ups are essential.', ar: 'الوقاية خير من العلاج، لذلك فإن الفحوصات الطبية الدورية أمر ضروري.' },
      { en: 'The physician diagnosed the persistent cough as a mild respiratory infection.', ar: 'شخّص الطبيب السعال المستمر بأنه التهاب تنفسي خفيف.' }
    ]
  },
  {
    id: 'pdf_chunk_9',
    unit: 9,
    topicAr: 'حقائق الهيكل العظمي البشري',
    topicEn: 'Human Skeleton Facts',
    page: 52,
    officialText: 'Scientific reading text: The adult human body consists of 206 bones. Functions of bones: 1. Protection (the skull/cranium protects the brain; ribs protect heart and lungs). 2. Support (the spine/vertebral column holds the body upright). 3. Movement (joints connecting bones).',
    officialGrammarRule: 'Scientific fact sentences use the Present Simple (consists of, protects, shields, enables).',
    hadramoutExamNotes: 'سؤال قطعة القراءة العلمية وأسئلة الصح والخطأ حول عدد العظام ووظائفها.',
    examples: [
      { en: 'The adult human skeleton consists of 206 individual bones that protect vital organs.', ar: 'يتكون الهيكل العظمي للإنسان البالغ من 206 عظمات تحمي الأعضاء الحيوية.' },
      { en: 'The cranium protects the brain, while the ribcage shields the heart and lungs.', ar: 'تحمي الجمجمة الدماغ، بينما يحمي القفص الصدري القلب والرئتين.' }
    ]
  },
  {
    id: 'pdf_chunk_10',
    unit: 10,
    topicAr: 'كيف يساعد العلم الشرطة (الأدلة الجنائية)',
    topicEn: 'How Science Helps the Police',
    page: 58,
    officialText: 'Forensic science in investigation: Latent fingerprints are left on surfaces due to sweat and natural oils. Because no two people possess identical ridge patterns, fingerprint identification provides conclusive proof. DNA profiling has transformed police work.',
    officialGrammarRule: 'Relative clauses with which/that/who to define evidence: Evidence that links the suspect to the crime scene.',
    hadramoutExamNotes: 'مفردات الدرس: Forensic, latent fingerprints, suspect, investigation, DNA profiling.',
    examples: [
      { en: 'Forensic scientists analyze latent fingerprints to identify suspects with absolute precision.', ar: 'يحلل علماء الأدلة الجنائية البصمات الخفية للتعرف على المشتبه بهم بدقة مطلقة.' },
      { en: 'DNA profiling has revolutionized modern criminal investigations around the globe.', ar: 'أحدثت تقنية البصمة الوراثية ثورة حقيقية في التحقيقات الجنائية الحديثة حول العالم.' }
    ]
  },
  {
    id: 'pdf_chunk_11',
    unit: 11,
    topicAr: 'البادئات ومشتقات الكلمات',
    topicEn: 'Prefixes and Word Derivatives',
    page: 64,
    officialText: 'Affixes change word meaning or part of speech. Negative prefixes: un- (unhappy, unexpected), dis- (disagree, disappear), in-/im- (incorrect, impossible). Suffixes turning verbs into nouns: -ment (development), -tion (information, collection). Adjective suffixes: -ful (careful), -less (careless).',
    officialGrammarRule: 'Root words remain unchanged when adding certain affixes, but spelling adjustments may occur (e.g., beauty -> beautiful).',
    hadramoutExamNotes: 'سؤال اشتقاق الكلمات في الامتحان: Complete with the correct derivative.',
    examples: [
      { en: 'Adding the prefix "un-" turns "expected" into "unexpected", indicating surprise.', ar: 'إضافة البادئة "un-" تحول كلمة "متوقع" إلى "غير متوقع"، مما يدل على المفاجأة.' },
      { en: 'The suffix "-ment" converts the verb "develop" into the noun "development".', ar: 'اللاحقة "-ment" تحول الفعل "يطور" إلى الاسم "تطوير / تنمية".' }
    ]
  },
  {
    id: 'pdf_chunk_12',
    unit: 12,
    topicAr: 'الأفعال القياسية والشاذة في السياق',
    topicEn: 'Regular & Irregular Verbs in Context',
    page: 70,
    officialText: 'Irregular verbs must be memorized with their three forms (Base V1, Past V2, Past Participle V3). Examples: write-wrote-written, speak-spoke-spoken, take-took-taken, build-built-built, drive-drove-driven. Used in Past Simple and Perfect tenses.',
    officialGrammarRule: 'Regular verbs take -ed (or -d). Irregular verbs change vowel sounds or forms completely.',
    hadramoutExamNotes: 'جدول تصريف الأفعال الشاذة الملحق بكتيّب المراجعة الشاملة.',
    examples: [
      { en: 'He wrote an outstanding essay about Hadrami maritime history yesterday.', ar: 'كتب مقالاً متميزاً عن التاريخ البحري الحضرمي يوم أمس.' },
      { en: 'They have spoken English fluently since graduating from secondary school.', ar: 'لقد تحدثوا الإنجليزية بطلاقة منذ تخرجهم من المدرسة الثانوية.' }
    ]
  }
];

export const searchCurriculumKnowledge = (query: string): PDFChunk[] => {
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/).filter(w => w.length > 1);

  return HADRAMOUT_PDF_KNOWLEDGE_CHUNKS.filter(chunk => {
    const haystack = [
      chunk.topicAr,
      chunk.topicEn,
      chunk.officialText,
      chunk.officialGrammarRule,
      chunk.hadramoutExamNotes,
      ...chunk.examples.map(e => e.en + ' ' + e.ar)
    ].join(' ').toLowerCase();

    return words.some(w => haystack.includes(w));
  });
};
