export interface OrderNotificationData {
  id: string;
  orderNumber: string;
  status: string;
  totalMillimes: number;
  totalTnd: string;
  gouvernorat: string;
  fullAddress: string;
  deliveryNote?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  items: {
    productName: string;
    quantity: number;
    priceTnd: string;
    subtotalTnd: string;
  }[];
}

/**
 * Returns French SMS text for order lifecycle events.
 */
export function getOrderSmsText(
  type: "ORDER_CREATED" | "ORDER_CONFIRMED" | "ORDER_SHIPPED" | "ORDER_CANCELLED",
  order: OrderNotificationData
): string {
  switch (type) {
    case "ORDER_CREATED":
      return `ParaTunisie : votre commande #${order.orderNumber} a bien été reçue (${order.totalTnd} DT). Nous vous contacterons pour la livraison. Merci pour votre confiance.`;
    case "ORDER_CONFIRMED":
      return `ParaTunisie : votre commande #${order.orderNumber} est confirmée. Nous préparons votre colis.`;
    case "ORDER_SHIPPED":
      return `ParaTunisie : votre commande #${order.orderNumber} a été expédiée et sera livrée sous 24h-48h.`;
    case "ORDER_CANCELLED":
      return `ParaTunisie : votre commande #${order.orderNumber} a été annulée.`;
    default:
      return `ParaTunisie : mise à jour concernant votre commande #${order.orderNumber}.`;
  }
}

/**
 * Returns French Subject and HTML Body for Order Confirmation Email.
 */
export function getOrderEmailContent(
  type: "ORDER_CREATED" | "ORDER_CONFIRMED" | "ORDER_SHIPPED" | "ORDER_CANCELLED",
  order: OrderNotificationData,
  isAdminNotice: boolean = false
): { subject: string; html: string } {
  const subject = isAdminNotice
    ? `[NOUVELLE COMMANDE ADMIN] Commande ParaTunisie #${order.orderNumber}`
    : `Commande reçue — ParaTunisie #${order.orderNumber}`;

  const itemsTable = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 13px; color: #333;">
          <strong>${item.productName}</strong> × ${item.quantity}
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 13px; color: #8B263E; text-align: right; font-weight: bold;">
          ${item.subtotalTnd} DT
        </td>
      </tr>
    `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF7F5; margin: 0; padding: 20px 10px; color: #222;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e8e2de; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        
        <!-- Header -->
        <div style="background-color: #8B263E; padding: 24px 30px; text-align: center;">
          <h1 style="color: #ffffff; font-family: Georgia, serif; font-size: 24px; margin: 0; font-weight: bold;">ParaTunisie</h1>
          <p style="color: #F7E7E9; font-size: 12px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">
            Votre Parapharmacie en Ligne
          </p>
        </div>

        <!-- Banner Notice -->
        ${
          isAdminNotice
            ? `<div style="background-color: #FEF3C7; color: #92400E; padding: 12px 20px; font-size: 12px; font-weight: bold; text-align: center; border-bottom: 1px solid #FDE68A;">
                🔔 NOTIFICATION ADMIN : Une nouvelle commande vient d'être créée sur le site.
              </div>`
            : ""
        }

        <!-- Content -->
        <div style="padding: 30px;">
          <h2 style="font-family: Georgia, serif; font-size: 20px; color: #111; margin-top: 0;">
            ${isAdminNotice ? "Nouvelle commande reçue" : `Merci pour votre commande, ${order.customerName} !`}
          </h2>
          
          <p style="font-size: 14px; color: #555; leading-height: 1.5; margin-bottom: 24px;">
            Votre commande <strong>#${order.orderNumber}</strong> a été enregistrée avec succès.
            Le règlement s'effectuera en espèces à la livraison.
          </p>

          <!-- Order Summary Box -->
          <div style="background-color: #FAF7F5; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h3 style="font-size: 14px; font-weight: bold; color: #8B263E; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">
              Détail des articles
            </h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              ${itemsTable}
            </table>

            <div style="margin-top: 16px; padding-top: 12px; border-top: 2px solid #e8e2de; display: flex; justify-content: space-between;">
              <span style="font-size: 15px; font-weight: bold; color: #111;">Total à payer (espèces) :</span>
              <span style="font-size: 18px; font-weight: bold; color: #8B263E;">${order.totalTnd} DT</span>
            </div>
          </div>

          <!-- Customer Address Details -->
          <div style="border: 1px solid #e8e2de; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
            <h3 style="font-size: 13px; font-weight: bold; color: #111; margin: 0 0 8px 0;">
              Adresse & Contact de livraison
            </h3>
            <p style="font-size: 13px; color: #444; margin: 0 0 4px 0;"><strong>Client :</strong> ${order.customerName}</p>
            <p style="font-size: 13px; color: #444; margin: 0 0 4px 0;"><strong>Téléphone :</strong> ${order.customerPhone}</p>
            <p style="font-size: 13px; color: #444; margin: 0 0 4px 0;"><strong>Gouvernorat :</strong> ${order.gouvernorat}</p>
            <p style="font-size: 13px; color: #444; margin: 0 0 4px 0;"><strong>Adresse :</strong> ${order.fullAddress}</p>
            ${order.deliveryNote ? `<p style="font-size: 13px; color: #666; margin: 4px 0 0 0; font-style: italic;">Note : ${order.deliveryNote}</p>` : ""}
          </div>

          <p style="font-size: 13px; color: #666; text-align: center; margin: 24px 0 0 0;">
            Si vous avez la moindre question, contactez notre équipe support.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #FAF7F5; padding: 16px; text-align: center; border-top: 1px solid #e8e2de; font-size: 11px; color: #888;">
          © ${new Date().getFullYear()} ParaTunisie. Tous droits réservés.
        </div>

      </div>
    </body>
    </html>
  `;

  return { subject, html };
}
