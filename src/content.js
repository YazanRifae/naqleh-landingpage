/* ============================================================================
   نقلة · Naqla — single source of truth for all landing-page copy.
   Consumed by build.js, which bakes both language pages to static HTML.

   Every string exists in ar + en (LANDING-PAGE-CONTENT.md §4). Arabic is the
   default language; English is a switch.

   RULES ENCODED HERE — do not "improve" copy without re-reading the spec:
     §5  Claims we must NOT make. No COD, no "dedicated vehicle", no live GPS
         the whole way, no guaranteed duration, no multi-stop, no partial
         delivery, no "insured" (say liability CAP), no scheduled routes, no
         receiver app.
     §6  Figures that are still placeholders are deliberately ABSENT from the
         copy: liability cap amount, cancellation percentages, return-leg fee,
         storage rate, abandonment period, re-attempt limit, free waiting time,
         active city list beyond the stated founding route, support phone.
         Mechanisms are described; numbers are not invented. See PLACEHOLDERS.md.
   Numerals: Western digits in both languages (standard in Levantine digital
   products, and it keeps mixed-direction strings like "20 kg" stable in RTL).
   ========================================================================== */

const SCENES = ['sender', 'pickup', 'fleet', 'route', 'delivery', 'finale'];

/* Brand colours, for text on LIGHT surfaces (the detail view). */
const TEAL = '#12676B';
const ORANGE = '#E0722C';

/* Lightened variants for the FILM only. The scene accent colours the eyebrow,
   the route-rail dots and the progress bar — all of which sit on the dark video
   scrim, where the deep brand teal fails contrast. Same hues, raised lightness. */
const TEAL_ON_DARK = '#5BBFC4';
const ORANGE_ON_DARK = '#F5934E';

const CONTENT = {
  ar: {
    lang: 'ar',
    dir: 'rtl',
    altHref: 'en/',
    altLabel: 'English',
    meta: {
      title: 'نقلة — خدمة التوصيل والشحن داخل سوريا',
      description: 'احجز سائقاً موثّقاً والمركبة المناسبة لحمولتك. سعر واضح قبل التأكيد، وإثبات QR لكل طرد، وتوصيل داخل المدينة وبين المدن.',
      keywords: 'توصيل سوريا، شحن دمشق حلب، نقل بضائع، شحن داخلي',
    },
    brand: 'نقلة',
    tagline: 'أرسل أي شيء داخل سوريا: المركبة المناسبة، سائق موثّق، سعر تراه قبل التأكيد، وإثبات لكل طرد.',
    hint: 'مرّر للأسفل للانطلاق',
    cta: { book: 'اطلب شحنة الآن', driver: 'انضم كسائق', talk: 'تواصل معنا', volume: 'تواصل معنا بخصوص الأحجام الكبيرة' },
    skipLink: 'تجاوز إلى التفاصيل',

    scenes: {
      sender: {
        label: 'الإرسال',
        eyebrow: 'من المرسل إلى المستلم',
        title: 'أرسلها. تتبّعها. وأثبت تسليمها.',
        body: 'خدمة توصيل وشحن داخل سوريا — من ظرف على دراجة نارية إلى عشرة أطنان على شاحنة. استلام واحد، تسليم واحد، وسعر واضح.',
        tags: ['سائقون موثّقون', 'مركبات موثّقة', 'مسح QR لكل طرد'],
      },
      pickup: {
        label: 'الاستلام',
        eyebrow: 'الصور إلزامية عند الطلب',
        title: 'سعر تراه قبل أن تؤكّد',
        body: 'تفاصيل الأجرة كاملة تظهر لك قبل الإرسال، ولا يُخصم أي مبلغ ما دام طلبك لم يجد سائقاً بعد.',
        tags: ['أجرة مفصّلة', 'الدفع بعد قبول السائق', 'صورة للحمولة'],
      },
      fleet: {
        label: 'المركبات',
        eyebrow: 'ست مركبات',
        title: 'المركبة المناسبة تُختار من حمولتك',
        body: 'نوصي بالمركبة حسب الوزن والأبعاد ونوع البضاعة — من دراجة نارية إلى شاحنة كبيرة، ويمكنك دائماً الترقية لمركبة أكبر.',
        tags: ['حتى 20 طرداً في الطلب', 'من 20 كغ إلى 10 أطنان'],
      },
      route: {
        label: 'التغطية',
        eyebrow: 'دمشق ⇄ حلب',
        title: 'بين المدن وداخل المدينة بالخدمة نفسها',
        body: 'بدأنا من دمشق ⇄ حلب. تعرف نافذة الوصول، ويظهر الموقع المباشر في المرحلة الأخيرة حين يكون مفيداً فعلاً.',
        tags: ['نافذة وصول', 'حالة في كل مرحلة'],
      },
      delivery: {
        label: 'التسليم',
        eyebrow: 'دون تطبيق للمستلم',
        title: 'مسحان يُغلقان التسليم',
        body: 'السائق يمسح رمز الطرد، والمستلم يعرض رمزه من رابط يصله برسالة نصية عبر أي متصفح.',
        tags: ['رابط برسالة نصية', 'رمز نصي بديل'],
      },
      finale: {
        label: 'الإثبات',
        eyebrow: 'إثبات لكل طرد',
        title: 'شحنتك على بُعد طلب واحد',
        body: 'صورة تسليم مؤرّخة ومحدّدة الموقع، وإيصال، وسقف تعويض معلن توافق عليه قبل الإرسال.',
      },
    },

    /* ---- detail view ---- */
    pillarsHead: { kicker: 'لماذا نقلة', title: 'ست ركائز تحكم كل شحنة' },
    pillars: [
      { t: 'السعر قبل التأكيد', d: 'تفاصيل الأجرة كاملة تظهر لك قبل إرسال الطلب.' },
      { t: 'الدفع بعد قبول السائق', d: 'لا يُخصم أي مبلغ ما دام طلبك لم يجد سائقاً بعد.' },
      { t: 'المركبة المناسبة تُختار من حمولتك', d: 'نوصي بالمركبة حسب الوزن والأبعاد ونوع البضاعة، ويمكنك دائماً الترقية لمركبة أكبر.' },
      { t: 'إثبات لكل طرد', d: 'ملصق QR لكل طرد يُمسح عند الاستلام وعند التسليم، مع صورة تسليم مؤرّخة ومحدّدة الموقع.' },
      { t: 'سائقون ومركبات تحت التدقيق', d: 'تحقق من الهوية والرخصة ودفتر المركبة، ومراجعة دورية كل ثلاثة أشهر.' },
      { t: 'عربي أولاً', d: 'الخدمة كاملة بالعربية وبتصميم يدعم الاتجاه من اليمين إلى اليسار، مع إمكانية التبديل للإنجليزية.' },
    ],

    stepsHead: { kicker: 'كيف تعمل', title: 'أربع خطوات من الطلب إلى الإثبات' },
    steps: [
      { t: 'وصّف الشحنة', d: 'عنوان الاستلام وعنوان التسليم، رقم المستلم، وصف البضاعة، عدد الطرود، الوزن والأبعاد — وصورة واحدة على الأقل للحمولة.' },
      { t: 'اطّلع على المركبة والأجرة والشروط', d: 'نوصي لك بالمركبة، وتظهر لك تفاصيل الأجرة، ورسوم الإلغاء حسب المرحلة، وسقف التعويض — وتوافق عليها قبل الإرسال.' },
      { t: 'يقبل السائق، ثم تدفع', d: 'إلكترونياً عبر شام كاش أو سيرياتيل كاش، أو نقداً للسائق عند الاستلام.' },
      { t: 'تابع، سلّم، واحصل على الإثبات', d: 'تابع الحالة ونافذة الوصول. المستلم يفتح رابطاً ويعرض رمز QR — دون تحميل أي تطبيق. وتصلك صورة التسليم والإيصال.' },
    ],
    stepsNote: 'الصور إلزامية عند إنشاء الطلب، لأنها المرجع الأساسي لأي مطالبة بالضرر لاحقاً.',

    fleetHead: { kicker: 'ما ننقل', title: 'أخبرنا بالحمولة، ونختار أصغر مركبة تناسبها' },
    fleetCols: { weight: 'أقصى وزن', volume: 'أقصى حجم', dims: 'الأبعاد الداخلية (سم)', body: 'الصندوق', help: 'مساعدة التحميل', pkgs: 'أقصى عدد طرود', use: 'الاستخدام النموذجي' },
    fleetNote: 'أخبرنا بالحمولة، ونختار لك أصغر مركبة تناسبها — وإن لم تناسبها أي مركبة، نقترح تقسيم الطلب.',
    fleetCaveat: 'السعات أدناه إرشادية، وتُعاد معايرتها مقابل الأسطول الفعلي قبل الإطلاق.',
    fleet: [
      { v: 'دراجة نارية', w: '20 كغ', vol: '0.06 م³', d: '40×40×40', b: 'صندوق', h: '—', p: '3', u: 'وثائق وطرود صغيرة' },
      { v: 'سيارة', w: '200 كغ', vol: '0.40 م³', d: '100×80×50', b: 'مغلق', h: '—', p: '8', u: 'طرود يومية وأجهزة صغيرة' },
      { v: 'بيك أب', w: '800 كغ', vol: '2.50 م³', d: '200×150', b: 'مكشوف', h: 'السائق يساعد', p: '15', u: 'أثاث ومواد بناء' },
      { v: 'فان', w: '1,000 كغ', vol: '6.00 م³', d: '250×160×150', b: 'مغلق', h: 'السائق يساعد', p: '20', u: 'بضاعة محلات وحمولات محمية' },
      { v: 'شاحنة صغيرة', w: '2,500 كغ', vol: '12.00 م³', d: '350×180×190', b: 'مغلق', h: 'رافعة خلفية', p: '20', u: 'نقل بالجملة وبضاعة على منصات' },
      { v: 'شاحنة كبيرة', w: '10,000 كغ', vol: '40.00 م³', d: '620×240×260', b: 'مغلق', h: 'رافعة خلفية', p: '20', u: 'حمولات كاملة بين المدن' },
    ],

    carryHead: { kicker: 'الحدود', title: 'ما ننقله — وما لا ننقله' },
    carryYes: { t: 'ننقل', items: ['وثائق وأظرفة', 'بضائع عامة', 'أطعمة مغلّفة وغير قابلة للتلف', 'أدوية مغلّفة', 'أجهزة كهربائية وإلكترونيات', 'أثاث', 'مواد بناء', 'نباتات', 'بضائع قابلة للكسر وزجاج', 'بضاعة على منصات (باليت)'] },
    carryNo: { t: 'لا ننقل', items: ['مواد خطرة — قابلة للاشتعال أو الانفجار أو التآكل، غازات مضغوطة، مواد سامة', 'أسلحة وذخائر وقطعها', 'حيوانات حية', 'نقود، ذهب، مجوهرات، وأوراق مالية لحاملها', 'أطعمة غير مغلّفة أو تحتاج تبريد — لا توجد سلسلة تبريد', 'رفات بشرية أو عيّنات بيولوجية', 'أي شيء يخالف القانون نقله', 'طرود مغلقة يرفض المرسل الإفصاح عن محتواها'] },
    carryNote: 'يحق للسائق رفض البضائع الممنوعة عند الاستلام، ويُسجَّل الرفض مع صورة.',

    priceHead: { kicker: 'الأجرة والدفع', title: 'بلا مفاجآت. أجرة واحدة مفصّلة قبل الطلب.' },
    priceBuildT: 'مما تتكوّن الأجرة',
    priceBuild: [
      { t: 'المبلغ الثابت', d: 'مبلغ ثابت حسب نوع المركبة.' },
      { t: 'المسافة', d: 'تسعيرة لكل كيلومتر من المسار.' },
      { t: 'رسم بين المدن', d: 'رسم إضافي ثابت لكل زوج مدن عند النقل بين المدن.' },
    ],
    priceExtraT: 'رسوم إضافية — تُذكر مسبقاً وتُطبَّق عند حدوثها فقط',
    priceExtra: [
      'رسم محاولة إضافية — عند إعادة محاولة التسليم',
      'رسم رحلة الإرجاع — عند إعادة البضاعة إليك',
      'رسم تخزين — تعرفة يومية في نقطة الحفظ بالمدينة',
      'رسم إلغاء — يتدرّج حسب المرحلة التي وصل إليها السائق',
    ],
    payT: 'طرق الدفع',
    pay: [
      { t: 'شام كاش', d: 'إلكترونياً بعد قبول السائق' },
      { t: 'سيرياتيل كاش', d: 'إلكترونياً بعد قبول السائق' },
      { t: 'نقداً عند الاستلام', d: 'تسلّم الأجرة للسائق ويصلك إيصال داخل التطبيق' },
    ],
    priceBounds: [
      'المرسل هو من يدفع. لا يُطلب من المستلم أي مبلغ ولا يظهر له أي سعر.',
      'نقلة تتقاضى أجرة النقل فقط، ولا تحصّل ثمن البضاعة نيابةً عنك.',
    ],

    trackHead: { kicker: 'التتبّع والإثبات', title: 'تعرف أين وصلت شحنتك — وتملك إثبات تسليمها' },
    track: [
      { t: 'حالة الطلب في كل مرحلة', d: 'من النشر حتى التسليم، مع اسم السائق والمركبة ورقم اللوحة بعد الإسناد.' },
      { t: 'نافذة وصول بدل نقطة تتبعها', d: 'تعرف متى تتوقع السائق، ويظهر الموقع المباشر في المرحلة الأخيرة حين يكون مفيداً فعلاً.' },
      { t: 'مسحان يُغلقان التسليم', d: 'السائق يمسح رمز الطرد، والمستلم يعرض رمزه من رابط يصله برسالة نصية عبر أي متصفح. دون تثبيت أي تطبيق.' },
      { t: 'صورة تسليم مؤرّخة ومحدّدة الموقع', d: 'محفوظة مع الطلب ومتاحة لك.' },
      { t: 'لا يملك المستلم هاتفاً ذكياً؟', d: 'يُستخدم رمز نصي يصله برسالة كبديل.' },
    ],

    protectHead: { kicker: 'الحماية والشروط', title: 'مكتوبة قبل الإرسال، لا محلّ نقاش بعده' },
    protect: [
      { t: 'سقف تعويض معلن', d: 'لكل شحنة حد أقصى محدّد للتعويض عن الفقدان أو الضرر، يظهر لك وتوافق عليه عند الطلب.' },
      { t: 'التعويض يُحتسب ولا يُتفاوض عليه', d: 'وهو الأقل بين القيمة المصرّح بها وسقف التعويض المعلن، ويُحدَّد من صورة الاستلام وصورة التسليم وسجل المسح ومسار GPS.' },
      { t: 'الاسترداد تلقائي وليس طلب دعم', d: 'المدفوعات الإلكترونية تعود إلى الرقم والمزوّد نفسه، والنقدي يعود كرصيد داخل التطبيق.' },
      { t: 'إذا كان الخلل من طرفنا فلن تدفع شيئاً', d: 'عدم توفر سائق، أو عدم حضوره، أو عطل المركبة، أو إلغاء من طرفنا — استرداد كامل بلا أي رسوم.' },
      { t: 'رسم الإلغاء يعادل ما أنجزه السائق فعلاً', d: 'لا شيء قبل قبول السائق، ورسم منخفض بعد القبول، ورسم رحلة بعد انطلاقه.' },
    ],
    exclT: 'استثناءات نذكرها بوضوح',
    excl: [
      'البضائع القابلة للكسر المرسلة دون الإفصاح عن ذلك',
      'البضائع على مركبة مكشوفة دون تأكيد التغليف',
      'البضائع المستلمة من السائق في غير العنوان المسجّل',
      'أي خسائر تبعية',
    ],

    failHead: { kicker: 'إذا تعذّر التسليم', title: 'لا شيء يبقى معلّقاً. أنت من يقرّر ما يحدث بعدها.' },
    fail: [
      { t: 'إعادة المحاولة', d: 'محاولة تسليم أخرى ضمن الحد المسموح، مع رسم محاولة إضافية.' },
      { t: 'تحويل', d: 'عنوان جديد أو مستلم جديد بتفويض منك، مع إعادة تسعير إن تغيّرت المسافة بشكل جوهري.' },
      { t: 'إرجاع', d: 'تعود البضاعة إليك، مع رسم رحلة إرجاع وتأكيد استلام بصورة.' },
      { t: 'نقطة الحفظ', d: 'إن تعذّر استلامك للبضاعة تُنقل إلى نقطة الحفظ في المدينة، مع رسم تخزين يومي، ويُبلَّغ لك عنوان الاستلام والتاريخ النهائي كتابةً.' },
    ],
    failNote: 'التسليم كامل أو لا شيء. إذا رفض المستلم طرداً واحداً يُعلَّق الطلب بأكمله ويعود القرار إليك.',

    bizHead: { kicker: 'للأعمال', title: 'مصمّمة للمحلات والمستودعات والتجّار' },
    biz: [
      'حساب أعمال باسم شركتك على كل طلب وإيصال',
      'حتى 20 طرداً في الطلب الواحد، لكل طرد رمز QR وحالة تتبّع مستقلة',
      'دفتر عناوين محفوظ — المحل، المستودع، الزبائن المتكررون',
      'سجل طلبات كامل مرتبط برقم هاتفك، مع الإيصالات وتفاصيل الأجرة',
      'يتلقّى زبائنك تحديثات الحالة ورابط التحقق دون تثبيت أي تطبيق',
      'أدلة صور ومسح لكل شحنة — سجلّك عند أي نزاع مع الزبون',
    ],

    coverHead: { kicker: 'التغطية', title: 'بين المدن وداخل المدينة بالخدمة نفسها' },
    cover: [
      'بدأنا من دمشق ⇄ حلب.',
      'نوصل ضمن مدننا المفعّلة. وإذا كان عنوانك خارج نطاق التغطية سنخبرك فوراً، ونسجّل طلبك لنعرف أين نتوسّع لاحقاً.',
    ],

    driverHead: { kicker: 'اعمل معنا', title: 'تملك مركبة؟ حوّلها إلى دخل.' },
    driver: [
      'سجّل برقم هاتفك وارفع الهوية ورخصة القيادة ودفتر المركبة',
      'اطّلع على الأجرة وحصتك قبل قبول الطلب',
      'محفظة واحدة ورقم واحد — ما لك وما عليك بوضوح',
      'دفعات منتظمة ضمن دورة ثابتة',
      'تفاصيل كل حصة وكل تعديل ظاهرة مع سببها وبلغتك',
    ],
    driverCta: 'قدّم طلبك كسائق',

    faqHead: { kicker: 'أسئلة متكرّرة', title: 'الأسئلة التي تُطرح قبل أول شحنة' },
    faq: [
      { q: 'متى أدفع؟', a: 'بعد قبول السائق للطلب. لا يُخصم أي مبلغ ما دام الطلب يبحث عن سائق.' },
      { q: 'هل يمكن للمستلم أن يدفع؟', a: 'لا. المرسل هو من يدفع دائماً، ولا يظهر أي سعر للمستلم.' },
      { q: 'هل تحصّلون ثمن البضاعة من المستلم؟', a: 'لا. نتقاضى أجرة النقل فقط.' },
      { q: 'هل يحتاج المستلم إلى التطبيق؟', a: 'لا. يصله رابط برسالة نصية ويفتح رمز التحقق في أي متصفح.' },
      { q: 'هل أختار المركبة بنفسي؟', a: 'نوصي بها حسب حمولتك، ويمكنك الترقية إلى مركبة أكبر، ولا نتيح مركبة أصغر مما تتطلبه الحمولة.' },
      { q: 'لماذا الصور إلزامية؟', a: 'لأنها الحالة المتفق عليها لبضاعتك عند الاستلام، وهي ما يحسم مطالبات الضرر بإنصاف.' },
      { q: 'ماذا لو لم يكن المستلم موجوداً؟', a: 'ينتظر السائق ويوثّق الحالة بصورة، ثم تختار أنت: إعادة محاولة، أو تحويل، أو إرجاع.' },
      { q: 'ماذا لو تضرّرت بضاعتي؟', a: 'نقارن صورة الاستلام بصورة التسليم وسجل المسح، ونعوّض وفق السياسة المعلنة — الأقل بين القيمة المصرّح بها وسقف التعويض.' },
      { q: 'هل يمكنني الإلغاء؟', a: 'نعم. مجاناً قبل قبول السائق، وبعدها يعكس الرسم ما أُنجز فعلاً.' },
      { q: 'هل التطبيق بالعربية؟', a: 'العربية هي اللغة الافتراضية بتصميم كامل من اليمين إلى اليسار، والإنجليزية متاحة بضغطة واحدة.' },
    ],

    footHead: 'شحنتك على بُعد طلب واحد.',
    footNote: 'نقلة تتقاضى أجرة النقل فقط، ولا تحصّل ثمن البضاعة نيابةً عنك.',
    footCols: [
      { t: 'الخدمة', links: ['كيف تعمل', 'المركبات', 'الأجرة والدفع', 'التتبّع والإثبات'] },
      { t: 'الشروط', links: ['الحماية والتعويض', 'ما ننقله', 'إذا تعذّر التسليم', 'أسئلة متكرّرة'] },
      { t: 'نقلة', links: ['للأعمال', 'انضم كسائق', 'التغطية', 'تواصل معنا'] },
    ],
    footLegal: 'نقلة — خدمة التوصيل والشحن داخل سوريا.',
  },

  en: {
    lang: 'en',
    dir: 'ltr',
    altHref: '../',
    altLabel: 'العربية',
    meta: {
      title: 'Naqla — Delivery & Freight Across Syria',
      description: 'Book a verified driver and the right vehicle for your load. Clear price before you commit, QR proof on every package, delivery inside the city and between cities.',
      keywords: 'delivery Syria, shipping Damascus Aleppo, freight Syria, truck rental delivery',
    },
    brand: 'Naqla',
    tagline: 'Send anything across Syria: the right vehicle, a verified driver, a price you see before you commit, and proof on every package.',
    hint: 'scroll to fly in',
    cta: { book: 'Book a delivery', driver: 'Drive with Naqla', talk: 'Talk to us', volume: 'Talk to us about volume' },
    skipLink: 'Skip to details',

    scenes: {
      sender: {
        label: 'Sending',
        eyebrow: 'From sender to receiver',
        title: 'Send it. Track it. Prove it.',
        body: 'Delivery and freight across Syria — from an envelope on a motorbike to ten tonnes on a truck. One pickup, one drop-off, one clear price.',
        tags: ['Verified drivers', 'Verified vehicles', 'A QR scan per package'],
      },
      pickup: {
        label: 'Pickup',
        eyebrow: 'Photos are mandatory',
        title: 'The price before you commit',
        body: 'An itemised fee, shown in full before you place the order — and nothing is charged while your order is still looking for a driver.',
        tags: ['Itemised fee', 'Pay after a driver accepts', 'A photo of the load'],
      },
      fleet: {
        label: 'The fleet',
        eyebrow: 'Six vehicles',
        title: 'The right vehicle, chosen from your load',
        body: 'We recommend the vehicle from weight, size and category — from a motorbike to a large truck. You can always upgrade.',
        tags: ['Up to 20 packages', 'From 20 kg to 10 tonnes'],
      },
      route: {
        label: 'Coverage',
        eyebrow: 'Damascus ⇄ Aleppo',
        title: 'Intercity and inside the city, one service',
        body: 'Damascus ⇄ Aleppo is where we started. You get an arrival window, and the live position appears on the final approach, when it actually helps.',
        tags: ['An arrival window', 'Status at every stage'],
      },
      delivery: {
        label: 'Handover',
        eyebrow: 'No app for the receiver',
        title: 'Two scans close the delivery',
        body: 'The driver scans the package QR; the receiver shows their own QR from an SMS link in any browser.',
        tags: ['A link by SMS', 'A typed code fallback'],
      },
      finale: {
        label: 'The proof',
        eyebrow: 'Proof on every package',
        title: 'Your shipment is one order away',
        body: 'A timestamped, located delivery photo, a receipt, and a published liability cap you accept before you send.',
      },
    },

    pillarsHead: { kicker: 'Why Naqla', title: 'Six pillars behind every shipment' },
    pillars: [
      { t: 'The price before you commit', d: 'An itemised fee, shown in full before you place the order.' },
      { t: 'You pay after a driver accepts', d: 'No money is taken while your order is still looking for a driver.' },
      { t: 'The right vehicle, chosen from your load', d: 'We recommend the vehicle from weight, size and category. You can always upgrade.' },
      { t: 'Proof on every package', d: 'A QR label per package, scanned at pickup and at handover, plus a delivery photo with time and location.' },
      { t: 'Checked drivers and checked vehicles', d: 'Identity, licence and registration verified, and re-checked every quarter.' },
      { t: 'Arabic first', d: 'The whole service in Arabic, with full right-to-left design. English available.' },
    ],

    stepsHead: { kicker: 'How it works', title: 'Four steps from order to proof' },
    steps: [
      { t: 'Describe the shipment', d: "Pickup and drop-off addresses, the receiver's phone, what you're sending, how many packages, weight and size — and at least one photo of the load." },
      { t: 'See the vehicle, the fee and the terms', d: 'We recommend the vehicle. You see the itemised fee, the cancellation tiers and the liability cap — then you accept them.' },
      { t: 'A driver accepts, then you pay', d: 'Pay online with Sham Cash or Syriatel Cash, or hand the fee to the driver in cash at pickup.' },
      { t: 'Track, hand over, get proof', d: 'Follow the status and arrival window. The receiver opens a link and shows a QR — no app needed. You get a delivery photo and a receipt.' },
    ],
    stepsNote: 'Photos are mandatory at booking. They are the baseline for any damage claim later.',

    fleetHead: { kicker: 'What we move', title: 'Tell us the load. We pick the smallest vehicle that fits it.' },
    fleetCols: { weight: 'Max weight', volume: 'Max volume', dims: 'Internal L×W×H (cm)', body: 'Body', help: 'Loading help', pkgs: 'Max packages', use: 'Typical use' },
    fleetNote: "Tell us the load. We pick the smallest vehicle that fits it — and if nothing fits, we'll tell you how to split the order.",
    fleetCaveat: 'The capacities below are indicative and are recalibrated against the real fleet before launch.',
    fleet: [
      { v: 'Motorbike', w: '20 kg', vol: '0.06 m³', d: '40×40×40', b: 'Box', h: '—', p: '3', u: 'Documents, small parcels' },
      { v: 'Car', w: '200 kg', vol: '0.40 m³', d: '100×80×50', b: 'Enclosed', h: '—', p: '8', u: 'Everyday parcels, small appliances' },
      { v: 'Pickup', w: '800 kg', vol: '2.50 m³', d: '200×150', b: 'Open bed', h: 'Driver helps', p: '15', u: 'Furniture, building materials' },
      { v: 'Van', w: '1,000 kg', vol: '6.00 m³', d: '250×160×150', b: 'Enclosed', h: 'Driver helps', p: '20', u: 'Shop stock, sheltered loads' },
      { v: 'Small truck', w: '2,500 kg', vol: '12.00 m³', d: '350×180×190', b: 'Enclosed', h: 'Tail lift', p: '20', u: 'Bulk moves, palletised freight' },
      { v: 'Large truck', w: '10,000 kg', vol: '40.00 m³', d: '620×240×260', b: 'Enclosed', h: 'Tail lift', p: '20', u: 'Full loads between cities' },
    ],

    carryHead: { kicker: 'The limits', title: "What we carry — and what we don't" },
    carryYes: { t: 'We carry', items: ['Documents and envelopes', 'General goods', 'Sealed, non-perishable food', 'Sealed medicine', 'Appliances and electronics', 'Furniture', 'Construction materials', 'Plants', 'Fragile items and glass', 'Palletised freight'] },
    carryNo: { t: 'We cannot carry', items: ['Hazardous materials — flammable, explosive, corrosive, compressed gas, toxic', 'Weapons, ammunition and their components', 'Live animals', 'Cash, gold, jewellery and bearer instruments', 'Unsealed or temperature-dependent food — no cold chain', 'Human remains or biological samples', 'Anything unlawful to transport', "Sealed containers whose contents you won't declare"] },
    carryNote: 'A driver may refuse prohibited goods at pickup. The refusal is recorded with a photo.',

    priceHead: { kicker: 'Pricing & payment', title: 'No surprises. One fee, itemised, before you book.' },
    priceBuildT: 'What the fee is built from',
    priceBuild: [
      { t: 'Base fare', d: 'Fixed per vehicle type.' },
      { t: 'Distance', d: 'Rate per kilometre of route.' },
      { t: 'Intercity surcharge', d: 'Fixed per city pair, when the trip crosses cities.' },
    ],
    priceExtraT: 'Additional charges — stated up front, applied only if they happen',
    priceExtra: [
      'Re-attempt fee — a second delivery attempt',
      'Return leg fee — goods coming back to you',
      'Storage fee — daily rate at the city holding point',
      'Cancellation fee — tiered by how far the driver has got',
    ],
    payT: 'Ways to pay',
    pay: [
      { t: 'Sham Cash', d: 'Online, after a driver accepts' },
      { t: 'Syriatel Cash', d: 'Online, after a driver accepts' },
      { t: 'Cash at pickup', d: 'Hand the fee to the driver, in-app receipt issued' },
    ],
    priceBounds: [
      'The sender pays. The receiver is never asked for money and never sees a price.',
      'Naqla charges for transport. We do not collect the value of the goods on your behalf.',
    ],

    trackHead: { kicker: 'Tracking & proof', title: 'Know where your shipment is — and own the proof it arrived' },
    track: [
      { t: 'Status at every stage', d: "From posted to delivered, with the driver's name, vehicle and plate once assigned." },
      { t: 'An arrival window, not a dot to chase', d: 'You see when to expect the driver. The live position appears on the final approach, when it actually helps.' },
      { t: 'Two scans close the delivery', d: 'The driver scans the package QR, the receiver shows their own QR from an SMS link in any browser. No app to install.' },
      { t: 'A delivery photo, timestamped and located', d: 'Kept on the order and available to you.' },
      { t: 'No smartphone? No problem.', d: 'A typed code sent by SMS works as the fallback.' },
    ],

    protectHead: { kicker: 'Protection & terms', title: 'Written down before you send, not argued about afterwards' },
    protect: [
      { t: 'A published liability cap', d: 'Every shipment carries a stated maximum compensation for loss or damage. You see it and accept it at booking.' },
      { t: 'Compensation is calculated, not negotiated', d: 'It is the lower of your declared value and the published cap, decided from the pickup photo, the delivery photo, the scan record and the GPS trail.' },
      { t: 'Refunds are automatic, not a support request', d: 'Online payments return to the same number and provider; cash returns as in-app credit.' },
      { t: 'If the failure is ours, you pay nothing', d: 'No driver found, driver no-show, vehicle failure, or a cancellation by us — full refund, no charge.' },
      { t: 'Cancellation costs what the driver has actually done', d: 'Nothing before a driver accepts; a low tier once he commits; the trip fee once he is on the way.' },
    ],
    exclT: 'Exclusions we state plainly',
    excl: [
      'Fragile items sent without declaring fragile handling',
      'Goods on an open-bed vehicle without confirming wrapping',
      'Goods taken from the driver anywhere other than the registered address',
      'Consequential loss of any kind',
    ],

    failHead: { kicker: 'If a delivery fails', title: 'Nothing gets stuck. You choose what happens next.' },
    fail: [
      { t: 'Re-attempt', d: 'Another delivery attempt within the limit. A re-attempt fee applies.' },
      { t: 'Redirect', d: 'A new address or a new recipient, authorised by you. Repriced if the distance changes materially.' },
      { t: 'Return', d: 'The goods come back to you. A return leg fee applies and you confirm receipt with a photo.' },
      { t: 'Holding point', d: "If you can't take the goods back, they go to our holding point in the city. Daily storage applies, and the collection address and final date are stated to you in writing." },
    ],
    failNote: 'A delivery is all or nothing. If the receiver refuses one package, the whole order goes on hold and you decide.',

    bizHead: { kicker: 'For businesses', title: 'Built for shops, warehouses and traders' },
    biz: [
      'A business account with your company name on every order and receipt',
      'Up to 20 packages in a single order, each with its own QR and its own tracked status',
      'A saved address book — shop, warehouse, regular customers',
      'Full order history bound to your phone number, with receipts and fee breakdowns',
      'Your customers get status updates and a verification link without installing anything',
      'Photo and scan evidence on every shipment — your record if a customer disputes',
    ],

    coverHead: { kicker: 'Coverage', title: 'Intercity and inside the city, on the same service' },
    cover: [
      'Damascus ⇄ Aleppo is where we started.',
      "We deliver in our active cities. If your address is outside coverage, we'll tell you at once — and we record the request so we know where to open next.",
    ],

    driverHead: { kicker: 'Work with us', title: 'Own a vehicle? Turn it into income.' },
    driver: [
      'Register with your phone, upload your ID, licence and vehicle registration',
      'See the fee and your own payout before you accept a job',
      "One wallet, one number — what you're owed and what you owe, clearly",
      'Regular payouts on a fixed cycle',
      'Every fee split and every adjustment visible, with the reason, in your language',
    ],
    driverCta: 'Apply as a driver',

    faqHead: { kicker: 'FAQ', title: 'The questions asked before a first shipment' },
    faq: [
      { q: 'When do I pay?', a: 'After a driver accepts your order. Nothing is charged while it is still looking for a driver.' },
      { q: 'Can the receiver pay?', a: 'No. The sender always pays, and the receiver is never shown a price.' },
      { q: 'Do you collect the price of the goods from the receiver?', a: 'No. We charge for transport only.' },
      { q: 'Does the receiver need the app?', a: 'No. A link arrives by SMS and the verification QR opens in any browser.' },
      { q: 'Can I choose the vehicle myself?', a: "We recommend it from your load. You can upgrade to a larger one; we don't offer a smaller one than the load needs." },
      { q: 'Why are photos mandatory?', a: 'They are the agreed starting condition of your goods, and they settle damage claims fairly.' },
      { q: "What if the receiver isn't there?", a: 'The driver waits, records the failure with a photo, and you choose: re-attempt, redirect, or return.' },
      { q: 'What if my goods are damaged?', a: 'We compare the pickup and delivery photos and the scan record, and compensate per the published policy — the lower of your declared value and the liability cap.' },
      { q: 'Can I cancel?', a: 'Yes. Free before a driver accepts; after that the fee reflects the work already done.' },
      { q: 'Is the app in Arabic?', a: 'Arabic is the default, with full right-to-left design. English is one tap away.' },
    ],

    footHead: 'Your shipment is one order away.',
    footNote: 'Naqla charges for transport. We do not collect the value of the goods on your behalf.',
    footCols: [
      { t: 'Service', links: ['How it works', 'The fleet', 'Pricing & payment', 'Tracking & proof'] },
      { t: 'Terms', links: ['Protection & refunds', 'What we carry', 'If a delivery fails', 'FAQ'] },
      { t: 'Naqla', links: ['For businesses', 'Drive with Naqla', 'Coverage', 'Talk to us'] },
    ],
    footLegal: 'Naqla — delivery and freight across Syria.',
  },
};

/* Scene pacing + accent, shared by both languages (visual, not linguistic).
   `scroll` = viewport-heights of dwell; `linger` settles the camera mid-scene
   exactly where the copy peaks (engine remaps time, seams untouched). */
const SCENE_STYLE = {
  sender:   { accent: ORANGE_ON_DARK, scroll: 1.7, linger: 0.42 },
  pickup:   { accent: TEAL_ON_DARK,   scroll: 1.4, linger: 0.34 },
  fleet:    { accent: TEAL_ON_DARK,   scroll: 1.6, linger: 0.44 },
  route:    { accent: TEAL_ON_DARK,   scroll: 1.3, linger: 0.22 },
  delivery: { accent: TEAL_ON_DARK,   scroll: 1.5, linger: 0.40 },
  finale:   { accent: ORANGE_ON_DARK, scroll: 1.9, linger: 0.46 },
};

// Anchor ids for the detail view, referenced by nav + footer links.
const ANCHORS = ['pillars', 'steps', 'fleet', 'carry', 'pricing', 'tracking', 'protection', 'fails', 'business', 'coverage', 'drivers', 'faq'];

/* Max weight in kg per fleet row, same order as CONTENT.*.fleet — drives the
   capacity bars. Language-independent, so it lives outside the copy. Log-scaled
   at render time: linear would make the motorbike a 0.2% sliver next to the truck. */
const FLEET_KG = [20, 200, 800, 1000, 2500, 10000];

module.exports = { CONTENT, SCENES, SCENE_STYLE, ANCHORS, TEAL, ORANGE, FLEET_KG };
