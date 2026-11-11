export interface SentenceItem {
  id: string;
  english: string;
  arabic: string;
  contextAr: string;
  topicId: string;
  topicNameAr: string;
  topicNameEn: string;
  source: 'hadramout_curriculum' | 'everyday_english';
  level: 'beginner' | 'intermediate' | 'advanced';
  grammarPoint?: string;
  vocabulary: { word: string; meaningAr: string }[];
  audioSpeed?: number;
  pdfReference?: {
    pageNumber: number;
    section: string;
    quoteAr: string;
  };
}

export interface CurriculumTopic {
  id: string;
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  unit: number;
  pdfPages: string;
  iconName: string;
  sentences: SentenceItem[];
}

export const HADRAMOUT_CURRICULUM_TOPICS: CurriculumTopic[] = [
  {
    id: 'school_subjects',
    titleAr: 'المواد الدراسية واختصاراتها',
    titleEn: 'School Subjects & Abbreviations',
    summaryAr: 'أسماء المواد المدرسية واختصاراتها الرسمية في منهج الصف الحادي عشر في حضرموت.',
    unit: 1,
    pdfPages: 'ص 3-6',
    iconName: 'GraduationCap',
    sentences: [
      {
        id: 'cur_sub_1',
        english: 'We have Chemistry (Chem.) in the laboratory every Sunday.',
        arabic: 'لدينا مادة الكيمياء في المختبر كل يوم أحد.',
        contextAr: 'استخدام اختصار مادة الكيمياء (Chem.) في سياق جدول الحصص المدرسية.',
        topicId: 'school_subjects',
        topicNameAr: 'المواد الدراسية واختصاراتها',
        topicNameEn: 'School Subjects & Abbreviations',
        source: 'hadramout_curriculum',
        level: 'beginner',
        grammarPoint: 'Present Simple with School Timetable',
        vocabulary: [
          { word: 'Chemistry', meaningAr: 'مادة الكيمياء' },
          { word: 'laboratory', meaningAr: 'المختبر المدرسي' }
        ],
        pdfReference: {
          pageNumber: 3,
          section: 'Unit 1: Education & Subjects',
          quoteAr: 'الجدول الرسمي لاختصارات المواد الدراسية: Chem = Chemistry, Bio = Biology, Maths = Mathematics'
        }
      },
      {
        id: 'cur_sub_2',
        english: 'Biology (Bio.) and Physics (Phys.) require practical experiments.',
        arabic: 'تتطلب مادتا الأحياء والفيزياء إجراء تجارب عملية.',
        contextAr: 'ذكر مادتي الأحياء والفيزياء واختصاراتهما مع الأفعال المناسبة للدراسة العلمية.',
        topicId: 'school_subjects',
        topicNameAr: 'المواد الدراسية واختصاراتها',
        topicNameEn: 'School Subjects & Abbreviations',
        source: 'hadramout_curriculum',
        level: 'intermediate',
        grammarPoint: 'Compound subjects with plural verb',
        vocabulary: [
          { word: 'Biology', meaningAr: 'علم الأحياء' },
          { word: 'Physics', meaningAr: 'علم الفيزياء' },
          { word: 'experiments', meaningAr: 'تجارب علمية' }
        ],
        pdfReference: {
          pageNumber: 4,
          section: 'Unit 1: Scientific Subjects',
          quoteAr: 'مقرر الصف الحادي عشر: Phys for Physics, Bio for Biology'
        }
      },
      {
        id: 'cur_sub_3',
        english: 'Physical Education (P.E.) strengthens both the body and mind.',
        arabic: 'تعمل مادة التربية الرياضية على تقوية الجسد والعقل معاً.',
        contextAr: 'اختصار التربية الرياضية واستخدام الفعل بصيغة المفرد الغائب.',
        topicId: 'school_subjects',
        topicNameAr: 'المواد الدراسية واختصاراتها',
        topicNameEn: 'School Subjects & Abbreviations',
        source: 'hadramout_curriculum',
        level: 'beginner',
        vocabulary: [
          { word: 'Physical Education', meaningAr: 'التربية الرياضية' },
          { word: 'strengthens', meaningAr: 'تقوي' }
        ],
        pdfReference: {
          pageNumber: 5,
          section: 'Unit 1: Abbreviations in Daily School Life',
          quoteAr: 'P.E. = Physical Education'
        }
      }
    ]
  },
  {
    id: 'direct_indirect_questions',
    titleAr: 'الأسئلة المباشرة وغير المباشرة',
    titleEn: 'Direct and Indirect Questions',
    summaryAr: 'طريقة تحويل الأسئلة المباشرة إلى صيغ مهذبة وغير مباشرة في المحادثة والكتابة الرسمية.',
    unit: 2,
    pdfPages: 'ص 8-12',
    iconName: 'HelpCircle',
    sentences: [
      {
        id: 'cur_ques_1',
        english: 'Could you tell me where the principal office is located?',
        arabic: 'هل يمكنك إخباري أين يقع مكتب مدير المدرسة؟',
        contextAr: 'صيغة السؤال غير المباشر المهذب؛ نلاحظ أن الفعل يأتي في النهاية بعد الفاعل وليس قبله.',
        topicId: 'direct_indirect_questions',
        topicNameAr: 'الأسئلة المباشرة وغير المباشرة',
        topicNameEn: 'Direct and Indirect Questions',
        source: 'hadramout_curriculum',
        level: 'intermediate',
        grammarPoint: 'Indirect Question: Could you tell me + Wh-word + Subject + Verb',
        vocabulary: [
          { word: 'principal', meaningAr: 'مدير المدرسة' },
          { word: 'located', meaningAr: 'يقع / موجود' }
        ],
        pdfReference: {
          pageNumber: 9,
          section: 'Grammar Review: Polite Inquiries',
          quoteAr: 'في السؤال غير المباشر نستخدم صيغة الجملة الخبرية بعد أداة الاستفهام: Where the office is وليس Where is the office'
        }
      },
      {
        id: 'cur_ques_2',
        english: 'Do you know if the bus to Mukalla has already departed?',
        arabic: 'هل تعلم ما إذا كانت حافلة المكلا قد غادرت بالفعل؟',
        contextAr: 'استخدام (if / whether) عند تحويل سؤال الإجابة بنعم أو لا (Yes/No Question) إلى سؤال غير مباشر.',
        topicId: 'direct_indirect_questions',
        topicNameAr: 'الأسئلة المباشرة وغير المباشرة',
        topicNameEn: 'Direct and Indirect Questions',
        source: 'hadramout_curriculum',
        level: 'intermediate',
        grammarPoint: 'Indirect Question with If / Whether',
        vocabulary: [
          { word: 'departed', meaningAr: 'غادرت / انطلقت' },
          { word: 'already', meaningAr: 'بالفعل / مسبقاً' }
        ],
        pdfReference: {
          pageNumber: 10,
          section: 'Indirect Questions with Auxiliaries',
          quoteAr: 'إذا كان السؤال المباشر يبدأ بفعل مساعد مثل Has the bus departed? نستخدم if أو whether في السؤال غير المباشر.'
        }
      },
      {
        id: 'cur_ques_3',
        english: 'I wonder what time the central library in Seiyun opens tomorrow.',
        arabic: 'أتساءل في أي وقت ستفتح المكتبة المركزية في سيئون غداً.',
        contextAr: 'صيغة الاستفسار بـ I wonder وما يتبعها من ترتيب الجملة الخبرية.',
        topicId: 'direct_indirect_questions',
        topicNameAr: 'الأسئلة المباشرة وغير المباشرة',
        topicNameEn: 'Direct and Indirect Questions',
        source: 'hadramout_curriculum',
        level: 'advanced',
        grammarPoint: 'Embedded Inquiries: I wonder + question phrase + subject + verb',
        vocabulary: [
          { word: 'wonder', meaningAr: 'أتساءل' },
          { word: 'central library', meaningAr: 'المكتبة المركزية' }
        ],
        pdfReference: {
          pageNumber: 11,
          section: 'Advanced Embedded Questions',
          quoteAr: 'تراكيب التساؤل المهذبة تشمل I wonder... و I would like to know...'
        }
      }
    ]
  },
  {
    id: 'order_of_adjectives',
    titleAr: 'ترتيب الصفات (OSASCOMP)',
    titleEn: 'Order of Adjectives',
    summaryAr: 'القاعدة الدقيقة لترتيب الصفات قبل الاسم: الرأي، الحجم، العمر، الشكل، اللون، الأصل، المادة، الغرض.',
    unit: 3,
    pdfPages: 'ص 14-17',
    iconName: 'Layers',
    sentences: [
      {
        id: 'cur_adj_1',
        english: 'He bought a beautiful small ancient Hadrami carved wooden chest.',
        arabic: 'اشترى صندوقاً خشبياً منحوتاً حضرمياً قديماً وصغيراً وجميلاً.',
        contextAr: 'ترتيب الصفات: الرأي (beautiful)، الحجم (small)، العمر (ancient)، الأصل (Hadrami)، المادة (wooden).',
        topicId: 'order_of_adjectives',
        topicNameAr: 'ترتيب الصفات',
        topicNameEn: 'Order of Adjectives',
        source: 'hadramout_curriculum',
        level: 'advanced',
        grammarPoint: 'Order of Adjectives: Opinion -> Size -> Age -> Origin -> Material',
        vocabulary: [
          { word: 'ancient', meaningAr: 'عتيق / قديم جداً' },
          { word: 'carved', meaningAr: 'منقوش / منحوت' },
          { word: 'chest', meaningAr: 'صندوق خشبي تراثي' }
        ],
        pdfReference: {
          pageNumber: 15,
          section: 'Descriptive Grammar: Adjective Sequence',
          quoteAr: 'قاعدة ترتيب الصفات في منهج الصف الحادي عشر: Opinion ثم Size ثم Age ثم Shape ثم Color ثم Origin ثم Material ثم Noun'
        }
      },
      {
        id: 'cur_adj_2',
        english: 'She wore an elegant long black silk dress for the graduation ceremony.',
        arabic: 'ارتدت فستاناً من الحرير الأسود الطويل والأنيق لحفل التخرج.',
        contextAr: 'تطبيق تسلسل الصفات: الرأي (elegant)، الحجم/الطول (long)، اللون (black)، المادة (silk).',
        topicId: 'order_of_adjectives',
        topicNameAr: 'ترتيب الصفات',
        topicNameEn: 'Order of Adjectives',
        source: 'hadramout_curriculum',
        level: 'intermediate',
        grammarPoint: 'Adjective Sequence: Opinion -> Length -> Color -> Material',
        vocabulary: [
          { word: 'elegant', meaningAr: 'أنيق / راقٍ' },
          { word: 'silk', meaningAr: 'حرير' },
          { word: 'graduation ceremony', meaningAr: 'حفل التخرج' }
        ],
        pdfReference: {
          pageNumber: 16,
          section: 'Adjective Practice Drills',
          quoteAr: 'ملاحظة: تأتي صفات الحجم والشكل قبل صفات اللون والمادة.'
        }
      }
    ]
  },
  {
    id: 'passive_voice',
    titleAr: 'المبني للمجهول (Passive Voice)',
    titleEn: 'Passive Voice',
    summaryAr: 'بناء الجمل للمجهول في الأزمنة المختلفة للتركيز على الحدث بدلاً من الفاعل.',
    unit: 4,
    pdfPages: 'ص 19-24',
    iconName: 'Repeat',
    sentences: [
      {
        id: 'cur_pas_1',
        english: 'The historic mud-brick towers in Shibam were constructed hundreds of years ago.',
        arabic: 'شُيّدت الأبراج الطينية التاريخية في شبام منذ مئات السنين.',
        contextAr: 'المبني للمجهول في الماضي البسيط: were + التصريف الثالث (constructed).',
        topicId: 'passive_voice',
        topicNameAr: 'المبني للمجهول',
        topicNameEn: 'Passive Voice',
        source: 'hadramout_curriculum',
        level: 'intermediate',
        grammarPoint: 'Past Simple Passive: was/were + past participle',
        vocabulary: [
          { word: 'mud-brick', meaningAr: 'طوب طيني (لبن)' },
          { word: 'constructed', meaningAr: 'شُيّدت / بُنيت' }
        ],
        pdfReference: {
          pageNumber: 20,
          section: 'Passive Voice: Historical Architecture',
          quoteAr: 'صيغة المبني للمجهول في الماضي: Object + was/were + Past Participle'
        }
      },
      {
        id: 'cur_pas_2',
        english: 'Final exam papers are marked carefully by certified teachers in Mukalla.',
        arabic: 'يتم تصحيح أوراق الامتحانات النهائية بعناية بواسطة معلمين معتمدين في المكلا.',
        contextAr: 'المبني للمجهول في المضارع البسيط: are + التصريف الثالث (marked).',
        topicId: 'passive_voice',
        topicNameAr: 'المبني للمجهول',
        topicNameEn: 'Passive Voice',
        source: 'hadramout_curriculum',
        level: 'intermediate',
        grammarPoint: 'Present Simple Passive: am/is/are + past participle',
        vocabulary: [
          { word: 'marked', meaningAr: 'تُصحح / تُقيّم' },
          { word: 'certified', meaningAr: 'معتمدين / مرخصين' }
        ],
        pdfReference: {
          pageNumber: 22,
          section: 'Passive in Educational Contexts',
          quoteAr: 'نستخدم by الفاعل فقط عند الضرورة لإيضاح من قام بالفعل.'
        }
      }
    ]
  },
  {
    id: 'if_conditionals',
    titleAr: 'الجمل الشرطية (If-Conditionals)',
    titleEn: 'If-Conditionals (Types 0, 1, 2, 3)',
    summaryAr: 'شرح الحالات الشرطية الأربع في المنهج اليمني: الصفرية، الأولى، الثانية، والثالثة.',
    unit: 5,
    pdfPages: 'ص 26-31',
    iconName: 'GitBranch',
    sentences: [
      {
        id: 'cur_if_1',
        english: 'If students revise their lessons daily, they achieve top scores in Hadramout schools.',
        arabic: 'إذا راجع الطلاب دروسهم يومياً، يحققون أعلى الدرجات في مدارس حضرموت.',
        contextAr: 'الحالة الشرطية الصفرية (Zero Conditional): حقائق ثابتة وعادات دراسية (مضارع بسيط + مضارع بسيط).',
        topicId: 'if_conditionals',
        topicNameAr: 'الجمل الشرطية',
        topicNameEn: 'If-Conditionals',
        source: 'hadramout_curriculum',
        level: 'beginner',
        grammarPoint: 'Zero Conditional: If + Present Simple, Present Simple',
        vocabulary: [
          { word: 'revise', meaningAr: 'يراجع / يذاكر' },
          { word: 'achieve', meaningAr: 'يحقق / ينال' }
        ],
        pdfReference: {
          pageNumber: 27,
          section: 'Conditionals Review: Type 0 and 1',
          quoteAr: 'Zero conditional يعبر عن الحقائق العلمية والعادات الثابتة.'
        }
      },
      {
        id: 'cur_if_2',
        english: 'If you study the review booklet thoroughly, you will pass the final English exam.',
        arabic: 'إذا درست كتيّب المراجعة جيداً، ستجتاز امتحان الإنجليزية النهائي بنجاح.',
        contextAr: 'الحالة الشرطية الأولى (First Conditional): احتمال حقيقي في المستقبل (مضارع بسيط + will).',
        topicId: 'if_conditionals',
        topicNameAr: 'الجمل الشرطية',
        topicNameEn: 'If-Conditionals',
        source: 'hadramout_curriculum',
        level: 'intermediate',
        grammarPoint: 'First Conditional: If + Present Simple, will + base verb',
        vocabulary: [
          { word: 'thoroughly', meaningAr: 'بدقة وبشكل شامل' },
          { word: 'pass', meaningAr: 'يجتاز بنجاح' }
        ],
        pdfReference: {
          pageNumber: 28,
          section: 'First Conditional Patterns',
          quoteAr: 'First conditional يعبر عن نتائج محتملة في المستقبل: If + Present, will + Verb'
        }
      },
      {
        id: 'cur_if_3',
        english: 'If we had known about the seminar earlier, we would have attended it in Mukalla.',
        arabic: 'لو كنا قد علمنا بشأن الندوة في وقت أبكر، لكنا قد حضرناها في المكلا.',
        contextAr: 'الحالة الشرطية الثالثة (Third Conditional): ندم أو تخيل عكس ما حدث في الماضي (past perfect + would have + p.p).',
        topicId: 'if_conditionals',
        topicNameAr: 'الجمل الشرطية',
        topicNameEn: 'If-Conditionals',
        source: 'hadramout_curriculum',
        level: 'advanced',
        grammarPoint: 'Third Conditional: If + Past Perfect, would have + past participle',
        vocabulary: [
          { word: 'seminar', meaningAr: 'ندوة / حلقة نقاش' },
          { word: 'attended', meaningAr: 'حضر / شارك' }
        ],
        pdfReference: {
          pageNumber: 30,
          section: 'Third Conditional Mastery',
          quoteAr: 'Third conditional يعبر عن ماضٍ افتراضي مستحيل التغيير.'
        }
      }
    ]
  },
  {
    id: 'past_connectors',
    titleAr: 'روابط الماضي المستمر والماضي التام',
    titleEn: 'Past Continuous & Past Perfect Connectors',
    summaryAr: 'استخدام روابط الزمن (while, when, as soon as, before, after) لربط الأحداث المتزامنة والمتعاقبة في الماضي.',
    unit: 6,
    pdfPages: 'ص 33-38',
    iconName: 'Clock',
    sentences: [
      {
        id: 'cur_con_1',
        english: 'While the teacher was explaining the grammar rule, the power went out suddenly.',
        arabic: 'بينما كان المعلم يشرح قاعدة القواعد، انقطعت الكهرباء فجأة.',
        contextAr: 'استخدام While مع الماضي المستمر للدلالة على حدث كان مستمراً عندما قطعه حدث ماضٍ بسيط.',
        topicId: 'past_connectors',
        topicNameAr: 'روابط الماضي المستمر والماضي التام',
        topicNameEn: 'Past Continuous & Past Perfect Connectors',
        source: 'hadramout_curriculum',
        level: 'intermediate',
        grammarPoint: 'While + Past Continuous, Past Simple',
        vocabulary: [
          { word: 'explaining', meaningAr: 'يشرح / يوضح' },
          { word: 'suddenly', meaningAr: 'فجأة' }
        ],
        pdfReference: {
          pageNumber: 34,
          section: 'Time Clauses with While and When',
          quoteAr: 'قاعدة While: يتبعها دائماً ماضٍ مستمر Past Continuous.'
        }
      },
      {
        id: 'cur_con_2',
        english: 'After the engineer had inspected the generator, the electrical grid was restored.',
        arabic: 'بعد أن كان المهندس قد فحص المولد، استعادت الشبكة الكهربائية عملها.',
        contextAr: 'استخدام After مع الماضي التام للحدث الأول الذي وقع وانتهى قبل وقوع الحدث الثاني في الماضي البسيط.',
        topicId: 'past_connectors',
        topicNameAr: 'روابط الماضي المستمر والماضي التام',
        topicNameEn: 'Past Continuous & Past Perfect Connectors',
        source: 'hadramout_curriculum',
        level: 'advanced',
        grammarPoint: 'After + Past Perfect, Past Simple',
        vocabulary: [
          { word: 'inspected', meaningAr: 'عاين / فحص' },
          { word: 'restored', meaningAr: 'أُعيد تشغيلها / استُرجعت' }
        ],
        pdfReference: {
          pageNumber: 36,
          section: 'Sequential Past Events with After / Before',
          quoteAr: 'الحدث الأسبق في الماضي يوضع في زمن الماضي التام had + p.p.'
        }
      }
    ]
  },
  {
    id: 'services_places_goods',
    titleAr: 'الخدمات والأماكن والسلع',
    titleEn: 'Services, Places and Goods',
    summaryAr: 'المفردات التخصصية للأماكن الخدمية، المتاجر، الحرفيين، والسلع المرتبطة بها في المنهج.',
    unit: 7,
    pdfPages: 'ص 40-44',
    iconName: 'Store',
    sentences: [
      {
        id: 'cur_ser_1',
        english: 'You can collect prescribed antibiotics from the local pharmacy on Main Street.',
        arabic: 'يمكنك استلام المضادات الحيوية الموصوفة طبياً من الصيدلية المحلية في الشارع الرئيسي.',
        contextAr: 'الربط بين السلعة الطبية (antibiotics) ومكان تقديم الخدمة (pharmacy).',
        topicId: 'services_places_goods',
        topicNameAr: 'الخدمات والأماكن والسلع',
        topicNameEn: 'Services, Places and Goods',
        source: 'hadramout_curriculum',
        level: 'intermediate',
        vocabulary: [
          { word: 'prescribed', meaningAr: 'موصوفة طبياً' },
          { word: 'antibiotics', meaningAr: 'مضادات حيوية' },
          { word: 'pharmacy', meaningAr: 'صيدلية' }
        ],
        pdfReference: {
          pageNumber: 41,
          section: 'Vocabulary of Community Places & Services',
          quoteAr: 'Pharmacy / Chemist’s: Place where medicines and medical goods are dispensed.'
        }
      },
      {
        id: 'cur_ser_2',
        english: 'The carpenter crafted bespoke wooden window frames for the traditional house.',
        arabic: 'صنع النجار إطارات نوافذ خشبية مصممة خصيصاً للمنزل التقليدي.',
        contextAr: 'المهنة (carpenter) والسلع المصنعة (wooden frames).',
        topicId: 'services_places_goods',
        topicNameAr: 'الخدمات والأماكن والسلع',
        topicNameEn: 'Services, Places and Goods',
        source: 'hadramout_curriculum',
        level: 'intermediate',
        vocabulary: [
          { word: 'carpenter', meaningAr: 'نجار' },
          { word: 'bespoke', meaningAr: 'مصنوع خصيصاً بالطلب' }
        ],
        pdfReference: {
          pageNumber: 42,
          section: 'Trades and Occupations',
          quoteAr: 'Trades: Carpenter, Baker, Grocer, Haberdasher.'
        }
      }
    ]
  },
  {
    id: 'medical_terms_proverbs',
    titleAr: 'المصطلحات الطبية والأمثال الصحية',
    titleEn: 'Medical Terms & Health Proverbs',
    summaryAr: 'المصطلحات الطبية الشائعة والأمثال الإنجليزية الشهيرة في الحفاظ على الصحة والوقاية.',
    unit: 8,
    pdfPages: 'ص 46-50',
    iconName: 'HeartPulse',
    sentences: [
      {
        id: 'cur_med_1',
        english: 'Prevention is better than cure, so regular medical check-ups are essential.',
        arabic: 'الوقاية خير من العلاج، لذلك فإن الفحوصات الطبية الدورية أمر ضروري.',
        contextAr: 'أشهر مثل صحي إنجليزي في منهج الصف الحادي عشر مع سياقه العملي.',
        topicId: 'medical_terms_proverbs',
        topicNameAr: 'المصطلحات الطبية والأمثال الصحية',
        topicNameEn: 'Medical Terms & Health Proverbs',
        source: 'hadramout_curriculum',
        level: 'beginner',
        grammarPoint: 'Comparative adjective: better than',
        vocabulary: [
          { word: 'prevention', meaningAr: 'الوقاية' },
          { word: 'cure', meaningAr: 'العلاج' },
          { word: 'essential', meaningAr: 'أساسي / ضروري' }
        ],
        pdfReference: {
          pageNumber: 47,
          section: 'Health Proverbs and Expressions',
          quoteAr: 'Proverb: Prevention is better than cure.'
        }
      },
      {
        id: 'cur_med_2',
        english: 'The physician diagnosed the persistent cough as a mild respiratory infection.',
        arabic: 'شخّص الطبيب السعال المستمر بأنه التهاب تنفسي خفيف.',
        contextAr: 'مصطلحات الفحص الطبي والتشخيص المتكررة في امتحانات حضرموت.',
        topicId: 'medical_terms_proverbs',
        topicNameAr: 'المصطلحات الطبية والأمثال الصحية',
        topicNameEn: 'Medical Terms & Health Proverbs',
        source: 'hadramout_curriculum',
        level: 'advanced',
        vocabulary: [
          { word: 'diagnosed', meaningAr: 'شخّص المرض' },
          { word: 'persistent', meaningAr: 'مستمر / متواصل' },
          { word: 'respiratory', meaningAr: 'تنفسي / متعلق بالجهاز التنفسي' }
        ],
        pdfReference: {
          pageNumber: 48,
          section: 'Medical Terminology in Exams',
          quoteAr: 'Doctor / Physician, Diagnose, Symptoms, Prescription.'
        }
      }
    ]
  },
  {
    id: 'human_skeleton_facts',
    titleAr: 'حقائق الهيكل العظمي البشري',
    titleEn: 'Human Skeleton Facts',
    summaryAr: 'نصوص القراءة العلمية المقررة حول عظام جسم الإنسان ووظائف الحماية والحركة.',
    unit: 9,
    pdfPages: 'ص 52-56',
    iconName: 'Activity',
    sentences: [
      {
        id: 'cur_skl_1',
        english: 'The adult human skeleton consists of 206 individual bones that protect vital organs.',
        arabic: 'يتكون الهيكل العظمي للإنسان البالغ من 206 عظمات تحمي الأعضاء الحيوية.',
        contextAr: 'حقيقة علمية مقررة في الوحدة العلمية حول عدد العظام ووظيفتها.',
        topicId: 'human_skeleton_facts',
        topicNameAr: 'حقائق الهيكل العظمي البشري',
        topicNameEn: 'Human Skeleton Facts',
        source: 'hadramout_curriculum',
        level: 'intermediate',
        grammarPoint: 'Present Simple for Scientific Facts',
        vocabulary: [
          { word: 'skeleton', meaningAr: 'الهيكل العظمي' },
          { word: 'vital organs', meaningAr: 'الأعضاء الحيوية (كالقلب والدماغ)' }
        ],
        pdfReference: {
          pageNumber: 53,
          section: 'Scientific Reading: The Skeletal System',
          quoteAr: 'An adult skeleton is made up of 206 bones.'
        }
      },
      {
        id: 'cur_skl_2',
        english: 'The cranium protects the brain, while the ribcage shields the heart and lungs.',
        arabic: 'تحمي الجمجمة الدماغ، بينما يحمي القفص الصدري القلب والرئتين.',
        contextAr: 'مقارنة وظائف أجزاء الهيكل العظمي باستخدام رابط التباين while.',
        topicId: 'human_skeleton_facts',
        topicNameAr: 'حقائق الهيكل العظمي البشري',
        topicNameEn: 'Human Skeleton Facts',
        source: 'hadramout_curriculum',
        level: 'advanced',
        vocabulary: [
          { word: 'cranium', meaningAr: 'عظام الجمجمة' },
          { word: 'ribcage', meaningAr: 'القفص الصدري' },
          { word: 'shields', meaningAr: 'يدرأ عن / يحمي كدرع' }
        ],
        pdfReference: {
          pageNumber: 54,
          section: 'Functions of Major Bones',
          quoteAr: 'Skull protects brain, ribs protect heart and lungs, spine supports posture.'
        }
      }
    ]
  },
  {
    id: 'science_helps_police',
    titleAr: 'كيف يساعد العلم الشرطة (Forensic Science)',
    titleEn: 'How Science Helps the Police',
    summaryAr: 'درس الأدلة الجنائية في المنهج: البصمات، تحليل الحمض النووي (DNA)، وفحص مسرح الجريمة.',
    unit: 10,
    pdfPages: 'ص 58-62',
    iconName: 'ShieldCheck',
    sentences: [
      {
        id: 'cur_pol_1',
        english: 'Forensic scientists analyze latent fingerprints to identify suspects with absolute precision.',
        arabic: 'يحلل علماء الأدلة الجنائية البصمات الخفية للتعرف على المشتبه بهم بدقة مطلقة.',
        contextAr: 'المفردات الجنائية المقررة في درس دور العلم في مساعدة أجهزة الأمن والشرطة.',
        topicId: 'science_helps_police',
        topicNameAr: 'كيف يساعد العلم الشرطة',
        topicNameEn: 'How Science Helps the Police',
        source: 'hadramout_curriculum',
        level: 'advanced',
        vocabulary: [
          { word: 'forensic', meaningAr: 'أدلة جنائية' },
          { word: 'latent', meaningAr: 'خفي / غير ظاهر بالعين المجردة' },
          { word: 'suspects', meaningAr: 'المشتبه بهم' }
        ],
        pdfReference: {
          pageNumber: 59,
          section: 'Unit 10: Science in Investigation',
          quoteAr: 'Fingerprint identification is unique to every human being.'
        }
      },
      {
        id: 'cur_pol_2',
        english: 'DNA profiling has revolutionized modern criminal investigations around the globe.',
        arabic: 'أحدثت تقنية البصمة الوراثية (DNA) ثورة حقيقية في التحقيقات الجنائية الحديثة حول العالم.',
        contextAr: 'استخدام المضارع التام (has revolutionized) لبيان أثر الاكتشاف العلمي المستمر.',
        topicId: 'science_helps_police',
        topicNameAr: 'كيف يساعد العلم الشرطة',
        topicNameEn: 'How Science Helps the Police',
        source: 'hadramout_curriculum',
        level: 'advanced',
        grammarPoint: 'Present Perfect for Recent Groundbreaking Discoveries',
        vocabulary: [
          { word: 'profiling', meaningAr: 'تحليل البصمة الوراثية' },
          { word: 'revolutionized', meaningAr: 'أحدث ثورة جذرية' }
        ],
        pdfReference: {
          pageNumber: 61,
          section: 'Forensic DNA Technology',
          quoteAr: 'DNA samples can confirm identity from microscopic traces.'
        }
      }
    ]
  },
  {
    id: 'prefixes_derivatives',
    titleAr: 'البادئات ومشتقات الكلمات',
    titleEn: 'Prefixes and Word Derivatives',
    summaryAr: 'كيف تغير البادئات (un-, re-, dis-, mis-) واللواحق (-tion, -ment, -ful, -less) معاني الكلمات وصيغها.',
    unit: 11,
    pdfPages: 'ص 64-68',
    iconName: 'Puzzle',
    sentences: [
      {
        id: 'cur_pfx_1',
        english: 'Adding the prefix "un-" turns "expected" into "unexpected", indicating surprise.',
        arabic: 'إضافة البادئة "un-" تحول كلمة "متوقع" إلى "غير متوقع"، مما يدل على المفاجأة.',
        contextAr: 'شرح البادئة التي تفيد النفي أو العكس في المفردات المقررة.',
        topicId: 'prefixes_derivatives',
        topicNameAr: 'البادئات ومشتقات الكلمات',
        topicNameEn: 'Prefixes and Word Derivatives',
        source: 'hadramout_curriculum',
        level: 'beginner',
        grammarPoint: 'Prefix un- denotes opposite or negation',
        vocabulary: [
          { word: 'prefix', meaningAr: 'بادئة تسبق جذر الكلمة' },
          { word: 'unexpected', meaningAr: 'غير متوقع' }
        ],
        pdfReference: {
          pageNumber: 65,
          section: 'Word Formation & Affixes',
          quoteAr: 'Negative prefixes: un-, in-, im-, dis-.'
        }
      },
      {
        id: 'cur_pfx_2',
        english: 'The suffix "-ment" converts the verb "develop" into the noun "development".',
        arabic: 'اللاحقة "-ment" تحول الفعل "يطور" إلى الاسم "تطوير / تنمية".',
        contextAr: 'اشتقاق الأسماء من الأفعال عبر اللواحق القياسية.',
        topicId: 'prefixes_derivatives',
        topicNameAr: 'البادئات ومشتقات الكلمات',
        topicNameEn: 'Prefixes and Word Derivatives',
        source: 'hadramout_curriculum',
        level: 'intermediate',
        grammarPoint: 'Noun-forming suffixes (-ment, -tion, -ness)',
        vocabulary: [
          { word: 'suffix', meaningAr: 'لاحقة تلحق بآخر الكلمة' },
          { word: 'development', meaningAr: 'تنمية / تطوير' }
        ],
        pdfReference: {
          pageNumber: 66,
          section: 'Noun and Adjective Derivation',
          quoteAr: 'Verb to Noun: develop -> development, govern -> government.'
        }
      }
    ]
  },
  {
    id: 'verbs_irregular',
    titleAr: 'الأفعال القياسية والشاذة (Verbs)',
    titleEn: 'Regular & Irregular Verbs in Context',
    summaryAr: 'تصريف الأفعال الشاذة والقياسية في جمل تواصلية كاملة مع الترجمة العربية.',
    unit: 12,
    pdfPages: 'ص 70-74',
    iconName: 'BookOpen',
    sentences: [
      {
        id: 'cur_vrb_1',
        english: 'He wrote an outstanding essay about Hadrami maritime history yesterday.',
        arabic: 'كتب مقالاً متميزاً عن التاريخ البحري الحضرمي يوم أمس.',
        contextAr: 'تصريف الفعل الشاذ write -> wrote -> written في جملة ماضٍ بسيط واضحة.',
        topicId: 'verbs_irregular',
        topicNameAr: 'الأفعال القياسية والشاذة',
        topicNameEn: 'Regular & Irregular Verbs',
        source: 'hadramout_curriculum',
        level: 'beginner',
        grammarPoint: 'Past Simple with Irregular Verb: write -> wrote',
        vocabulary: [
          { word: 'outstanding', meaningAr: 'متميز / بارز' },
          { word: 'maritime', meaningAr: 'بحري / ملاحي' }
        ],
        pdfReference: {
          pageNumber: 71,
          section: 'Irregular Verb Tables',
          quoteAr: 'write - wrote - written'
        }
      },
      {
        id: 'cur_vrb_2',
        english: 'They have spoken English fluently since graduating from secondary school.',
        arabic: 'لقد تحدثوا الإنجليزية بطلاقة منذ تخرجهم من المدرسة الثانوية.',
        contextAr: 'استخدام التصريف الثالث (spoken) مع المضارع التام والرابط since.',
        topicId: 'verbs_irregular',
        topicNameAr: 'الأفعال القياسية والشاذة',
        topicNameEn: 'Regular & Irregular Verbs',
        source: 'hadramout_curriculum',
        level: 'intermediate',
        grammarPoint: 'Present Perfect: have + past participle (spoken) + since',
        vocabulary: [
          { word: 'fluently', meaningAr: 'بطلاقة ودون تعثر' },
          { word: 'graduating', meaningAr: 'التخرج' }
        ],
        pdfReference: {
          pageNumber: 72,
          section: 'Verbs of Communication in Perfect Tenses',
          quoteAr: 'speak - spoke - spoken'
        }
      }
    ]
  }
];
