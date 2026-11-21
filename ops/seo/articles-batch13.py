"""Batch 13 articles -> SQL (Article rows + FAQ). Facts limited to well-established public references (NIH Office of Dietary Supplements,
NCCIH). US reference values are labelled as such. No product claims, no prices. Reuses the existing /assets/blog/<slug>.webp image of the same slug.
Rollback: delete from "Article" where slug in (...) -- FAQ rows cascade by articleId (delete them first)."""
import sys, json, hashlib

ODS = "https://ods.od.nih.gov/factsheets/"
A = []

def art(slug, title, kw, cat, mins, excerpt, meta, blocks, faqs, sources):
    A.append(dict(slug=slug, title=title, kw=kw, cat=cat, mins=mins, excerpt=excerpt, meta=meta, blocks=blocks, faqs=faqs, sources=sources))

def H(t): return {"type": "heading", "text": t}
def P(t): return {"type": "paragraph", "text": t}

art("calcium-magnesium-vitamine-d3-trilogie-osseuse",
    "Calcium et vitamine D : comprendre leurs rôles complémentaires",
    "calcium vitamine d", "Minéraux", "6 min",
    "Le calcium est le matériau de l'os et la vitamine D aide à l'absorber. Voici ce que disent les références officielles, et les limites à connaître.",
    "Calcium et vitamine D : rôle de chacun, apports de référence, sources alimentaires et précautions avant de prendre un complément.",
    [P("Le calcium est le minéral le plus abondant de l'organisme et la grande majorité se trouve dans les os et les dents. La vitamine D facilite l'absorption intestinale du calcium. Les deux sont donc souvent évoqués ensemble, mais ils ne se remplacent pas."),
     H("Ce que fait chacun"),
     P("Le calcium sert de composant structurel de l'os et intervient aussi dans la contraction musculaire et la transmission nerveuse. La vitamine D contribue à l'absorption du calcium et au maintien d'une bonne minéralisation osseuse. Sans apport suffisant de vitamine D, l'absorption du calcium alimentaire est réduite."),
     H("Quels apports viser ?"),
     P("À titre de repère, l'Office of Dietary Supplements américain (NIH) indique un apport recommandé de 1 000 mg de calcium par jour pour la plupart des adultes de 19 à 50 ans, et de 600 UI (15 µg) de vitamine D par jour pour les adultes jusqu'à 70 ans. Ce sont des repères américains : les valeurs européennes (EFSA) peuvent différer légèrement. Vos besoins personnels dépendent de votre âge, de votre alimentation et de votre état de santé."),
     H("D'où viennent-ils dans l'alimentation ?"),
     P("Le calcium se trouve surtout dans les produits laitiers, certains poissons consommés avec leurs arêtes (sardines), certains légumes verts et les eaux minérales riches en calcium. La vitamine D vient de l'exposition de la peau au soleil, des poissons gras, des œufs et des aliments enrichis. Il est difficile de couvrir les besoins en vitamine D par la seule alimentation."),
     H("Quand un complément est-il envisagé ?"),
     P("Un complément peut être discuté en cas d'apports alimentaires insuffisants, de régime sans produits laitiers, de faible exposition au soleil ou de situation médicale particulière. Seule une prise de sang (dosage de la vitamine D) et l'avis d'un médecin permettent de savoir si vous en avez besoin."),
     H("Précautions importantes"),
     P("Plus n'est pas mieux. L'ODS fixe une limite supérieure de sécurité de 2 500 mg de calcium par jour pour les adultes de 19 à 50 ans, et de 4 000 UI (100 µg) de vitamine D par jour. Dépasser ces limites sur la durée peut provoquer des effets indésirables, notamment un excès de calcium dans le sang. Additionnez les apports de tous vos produits (multivitamines, eaux, aliments enrichis). En cas de maladie rénale, de calculs, de traitement en cours, de grossesse ou d'allaitement, demandez l'avis d'un médecin."),
     H("À retenir"),
     P("Le calcium construit, la vitamine D aide à l'absorber. Commencez par l'alimentation, faites doser votre vitamine D avant de supplémenter, respectez les limites de sécurité et ne considérez jamais un complément comme un traitement. Retrouvez nos références dans la catégorie vitamines et dans la catégorie compléments alimentaires du site."),
     H("Sources"),
     P("NIH Office of Dietary Supplements, Calcium : " + ODS + "Calcium-HealthProfessional/"),
     P("NIH Office of Dietary Supplements, Vitamin D : " + ODS + "VitaminD-HealthProfessional/")],
    [("La vitamine D est-elle indispensable pour absorber le calcium ?", "Elle favorise l'absorption intestinale du calcium. Une carence réduit cette absorption, d'où l'intérêt de faire doser sa vitamine D avant toute supplémentation."),
     ("Peut-on prendre calcium et vitamine D ensemble ?", "Oui, ils sont souvent associés. L'important est de respecter les doses et de tenir compte de tous vos apports, aliments et autres compléments compris."),
     ("Quelle est la limite de sécurité ?", "Les repères américains (ODS) sont de 2 500 mg de calcium et 4 000 UI de vitamine D par jour pour les adultes de 19 à 50 ans. Votre médecin adapte ces repères à votre situation.")],
    [("NIH ODS - Calcium", ODS + "Calcium-HealthProfessional/"), ("NIH ODS - Vitamin D", ODS + "VitaminD-HealthProfessional/")])

art("fer-bisglycinate-sans-constipation-guide",
    "Fer et vitamine C : comprendre leur association",
    "fer et vitamine c", "Minéraux", "6 min",
    "La vitamine C améliore l'absorption du fer d'origine végétale. Ce que l'on sait, ce qu'il faut éviter, et pourquoi ne pas se supplémenter sans analyse.",
    "Fer et vitamine C : pourquoi on les associe, ce qui freine l'absorption du fer, les limites de sécurité et quand demander un avis médical.",
    [P("Le fer sert notamment à fabriquer l'hémoglobine, qui transporte l'oxygène dans le sang. L'organisme absorbe mieux le fer de la viande et du poisson (fer héminique) que celui des végétaux et des produits enrichis (fer non héminique). C'est pour ce second type que la vitamine C intervient."),
     H("Pourquoi la vitamine C est associée au fer"),
     P("Selon l'Office of Dietary Supplements (NIH), la vitamine C améliore l'absorption du fer non héminique lorsqu'elle est consommée en même temps. Concrètement, un jus d'orange, un poivron ou un kiwi pris au repas peuvent aider à mieux absorber le fer des lentilles, des épinards ou des céréales enrichies."),
     H("Ce qui freine l'absorption"),
     P("Le thé et le café (polyphénols), le calcium à forte dose et les phytates des céréales complètes et des légumineuses peuvent réduire l'absorption du fer. Il est donc conseillé d'espacer le thé ou le café des repas riches en fer."),
     H("Les apports de référence"),
     P("À titre de repère, l'ODS indique un apport recommandé de 8 mg de fer par jour pour les hommes adultes et de 18 mg pour les femmes de 19 à 50 ans, avec un besoin plus élevé pendant la grossesse. Les végétariens ont des besoins plus élevés car le fer végétal est moins bien absorbé."),
     H("Pourquoi ne pas se supplémenter à l'aveugle"),
     P("Contrairement à d'autres nutriments, l'excès de fer est dangereux. La limite supérieure de sécurité est de 45 mg par jour pour les adultes selon l'ODS, et une surdose de fer chez l'enfant peut être grave. Certaines personnes (maladie de surcharge en fer) ne doivent pas en prendre. Les compléments de fer peuvent aussi provoquer des troubles digestifs. Une carence se confirme par une analyse de sang : demandez l'avis d'un médecin avant de commencer."),
     H("À retenir"),
     P("Associer une source de vitamine C au fer végétal est une astuce alimentaire simple. Un complément de fer, lui, relève d'un diagnostic médical. Tenez les produits contenant du fer hors de portée des enfants."),
     H("Sources"),
     P("NIH Office of Dietary Supplements, Iron : " + ODS + "Iron-HealthProfessional/"),
     P("NIH Office of Dietary Supplements, Vitamin C : " + ODS + "VitaminC-HealthProfessional/")],
    [("La vitamine C aide-t-elle vraiment à absorber le fer ?", "Oui, pour le fer non héminique (végétal), selon l'ODS. L'effet concerne l'alimentation prise au même repas."),
     ("Peut-on prendre du fer sans analyse ?", "Ce n'est pas recommandé : l'excès de fer est dangereux. Une prise de sang confirme une carence, et un médecin décide de la dose."),
     ("Que faut-il éviter avec le fer ?", "Le thé et le café pendant le repas, car ils réduisent l'absorption du fer.")],
    [("NIH ODS - Iron", ODS + "Iron-HealthProfessional/"), ("NIH ODS - Vitamin C", ODS + "VitaminC-HealthProfessional/")])

art("complexe-vitamines-b-sport-metabolisme-energetique",
    "Vitamine B12 : sources, besoins et supplémentation",
    "vitamine b12", "Vitamines", "6 min",
    "La B12 vient presque uniquement des aliments d'origine animale. Qui peut en manquer, comment la repérer sur une étiquette, et quand en parler à un médecin.",
    "Vitamine B12 : rôle, sources alimentaires, personnes à risque de carence, formes de compléments et précautions.",
    [P("La vitamine B12 (cobalamine) participe à la formation des globules rouges, au fonctionnement du système nerveux et à la synthèse de l'ADN. L'organisme ne la fabrique pas : elle vient de l'alimentation ou de compléments."),
     H("Où la trouve-t-on ?"),
     P("La B12 est naturellement présente dans les aliments d'origine animale : viandes, poissons, œufs, produits laitiers. Les végétaux n'en contiennent pas de façon fiable. Certains aliments sont enrichis en B12 (certaines boissons végétales, céréales)."),
     H("Quels apports ?"),
     P("L'ODS (NIH) indique un apport recommandé de 2,4 µg par jour pour les adultes. Les besoins sont plus élevés pendant la grossesse et l'allaitement. Les étiquettes de compléments affichent souvent des doses bien supérieures, car l'absorption par voie orale est limitée : une dose élevée ne signifie pas une meilleure efficacité."),
     H("Qui risque d'en manquer ?"),
     P("Les personnes qui suivent une alimentation végétalienne sans aliments enrichis ni complément, les personnes âgées (absorption diminuée), et celles qui ont certaines maladies digestives ou prennent certains traitements au long cours, par exemple la metformine ou des médicaments réduisant l'acidité gastrique. Une carence peut passer inaperçue : fatigue, fourmillements ou troubles de la mémoire sont des signes non spécifiques qui nécessitent un avis médical et un dosage sanguin."),
     H("Lire l'étiquette d'un complément"),
     P("La B12 existe sous plusieurs formes, notamment cyanocobalamine et méthylcobalamine. Comparez la quantité en microgrammes (µg) par dose, la forme indiquée, le nombre de doses par boîte et les autres ingrédients. Aucune forme n'est démontrée comme supérieure pour tous : choisissez selon l'avis de votre médecin."),
     H("Précautions"),
     P("Aucune limite supérieure n'a été fixée pour la B12 par l'ODS, faute d'effet indésirable avéré à forte dose chez les personnes en bonne santé. Cela ne dispense pas d'un avis médical, car une carence en B12 peut cacher une autre maladie. Respectez toujours la posologie du fabricant."),
     H("Sources"),
     P("NIH Office of Dietary Supplements, Vitamin B12 : " + ODS + "VitaminB12-HealthProfessional/")],
    [("Les végétaliens ont-ils besoin d'un complément de B12 ?", "Les aliments d'origine végétale n'en fournissent pas de façon fiable. Une supplémentation ou des aliments enrichis sont généralement nécessaires : parlez-en à un professionnel de santé."),
     ("Une dose élevée de B12 est-elle meilleure ?", "Non. L'absorption orale est limitée. Comparez la dose par prise et suivez la posologie du fabricant."),
     ("Comment savoir si je manque de B12 ?", "Par un dosage sanguin prescrit par un médecin. Les symptômes seuls ne suffisent pas.")],
    [("NIH ODS - Vitamin B12", ODS + "VitaminB12-HealthProfessional/")])

art("melatonine-en-gouttes-spray-ou-gelules",
    "Mélatonine : informations essentielles et précautions",
    "mélatonine", "Sommeil", "6 min",
    "La mélatonine est une hormone du sommeil. Ce que disent les sources publiques sur son usage à court terme, ses effets indésirables et les situations où il faut éviter de la prendre.",
    "Mélatonine : rôle, usages étudiés, effets indésirables, précautions et questions à poser à un professionnel de santé.",
    [P("La mélatonine est une hormone produite par l'organisme, surtout la nuit, qui participe à la régulation du rythme veille-sommeil. Des produits en contenant sont vendus sous plusieurs formes (comprimés, gélules, gouttes, sprays). Selon les pays, leur statut réglementaire diffère : vérifiez toujours qu'un produit est autorisé et demandez conseil à un pharmacien ou à un médecin."),
     H("Ce que montrent les données"),
     P("Le National Center for Complementary and Integrative Health (NCCIH, États-Unis) indique que la mélatonine peut aider certaines personnes à s'endormir plus tôt, notamment en cas de décalage horaire ou de trouble du rythme du sommeil, mais que les preuves restent limitées pour l'insomnie en général. L'effet observé dans les études est modeste."),
     H("Effets indésirables possibles"),
     P("Le NCCIH rapporte des effets généralement légers à court terme : somnolence, maux de tête, étourdissements, nausées. La sécurité d'un usage prolongé n'est pas bien établie. Évitez de conduire ou d'utiliser des machines après une prise."),
     H("Qui doit demander un avis avant d'en prendre ?"),
     P("Les femmes enceintes ou qui allaitent, les enfants et adolescents, et les personnes qui prennent des anticoagulants, des antidépresseurs, des sédatifs ou des médicaments contre la tension ou le diabète : des interactions sont possibles. Les personnes souffrant d'une maladie auto-immune ou d'épilepsie doivent aussi consulter."),
     H("Lire l'étiquette et se méfier des écarts de dose"),
     P("La dose indiquée sur l'étiquette est en milligrammes ou en microgrammes. Des études ont montré que la quantité réelle de mélatonine dans certains produits peut s'écarter de celle annoncée : privilégiez des produits dont l'origine et le contrôle qualité sont clairs, et respectez la dose du fabricant."),
     H("Avant de chercher un complément"),
     P("Un sommeil de mauvaise qualité dépend souvent de l'horaire de coucher, de la lumière des écrans, de la caféine et du stress. Si l'insomnie dure plus de quelques semaines, consultez un médecin : elle peut avoir une cause à traiter."),
     H("Sources"),
     P("NCCIH, Melatonin: What You Need To Know : https://www.nccih.nih.gov/health/melatonin-what-you-need-to-know")],
    [("La mélatonine est-elle un somnifère ?", "Non. C'est une hormone qui participe au rythme du sommeil. Les données montrent un effet modeste chez certaines personnes, surtout en cas de décalage du rythme."),
     ("Peut-on la prendre tous les soirs ?", "La sécurité à long terme n'est pas bien établie. Demandez l'avis d'un médecin pour tout usage prolongé."),
     ("Est-elle adaptée aux enfants ?", "Seul un médecin peut en décider.")],
    [("NCCIH - Melatonin", "https://www.nccih.nih.gov/health/melatonin-what-you-need-to-know")])

art("conservation-complements-chaleur-humidite-tunisie",
    "Comment conserver ses compléments avec la chaleur en Tunisie ?",
    "conserver compléments alimentaires chaleur", "Guides d'achat", "4 min",
    "En été, la chaleur et l'humidité peuvent abîmer poudres, gélules et huiles. Des règles simples pour bien conserver vos compléments.",
    "Conservation des compléments alimentaires en climat chaud : température, humidité, voiture, huiles, poudres et signes d'altération.",
    [P("Les étés tunisiens et l'humidité du littoral sont durs pour les compléments. Aucune règle ne remplace la mention portée sur l'emballage de chaque produit : suivez-la en priorité. Voici néanmoins des principes simples."),
     H("Les ennemis : chaleur, humidité et lumière"),
     P("La chaleur accélère la dégradation de certains nutriments et des huiles (par exemple les oméga-3, qui rancissent). L'humidité fait agglomérer les poudres et peut favoriser les moisissures. La lumière abîme certaines vitamines. Conservez les produits dans leur emballage d'origine, bien fermé, dans un endroit frais et sec."),
     H("Les erreurs fréquentes"),
     P("Laisser un pot dans la voiture ou près d'une fenêtre ensoleillée. Le ranger dans la salle de bain ou au-dessus de la cuisinière, pièces chaudes et humides. Ouvrir le pot avec une cuillère mouillée. Oublier de refermer le couvercle ou d'enlever le sachet déshydratant, qui doit rester dans le pot."),
     H("Poudres, gélules, huiles : ce qui change"),
     P("Les poudres (whey, créatine) craignent surtout l'humidité : fermez le pot et essuyez la cuillère doseuse. Les gélules et comprimés supportent mal la chaleur prolongée. Les huiles (oméga-3) se conservent à l'abri de la chaleur et de la lumière, et certaines marques conseillent le réfrigérateur après ouverture : lisez l'étiquette."),
     H("Quand jeter un produit ?"),
     P("En cas de mauvaise odeur, de changement de couleur, de grumeaux durs dans une poudre, de moisissure, de gélules collées ou fondues, ou si la date de durabilité minimale est dépassée de manière significative, ne consommez pas le produit. Un doute vaut mieux qu'un risque."),
     H("Pour les trajets"),
     P("Emportez des doses dans un contenant propre et sec, à l'abri du soleil, et ne laissez jamais vos compléments dans un véhicule fermé.")],
    [("Où ranger ses compléments en été ?", "Dans un placard frais et sec, loin du soleil, de la cuisine et de la salle de bain, dans l'emballage d'origine bien fermé."),
     ("Faut-il mettre les compléments au réfrigérateur ?", "Seulement si l'étiquette l'indique, par exemple pour certaines huiles ou probiotiques."),
     ("Peut-on utiliser une poudre qui a pris l'humidité ?", "Si elle a des grumeaux durs, une odeur ou des moisissures, jetez-la.")],
    [])

art("authentique-vs-contrefacon-complements-tunisie",
    "Comment vérifier l'authenticité d'un complément alimentaire ?",
    "vérifier authenticité complément alimentaire", "Guides d'achat", "5 min",
    "Prix anormalement bas, emballage douteux, vendeur sans identité : voici les vérifications concrètes à faire avant d'acheter un complément.",
    "Authenticité des compléments alimentaires : prix, emballage, lot, vendeur, étiquette et signalement en cas de doute.",
    [P("Les contrefaçons et les produits mal conservés existent aussi dans les compléments alimentaires. Aucun contrôle visuel ne garantit à lui seul l'authenticité, mais plusieurs vérifications réduisent beaucoup le risque."),
     H("1. Le vendeur"),
     P("Un vendeur sérieux affiche son identité, une adresse, un moyen de contact, ses conditions de livraison et de retour. Méfiez-vous des vendeurs anonymes qui ne répondent que sur les réseaux sociaux. Demandez l'origine de l'approvisionnement : un revendeur honnête peut l'expliquer."),
     H("2. Le prix"),
     P("Un prix très inférieur à celui des autres vendeurs doit alerter. Comparez le prix au 100 g ou par portion, pas seulement le prix du pot, pour savoir si l'écart est réaliste."),
     H("3. L'emballage et l'étiquette"),
     P("Vérifiez la qualité d'impression, l'orthographe, la présence du tableau nutritionnel, de la liste des ingrédients, du numéro de lot et de la date de durabilité minimale. Le scellé de sécurité doit être intact. Comparez avec les photos du site officiel de la marque."),
     H("4. Le lot et la date"),
     P("Le numéro de lot et la date doivent être lisibles et non effacés. Plusieurs marques proposent un service de vérification de lot ou de contact avec le fabricant : utilisez-le en cas de doute."),
     H("5. En cas de doute"),
     P("Ne consommez pas le produit, conservez l'emballage et la preuve d'achat, contactez le vendeur puis la marque. En cas d'effet indésirable, consultez un professionnel de santé."),
     H("Ce que nous indiquons sur ParaTunisie"),
     P("Notre démarche est décrite sur la page authenticité du site. Chaque fiche produit indique la marque, le format et les informations disponibles. Aucune vérification en ligne ne remplace l'examen du produit à la réception.")],
    [("Un prix bas prouve-t-il une contrefaçon ?", "Non, mais un écart important avec le marché doit pousser à vérifier le vendeur, l'étiquette et le lot."),
     ("Que vérifier sur le pot ?", "Le scellé, le numéro de lot, la date de durabilité minimale, la liste des ingrédients et la qualité d'impression."),
     ("Que faire si le produit semble suspect ?", "Ne pas le consommer, conserver l'emballage et la preuve d'achat, et contacter le vendeur puis la marque.")],
    [])

art("collagene-marin-avec-vitamine-c-articulations-peau",
    "Collagène marin ou bovin : quelles différences ?",
    "collagène marin ou bovin", "Bien-être", "5 min",
    "Origine, forme et étiquette : ce qui distingue le collagène marin du collagène bovin, et ce que la recherche permet de dire.",
    "Collagène marin ou bovin : origines, types de collagène, peptides hydrolysés, lecture d'étiquette, allergènes et limites des preuves.",
    [P("Le collagène est une protéine de structure présente dans la peau, les tendons et les os. Les compléments sont des peptides de collagène obtenus par hydrolyse, à partir de peaux ou d'os de bovins ou d'écailles et de peaux de poissons."),
     H("Ce qui change selon l'origine"),
     P("Le collagène bovin est surtout riche en collagène de types I et III. Le collagène marin est surtout de type I. Ces différences de composition sont documentées, mais aucune étude ne permet de dire qu'une origine est meilleure pour tous les usages. Le choix se fait plutôt selon les contraintes personnelles."),
     H("Les critères pratiques"),
     P("Allergie au poisson ou aux fruits de mer : évitez le collagène marin. Régime halal, casher ou végétarien : vérifiez l'origine et la certification, le collagène animal n'est pas compatible avec un régime végétarien. Goût et solubilité : variables selon les produits. Format : poudre, gélules ou boisson."),
     H("Lire l'étiquette"),
     P("Repérez la source (bovin, marin), la mention de peptides hydrolysés, la quantité par portion, les ingrédients ajoutés (vitamine C, acide hyaluronique, édulcorants) et le nombre de portions pour calculer le coût par jour."),
     H("Ce que montre la recherche"),
     P("Certaines études suggèrent un effet des peptides de collagène sur l'hydratation de la peau ou sur le confort articulaire, mais les résultats sont hétérogènes, souvent financés par l'industrie et de qualité variable. Les preuves ne permettent pas de promettre un résultat. Aucun complément ne remplace une alimentation riche en protéines, une protection solaire et un avis médical en cas de douleur articulaire."),
     H("Précautions"),
     P("Respectez la dose du fabricant. Demandez conseil à un médecin en cas de grossesse, d'allaitement, d'allergie ou de maladie. Les compléments ne sont pas destinés aux mineurs.")],
    [("Quelle est la différence entre collagène marin et bovin ?", "L'origine et les types de collagène dominants : surtout I et III pour le bovin, surtout I pour le marin. Aucune étude ne prouve la supériorité de l'un pour tous."),
     ("Le collagène marin convient-il en cas d'allergie au poisson ?", "Non, il est à éviter. Vérifiez la source sur l'étiquette."),
     ("Le collagène garantit-il un effet sur la peau ?", "Non. Les études sont hétérogènes et ne permettent pas de promettre un résultat.")],
    [])

art("whey-vegetale-vs-whey-laitiere",
    "Protéines végétales ou whey : comparaison nutritionnelle",
    "protéines végétales ou whey", "Nutrition sportive", "5 min",
    "Digestibilité, acides aminés, allergènes, prix : comment comparer une protéine végétale et une whey sans promesse exagérée.",
    "Protéines végétales ou whey : composition en acides aminés, digestibilité, allergènes, goût, prix et critères de choix.",
    [P("Une protéine végétale (pois, riz, soja…) et une whey (lactosérum) sont deux sources en poudre qui peuvent compléter l'apport en protéines. Elles ne sont pas identiques sur le plan nutritionnel, mais l'écart pratique dépend de l'ensemble de votre alimentation."),
     H("Acides aminés"),
     P("La whey fournit les neuf acides aminés essentiels, avec une teneur élevée en leucine. Une protéine végétale prise seule peut être pauvre en un acide aminé essentiel (par exemple la lysine pour les céréales, la méthionine pour les légumineuses). Les mélanges (pois et riz, par exemple) compensent ces manques. Vérifiez sur l'étiquette que le produit est un mélange."),
     H("Digestion et allergènes"),
     P("La whey est un produit laitier : à éviter en cas d'allergie aux protéines de lait, et le lactose est à vérifier en cas d'intolérance (les isolats en contiennent moins). Les protéines végétales évitent le lait mais peuvent contenir du soja, des édulcorants ou des épaississants parfois mal tolérés."),
     H("Comment comparer"),
     P("Comparez les protéines par portion, la liste des ingrédients, le profil en acides aminés quand il est indiqué, le goût, la solubilité et le prix par portion et par 100 g. Une protéine végétale peut contenir moins de protéines par portion qu'une whey : il faut parfois une portion plus grande pour le même apport."),
     H("Quel choix ?"),
     P("Si vous tolérez le lait, la whey est pratique et bien documentée. Si vous êtes végétalien ou allergique au lait, un mélange de protéines végétales est une alternative. Dans les deux cas, ces produits complètent l'alimentation et ne la remplacent pas. Demandez conseil à un professionnel de santé en cas de maladie, notamment rénale, de grossesse ou d'allaitement.")],
    [("La protéine végétale est-elle aussi complète que la whey ?", "Pas toujours seule, mais un mélange de sources (pois et riz) peut couvrir les acides aminés essentiels. Lisez l'étiquette."),
     ("Quelle protéine choisir en cas d'intolérance au lactose ?", "Une protéine végétale ou un isolat de whey, à valider avec un professionnel de santé."),
     ("Une protéine végétale est-elle moins chère ?", "Cela dépend des produits : comparez le prix par portion et par gramme de protéines.")],
    [])

art("guide-achat-whey-prix-au-kilo-tunisie",
    "Comment comparer le prix réel des protéines en Tunisie ?",
    "comparer prix whey tunisie", "Guides d'achat", "5 min",
    "Le prix du pot ne dit rien. Voici la méthode pour comparer les protéines au gramme de protéines, par portion et au kilo.",
    "Comparer le prix d'une whey : prix au 100 g, par portion, par 25 g de protéines, pièges des formats et des portions.",
    [P("Deux pots de whey affichent rarement le même poids, le même nombre de portions ni la même teneur en protéines. Comparer les prix demande donc quelques calculs simples."),
     H("Étape 1 : le prix au 100 g de poudre"),
     P("Prix du pot divisé par le poids en grammes, multiplié par 100. Exemple : un pot de 2 000 g à 200 DT revient à 10 DT les 100 g. Ce premier repère compare les pots de tailles différentes."),
     H("Étape 2 : le prix par portion"),
     P("Prix du pot divisé par le nombre de portions annoncé. Attention : la taille de la portion varie selon les marques (25 g, 30 g, 33 g), ce qui change le nombre de portions du pot."),
     H("Étape 3 : le prix des protéines"),
     P("Le plus juste est de calculer le prix de 100 g de protéines : prix au 100 g de poudre divisé par la part de protéines. Une poudre à 10 DT les 100 g qui contient 80 % de protéines (0,8) coûte 10 ÷ 0,8 = 12,50 DT les 100 g de protéines."),
     H("Les pièges à éviter"),
     P("Comparer un concentré et un isolat sans tenir compte de leur taux de protéines. Se fier à un « grand format » sans vérifier la date de durabilité minimale. Oublier les frais de livraison, ou comparer un produit en stock à un produit sur commande dont le délai diffère."),
     H("Un tableau déjà calculé"),
     P("Sur les pages whey protéine et whey isolate de ParaTunisie, un tableau ramène le prix des références en stock au 100 g, avec les mises à jour du catalogue. Les prix affichés sur chaque fiche font foi.")],
    [("Comment calculer le prix au kilo d'une whey ?", "Divisez le prix du pot par son poids en kilos. Pour comparer les protéines, divisez ensuite par le pourcentage de protéines."),
     ("Pourquoi comparer par portion ?", "Parce que la taille de la portion varie selon les marques et change le nombre de portions d'un pot."),
     ("Un gros pot est-il toujours plus économique ?", "Souvent au gramme, mais vérifiez la date de durabilité et votre rythme de consommation.")],
    [])


def q(s):
    assert "$cc$" not in s
    return "$cc$" + s + "$cc$"

out = []
slugs = ",".join("'%s'" % a["slug"] for a in A)
out.append('create table if not exists _backup_article_batch13 as select * from "Article" where slug in (%s);' % slugs)
for a in A:
    blocks = list(a["blocks"])
    # a visible sources line already inside blocks for DB articles (the template shows sources only for static ones)
    aid = "art_" + hashlib.md5(a["slug"].encode()).hexdigest()[:20]
    title = a["title"]
    assert len(a["meta"]) <= 165 and len(a["meta"]) >= 90, (a["slug"], len(a["meta"]))
    assert len(title) <= 70, (a["slug"], len(title))
    img = "/assets/blog/%s.webp" % a["slug"]
    out.append(
        'insert into "Article"(id,slug,title,excerpt,category,"readTime",date,content,status,"authorName","featuredImage","imageAlt","publishedAt","updatedAt","seoTitle","metaDescription","canonicalUrl",indexable,"targetKeyword") values (%s,%s,%s,%s,%s,%s,%s,%s,\'PUBLISHED\',%s,%s,%s,now(),now(),%s,%s,%s,true,%s) '
        'on conflict (slug) do nothing;' % (q(aid), q(a["slug"]), q(title), q(a["excerpt"]), q(a["cat"]), q(a["mins"]), q("2026-11-21"), q(json.dumps(blocks, ensure_ascii=False)),
                                          q("Équipe éditoriale ParaTunisie"), q(img), q("Illustration : " + title), q(title + " | ParaTunisie"), q(a["meta"]), q("https://paratunisie.com/conseils/" + a["slug"]), q(a["kw"])))
    for pos, (qq, an) in enumerate(a["faqs"]):
        out.append('insert into "ArticleFaq"(id,"articleId",question,answer,position) select %s, id, %s, %s, %d from "Article" where slug=%s and not exists (select 1 from "ArticleFaq" f where f."articleId"="Article".id and f.question=%s);' % (q("faq_%s_%d" % (aid[4:], pos)), q(qq), q(an), pos, q(a["slug"]), q(qq)))
    print("--", a["slug"], len(title), len(a["meta"]), sum(len(b["text"].split()) for b in blocks), "words", file=sys.stderr)
out.append('select slug,status from "Article" where slug in (%s);' % slugs)
sys.stdout.buffer.write(("\n".join(out) + "\n").encode("utf-8"))
