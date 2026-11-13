// Official Grounded Knowledge Base extracted directly from:
// "English Course Comprehensive Review – Grade 11 – Yemeni Curriculum (Hadramout)"
// File path: content/official-curriculum/grade-11-hadramout.pdf (Consolidated 64 Notebook Sheets Master Guide)

export interface PDFCurriculumSection {
  id: string;
  sectionNumber: number;
  titleAr: string;
  titleEn: string;
  pageNumber: number;
  officialContent: string;
  grammarRulesAr: string[];
  notebookExamples: { en: string; ar: string }[];
  workbookExercises: { promptEn: string; answerEn: string; explanationAr: string }[];
  examNotesAr: string;
}

export const OFFICIAL_GRADE_11_HADRAMOUT_PDF: PDFCurriculumSection[] = [
  // Page 1: 1. School Subjects & Abbreviations
  {
    id: 'sec_1_subjects',
    sectionNumber: 1,
    titleAr: 'اختصارات ومسميات المواد المدرسية',
    titleEn: 'School Subjects & Abbreviations',
    pageNumber: 1,
    officialContent: `Official abbreviations and subject names in Grade 11 Yemeni Curriculum (Hadramout):
1. Isla -> Islamic Studies (التربية الإسلامية)
2. Ara -> Arabic (اللغة العربية)
3. Qur -> Quran (القرآن الكريم)
4. Phys -> Physics (الفيزياء)
5. Chem -> Chemistry (الكيمياء)
6. Mathemat -> Mathematics (الرياضيات)
7. Sci -> Science (العلوم العامة)
8. Eng -> English (اللغة الإنجليزية)
9. Biol -> Biology (الأحياء)
10. His -> History (التاريخ)
11. Geog -> Geography (الجغرافيا)`,
    grammarRulesAr: [
      'تُكتب الاختصارات بحرف استهلالي كبير (Capital Letter).',
      'تُستخدم في الجداول المدرسية وكشوفات الدرجات الرسمية في ثانويات حضرموت.'
    ],
    notebookExamples: [
      { en: 'We have Chemistry (Chem.) in the laboratory every Sunday.', ar: 'لدينا مادة الكيمياء في المختبر كل يوم أحد.' },
      { en: 'Islamic Studies (Isla) and Arabic (Ara) are core subjects.', ar: 'التربية الإسلامية واللغة العربية مادتان أساسيتان.' }
    ],
    workbookExercises: [
      {
        promptEn: 'What is the official abbreviation for Mathematics in Grade 11 notes?',
        answerEn: 'Mathemat',
        explanationAr: 'الاختصار المعتمد في ملخص حضرموت لمادة الرياضيات هو Mathemat.'
      },
      {
        promptEn: 'What does "Biol" stand for in the subjects table?',
        answerEn: 'Biology',
        explanationAr: 'اختصار Biol يشير إلى مادة الأحياء Biology.'
      }
    ],
    examNotesAr: 'سؤال ربط أو اختيار من متعدد في الامتحانات الشهرية والنهائية بحضرموت.'
  },

  // Page 1: 2. Direct & Indirect Questions
  {
    id: 'sec_2_indirect_questions',
    sectionNumber: 2,
    titleAr: 'الأسئلة المباشرة وغير المباشرة',
    titleEn: 'Direct & Indirect Questions',
    pageNumber: 1,
    officialContent: `Grammar Rule / قاعدة الجرامر:
To ask questions politely, start with: Can you tell me...? or Do you know...?
خطوات التحويل:
1. نبدل موقع الفاعل والفعل المساعد (نضع الفاعل قبل الفعل المساعد).
2. تُحذف الأفعال المساعدة (do, does, did) مع تحويل الفعل للماضي مع did، وإضافة s/es مع does.

Notebook Examples:
• Direct: Where is the bookshop? ➔ Can you tell me where the bookshop is?
• Direct: When does the coffee shop open? ➔ Do you know when the coffee shop opens?
• Direct: When did the beauty shop close? ➔ Do you know when the beauty shop closed?
• Direct: What is your name? ➔ Can you tell me what your name is?
• Direct: Where can I buy some books? ➔ Do you know where I can buy some books?

Workbook Exercises - Page 4 (W.B):
1) Where can I buy a spade? ➔ Can you tell me where I can buy a spade?
2) How far is the bus station? ➔ Can you tell me how far the bus station is?
3) What time does the bookshop open? ➔ Do you know what time the bookshop opens?`,
    grammarRulesAr: [
      'البدء بالصيغة المهذبة: Can you tell me...? أو Do you know...?',
      'تقديم الفاعل على الفعل المساعد (Subject before Verb).',
      'حذف do / does / did وإعادة تصريف الفعل الرئيسي تبعاً لذلك.'
    ],
    notebookExamples: [
      { en: 'Can you tell me where the bookshop is?', ar: 'هل يمكنك إخباري أين تقع المكتبة؟' },
      { en: 'Do you know when the coffee shop opens?', ar: 'هل تعلم متى يفتح المقهى؟' },
      { en: 'Do you know when the beauty shop closed?', ar: 'هل تعلم متى أغلقت صالة التجميل؟' },
      { en: 'Can you tell me where I can buy a spade?', ar: 'هل يمكنك إخباري من أين يمكنني شراء مجرفة؟' },
      { en: 'Can you tell me how far the bus station is?', ar: 'هل يمكنك إخباري كم تبعد محطة الحافلات؟' }
    ],
    workbookExercises: [
      {
        promptEn: 'Where can I buy a spade? (Make indirect)',
        answerEn: 'Can you tell me where I can buy a spade?',
        explanationAr: 'نبدأ بـ Can you tell me ونضع الفاعل I قبل الفعل المساعد can.'
      },
      {
        promptEn: 'When did the beauty shop close? (Make indirect)',
        answerEn: 'Do you know when the beauty shop closed?',
        explanationAr: 'تُحذف did ويتحول الفعل close إلى الماضي closed.'
      }
    ],
    examNotesAr: 'سؤال ثابت لا يخلو منه أي امتحان في حضرموت لكتابة السؤال المهذب بصيغة صحيحة.'
  },

  // Page 2: 3. Order of Adjectives (OSASCOMP)
  {
    id: 'sec_3_order_adjectives',
    sectionNumber: 3,
    titleAr: 'ترتيب الصفات (قاعدة OSASCOMP)',
    titleEn: 'Order of Adjectives (OSASCOMP)',
    pageNumber: 2,
    officialContent: `The OSASCOMP Sequence:
1. Opinion: beautiful, good, handsome, interesting, nice, pretty, horrible.
2. Size / Build: tall, big, short, small, long.
3. Age: old, young, new, 20 years old.
4. Shape: round, straight, rectangular.
5. Colour: red, black, white, blue, brown, dark.
6. Nationality: Yemeni, Qatari, Omani, British.
7. Material: metal, plastic, glass, wood, iron.

Reorder Adjectives Practice from Notes:
1) bag: brown / nice / small ➔ a nice small brown bag
2) hair: long / dark / pretty ➔ pretty long dark hair
3) city: old / interesting ➔ an interesting old city
4) car: iron / new / white / horrible ➔ a horrible new white iron car
5) beard: black / long ➔ a long black beard
6) bag: paper / yellow / small ➔ a small yellow paper bag
7) eyes: brown / big / lovely ➔ lovely big brown eyes
8) door: small / iron / bad ➔ a bad small iron door
9) city: amazing / old ➔ an amazing old city`,
    grammarRulesAr: [
      'الترتيب المعتمد: Opinion -> Size -> Age -> Shape -> Colour -> Nationality -> Material + Noun',
      'الصفات العامة (Opinion) تسبق الصفات الوصفية الموضوعية (Size, Age, Colour).'
    ],
    notebookExamples: [
      { en: 'He bought a nice small brown bag.', ar: 'اشترى حقيبة بنية صغيرة لطيفة.' },
      { en: 'She has pretty long dark hair.', ar: 'لديها شعر داكن طويل جميل.' },
      { en: 'Mukalla is an amazing old city.', ar: 'المكلا مدينة قديمة مذهلة.' },
      { en: 'They installed a bad small iron door.', ar: 'قاموا بتركيب باب حديدي صغير رديء.' }
    ],
    workbookExercises: [
      {
        promptEn: 'Reorder: (brown / nice / small) bag',
        answerEn: 'a nice small brown bag',
        explanationAr: 'الرأي (nice) ثم الحجم (small) ثم اللون (brown).'
      },
      {
        promptEn: 'Reorder: (iron / new / white / horrible) car',
        answerEn: 'a horrible new white iron car',
        explanationAr: 'الرأي (horrible) ثم العمر (new) ثم اللون (white) ثم المادة (iron).'
      }
    ],
    examNotesAr: 'يأتي غالباً في سؤال: Re-arrange the adjectives in correct order.'
  },

  // Page 2: 4. Passive Voice Rules
  {
    id: 'sec_4_passive_voice',
    sectionNumber: 4,
    titleAr: 'المبني للمجهول في جميع الأزمنة',
    titleEn: 'Passive Voice Rules in All Tenses',
    pageNumber: 2,
    officialContent: `Passive Structure in Yemeni Curriculum Grade 11:
• Present Simple: Obj + is / are + V3 | He cleans his car. ➔ His car is cleaned.
• Past Simple: Obj + was / were + V3 | Ali visited his sister. ➔ His sister was visited.
• Present Continuous: Obj + is / are + being + V3 | She is making coffee now. ➔ Coffee is being made now.
• Past Continuous: Obj + was / were + being + V3 | My mother was cooking fish. ➔ Fish was being cooked.
• Present Perfect: Obj + has / have + been + V3 | I have done my homework. ➔ My homework has been done.
• Past Perfect: Obj + had + been + V3 | I had finished my work. ➔ My work had been finished.
• Future & Modals: Obj + modal + be + V3 | He will buy a car. ➔ A car will be bought.`,
    grammarRulesAr: [
      'تحويل المفعول به ليصبح في موقع الفاعل (المبتدأ).',
      'إضافة فعل الكينونة to be في نفس زمن الجملة الأصلية.',
      'تحويل الفعل الأساسي دائماً إلى التصريف الثالث (Past Participle - V3).'
    ],
    notebookExamples: [
      { en: 'His car is cleaned every Friday.', ar: 'تُنظف سيارته كل يوم جمعة.' },
      { en: 'His sister was visited by Ali yesterday.', ar: 'تمت زيارة أخته من قِبل علي أمس.' },
      { en: 'Coffee is being made now.', ar: 'القهوة تُحضّر الآن.' },
      { en: 'Fish was being cooked when guests arrived.', ar: 'السمك كان يُطهى عند وصول الضيوف.' },
      { en: 'My homework has been done.', ar: 'تم إنجاز واجبي المنزلي.' },
      { en: 'A car will be bought next week.', ar: 'سيتم شراء سيارة الأسبوع القادم.' }
    ],
    workbookExercises: [
      {
        promptEn: 'Change to passive: "She is making coffee now."',
        answerEn: 'Coffee is being made now.',
        explanationAr: 'في المضارع المستمر: is + being + made (V3).'
      },
      {
        promptEn: 'Change to passive: "Ali visited his sister."',
        answerEn: 'His sister was visited.',
        explanationAr: 'في الماضي البسيط: was + visited (V3).'
      }
    ],
    examNotesAr: 'سؤال وزاري متكرر: Change the following sentences into Passive Voice.'
  },

  // Page 2: 5. If-Conditionals
  {
    id: 'sec_5_conditionals',
    sectionNumber: 5,
    titleAr: 'الجمل الشرطية (النوع الأول والثاني)',
    titleEn: 'If-Conditionals (Type 1 & Type 2)',
    pageNumber: 2,
    officialContent: `If-Conditionals in Grade 11:
Type 1 (المضارع والنتيجة المستقبلية):
Formula: If + Subject + V1 , Subject + will + infinitive
Example: If I go to park, I will be happy.

Type 2 (الماضي والنتيجة الافتراضية):
Formula: If + Subject + V2 , Subject + would + infinitive
Example: If you ran, you would catch the bus.

ملاحظة هامة من الملخص:
إذا جاء جواب الشرط في البداية لا نضع فاصلة (comma) في المنتصف.
مثال: You will catch the bus if you run.`,
    grammarRulesAr: [
      'النوع الأول: إمكانية حقيقية في المستقبل (مضارع بسيط + will ومصدر).',
      'النوع الثاني: موقف افتراضي أو خيالي غير واقعي حالياً (ماضي بسيط + would ومصدر).',
      'مكان الفاصلة: توضع فقط إذا بدأت الجملة بـ If.'
    ],
    notebookExamples: [
      { en: 'If I go to park, I will be happy.', ar: 'إذا ذهبت إلى الحديقة، سأكون سعيداً.' },
      { en: 'If you ran, you would catch the bus.', ar: 'لو ركضت، للحقت بالحافلة.' },
      { en: 'You will catch the bus if you run.', ar: 'ستلحق بالحافلة إذا ركضت.' }
    ],
    workbookExercises: [
      {
        promptEn: 'Complete: If you ran, you _____ catch the bus.',
        answerEn: 'would',
        explanationAr: 'لأن فعل الشرط ماضٍ بسيط (ran) فالجواب يكون would + infinitive (Type 2).'
      }
    ],
    examNotesAr: 'تصحيح الأفعال بين الأقواس (Correct the verb between brackets).'
  },

  // Page 3: 6. Past Continuous & Past Perfect Connectors
  {
    id: 'sec_6_connectors',
    sectionNumber: 6,
    titleAr: 'أدوات الربط مع الماضي (When / While / Past Perfect)',
    titleEn: 'Past Continuous & Past Perfect Connectors',
    pageNumber: 3,
    officialContent: `1) Past Continuous with When / While:
• Subject + was/were + V-ing + When + Subject + V2
Example: My mother was cooking when I came.
• While + Subject + was/were + V-ing , Subject + V2
Example: While I was sleeping, my friend called me.

2) Past Perfect Structure:
• Subject + had + V3 , Subject + V2
Example: Ali had come when his friend arrived.`,
    grammarRulesAr: [
      'قاعدة While: يليها دائماً ماضٍ مستمر (was/were + -ing).',
      'قاعدة When: يليها غالباً ماضٍ بسيط (V2).',
      'الماضي التام (had + V3) يعبر عن الحدث الأسبق في الحدوث.'
    ],
    notebookExamples: [
      { en: 'My mother was cooking when I came.', ar: 'كانت والدتي تطبخ عندما أتيت.' },
      { en: 'While I was sleeping, my friend called me.', ar: 'بينما كنت نائماً، اتصل بي صديقي.' },
      { en: 'Ali had come when his friend arrived.', ar: 'كان علي قد جاء بالفعل عندما وصل صديقه.' }
    ],
    workbookExercises: [
      {
        promptEn: 'Fill in: _____ I was sleeping, my friend called me.',
        answerEn: 'While',
        explanationAr: 'استخدام While لأن الجملة التي تليها في صيغة الماضي المستمر was sleeping.'
      }
    ],
    examNotesAr: 'دائماً يأتي في أسئلة اختيار الرابط الصحيح (While / When).'
  },

  // Page 3: 7. Services, Places & Goods
  {
    id: 'sec_7_services_places',
    sectionNumber: 7,
    titleAr: 'الخدمات وأماكن الشراء وتصنيف السلع',
    titleEn: 'Services, Places & Goods Classification',
    pageNumber: 3,
    officialContent: `Official Table from Grade 11 Summary:
• Medicine & Thermometer ➔ We can buy medicine and thermometer at Pharmacy
• Stamps ➔ We can buy stamps at Post office
• Bread ➔ We can buy bread at Bakery
• Vegetables ➔ We can buy vegetables at Supermarket
• Cooker & Fridge ➔ Cooker and fridge are classified as electrical goods
• Blankets ➔ Blankets are classified as bedding
• Trousers ➔ Trousers are classified as menswear
• Skirts ➔ Skirts are classified as ladieswear`,
    grammarRulesAr: [
      'حروف الجر المكانية مع الأماكن الخدمية (at the Pharmacy, at the Post office).',
      'تصنيفات البضائع في المتاجر الكبرى (electrical goods, bedding, menswear, ladieswear).'
    ],
    notebookExamples: [
      { en: 'We can buy medicine and thermometer at Pharmacy.', ar: 'يمكننا شراء الدواء وميزان الحرارة من الصيدلية.' },
      { en: 'We can buy stamps at Post office.', ar: 'يمكننا شراء الطوابع من مكتب البريد.' },
      { en: 'Cooker and fridge are classified as electrical goods.', ar: 'يُصنف الموقد والثلاجة كأجهزة كهربائية.' },
      { en: 'Blankets are classified as bedding.', ar: 'تُصنف البطانيات كأغطية ومفارش سرير.' },
      { en: 'Trousers are classified as menswear.', ar: 'تُصنف السراويل كملابس رجالية.' }
    ],
    workbookExercises: [
      {
        promptEn: 'Where can we buy stamps?',
        answerEn: 'at Post office',
        explanationAr: 'شراء الطوابع يتم في مكتب البريد Post office.'
      },
      {
        promptEn: 'How are blankets classified?',
        answerEn: 'bedding',
        explanationAr: 'البطانيات تصنف ضمن المفروشات bedding.'
      }
    ],
    examNotesAr: 'سؤال Match the item with the correct shop/category.'
  },

  // Page 3: 8. Medical Terms & Health Proverbs
  {
    id: 'sec_8_medical_terms_proverbs',
    sectionNumber: 8,
    titleAr: 'المصطلحات والأمثال الطبية والصحية',
    titleEn: 'Medical Terms & Health Proverbs',
    pageNumber: 3,
    officialContent: `Official Definitions from Summary:
• Microscope: makes small things look larger.
• Thermometer: used to take temperature.
• Teenager: people between 13 and 19 years old.
• Bandage: used for small cuts.
• X-ray: picture for broken bones.
• Giggle: laugh (ضحك / ابتسامة).
• Flew downstairs: ran very fast (نزل مسرعاً).
• Panting: breath fast (يلهث).

Equivalents in curriculum:
Exercise, Flu, Immunized-Cholera, Fats-Healthy, Disinfectant-Infection, Cough-Smoking, Prescription-Tablets, Balanced-Vitamins.

Health Proverbs (أمثال صحية مشهورة):
1) An apple a day keeps the doctor away.
2) Prevention is better than cure.
3) Coughs and sneezes spread diseases.`,
    grammarRulesAr: [
      'استخدام صيغ التعريف (Relative clauses: used to take..., makes small things...).',
      'حفظ الأمثال الصحية كقوالب لغوية ثابتة.'
    ],
    notebookExamples: [
      { en: 'Microscope makes small things look larger.', ar: 'المجهر يجعل الأشياء الصغيرة تبدو أكبر.' },
      { en: 'Bandage is used for small cuts.', ar: 'الضمادة تُستخدم للجروح الصغيرة.' },
      { en: 'An apple a day keeps the doctor away.', ar: 'تفاحة في اليوم تغنيك عن الطبيب.' },
      { en: 'Prevention is better than cure.', ar: 'الوقاية خير من العلاج.' },
      { en: 'Coughs and sneezes spread diseases.', ar: 'السعال والعطاس ينشران الأمراض.' }
    ],
    workbookExercises: [
      {
        promptEn: 'What instrument is used to take temperature?',
        answerEn: 'Thermometer',
        explanationAr: 'ميزان الحرارة Thermometer يستخدم لقياس درجة الحرارة.'
      },
      {
        promptEn: 'Complete the proverb: "Prevention is better than _____."',
        answerEn: 'cure',
        explanationAr: 'المثل المعتمد: Prevention is better than cure (الوقاية خير من العلاج).'
      }
    ],
    examNotesAr: 'سؤال حفظ وتكملة الأمثال الصحية ومطابقة أجهزة التشخيص بتعريفاتها.'
  },

  // Page 3-4: 9. Biology: The Human Skeleton Facts
  {
    id: 'sec_9_skeleton_facts',
    sectionNumber: 9,
    titleAr: 'حقائق الهيكل العظمي البشري',
    titleEn: 'Biology: The Human Skeleton Facts',
    pageNumber: 4,
    officialContent: `Official Q&A and Facts:
• What is the main nerve in the body? ➔ The Spinal cord
• When do our rib bones move? ➔ When we breath
• How many ligaments are there in the foot? ➔ More than 100
• Newborn baby has 275 bones. ➔ True (T)
• The foot and the spine have 26 bones. ➔ True (T)
• Bones are the hardest tissues in the body. ➔ True (T)
• The foot has a very simple structure. ➔ False (F) (Complicated)
• The skull has 22 bones. ➔ True (T)
• An adult has more bones than a baby. ➔ False (F) (206 bones - less)
• All the bones in the skull protect the brain. ➔ False (F) (Only 8 protect brain)`,
    grammarRulesAr: [
      'حقائق بيولوجية مصاغة في زمن المضارع البسيط (Scientific Present Simple).',
      'صيغ المقارنة (more bones than, hardest tissues).'
    ],
    notebookExamples: [
      { en: 'The Spinal cord is the main nerve in the human body.', ar: 'الحبل الشوكي هو العصب الرئيسي في جسم الإنسان.' },
      { en: 'Our rib bones move when we breath.', ar: 'عظام الأضلاع تتحرك عندما نتنفس.' },
      { en: 'An adult has 206 bones, while a newborn baby has 275 bones.', ar: 'للإنسان البالغ 206 عظمات، بينما لدى الطفل حديث الولادة 275 عظمة.' },
      { en: 'Only 8 bones in the skull protect the brain.', ar: '8 عظام فقط في الجمجمة هي التي تحمي الدماغ.' }
    ],
    workbookExercises: [
      {
        promptEn: 'True or False: An adult has more bones than a baby.',
        answerEn: 'False (An adult has 206, baby has 275)',
        explanationAr: 'خطأ؛ فالإنسان البالغ لديه 206 عظمة أي أقل من الرضيع الذي يملك 275 عظمة.'
      },
      {
        promptEn: 'How many bones in the skull protect the brain?',
        answerEn: 'Only 8 bones',
        explanationAr: 'من بين 22 عظمة في الجمجمة، 8 عظام فقط تحمي الدماغ.'
      }
    ],
    examNotesAr: 'أسئلة الصح والخطأ والاختيارات في اختبارات القراءة العلمية بحضرموت.'
  },

  // Page 4: 10. How Science Helps the Police
  {
    id: 'sec_10_forensic_science',
    sectionNumber: 10,
    titleAr: 'كيف يساعد العلم الشرطة (الأدلة الجنائية)',
    titleEn: 'How Science Helps the Police',
    pageNumber: 4,
    officialContent: `What sciences help the police?
➔ Fingerprints, DNA, Identikit picture, Computer.

Official Terms and Definitions:
• Kit: Set of equipment.
• Witness: Somebody who has seen a crime.
• Molecule: Small groups of atoms.
• Drop: Spot of liquid.
• Acid: A chemical.
• Cells: Small parts of living matter.
• Scene of a crime: Where a crime is committed.
• Moisture: Very small quantity of water.
• Forensic Science: Helps the police fight crime.

True / False Facts from Curriculum:
1) DNA is in our hair, skin, blood and bones. ➔ True (T)
2) DNA determines our character. ➔ False (F) (Determines genetic characteristics)
3) Each individual has different DNA molecules. ➔ True (T)
4) Just one drop of blood is enough to identify a criminal. ➔ True (T)
5) Our body is made up of millions of cells. ➔ True (T)
6) The structure of DNA is like a ladder. ➔ True (T)`,
    grammarRulesAr: [
      'تراكيب الجمل المبنية للمجهول في التحقيق الجنائي (where a crime is committed).',
      'التشبيهات العلمية (structure of DNA is like a ladder).'
    ],
    notebookExamples: [
      { en: 'Forensic Science helps the police fight crime.', ar: 'تساعد الأدلة الجنائية الشرطة في مكافحة الجريمة.' },
      { en: 'DNA is found in our hair, skin, blood and bones.', ar: 'يوجد الحمض النووي (DNA) في شعرنا وجلدنا ودمنا وعظامنا.' },
      { en: 'Just one drop of blood is enough to identify a criminal.', ar: 'قطرة دم واحدة تكفي لتحديد هوية المجرم.' },
      { en: 'The structure of DNA is like a ladder.', ar: 'تركيب الحمض النووي يشبه السلّم.' }
    ],
    workbookExercises: [
      {
        promptEn: 'Define "Witness" from Grade 11 notes:',
        answerEn: 'Somebody who has seen a crime.',
        explanationAr: 'الشاهد هو شخص رأى وقوع الجريمة.'
      },
      {
        promptEn: 'True or False: DNA determines our character.',
        answerEn: 'False',
        explanationAr: 'خطأ؛ الـ DNA يحدد الخصائص الوراثية وليس الطباع أو الشخصية.'
      }
    ],
    examNotesAr: 'سؤال المصطلحات وحقائق الـ DNA في أسئلة القطع والفهم.'
  },

  // Page 4-5: 11. Prefixes & Word Derivatives
  {
    id: 'sec_11_prefixes_derivatives',
    sectionNumber: 11,
    titleAr: 'البادئات ومشتقات الكلمات',
    titleEn: 'Prefixes & Word Derivatives',
    pageNumber: 5,
    officialContent: `Prefixes Rules:
• im- (قبل حرف p): possible ➔ impossible | polite ➔ impolite
• dis-: agree ➔ disagree | infect ➔ disinfect | like ➔ dislike | appear ➔ disappear | obey ➔ disobey
• un-: necessary ➔ unnecessary | expected ➔ unexpected | fit ➔ unfit | happy ➔ unhappy | friendly ➔ unfriendly | healthy ➔ unhealthy

Verb to Noun table:
Suggest ➔ Suggestion
Educate ➔ Education
Regulate ➔ Regulation
Define ➔ Definition
Emigrate ➔ Emigration
Serve ➔ Service
Respect ➔ Respect
Search ➔ Search
Enter ➔ Entrance
Own ➔ Owner
Carry ➔ Carrier

Noun to Adjective table:
Danger ➔ Dangerous
Superstition ➔ Superstitious
Mountain ➔ Mountainous
Agriculture ➔ Agricultural
Department ➔ Departmental
History ➔ Historical
Office ➔ Official
Architecture ➔ Architectural
Industry ➔ Industrial
Electricity ➔ Electrical
Tradition ➔ Traditional`,
    grammarRulesAr: [
      'البادئة im- تأتي قبل الكلمات البادئة بحرف p (polite -> impolite, possible -> impossible).',
      'البادئة dis- تنفي الأفعال (agree -> disagree, obey -> disobey).',
      'البادئة un- تنفي الصفات والكلمات (necessary -> unnecessary, friendly -> unfriendly).'
    ],
    notebookExamples: [
      { en: 'Adding "im-" turns "polite" into "impolite".', ar: 'إضافة البادئة im- تحول مهذب إلى غير مهذب.' },
      { en: 'The noun of "Suggest" is "Suggestion".', ar: 'الاسم من الفعل يقترح هو اقتراح Suggestion.' },
      { en: 'The adjective of "Tradition" is "Traditional".', ar: 'الصفة من الاسم تقليد هي تقليدي Traditional.' }
    ],
    workbookExercises: [
      {
        promptEn: 'What is the opposite of "possible" using a prefix?',
        answerEn: 'impossible',
        explanationAr: 'نضيف im- قبل الكلمات التي تبدأ بـ p.'
      },
      {
        promptEn: 'Give the noun of "Educate":',
        answerEn: 'Education',
        explanationAr: 'تحويل الفعل Educate إلى اسم Education بإضافة -tion.'
      }
    ],
    examNotesAr: 'سؤال ثابت في كل امتحان: Complete with the correct word derivative.'
  },

  // Page 5: 12. Vocabulary, Synonyms & Antonyms
  {
    id: 'sec_12_synonyms_antonyms',
    sectionNumber: 12,
    titleAr: 'المترادفات والأضداد وتعريف المهن',
    titleEn: 'Vocabulary, Synonyms, Antonyms & Jobs',
    pageNumber: 5,
    officialContent: `Synonyms (المترادفات):
• Reasonable = Not bad
• Died = Stopped
• Previous occasions = Before
• Beyond repair = Could not be fixed
• Without success = Failed
• Towing the boat = Pulling
• Confident = Sure
• Eventually = In the end
• Saved = Destroyed (context notes)
• Burning too strongly = Blazing
• Hurt = Injured
• Taken very quickly = Rushed
• Rules = Regulations
• Check = Examine
• Nearly = Almost
• Silly = Stupid
• Sick = Ill

Antonyms (الأضداد):
• Careful ➔ Careless
• Leaving ➔ Entering
• Emigration ➔ Immigration
• Disobey ➔ Obey
• Difficult ➔ Easy

Jobs & Definitions (المهن والوظائف):
• Traffic policeman: Make roads safe.
• Fireman: Put out fires.
• Immigration officer: Check people entering/leaving.
• Police helicopter pilot: Help people in trouble.
• Doctor: Treat the people.
• Housewife: Take care of family.
• Dressmaker: Make dresses.
• Motorist: Drives cars/buses.
• Cyclist: Rides bikes.
• Pedestrian: Walks in streets.`,
    grammarRulesAr: [
      'التفريق بين المترادفات والكلمات المضادة.',
      'صياغة تعريفات المهن باستخدام أفعال المضارع البسيط (Make roads safe, Put out fires).'
    ],
    notebookExamples: [
      { en: 'Confident means sure.', ar: 'واثق Confident تعني متأكد Sure.' },
      { en: 'The opposite of careful is careless.', ar: 'عكس حذر هو مهمل Careless.' },
      { en: 'A traffic policeman makes roads safe.', ar: 'شرطي المرور يجعل الطرق آمنة.' },
      { en: 'A pedestrian is somebody who walks in streets.', ar: 'المشاة هو من يمشي على قدميه في الشوارع.' }
    ],
    workbookExercises: [
      {
        promptEn: 'What is the synonym of "Confident"?',
        answerEn: 'Sure',
        explanationAr: 'مرادف Confident هو Sure (متأكد).'
      },
      {
        promptEn: 'Who puts out fires?',
        answerEn: 'Fireman',
        explanationAr: 'رجل الإطفاء Fireman هو من يخمد النيران.'
      }
    ],
    examNotesAr: 'سؤال الكلمات والمترادفات وتعريفات المهن في القسم الأول من الامتحان.'
  },

  // Page 5-6: 13. Irregular & Regular Verbs Master Table
  {
    id: 'sec_13_verbs_table',
    sectionNumber: 13,
    titleAr: 'جدول تصاريف الأفعال القياسية والشاذة',
    titleEn: 'Irregular & Regular Verbs Master Table',
    pageNumber: 6,
    officialContent: `Master Verb Table from Consolidated Guide:
V1 (Infinitive) | V2 (Past Simple) | V3 (Past Participle)
Help | Helped | Helped
Watch | Watched | Watched
Eat | Ate | Eaten
Cook | Cooked | Cooked
See | Saw | Seen
Close | Closed | Closed
Put | Put | Put
Break | Broke | Broken
Go | Went | Gone
Make | Made | Made
Find | Found | Found
Buy | Bought | Bought
Write | Wrote | Written
Visit | Visited | Visited
Clean | Cleaned | Cleaned
Read | Read | Read
Run | Ran | Run
Finish | Finished | Finished
Work | Worked | Worked
Drink | Drank | Drunk
Do/Does | Did | Done
Live | Lived | Lived`,
    grammarRulesAr: [
      'الأفعال القياسية تأخذ -ed في التصريفين الثاني والثالث (Help - Helped - Helped).',
      'الأفعال الشاذة تتغير حروف العلة فيها أو تبقى كما هي (Put - Put - Put, Write - Wrote - Written).'
    ],
    notebookExamples: [
      { en: 'He wrote an excellent essay yesterday.', ar: 'كتب مقالاً ممتازاً يوم أمس.' },
      { en: 'She has eaten breakfast already.', ar: 'لقد تناولت وجبة الإفطار بالفعل.' },
      { en: 'They have gone to Mukalla.', ar: 'لقد ذهبوا إلى المكلا.' }
    ],
    workbookExercises: [
      {
        promptEn: 'What is the V3 of "Break"?',
        answerEn: 'Broken',
        explanationAr: 'التصريف الثالث للفعل Break هو Broken.'
      },
      {
        promptEn: 'What is the V2 of "Buy"?',
        answerEn: 'Bought',
        explanationAr: 'التصريف الثاني (الماضي) للفعل Buy هو Bought.'
      }
    ],
    examNotesAr: 'جدول الحفظ الإلزامي لجميع الأزمنة التامة والمبني للمجهول.'
  }
];

const SEARCH_STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'what', 'when', 'where', 'which', 'how',
  'who', 'why', 'are', 'was', 'were', 'been', 'being', 'have', 'has', 'had', 'does', 'did',
  'can', 'could', 'would', 'should', 'will', 'about', 'into', 'than', 'then', 'your', 'you',
  'they', 'their', 'there', 'here', 'some', 'more', 'briefly', 'explain', 'please', 'tell',
  'arabic', 'english', 'sentence', 'sentences', 'word', 'words', 'rule', 'rules', 'example',
  'examples', 'lesson', 'lessons', 'grade', 'page', 'help', 'question', 'answer', 'meaning',
  'in', 'on', 'at', 'to', 'of', 'is', 'it', 'by', 'or', 'as', 'an', 'be',
  'من', 'في', 'على', 'عن', 'إلى', 'الى', 'ما', 'ماذا', 'كيف', 'متى', 'أين', 'هل', 'هذا',
  'هذه', 'ذلك', 'تلك', 'هو', 'هي', 'هم', 'مع', 'بين', 'او', 'أو', 'ثم', 'أن', 'إن', 'كان',
  'كانت', 'يكون', 'اشرح', 'وضح', 'أعطني', 'لي', 'لنا', 'بالعربية', 'بالإنجليزية', 'باختصار',
  'جملة', 'جمل', 'كلمة', 'كلمات', 'قاعدة', 'قواعد', 'مثال', 'أمثلة', 'درس', 'سؤال', 'معنى'
]);

export const searchOfficialCurriculum = (query: string): PDFCurriculumSection[] => {
  const q = query.toLowerCase().trim();
  if (!q) return OFFICIAL_GRADE_11_HADRAMOUT_PDF;

  const words = q
    .replace(/[?؟.,!:"'()[\]{}]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3 && !SEARCH_STOP_WORDS.has(w));

  if (words.length === 0) return [];

  const scored = OFFICIAL_GRADE_11_HADRAMOUT_PDF.map(sec => {
    const haystack = [
      sec.titleAr,
      sec.titleEn,
      sec.officialContent,
      ...sec.grammarRulesAr,
      ...sec.notebookExamples.map(e => `${e.en} ${e.ar}`),
      sec.examNotesAr
    ]
      .join(' ')
      .toLowerCase();

    let matches = 0;
    for (const w of words) {
      if (haystack.includes(w)) matches += 1;
    }
    return { sec, matches };
  })
    .filter(item => item.matches > 0)
    .sort((a, b) => b.matches - a.matches);

  return scored.map(item => item.sec);
};

export const HADRAMOUT_PDF_KNOWLEDGE_CHUNKS = OFFICIAL_GRADE_11_HADRAMOUT_PDF;
export const searchCurriculumKnowledge = searchOfficialCurriculum;
export type PDFChunk = PDFCurriculumSection;


