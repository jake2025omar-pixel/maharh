import { SentenceItem, HADRAMOUT_CURRICULUM_TOPICS } from './curriculumData.ts';

export interface EverydayCategory {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  iconName: string;
  sentences: SentenceItem[];
}

export const EVERYDAY_ENGLISH_CATEGORIES: EverydayCategory[] = [
  {
    id: 'greetings_introductions',
    titleAr: 'التحيات والتعارف',
    titleEn: 'Greetings and Introductions',
    descriptionAr: 'عبارات الترحيب الطبيعية، وتقديم النفس والآخرين بأسلوب عصري ولبق.',
    iconName: 'Smile',
    sentences: [
      {
        id: 'ev_greet_1',
        english: 'Good morning! It is a pleasure to meet you in person.',
        arabic: 'صباح الخير! إنه لمن دواعي سروري أن ألتقي بك شخصياً.',
        contextAr: 'تحية صباحية راقية ومناسبة للمواقف الاجتماعية والمهنية الأولى.',
        topicId: 'greetings_introductions',
        topicNameAr: 'التحيات والتعارف',
        topicNameEn: 'Greetings and Introductions',
        source: 'everyday_english',
        level: 'beginner',
        vocabulary: [
          { word: 'pleasure', meaningAr: 'سرور / بهجة' },
          { word: 'in person', meaningAr: 'شخصياً وجهاً لوجه' }
        ]
      },
      {
        id: 'ev_greet_2',
        english: 'How have you been doing since we last spoke?',
        arabic: 'كيف كانت أحوالك منذ آخر مرة تحدثنا فيها؟',
        contextAr: 'سؤال دافئ يُطرح على معارف أو أصدقاء لم ترهم منذ فترة.',
        topicId: 'greetings_introductions',
        topicNameAr: 'التحيات والتعارف',
        topicNameEn: 'Greetings and Introductions',
        source: 'everyday_english',
        level: 'intermediate',
        vocabulary: [
          { word: 'since', meaningAr: 'منذ' },
          { word: 'last spoke', meaningAr: 'آخر محادثة بيننا' }
        ]
      },
      {
        id: 'ev_greet_3',
        english: 'Allow me to introduce my colleague, Dr. Salem, who leads our research project.',
        arabic: 'اسمح لي أن أقدّم زميلي، د. سالم، الذي يقود مشروعنا البحثي.',
        contextAr: 'تقديم شخص ثالث بأسلوب رسمي واحترافي في المؤتمرات والاجتماعات.',
        topicId: 'greetings_introductions',
        topicNameAr: 'التحيات والتعارف',
        topicNameEn: 'Greetings and Introductions',
        source: 'everyday_english',
        level: 'advanced',
        vocabulary: [
          { word: 'colleague', meaningAr: 'زميل عمل' },
          { word: 'leads', meaningAr: 'يقود / يدير' }
        ]
      }
    ]
  },
  {
    id: 'asking_questions',
    titleAr: 'طرح الأسئلة اليومية',
    titleEn: 'Asking Questions Naturally',
    descriptionAr: 'كيف تسأل عن الوقت، والأسعار، والمعلومات اليومية بثقة ودقة.',
    iconName: 'HelpCircle',
    sentences: [
      {
        id: 'ev_q_1',
        english: 'Could you please tell me what time the grocery store closes tonight?',
        arabic: 'هل يمكنك إخباري في أي وقت يغلق متجر البقالة الليلة من فضلك؟',
        contextAr: 'استفسار مهذب عن ساعات إغلاق المتاجر والخدمات.',
        topicId: 'asking_questions',
        topicNameAr: 'طرح الأسئلة اليومية',
        topicNameEn: 'Asking Questions Naturally',
        source: 'everyday_english',
        level: 'beginner',
        vocabulary: [
          { word: 'grocery store', meaningAr: 'متجر البقالة / السوبرماركت' },
          { word: 'closes', meaningAr: 'يغلق أبوابه' }
        ]
      },
      {
        id: 'ev_q_2',
        english: 'Would you mind explaining how the public transit payment system works?',
        arabic: 'هل تمانع في توضيح كيفية عمل نظام الدفع لوسائل النقل العام؟',
        contextAr: 'سؤال مهذب جداً بـ Would you mind مع صيغة gerund (explaining).',
        topicId: 'asking_questions',
        topicNameAr: 'طرح الأسئلة اليومية',
        topicNameEn: 'Asking Questions Naturally',
        source: 'everyday_english',
        level: 'intermediate',
        vocabulary: [
          { word: 'public transit', meaningAr: 'النقل العام' },
          { word: 'payment system', meaningAr: 'نظام الدفع' }
        ]
      }
    ]
  },
  {
    id: 'shopping_ordering_food',
    titleAr: 'التسوق وطلب الطعام',
    titleEn: 'Shopping and Ordering Food',
    descriptionAr: 'المحادثات في المطاعم، المقاهي، الأسواق، والاستفسار عن الحساب والطلبات.',
    iconName: 'Coffee',
    sentences: [
      {
        id: 'ev_food_1',
        english: 'Could I have a medium cappuccino with oat milk and a warm croissant, please?',
        arabic: 'هل يمكنني الحصول على كابتشينو بحجم متوسط مع حليب الشوفان وكرواسون دافئ من فضلك؟',
        contextAr: 'طلب قهوة ومخبوزات بأسلوب طبيعي ومستخدم يومياً في المقاهي.',
        topicId: 'shopping_ordering_food',
        topicNameAr: 'التسوق وطلب الطعام',
        topicNameEn: 'Shopping and Ordering Food',
        source: 'everyday_english',
        level: 'beginner',
        vocabulary: [
          { word: 'oat milk', meaningAr: 'حليب الشوفان' },
          { word: 'warm', meaningAr: 'دافئ' }
        ]
      },
      {
        id: 'ev_food_2',
        english: 'Excuse me, could we get the bill, and do you accept contactless card payment?',
        arabic: 'عذراً، هل يمكننا الحصول على الفاتورة، وهل تقبلون الدفع بالبطاقة عبر اللمس؟',
        contextAr: 'طلب الحساب في المطعم والاستفسار عن وسيلة الدفع الإلكترونية الحديثة.',
        topicId: 'shopping_ordering_food',
        topicNameAr: 'التسوق وطلب الطعام',
        topicNameEn: 'Shopping and Ordering Food',
        source: 'everyday_english',
        level: 'intermediate',
        vocabulary: [
          { word: 'bill', meaningAr: 'الفاتورة / الحساب' },
          { word: 'contactless', meaningAr: 'الدفع دون تلامس (عبر الشريحة)' }
        ]
      },
      {
        id: 'ev_food_3',
        english: 'Are there any dairy-free or vegetarian alternatives on the chef tasting menu?',
        arabic: 'هل هناك أي بدائل خالية من منتجات الألبان أو مناسبة للنباتيين في قائمة التذوق الخاصة بالشيف؟',
        contextAr: 'السؤال عن الحساسيات الغذائية والخيارات المحددة في المطاعم الراقية.',
        topicId: 'shopping_ordering_food',
        topicNameAr: 'التسوق وطلب الطعام',
        topicNameEn: 'Shopping and Ordering Food',
        source: 'everyday_english',
        level: 'advanced',
        vocabulary: [
          { word: 'dairy-free', meaningAr: 'خالٍ من مشتقات الحليب' },
          { word: 'alternatives', meaningAr: 'خيارات بديلة' }
        ]
      }
    ]
  },
  {
    id: 'travel_transportation',
    titleAr: 'السفر والمواصلات',
    titleEn: 'Travel and Transportation',
    descriptionAr: 'المحادثات في المطارات، محطات القطار، حجز التذاكر، والتعامل مع الرحلات.',
    iconName: 'Plane',
    sentences: [
      {
        id: 'ev_trv_1',
        english: 'Excuse me, which terminal does the international flight to Cairo depart from?',
        arabic: 'عذراً، من أي صالة تنطلق الرحلة الدولية المتجهة إلى القاهرة؟',
        contextAr: 'استفسار أساسي في المطار للوصول إلى صالة المغادرة الصحيحة.',
        topicId: 'travel_transportation',
        topicNameAr: 'السفر والمواصلات',
        topicNameEn: 'Travel and Transportation',
        source: 'everyday_english',
        level: 'intermediate',
        vocabulary: [
          { word: 'terminal', meaningAr: 'صالة المطار / مبنى الركاب' },
          { word: 'depart', meaningAr: 'تقلع / تنطلق الرحلة' }
        ]
      },
      {
        id: 'ev_trv_2',
        english: 'My checked baggage did not arrive on the carousel; where is the lost luggage counter?',
        arabic: 'حقيبتي المشحونة لم تصل على شريط الأمتعة؛ أين مكتب الأمتعة المفقودة؟',
        contextAr: 'التعامل مع مشكلة شائعة في المطار بعبارات واضحة ومحددة.',
        topicId: 'travel_transportation',
        topicNameAr: 'السفر والمواصلات',
        topicNameEn: 'Travel and Transportation',
        source: 'everyday_english',
        level: 'advanced',
        vocabulary: [
          { word: 'carousel', meaningAr: 'شريط استلام الأمتعة الدوار' },
          { word: 'luggage counter', meaningAr: 'مكتب خدمات الأمتعة' }
        ]
      }
    ]
  },
  {
    id: 'directions_locations',
    titleAr: 'الاتجاهات والأماكن',
    titleEn: 'Directions and Locations',
    descriptionAr: 'كيف تطلب وتصف الاتجاهات في الشارع، وتصل إلى وجهتك بدقة وسهولة.',
    iconName: 'Compass',
    sentences: [
      {
        id: 'ev_dir_1',
        english: 'Go straight ahead for two blocks, then turn left at the traffic light.',
        arabic: 'امشِ للأمام مباشرة لمسافة تقاطعين، ثم انعطف يساراً عند إشارة المرور.',
        contextAr: 'وصف اتجاهات قياسي وشائع في المدن.',
        topicId: 'directions_locations',
        topicNameAr: 'الاتجاهات والأماكن',
        topicNameEn: 'Directions and Locations',
        source: 'everyday_english',
        level: 'beginner',
        vocabulary: [
          { word: 'straight ahead', meaningAr: 'للأمام مباشرة' },
          { word: 'traffic light', meaningAr: 'إشارة المرور الضوئية' }
        ]
      },
      {
        id: 'ev_dir_2',
        english: 'The museum is situated right across the street from the old clock tower.',
        arabic: 'يقع المتحف مباشرة في الجهة المقابلة من الشارع أمام برج الساعة القديم.',
        contextAr: 'تحديد موقع مكان نسبةً إلى معلم معروف ومميز.',
        topicId: 'directions_locations',
        topicNameAr: 'الاتجاهات والأماكن',
        topicNameEn: 'Directions and Locations',
        source: 'everyday_english',
        level: 'intermediate',
        vocabulary: [
          { word: 'situated', meaningAr: 'يقع / متواجد' },
          { word: 'across the street', meaningAr: 'على الجانب الآخر من الشارع' }
        ]
      }
    ]
  },
  {
    id: 'work_professional',
    titleAr: 'العمل والتواصل المهني',
    titleEn: 'Work and Professional Communication',
    descriptionAr: 'التواصل في بيئة العمل، كتابة البريد الإلكتروني، والاجتماعات المهنية.',
    iconName: 'Briefcase',
    sentences: [
      {
        id: 'ev_wrk_1',
        english: 'I have attached the updated quarterly project summary for your perusal.',
        arabic: 'لقد أرفقت ملخص المشروع الفصلي المحدّث لكي تتفضلوا بالاطلاع عليه.',
        contextAr: 'صيغة مهنية معتادة في رسائل البريد الإلكتروني الرسمية.',
        topicId: 'work_professional',
        topicNameAr: 'العمل والتواصل المهني',
        topicNameEn: 'Work and Professional Communication',
        source: 'everyday_english',
        level: 'advanced',
        vocabulary: [
          { word: 'attached', meaningAr: 'أرفقت (ملفاً)' },
          { word: 'perusal', meaningAr: 'المعاينة والاطلاع الدقيق' }
        ]
      },
      {
        id: 'ev_wrk_2',
        english: 'Let us schedule a brief synchronizing call to align our deliverables before Friday.',
        arabic: 'دعنا نحدد موعداً لمكالمة تنسيقية موجزة لتوحيد مخرجاتنا قبل حلول يوم الجمعة.',
        contextAr: 'عبارة شائعة جداً في بيئة العمل الحديثة لتنسيق مهام الفريق.',
        topicId: 'work_professional',
        topicNameAr: 'العمل والتواصل المهني',
        topicNameEn: 'Work and Professional Communication',
        source: 'everyday_english',
        level: 'advanced',
        vocabulary: [
          { word: 'synchronizing', meaningAr: 'تنسيقي / مزامنة' },
          { word: 'deliverables', meaningAr: 'المخرجات والمهام المطلوب تسليمها' }
        ]
      }
    ]
  },
  {
    id: 'polite_requests',
    titleAr: 'الطلبات والردود المهذبة',
    titleEn: 'Polite Requests and Responses',
    descriptionAr: 'الصيغ اللبقة لطلب المساعدة، تقديم الاعتذار، أو الرد على الشكر بلطف.',
    iconName: 'ThumbsUp',
    sentences: [
      {
        id: 'ev_plt_1',
        english: 'Would it be possible to postpone our appointment until tomorrow afternoon?',
        arabic: 'هل سيكون من الممكن تأجيل موعدنا حتى بعد ظهر الغد؟',
        contextAr: 'طلب تأجيل موعد بلباقة عالية ودون إحراج.',
        topicId: 'polite_requests',
        topicNameAr: 'الطلبات والردود المهذبة',
        topicNameEn: 'Polite Requests and Responses',
        source: 'everyday_english',
        level: 'intermediate',
        vocabulary: [
          { word: 'postpone', meaningAr: 'يؤجل / يؤخر' },
          { word: 'appointment', meaningAr: 'موعد متفق عليه' }
        ]
      },
      {
        id: 'ev_plt_2',
        english: 'Do not mention it; it was truly my pleasure to lend a helping hand.',
        arabic: 'لا داعي لشكري على الإطلاق؛ لقد كان من دواعي سروري حقاً أن أمد لك يد المساعدة.',
        contextAr: 'رد راقٍ وطبيعي عند شكر أحدهم لك على معروف قمت به.',
        topicId: 'polite_requests',
        topicNameAr: 'الطلبات والردود المهذبة',
        topicNameEn: 'Polite Requests and Responses',
        source: 'everyday_english',
        level: 'intermediate',
        vocabulary: [
          { word: 'do not mention it', meaningAr: 'عفواً / لا شكر على واجب' },
          { word: 'lend a helping hand', meaningAr: 'يمد يد العون والمساعدة' }
        ]
      }
    ]
  },
  {
    id: 'phone_online_chat',
    titleAr: 'المكالمات والمحادثات الرقمية',
    titleEn: 'Phone and Online Conversations',
    descriptionAr: 'التعامل مع اتصالات الفيديو، رداءة الصوت، وترك الرسائل الصوتية.',
    iconName: 'PhoneCall',
    sentences: [
      {
        id: 'ev_phn_1',
        english: 'You are cutting out a little bit; could you please repeat that last sentence?',
        arabic: 'صوتك يتقطع قليلاً؛ هل يمكنك التفضل بإعادة تلك الجملة الأخيرة؟',
        contextAr: 'عبارة أساسية عند حدوث تشويش في الاتصال أثناء مكالمات الفيديو أو الهاتف.',
        topicId: 'phone_online_chat',
        topicNameAr: 'المكالمات والمحادثات الرقمية',
        topicNameEn: 'Phone and Online Conversations',
        source: 'everyday_english',
        level: 'intermediate',
        vocabulary: [
          { word: 'cutting out', meaningAr: 'يتقطع (الصوت بسبب الشبكة)' },
          { word: 'repeat', meaningAr: 'يكرر / يعيد' }
        ]
      },
      {
        id: 'ev_phn_2',
        english: 'I think your microphone is muted; please unmute yourself so we can hear you.',
        arabic: 'أعتقد أن الميكروفون لديك في وضع كتم الصوت؛ يُرجى إلغاء الكتم حتى نتمكن من سماعك.',
        contextAr: 'تنبيه معتاد في الاجتماعات الافتراضية الحديثة (Zoom / Meet).',
        topicId: 'phone_online_chat',
        topicNameAr: 'المكالمات والمحادثات الرقمية',
        topicNameEn: 'Phone and Online Conversations',
        source: 'everyday_english',
        level: 'beginner',
        vocabulary: [
          { word: 'muted', meaningAr: 'مكتوم الصوت' },
          { word: 'unmute', meaningAr: 'إلغاء كتم الصوت' }
        ]
      }
    ]
  }
];

export const ALL_SENTENCES: SentenceItem[] = [
  ...HADRAMOUT_CURRICULUM_TOPICS.flatMap(t => t.sentences),
  ...EVERYDAY_ENGLISH_CATEGORIES.flatMap(c => c.sentences)
];
