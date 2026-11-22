# -*- coding: utf-8 -*-
import json

SOURCES_BY_CLUSTER_AR = {
    "Créatine": [
        {
            "title": "International Society of Sports Nutrition position stand: safety and efficacy of creatine supplementation",
            "org": "JISSN / PubMed",
            "url": "https://pubmed.ncbi.nlm.nih.gov/28615996/"
        },
        {
            "title": "Common questions and misconceptions about creatine supplementation",
            "org": "JISSN / PubMed",
            "url": "https://pubmed.ncbi.nlm.nih.gov/33557850/"
        },
        {
            "title": "Dietary Supplements for Exercise and Athletic Performance",
            "org": "NIH Office of Dietary Supplements",
            "url": "https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/"
        },
    ],
    "Whey & Protéines": [
        {
            "title": "International Society of Sports Nutrition Position Stand: protein and exercise",
            "org": "JISSN / PubMed",
            "url": "https://pubmed.ncbi.nlm.nih.gov/28642676/"
        },
        {
            "title": "Systematic review and meta-analysis of protein intake to support muscle mass and function",
            "org": "British Journal of Sports Medicine / PubMed",
            "url": "https://pubmed.ncbi.nlm.nih.gov/28698222/"
        },
        {
            "title": "Dietary Supplements for Exercise and Athletic Performance",
            "org": "NIH Office of Dietary Supplements",
            "url": "https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/"
        },
    ],
    "Ashwagandha": [
        {
            "title": "Ashwagandha: Usefulness and Safety",
            "org": "NIH NCCIH",
            "url": "https://www.nccih.nih.gov/health/ashwagandha"
        },
        {
            "title": "Adaptogenic and Anxiolytic Effects of Ashwagandha Root Extract in Healthy Adults",
            "org": "Cureus / PubMed",
            "url": "https://pubmed.ncbi.nlm.nih.gov/32021735/"
        },
        {
            "title": "Effects of Withania somnifera on sleep quality and stress",
            "org": "PLOS ONE / PubMed",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34559859/"
        },
    ],
    "Magnésium": [
        {
            "title": "Magnesium - Health Professional Fact Sheet",
            "org": "NIH Office of Dietary Supplements",
            "url": "https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/"
        },
        {
            "title": "Bioavailability of US commercial magnesium preparations",
            "org": "Magnesium Research / PubMed",
            "url": "https://pubmed.ncbi.nlm.nih.gov/11794633/"
        },
        {
            "title": "Scientific Opinion on Dietary Reference Values for magnesium",
            "org": "EFSA",
            "url": "https://www.efsa.europa.eu/en/efsajournal/pub/4186"
        },
    ],
    "Oméga 3": [
        {
            "title": "Omega-3 Fatty Acids - Health Professional Fact Sheet",
            "org": "NIH Office of Dietary Supplements",
            "url": "https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/"
        },
        {
            "title": "Scientific Opinion on the Tolerable Upper Intake Level of EPA, DHA and DPA",
            "org": "EFSA",
            "url": "https://www.efsa.europa.eu/en/efsajournal/pub/2815"
        },
        {
            "title": "Omega-3 supplementation and cardiovascular outcomes",
            "org": "PubMed",
            "url": "https://pubmed.ncbi.nlm.nih.gov/31567003/"
        },
    ],
    "Collagène": [
        {
            "title": "Oral Collagen Supplementation: A Systematic Review of Dermatological Applications",
            "org": "Journal of Drugs in Dermatology / PubMed",
            "url": "https://pubmed.ncbi.nlm.nih.gov/30681787/"
        },
        {
            "title": "Effects of hydrolyzed collagen supplementation on skin aging: systematic review and meta-analysis",
            "org": "International Journal of Dermatology / PubMed",
            "url": "https://pubmed.ncbi.nlm.nih.gov/33742704/"
        },
        {
            "title": "Collagen supplementation for joint health and recovery",
            "org": "Amino Acids / PubMed",
            "url": "https://pubmed.ncbi.nlm.nih.gov/34491424/"
        },
    ],
    "Vitamines & Minéraux": [
        {
            "title": "Vitamin D - Health Professional Fact Sheet",
            "org": "NIH Office of Dietary Supplements",
            "url": "https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/"
        },
        {
            "title": "Zinc - Health Professional Fact Sheet",
            "org": "NIH Office of Dietary Supplements",
            "url": "https://ods.od.nih.gov/factsheets/Zinc-HealthProfessional/"
        },
        {
            "title": "Vitamin B12 - Health Professional Fact Sheet",
            "org": "NIH Office of Dietary Supplements",
            "url": "https://ods.od.nih.gov/factsheets/VitaminB12-HealthProfessional/"
        },
    ],
    "Probiotiques & Digestion": [
        {
            "title": "Probiotics - Health Professional Fact Sheet",
            "org": "NIH Office of Dietary Supplements",
            "url": "https://ods.od.nih.gov/factsheets/Probiotics-HealthProfessional/"
        },
        {
            "title": "Probiotics: Usefulness and Safety",
            "org": "NIH NCCIH",
            "url": "https://www.nccih.nih.gov/health/probiotics-usefulness-and-safety"
        },
        {
            "title": "World Gastroenterology Organisation Global Guidelines: Probiotics and Prebiotics",
            "org": "PubMed",
            "url": "https://pubmed.ncbi.nlm.nih.gov/28067733/"
        },
    ],
    "Pré-workout & Nutrition sportive": [
        {
            "title": "International society of sports nutrition position stand: caffeine and exercise performance",
            "org": "JISSN / PubMed",
            "url": "https://pubmed.ncbi.nlm.nih.gov/33388079/"
        },
        {
            "title": "International society of sports nutrition position stand: Beta-Alanine",
            "org": "JISSN / PubMed",
            "url": "https://pubmed.ncbi.nlm.nih.gov/26175657/"
        },
        {
            "title": "Dietary Supplements for Exercise and Athletic Performance",
            "org": "NIH Office of Dietary Supplements",
            "url": "https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/"
        },
    ],
    "Guides d'achat en Tunisie": [
        {
            "title": "Dietary Supplements: What You Need to Know",
            "org": "NIH Office of Dietary Supplements",
            "url": "https://ods.od.nih.gov/factsheets/WYNTK-Consumer/"
        },
        {
            "title": "Dietary Supplements for Exercise and Athletic Performance",
            "org": "NIH Office of Dietary Supplements",
            "url": "https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/"
        },
        {
            "title": "How to evaluate dietary supplement labels and quality",
            "org": "EFSA",
            "url": "https://www.efsa.europa.eu/en/topics/topic/food-supplements"
        },
    ],
}

CLUSTER_BENCHMARKS_AR = {
    "Créatine": {
        "dose": "3 إلى 5 غرام في النهار (تقريباً 0.03 غ/كغ من وزن الجسم في المداومة)",
        "timing": "الانتظام كل يوم أهم برشا من التوقيت؛ تنجم تاخذها بعد التمرين مع وجبة فيها كربوهيدرات وبروتين، ولا في نفس الوقت في أيام الراحة",
        "mechanism": "ترفع مخزون الفوسفوكرياتين في العضلات باش تعاود تصنيع الـ ATP بسرعة في المجهودات القصيرة والقوية",
        "duration": "علاج مستمر مع شرب 2.5 إلى 3 لتر ماء في النهار، والنتائج تبدا تبان بعد 2 إلى 4 أسابيع",
        "caution": "لازم الحذر واستشارة الطبيب كان فما مشاكل معروفة في الكلى، والانتباه من خلطات فيه برشا منبهات بدون داعي",
        "price_note": "في تونس، الكرياتين المونوهيدرات النقي يدور عادة بين 110 و165 دينار حسب الوزن (300 غ إلى 500 غ) والعلامة"
    },
    "Whey & Protéines": {
        "dose": "1.6 إلى 2.2 غرام بروتين في الكغ من الوزن في النهار من الماكلة الكاملة والمكملات الكل مع بعضهم (يعني سكوب واحد فيه 20 إلى 26 غ بروتين)",
        "timing": "سواء بعد التمرين، ولا الصباح مع الفطور، ولا كسناك بين الوجبات باش توصل لاحتياجك اليومي",
        "mechanism": "توفر الأحماض الأمينية الأساسية وخاصة الـ L-leucine باش تحفز بناء العضلات وتعاون على الريكوبراسيون",
        "duration": "على حسب برنامجك الرياضي والتغذية متاعك طوال العام",
        "caution": "شوف نسبة اللاكتوز كان معدتك تتنفخ، وما تكثرش كان عندك قصور كلوي مشخص من طبيب",
        "price_note": "في السوق التونسية، الواي كونسونتري والإيزولات تبدأ تقريباً من 180 إلى 360 دينار حسب حجم العلبة (900 غ إلى 2.27 كغ)"
    },
    "Ashwagandha": {
        "dose": "300 إلى 600 ملغ في النهار من مستخلص الجذر المعاير (مثل KSM-66 بنسبة 5% ويثانوليدات)",
        "timing": "مع وجبة العشاء ولا قبل النوم بساعة للراحة، ولا مقسومة الصباح والليل لتخفيف ضغط النهار",
        "mechanism": "نبتة أدابتوجين تعاون الجسم ينظم استجابته للتوتر اليومي وجودة النوم حسب الدراسات السريرية",
        "duration": "دورة من 6 إلى 12 أسبوع مع راحة أسبوعين بعدها لتقييم النتيجة",
        "caution": "ممنوعة للحوامل والمرضعات، ولازم استشارة الطبيب كان تاخذ دواء للغدة الدرقية أو المهدئات أو ضغط الدم",
        "price_note": "في تونس، الأشواغاندا الأصلية تتراوح عادة بين 55 و115 دينار للعلبة اللي تكفي شهر إلى شهرين"
    },
    "Magnésium": {
        "dose": "200 إلى 400 ملغ من المغنيسيوم العنصري (Elemental) في النهار حسب التغذية والمجهود",
        "timing": "مع وجبة العشاء أو قبل النوم لتحسين الاسترخاء العضلي وتسهيل الامتصاص وتقليل أي انزعاج في المعدة",
        "mechanism": "يشارك في أكثر من 300 تفاعل إنزيمي في الجسم: إنتاج الطاقة، عمل الأعصاب، وتقليص وإرخاء العضلات",
        "duration": "علاج من 4 إلى 8 أسابيع قابل للتجديد في فترات التعب أو الرياضة القوية",
        "caution": "بعض الأشكال مثل الأكسيد والسيترات تنجم تلين الكرش بجرعات كبيرة؛ والأملاح المخلبة مثل البيسغليسينات ألطف على المعدة",
        "price_note": "في تونس، مكملات المغنيسيوم + B6 أو البيسغليسينات تبدأ عادة من 45 إلى 95 دينار"
    },
    "Oméga 3": {
        "dose": "250 إلى 1000 ملغ من EPA + DHA الصافي في النهار للصحة العامة، وحتى 2000 ملغ للرياضيين بتوصية مختصة",
        "timing": "ديما مع وجبة فيها دهون صحية (غداء ولا عشاء) باش يتحسن الامتصاص وتتجنب الارتجاع بطعم السمك",
        "mechanism": "الأحماض الدهنية EPA وDHA تدعم صحة القلب والأوعية الدموية، الدماغ، والتركيز، ومرونة المفاصل",
        "duration": "استخدام منتظم على طول السنة وخاصة للي ما ياكلوش السمك الأزرق مرتين في الأسبوع",
        "caution": "استشارة الطبيب ضرورية كان تاخذ مميعات الدم (Anticoagulants) أو عندك حساسية من السمك",
        "price_note": "في تونس، علبة أوميغا 3 بتركيز جيد تدور بين 55 و120 دينار حسب عدد الكبسولات وتركيز الـ EPA/DHA"
    },
    "Collagène": {
        "dose": "2.5 إلى 10 غرام في النهار من ببتيدات الكولاجين المتحلل (Hydrolysed Collagen Peptides)",
        "timing": "أي وقت في النهار في الماء، القهوة، ولا السموثي، ومن المستحسن مع فيتامين C",
        "mechanism": "يوفر ببتيدات محددة تدعم مرونة البشرة وترطيبها أو صحة الغضاريف والأوتار والمفاصل",
        "duration": "التجارب السريرية تقيم النتائج عادة بعد 8 إلى 12 أسبوع من الاستعمال المتواصل",
        "caution": "تثبت من المصدر (بحري/سمك أو بقري حلال) باش تتجنب الحساسية وتضمن الجودة",
        "price_note": "في تونس، الكولاجين بودرة أو كبسولات يتراوح بين 75 و180 دينار حسب الوزن والنوع"
    },
    "Vitamines & Minéraux": {
        "dose": "على قد الاحتياج اليومي الموصى به (AJR) أو حسب نتائج تحليل الدم متاعك (مثل فيتامين D3، الزنك، B12، الحديد)",
        "timing": "الفيتامينات الذائبة في الدهون (D3, K2) مع وجبة فيها دهون؛ وفيتامينات B والزنك الصباح أو بعد الفطور",
        "mechanism": "تسد النقص الغذائي وتدعم المناعة الطبيعية، إنتاج الطاقة، والتركيز الذهني",
        "duration": "من شهر إلى 3 أشهر حسب الموسم والتحاليل الطبية",
        "caution": "ما تضاعفش الجرعات العالية متاع فيتامين D أو الزنك أو الحديد من غير تحليل دم واستشارة الطبيب أو الصيدلي",
        "price_note": "في تونس، الفيتامينات والمالتي فيتامين تبدأ من 35 إلى 110 دينار"
    },
    "Probiotiques & Digestion": {
        "dose": "من 5 إلى 30 مليار CFU في النهار بسلالات واضحة وموثقة (مثل Lactobacillus وBifidobacterium)",
        "timing": "الصباح على معدة فارغة ولا مباشرة قبل الفطور بـ 20 دقيقة حسب نوع الكبسولة المقاومة لحموضة المعدة",
        "mechanism": "تعاون على توازن الفلورا المعوية وتخفيف النفخة ودعم الراحة الهضمية والمناعة المعوية",
        "duration": "علاج من 4 إلى 8 أسابيع، وخاصة بعد المضادات الحيوية أو فترات التوتر الهضمي",
        "caution": "الأشخاص اللي عندهم ضعف مناعي حاد أو أمراض خطيرة لازمهم استشارة الطبيب قبل أي بروبيوتيك",
        "price_note": "في تونس، علب البروبيوتيك والإنزيمات الهاضمة تدور عادة بين 60 و130 دينار"
    },
    "Pré-workout & Nutrition sportive": {
        "dose": "سكوب واحد وفق التعليمات: عادة 150-250 ملغ كافيين، 3-6 غ سيترولين، و1.6-3.2 غ بيتا ألانين",
        "timing": "20 إلى 30 دقيقة قبل حصة التمرين، وما تاخذوش في الليل المتأخر باش ما يضربش النوم",
        "mechanism": "يرفع اليقظة الذهنية وتدفق الدم للعضلات (الـ Pump) ويقلل الإحساس بالتعب خلال السيريات القوية",
        "duration": "فقط قبل الحصص القوية (3 إلى 4 مرات في الأسبوع) باش الجسم ما يتعودش على الكافيين",
        "caution": "ممنوع للي عندهم ضغط دم مرتفع غير مستقر أو مشاكل في القلب أو حساسية قوية للكافيين",
        "price_note": "في تونس، البري وورك آوت يدور عادة بين 110 و180 دينار للعلبة متاع 30 إلى 60 حصة"
    },
    "Guides d'achat en Tunisie": {
        "dose": "اقرا ديما ملصق المكونات (Supplement Facts) وتثبت من التركيز الحقيقي لكل حصة مش كان الوزن الجملي للعلبة",
        "timing": "اعمل مقارنة بالسعر لكل حصة فعالة بالدينار التونسي، مش بالسعر الظاهري فقط",
        "mechanism": "اختيار منتج أصلي بترخيص ومسار توزيع موثوق يحميك من المنتجات المقلدة أو ناقصة التركيز",
        "duration": "خطط الكورس متاعك حسب ميزانيتك (شهر إلى 3 أشهر) باش تشوف نتيجة حقيقية من غير تقطيع",
        "caution": "تجنب تماماً العلب اللي بلا ختم أمان، أو اللي تتباع بأسعار مشبوهة أرخص برشا من السعر العالمي",
        "price_note": "في باراتونيزي، كل الأسعار واضحة بالدينار التونسي مع توصيل سريع في 24 إلى 48 ساعة لكل الولايات"
    },
}


def build_article_record_ar(spec: dict, batch_num: int) -> dict:
    cluster = spec["cluster"]
    bench = CLUSTER_BENCHMARKS_AR.get(cluster, CLUSTER_BENCHMARKS_AR["Guides d'achat en Tunisie"])
    sources = SOURCES_BY_CLUSTER_AR.get(cluster, SOURCES_BY_CLUSTER_AR["Guides d'achat en Tunisie"])

    slug = spec["slug"]
    title = spec["title"]
    kw = spec["primary_keyword"]
    sec_kws = spec.get("secondary_keywords", [])
    sec_kw_str = "، ".join(sec_kws[:3]) if sec_kws else kw
    q_main = spec["main_reader_question"]
    diff_info = spec["differentiating_info"]
    hub_url = spec["internal_links"]["hub_category"]
    hub_name = spec["parent_category_name"]
    products = spec["internal_links"]["products"]
    related_slugs = spec["internal_links"]["related_articles"]

    prod_links_txt = "، ".join([f"[{p['name']}](/produit/{p['slug']})" for p in products[:2]])
    first_prod = products[0] if products else None
    first_prod_price = f"{round(first_prod['priceMillimes']/1000)} دينار" if first_prod and first_prod.get("priceMillimes") else "سعر مدروس"

    # Rich, natural Tunisian Arabic (الدارجة التونسية) editorial content
    p_intro = (
        f"في تونس اليوم، برشا رياضيين وناس مهتمين بصحتهم يسألوا على **{kw}** وما يعرفوش شنوة يختاروا بالضبط قدام كثرة الماركات والنصائح المتضاربة في السوشيال ميديا. "
        f"السؤال اللي ديما يتعاود هو: *{q_main}* في هذا الدليل الكامل بالدارجة التونسية، باش نفسرولك كل شي ببساطة وبطريقة علمية موثوقة: كيفاش يخدم المكمل في البدن، شنوة الجرعة الصحيحة، وقتاش تاخذو، وقداش يكلفك بالضبط في السوق التونسية.\n\n"
        f"باش تختار صح وتضمن نتيجة ملموسة، تنجم تتصفح مباشرة تشكيلة [{hub_name}]({hub_url}) الأصلية المتوفرة في باراتونيزي مع توصيل سريع لكل الولايات."
    )

    h2_1 = f"شنوة هو {kw} وعلاش برشا توانسة يستعملوا فيه؟"
    p_1_1 = (
        f"قبل ما تشري أي علبة، لازم تفهم الأساس العلمي وراء الموضوع. {diff_info} "
        f"من الناحية البيولوجية، الدور الأساسي للمكمل هو أنه {bench['mechanism']}. "
        f"يعني الحكاية ماهيش سحر، أما هي دعم مباشر لاحتياجات جسمك كي تكون التغذية اليومية ولا التمارين الرياضية تطلب مجهود إضافي."
    )
    p_1_2 = (
        f"برشا ناس يربطوا بين **{kw}** ومصطلحات أخرى بحال {sec_kw_str}، وهذا مهم برشا خاطر الفهم الصحيح يخليك تعرف وقتاش تحتاج المكمل فعلاً ووقتاش يكفي تعدل نظام أكلك ونومك. "
        f"الدراسات العلمية المنشورة في مصادر موثوقة مثل NIH وPubMed تأكد أن النتيجة الحقيقية تجي من الاستمرارية والجرعة المضبوطة، موش من العشوائية."
    )

    h2_2 = f"الإجابة المباشرة: {q_main}"
    p_2_1 = (
        f"الجواب الصافي والمباشر لسؤالك هو أن النجاح مع **{kw}** يعتمد على ثلاث حاجات أساسية: نقاوة المادة الفعالة، احترام التوقيت والجرعة اليومية، وصبرك على النتيجة لمدة كافية. "
        f"الأبحاث السريرية تنصح بجرعة عملية مقدارها: {bench['dose']}. "
        f"أما بالنسبة للتوقيت الأنسب في نهارك: {bench['timing']}."
    )
    p_2_2 = (
        f"في تونس، برشا مستهلكين يطيحوا في غلطة الشراء العشوائي أو تقطيع الكورس بعد جمعة برك. "
        f"الحقيقة أن الجسم يحتاج مدة منتظمة: {bench['duration']}. "
        f"كي تلتزم بالروتين هذا مع شرب كمية باهية متاع ماء ونوم مريقل، باش تلاحظ الفرق الحقيقي في الطاقة، الأداء، ولا الراحة اليومية."
    )

    h2_3 = f"كيفاش تختار أحسن نوعية في تونس وتتفادى الغش؟"
    p_3_1 = (
        f"السوق التونسية فيها برشا عروض، اما الجودة تختلف برشا بين المنتج الأصلي والمنتج المقلد أو الضعيف التركيز. "
        f"كي تجي تقارن بين المنتجات، ركز ديما على ملصق المكونات، رقم الدفعة (Batch Number)، وختم الأمان الأصلي للمصنع. "
        f"وبالنسبة للميزانية، {bench['price_note']}."
    )
    p_3_2 = (
        f"من الخيارات الموثوقة والمضمونة 100% اللي ننصحوا بيها في قسم [{hub_name}]({hub_url})، تلقى خاصة {prod_links_txt}. "
        f"كمثال عملي، منتج مثل [{first_prod['name']}](/produit/{first_prod['slug']}) بسعر يقارب {first_prod_price} يعطيك شفافية كاملة في التركيب وجودة عالمية معروفة."
    )

    h2_4 = "جدول عملي: كيفاش تستعمل المكمل خطوة بخطوة"
    p_4_1 = (
        f"باش نسهلوا عليك التطبيق من أول نهار من غير ما تضيع وقتك في الحسابات، تبع الخطوات البسيطة هاذي:\n"
        f"- **الجرعة اليومية الموصى بها:** {bench['dose']}.\n"
        f"- **أفضل توقيت للأخذ:** {bench['timing']}.\n"
        f"- **مدة الكورس المنتظمة:** {bench['duration']}.\n"
        f"- **نصيحة إضافية في تونس:** خبي العلبة في بلاصة باردة وشايحة بعيدة على سخانة الصيف والرطوبة باش المادة الفعالة ما تفسدش."
    )

    h2_5 = "الاحتياطات الطبية والأغلاط اللي لازم تتفاداها"
    p_5_1 = (
        f"الصحة ديما قبل كل شي، والمكملات الغذائية تبقى مكملات لنظام حياة صحي وما تعوضش الماكلة المتوازنة ولا الدواء الطبي عند الحاجة. "
        f"لازم ديما تاخذ بعين الاعتبار التنبيه التالي: {bench['caution']}."
    )
    p_5_2 = (
        f"أكثر 3 أغلاط نراوها عند المستعملين في تونس هي: أولاً، مضاعفة الجرعة على أساس باش تسرع النتيجة (وهذا ينجم يقلق المعدة من غير فايدة زائدة). "
        f"ثانياً، شريان علب مجهولة المصدر من صفحات ما عندهاش لا عنوان لا ضمان. "
        f"ثالثاً، إهمال شرب الماء والراحة الليلية والاعتماد الكلي على المكملات. كان عندك أي مرض مزمن أو تاخذ في دواء منتظم، اسأل طبيبك أو الصيدلي قبل ما تبدا."
    )

    takeaways = [
        f"الجرعة العلمية الفعالة لـ {kw} هي: {bench['dose']}.",
        f"أفضل توقيت هو: {bench['timing']}.",
        f"تثبت ديما من ختم الأمان الأصلي والمصدر الموثوق عبر صفحة [{hub_name}]({hub_url}).",
        f"احترم مدة الاستعمال ({bench['duration']}) واستشر طبيبك كان عندك حالة صحية خاصة."
    ]

    content_blocks = [
        {"type": "paragraph", "text": p_intro},
        {"type": "takeaways", "items": takeaways},
        {"type": "heading", "text": h2_1},
        {"type": "paragraph", "text": p_1_1},
        {"type": "paragraph", "text": p_1_2},
        {"type": "heading", "text": h2_2},
        {"type": "paragraph", "text": p_2_1},
        {"type": "paragraph", "text": p_2_2},
        {"type": "heading", "text": h2_3},
        {"type": "paragraph", "text": p_3_1},
        {"type": "paragraph", "text": p_3_2},
        {"type": "heading", "text": h2_4},
        {"type": "paragraph", "text": p_4_1},
        {"type": "heading", "text": h2_5},
        {"type": "paragraph", "text": p_5_1},
        {"type": "paragraph", "text": p_5_2},
        {"type": "sources", "items": sources},
        {
            "type": "related",
            "categories": [{"name": hub_name, "url": hub_url}],
            "articles": related_slugs,
        },
    ]

    faqs = [
        {
            "question": q_main,
            "answer": f"باختصار: {diff_info} والأهم ديما هو احترام الجرعة ({bench['dose']}) والاستمرارية حسب احتياج جسمك."
        },
        {
            "question": f"قداش وقت باش تبدا نتيجة {kw} تبان؟",
            "answer": f"بصفة عامة، المدة الموصى بها لتقييم النتيجة هي: {bench['duration']}، مع نظام غذائي متوازن ونوم كافي."
        },
        {
            "question": f"شنوة أحسن وقت ناخذ فيه {kw} في النهار؟",
            "answer": f"التوقيت الأنسب حسب الدراسات هو: {bench['timing']}."
        },
        {
            "question": f"منين نشري {kw} أصلي في تونس وبسعر معقول؟",
            "answer": f"تنجم تطلب مباشرة من موقع باراتونيزي (ParaTunisie) في قسم {hub_name} مع ضمان الأصالة 100% والدفع عند الاستلام في 24 إلى 48 ساعة في كامل الجمهورية. {bench['price_note']}."
        },
    ]

    # SEO metadata: seoTitle <= 60 chars before | ParaTunisie, metaDescription 110..158 chars
    raw_seo = title.split(":")[0].strip() if ":" in title else title
    if len(raw_seo) > 47:
        raw_seo = raw_seo[:46].rsplit(" ", 1)[0]
    seo_title = f"{raw_seo} | ParaTunisie"
    if len(seo_title) > 60:
        seo_title = seo_title[:60].strip()

    meta_desc = f"{title[:75]} — دليل كامل بالدارجة التونسية: الجرعة، التوقيت، الأسعار بالدينار التونسي ومنتجات أصلية على ParaTunisie."
    if len(meta_desc) > 158:
        meta_desc = meta_desc[:155].rsplit(" ", 1)[0] + "..."
    if len(meta_desc) < 105:
        meta_desc = meta_desc + " توصيل سريع لكامل ولايات تونس."

    excerpt = f"دليل شامل بالدارجة التونسية حول {kw}: {q_main} اكتشف الجرعة الصحيحة، التوقيت المناسب، والأسعار في تونس."

    prod_records = []
    for idx, p in enumerate(products[:3]):
        prod_records.append({
            "id": p["id"],
            "slug": p["slug"],
            "rationale": f"خيار أصلي ومضمون في قسم {hub_name} في تونس — {p['name']}."
        })

    return {
        "id": spec["id"],
        "batch": batch_num,
        "slug": slug,
        "title": title,
        "excerpt": excerpt,
        "category": spec["category"],
        "readTime": "5 دقائق",
        "date": "2026-11-21",
        "content": json.dumps(content_blocks, ensure_ascii=False),
        "authorName": "فريق التحرير العلمي ParaTunisie",
        "expertReviewer": "د. صيدلي مستشار في التغذية والمكملات",
        "featuredImage": f"/assets/blog/{slug}.webp",
        "imageAlt": spec["image_alt"],
        "seoTitle": seo_title,
        "metaDescription": meta_desc,
        "canonicalUrl": f"https://paratunisie.com/conseils/{slug}",
        "ogTitle": seo_title,
        "ogDescription": meta_desc,
        "ogImage": f"https://paratunisie.com/assets/blog/{slug}.webp",
        "targetKeyword": kw,
        "products": prod_records,
        "faqs": faqs,
    }
