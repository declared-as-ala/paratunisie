// Pre-built High-Converting Templates for Email & SMS Marketing
const PRESET_TEMPLATES = {
  email: [
    {
      id: "protein-promo",
      name: "🔥 Protein.tn — Super Promo Fitness & Whey",
      subject: "⚡ Vente Flash Protein.tn : Jusqu'à -25% sur Whey, Isolate & Créatine !",
      html: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vente Flash Protein.tn</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0b0f19; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #e2e8f0; }
    .wrapper { width: 100%; max-width: 600px; margin: 0 auto; background-color: #111827; border-radius: 16px; overflow: hidden; border: 1px solid #1f2937; }
    .header { background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #3b82f6; }
    .badge { display: inline-block; background: #ef4444; color: #ffffff; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 6px 14px; border-radius: 999px; margin-bottom: 12px; }
    .title { color: #ffffff; font-size: 26px; font-weight: 800; margin: 0 0 10px; line-height: 1.2; }
    .subtitle { color: #94a3b8; font-size: 15px; margin: 0; }
    .content { padding: 32px 24px; }
    .greeting { font-size: 18px; color: #f8fafc; font-weight: 600; margin-bottom: 16px; }
    .lead-text { font-size: 15px; line-height: 1.6; color: #cbd5e1; margin-bottom: 24px; }
    .promo-card { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1px dashed #3b82f6; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
    .promo-code { font-size: 24px; font-weight: 900; letter-spacing: 3px; color: #60a5fa; font-family: monospace; }
    .features-grid { display: table; width: 100%; margin: 24px 0; }
    .feature-item { display: table-cell; width: 33.33%; padding: 12px; text-align: center; border: 1px solid #1f2937; border-radius: 8px; background: #0f172a; }
    .feature-val { font-size: 18px; font-weight: 700; color: #10b981; }
    .feature-lbl { font-size: 12px; color: #94a3b8; margin-top: 4px; }
    .btn-container { text-align: center; margin: 32px 0 16px; }
    .cta-btn { display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; font-weight: 700; font-size: 16px; padding: 14px 32px; border-radius: 999px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4); }
    .footer { background: #0b0f19; padding: 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; }
    .footer a { color: #38bdf8; text-decoration: none; }
  </style>
</head>
<body>
  <div style="padding: 24px 12px;">
    <div class="wrapper">
      <div class="header">
        <span class="badge">🔥 OFFRE EXCLUSIVE</span>
        <h1 class="title">PROTEIN.TN</h1>
        <p class="subtitle">Votre destination N°1 en Nutrition Sportive en Tunisie</p>
      </div>
      
      <div class="content">
        <p class="greeting">Bonjour {{name}},</p>
        <p class="lead-text">
          Préparez-vous à dépasser vos limites ! Profitez dès aujourd'hui d'une réduction exceptionnelle sur nos meilleures marques de <strong>Whey Isolate, Créatine Monohydrate, BCAA et Prise de Masse</strong>.
        </p>

        <div class="promo-card">
          <div style="font-size: 13px; color: #94a3b8; margin-bottom: 6px;">VOTRE CODE PROMO EXCLUSIF</div>
          <div class="promo-code">PROTEIN20</div>
          <div style="font-size: 13px; color: #f59e0b; margin-top: 6px;">⚡ Valable ce weekend seulement</div>
        </div>

        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-val">100%</div>
            <div class="feature-lbl">Certifié Authentique</div>
          </div>
          <div class="feature-item" style="margin-left: 8px; margin-right: 8px;">
            <div class="feature-val">24-48h</div>
            <div class="feature-lbl">Livraison Tunisie</div>
          </div>
          <div class="feature-item">
            <div class="feature-val">Paiement</div>
            <div class="feature-lbl">À la Livraison</div>
          </div>
        </div>

        <div class="btn-container">
          <a href="https://protein.tn" class="cta-btn">Commander Maintenant &rarr;</a>
        </div>
      </div>

      <div class="footer">
        <p>© 2026 Protein.tn & ParaTunisie. Tous droits réservés.</p>
        <p>Service Client: +216 21 909 597 | Email: contact@protein.tn</p>
        <p><a href="#">Se désinscrire</a> • <a href="https://protein.tn">Visiter notre boutique</a></p>
      </div>
    </div>
  </div>
</body>
</html>`
    },
    {
      id: "para-skincare",
      name: "🌿 ParaTunisie — Beauté, Soins & Parapharmacie",
      subject: "✨ Offre Spéciale Beauté & Santé : Soins Dermatologiques & Compléments",
      html: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ParaTunisie — Offre Beauté & Santé</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; }
    .wrapper { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .top-banner { background: #047857; color: #ffffff; text-align: center; padding: 10px; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; }
    .header { padding: 32px 24px; text-align: center; background: #ecfdf5; border-bottom: 1px solid #d1fae5; }
    .logo { font-size: 26px; font-weight: 800; color: #065f46; letter-spacing: -0.5px; margin: 0; }
    .tagline { color: #047857; font-size: 14px; margin-top: 4px; }
    .content { padding: 32px 28px; }
    .heading { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 12px; }
    .text { font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
    .card-banner { background: linear-gradient(135deg, #065f46 0%, #047857 100%); color: white; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
    .card-title { font-size: 22px; font-weight: 800; margin: 0 0 8px; }
    .card-desc { font-size: 14px; opacity: 0.9; margin: 0 0 16px; }
    .pill { display: inline-block; background: #ffffff; color: #047857; font-weight: 800; padding: 8px 20px; border-radius: 999px; font-size: 16px; }
    .btn { display: inline-block; background: #047857; color: #ffffff; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; margin-top: 16px; }
    .footer { background: #f8fafc; padding: 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div style="padding: 24px 12px;">
    <div class="wrapper">
      <div class="top-banner">🚚 LIVRAISON GRATUITE DÈS 99 DT D'ACHAT</div>
      <div class="header">
        <h1 class="logo">PARATUNISIE.TN</h1>
        <div class="tagline">Votre Parapharmacie & Nutrition de Confiance en Tunisie</div>
      </div>
      <div class="content">
        <h2 class="heading">Prenez soin de vous au meilleur prix, {{name}} !</h2>
        <p class="text">
          Découvrez notre sélection exclusive de soins dermo-cosmétiques, solaires, hygiène et compléments alimentaires de laboratoires reconnus.
        </p>
        
        <div class="card-banner">
          <div class="card-title">JOURNÉES PRIVILÈGES</div>
          <p class="card-desc">Bénéficiez d'une remise immédiate de 15% sur toute la gamme parapharmacie avec votre code :</p>
          <div class="pill">PARAVIP15</div>
        </div>

        <div style="text-align: center;">
          <a href="https://paratunisie.com" class="btn">Découvrir les Nouveautés &rarr;</a>
        </div>
      </div>
      <div class="footer">
        <p>ParaTunisie — Santé, Beauté et Bien-être</p>
        <p>Des questions ? Contactez-nous à support@paratunisie.com</p>
      </div>
    </div>
  </div>
</body>
</html>`
    },
    {
      id: "order-reactivation",
      name: "🎁 Offre Fidélité & Bon d'Achat Cadeau",
      subject: "🎁 {{name}}, un cadeau de fidélité vous attend chez Protein.tn !",
      html: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cadeau de Fidélité</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #e2e8f0; }
    .box { max-width: 580px; margin: 30px auto; background: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 36px 28px; }
    .icon { font-size: 42px; text-align: center; margin-bottom: 12px; }
    .h1 { font-size: 24px; font-weight: 800; text-align: center; color: #f8fafc; margin: 0 0 16px; }
    .txt { font-size: 15px; line-height: 1.6; color: #cbd5e1; }
    .coupon { background: #0f172a; border: 2px dashed #eab308; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
    .coupon-title { color: #facc15; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .coupon-code { font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: 3px; margin: 8px 0; }
    .cta { display: block; background: #eab308; color: #0f172a; font-weight: 800; font-size: 16px; text-decoration: none; padding: 14px; text-align: center; border-radius: 10px; margin-top: 20px; }
    .footer { text-align: center; font-size: 12px; color: #64748b; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="box">
    <div class="icon">🎁</div>
    <h1 class="h1">Vous nous avez manqué, {{name}} !</h1>
    <p class="txt">
      Cela fait un moment que vous n'avez pas renouvelé vos stocks de nutrition et compléments. Pour fêter votre retour, nous vous offrons un bon d'achat spécial valable sur l'ensemble de notre catalogue.
    </p>

    <div class="coupon">
      <div class="coupon-title">VOTRE BON DE RÉDUCTION PERSONNEL</div>
      <div class="coupon-code">WELCOME-BACK</div>
      <div style="font-size: 13px; color: #94a3b8;">15 DT offerts dès 100 DT d'achat</div>
    </div>

    <p class="txt">
      Ne tardez pas, cette offre exclusive expire dans <strong>72 heures</strong> !
    </p>

    <a href="https://protein.tn" class="cta">Profiter de Mon Bon d'Achat &rarr;</a>

    <div class="footer">
      <p>Protein.tn • Le N°1 des protéines en Tunisie</p>
    </div>
  </div>
</body>
</html>`
    },
    {
      id: "blank-email",
      name: "📝 Modèle Vierge Personnalisé (Code HTML Libre)",
      subject: "Nouvelle annonce importante de Protein.tn",
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Annonce</title>
</head>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px;">
    <h2 style="color: #333333;">Bonjour {{name}},</h2>
    <p style="color: #666666; line-height: 1.6;">
      Écrivez votre message ici... Vous pouvez utiliser <strong>{{name}}</strong>, <strong>{{phone}}</strong>, et <strong>{{email}}</strong>.
    </p>
    <a href="https://protein.tn" style="display: inline-block; background: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 15px;">Visiter notre site</a>
  </div>
</body>
</html>`
    }
  ],

  sms: [
    {
      id: "sms-promo-weekend",
      name: "⚡ Flash Promo Weekend (-20%)",
      text: "Salam {{name}}! Profitez de -20% sur tout le stock Whey, Isolate & Creatine chez Protein.tn avec le code FLASH20. Stock limite! Commande: https://protein.tn"
    },
    {
      id: "sms-arrivage-whey",
      name: "📦 Nouvel Arrivage Isolate & Créatine",
      text: "Bonjour {{name}}, arrivage massif Isolate 100% Whey & Creatine Creapure chez Protein.tn! Livraison 24-48h partout en Tunisie. Commandez vite: https://protein.tn"
    },
    {
      id: "sms-livraison-gratuite",
      name: "🚚 Offre Livraison Gratuite",
      text: "Cher(e) {{name}}, Protein.tn vous offre la LIVRAISON GRATUITE sur toute commande des 80 DT avec le code FREE26. Offre valable 48h sur https://protein.tn"
    },
    {
      id: "sms-relance-client",
      name: "🎁 Bon de Réduction Fidélité",
      text: "{{name}}, profitez de 10 DT de remise immediate sur votre prochaine commande Protein.tn avec le code CADEAU10. RDV sur https://protein.tn ou au 21909597"
    },
    {
      id: "sms-custom",
      name: "✏️ Modèle SMS Libre",
      text: "Bonjour {{name}}, retrouvez nos nouveautes et promotions exclusives sur Protein.tn ! Info: +21621909597"
    }
  ]
};
