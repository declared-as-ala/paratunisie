import { Injectable, Logger, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface AramexClientInfo {
  UserName: string;
  Password: string;
  Version: string;
  AccountNumber: string;
  AccountPin: string;
  AccountEntity: string;
  AccountCountryCode: string;
  Source: number;
}

export type NormalizedAramexStatus =
  | "DELIVERED"
  | "OUT_FOR_DELIVERY"
  | "IN_TRANSIT"
  | "PICKED_UP"
  | "PICKUP_REQUESTED"
  | "CREATED"
  | "DELIVERY_ATTEMPT"
  | "REFUSED"
  | "RETURN_REQUESTED"
  | "RETURNING"
  | "RETURNED"
  | "EXCEPTION"
  | "CANCELLED";

export interface AramexCheckpoint {
  date: string;
  isoDate?: string;
  location: string;
  description: string;
  code: string;
  comments: string;
}

export interface NormalizedTracking {
  status: NormalizedAramexStatus;
  code: string;
  label: string;
  description: string;
  location: string;
  lastUpdateDate?: Date;
  deliveredAt?: Date;
  returnedAt?: Date;
}

export function normalizeAramexCheckpoints(results: any[]): {
  checkpoints: AramexCheckpoint[];
  normalized: NormalizedTracking;
} {
  const checkpoints: AramexCheckpoint[] = (results || []).map((item: any) => {
    let formattedDate = item.UpdateDateTime || "";
    let isoDate: string | undefined = undefined;
    const m = formattedDate.match(/\/Date\((\d+)(?:[+-]\d+)?\)\//);
    if (m) {
      const dt = new Date(Number(m[1]));
      formattedDate = dt.toLocaleString("fr-FR", { timeZone: "Africa/Tunis" });
      isoDate = dt.toISOString();
    }
    return {
      date: formattedDate,
      isoDate,
      location: item.UpdateLocation || "",
      description: item.UpdateDescription || "",
      code: item.UpdateCode || "",
      comments: item.Comments || "",
    };
  });

  if (checkpoints.length === 0) {
    return {
      checkpoints: [],
      normalized: {
        status: "CREATED",
        code: "SH014",
        label: "Créée",
        description: "Bordereau créé chez Aramex",
        location: "Tunisie",
        lastUpdateDate: new Date(),
      },
    };
  }

  // Find terminal delivered event if any
  const deliveredEvent = checkpoints.find(
    (c) => c.code === "SH005" || /delivered|livr[ée]/i.test(c.description)
  );

  // Find terminal returned event if any
  const returnedEvent = checkpoints.find(
    (c) => c.code === "SH069" || /returned to shipper|retourn[ée]/i.test(c.description)
  );

  // If delivered event exists and comes after or without return
  if (deliveredEvent && (!returnedEvent || checkpoints.indexOf(deliveredEvent) < checkpoints.indexOf(returnedEvent))) {
    const dDate = deliveredEvent.isoDate ? new Date(deliveredEvent.isoDate) : undefined;
    return {
      checkpoints,
      normalized: {
        status: "DELIVERED",
        code: deliveredEvent.code || "SH005",
        label: "Livrée",
        description: deliveredEvent.description || "Colis livré",
        location: deliveredEvent.location || "Tunisie",
        lastUpdateDate: dDate || new Date(),
        deliveredAt: dDate || new Date(),
      },
    };
  }

  // If returned event exists
  if (returnedEvent) {
    const rDate = returnedEvent.isoDate ? new Date(returnedEvent.isoDate) : undefined;
    return {
      checkpoints,
      normalized: {
        status: "RETURNED",
        code: returnedEvent.code || "SH069",
        label: "Retournée",
        description: returnedEvent.description || "Retournée à l'expéditeur",
        location: returnedEvent.location || "Tunisie",
        lastUpdateDate: rDate || new Date(),
        returnedAt: rDate || new Date(),
      },
    };
  }

  // Otherwise, inspect latest checkpoint (index 0)
  const latest = checkpoints[0];
  const code = (latest.code || "").toUpperCase();
  const desc = (latest.description || "").toLowerCase();
  const comm = (latest.comments || "").toLowerCase();
  const loc = latest.location || "Tunisie";
  const uDate = latest.isoDate ? new Date(latest.isoDate) : new Date();

  // Returning / Return requested
  if (
    code === "SH498" ||
    code === "SH070" ||
    /pending return|retour demand[ée]|en cours de retour|to shipper/i.test(desc) ||
    /pending return/i.test(comm)
  ) {
    return {
      checkpoints,
      normalized: {
        status: "RETURNING",
        code: code || "SH498",
        label: "En cours de retour",
        description: latest.description,
        location: loc,
        lastUpdateDate: uDate,
      },
    };
  }

  if (code === "SH043" || /return requested/i.test(desc)) {
    return {
      checkpoints,
      normalized: {
        status: "RETURN_REQUESTED",
        code: code || "SH043",
        label: "Retour demandé",
        description: latest.description,
        location: loc,
        lastUpdateDate: uDate,
      },
    };
  }

  // Refused
  if (
    code === "SH034" ||
    /payment was declined|refused by consignee|refus[ée]/i.test(desc) ||
    /payment was declined|refused/i.test(comm)
  ) {
    return {
      checkpoints,
      normalized: {
        status: "REFUSED",
        code: code || "SH034",
        label: "Refusée",
        description: latest.description,
        location: loc,
        lastUpdateDate: uDate,
      },
    };
  }

  // Delivery Attempt / Contact problems
  if (
    code === "SH033" ||
    code === "SH294" ||
    code === "SH515" ||
    /attempted delivery|tentative|not available|no answer|cannot be reached|injoignable|absent/i.test(desc) ||
    /attempted delivery|not available|no answer|cannot be reached/i.test(comm)
  ) {
    let label = "Tentative de livraison";
    if (/cannot be reached|no answer|did not respond|busy/i.test(desc) || /cannot be reached|no answer|busy/i.test(comm)) {
      label = "Client injoignable";
    } else if (/not available/i.test(desc) || /not available/i.test(comm)) {
      label = "Client absent";
    }
    return {
      checkpoints,
      normalized: {
        status: "DELIVERY_ATTEMPT",
        code: code || "SH033",
        label,
        description: latest.description,
        location: loc,
        lastUpdateDate: uDate,
      },
    };
  }

  // Out for delivery
  if (code === "SH003" || code === "SH004" || /out for delivery|en cours de livraison/i.test(desc)) {
    return {
      checkpoints,
      normalized: {
        status: "OUT_FOR_DELIVERY",
        code: code || "SH003",
        label: "En cours de livraison",
        description: latest.description,
        location: loc,
        lastUpdateDate: uDate,
      },
    };
  }

  // Picked up
  if (code === "SH012" || code === "SH314" || /picked up|pickup completed|collect[ée]/i.test(desc)) {
    return {
      checkpoints,
      normalized: {
        status: "PICKED_UP",
        code: code || "SH012",
        label: "Collectée",
        description: latest.description,
        location: loc,
        lastUpdateDate: uDate,
      },
    };
  }

  // Pickup scheduled / requested
  if (code === "SH011" || /pickup scheduled|ramassage/i.test(desc)) {
    return {
      checkpoints,
      normalized: {
        status: "PICKUP_REQUESTED",
        code: code || "SH011",
        label: "Ramassage demandé",
        description: latest.description,
        location: loc,
        lastUpdateDate: uDate,
      },
    };
  }

  // Cancelled
  if (code === "SH015" || /cancelled|annul[ée]|void/i.test(desc)) {
    return {
      checkpoints,
      normalized: {
        status: "CANCELLED",
        code: code || "SH015",
        label: "Annulée",
        description: latest.description,
        location: loc,
        lastUpdateDate: uDate,
      },
    };
  }

  // Exception / Problem
  if (code === "SH006" || code === "SH007" || code === "SH020" || code === "SH030" || /damage|lost|problem|exception|adresse/i.test(desc)) {
    return {
      checkpoints,
      normalized: {
        status: "EXCEPTION",
        code: code || "SH006",
        label: "Problème de livraison",
        description: latest.description,
        location: loc,
        lastUpdateDate: uDate,
      },
    };
  }

  // In Transit / Under processing / Facility
  if (
    code === "SH022" ||
    code === "SH047" ||
    code === "SH001" ||
    code === "SH008" ||
    code === "SH002" ||
    code === "SH010" ||
    /in transit|en transit|facility|arriv|processing|on hold/i.test(desc)
  ) {
    return {
      checkpoints,
      normalized: {
        status: "IN_TRANSIT",
        code: code || "SH022",
        label: "En transit",
        description: latest.description,
        location: loc,
        lastUpdateDate: uDate,
      },
    };
  }

  // Created
  if (code === "SH014" || /record created|cr[ée][ée]/i.test(desc)) {
    return {
      checkpoints,
      normalized: {
        status: "CREATED",
        code: code || "SH014",
        label: "Créée",
        description: latest.description,
        location: loc,
        lastUpdateDate: uDate,
      },
    };
  }

  // Default fallback
  return {
    checkpoints,
    normalized: {
      status: "IN_TRANSIT",
      code: code || "SH022",
      label: "En transit",
      description: latest.description || "En cours de traitement",
      location: loc,
      lastUpdateDate: uDate,
    },
  };
}

export interface AramexCustomData {
  nom?: string;
  phone?: string;
  adresse?: string;
  ville?: string;
  gouvernorat?: string;
  weight?: number;
  pieces?: number;
  codAmount?: number;
  instructions?: string;
}

function normalizeAramexCity(city?: string): string {
  if (!city) return "Tunis";
  const clean = city.trim();
  const map: Record<string, string> = {
    "Gabès": "Gabes",
    "Gabes": "Gabes",
    "Béja": "Beja",
    "Beja": "Beja",
    "Médenine": "Medenine",
    "Medenine": "Medenine",
    "Manouba": "Manouba",
    "La Manouba": "Manouba",
    "Ben Arous": "Ben Arous",
    "Ariana": "Ariana",
    "Tunis": "Tunis",
    "Bizerte": "Bizerte",
    "Nabeul": "Nabeul",
    "Zaghouan": "Zaghouan",
    "Sousse": "Sousse",
    "Monastir": "Monastir",
    "Mahdia": "Mahdia",
    "Sfax": "Sfax",
    "Kairouan": "Kairouan",
    "Kasserine": "Kasserine",
    "Sidi Bouzid": "Sidi Bouzid",
    "Gafsa": "Gafsa",
    "Tozeur": "Tozeur",
    "Kebili": "Kebili",
    "Kébili": "Kebili",
    "Tataouine": "Tataouine",
    "Jendouba": "Jendouba",
    "Kef": "Kef",
    "Le Kef": "Kef",
    "Siliana": "Siliana",
  };
  return map[clean] || clean.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

@Injectable()
export class AramexService {
  private readonly logger = new Logger(AramexService.name);

  constructor(private readonly prisma: PrismaService) {}

  private getClientInfo(): AramexClientInfo {
    return {
      UserName: process.env.ARAMEX_USER_NAME || "bitoutawalid@gmail.com",
      Password: process.env.ARAMEX_PASSWORD || "Walid@bitouta@0000",
      Version: "v1.0",
      AccountNumber: process.env.ARAMEX_ACCOUNT_NUMBER || "60506486",
      AccountPin: process.env.ARAMEX_ACCOUNT_PIN || "321321",
      AccountEntity: process.env.ARAMEX_ACCOUNT_ENTITY || "TUN",
      AccountCountryCode: process.env.ARAMEX_ACCOUNT_COUNTRY_CODE || "TN",
      Source: Number(process.env.ARAMEX_SOURCE || 24),
    };
  }

  private getBaseUrl(): string {
    return (process.env.ARAMEX_BASE_URL || "https://ws.aramex.net").replace(/\/+$/, "");
  }

  private formatTunisianPhone(phone: string): string {
    const digits = phone.replace(/[^0-9+]/g, "");
    if (digits.startsWith("00216")) return digits;
    if (digits.startsWith("+216")) return "00216" + digits.slice(4);
    if (digits.length === 8) return "00216" + digits;
    return digits || "0021620000000";
  }

  /**
   * Create an Aramex Shipment for an existing Order
   */
  async createShipment(orderId: string, customData?: AramexCustomData) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: {
            product: true,
            productVariant: true,
          },
        },
        shipment: true,
      },
    });

    if (!order) {
      throw new NotFoundException("Commande introuvable");
    }

    const clientInfo = this.getClientInfo();
    const endpoint = `${this.getBaseUrl()}/ShippingAPI.V2/Shipping/Service_1_0.svc/json/CreateShipments`;

    const consigneeName = (
      customData?.nom ||
      order.user?.name ||
      `Client Commande #${order.id.slice(-6)}`
    ).trim();

    const formattedPhone = this.formatTunisianPhone(customData?.phone || order.user?.phone || "20000000");
    const address = (customData?.adresse || order.fullAddress || "Tunisie").trim();
    const rawCity = (customData?.ville || order.gouvernorat || "Tunis").trim();
    const city = normalizeAramexCity(rawCity);
    const email = order.user?.email || "contact@sobitas.tn";

    const weight = Number(customData?.weight || 1.0);
    const pieces = Number(customData?.pieces || 1);
    const codAmountTnd =
      customData?.codAmount !== undefined
        ? Number(customData.codAmount)
        : Math.round(order.totalMillimes / 1000);

    const subtotalTnd = (order.items || []).reduce(
      (sum, it) => sum + ((it.priceMillimes || 0) * (it.quantity || 1)) / 1000,
      0
    );
    const shippingFeeTnd = Math.max(0, codAmountTnd - Math.round(subtotalTnd));
    const shippingText = shippingFeeTnd > 0 ? ` + Livr. (${shippingFeeTnd} DT)` : "";

    // Format all product items into a clear summary list with isolated prices
    const productSummaryList = (order.items || []).map((it) => {
      const q = it.quantity || 1;
      const name = it.product?.name || "Produit";
      const price = Math.round((it.priceMillimes || 0) / 1000);
      const variantName = it.productVariant?.label ? ` (${it.productVariant.label})` : "";
      return `${q}x ${name}${variantName} (${price * q} DT)`;
    });

    const productsText =
      productSummaryList.length > 0
        ? `${productSummaryList.join(", ")}${shippingText} = Total ${codAmountTnd} DT`
        : `Commande #${order.id.slice(-6)} (Total ${codAmountTnd} DT)`;

    const descriptionOfGoods = productsText.slice(0, 150);
    const shortRef2 = `Prod: ${Math.round(subtotalTnd)} DT | Livr: ${shippingFeeTnd} DT`.slice(0, 45);
    const instructions = customData?.instructions || order.deliveryNote || descriptionOfGoods;

    const isCod = codAmountTnd > 0;

    const itemsPayload = (order.items || []).map((it, idx) => ({
      PackageType: "Box",
      Quantity: it.quantity || 1,
      Weight: {
        Unit: "KG",
        Value: Number((weight / Math.max(1, order.items.length)).toFixed(2)),
      },
      Comments: (it.product?.name || "Produit").slice(0, 50),
      Reference: `ITEM-${idx + 1}`,
      Pieces: it.quantity || 1,
      CountryOfOrigin: "TN",
      GoodsDescription: `${it.quantity}x ${it.product?.name || "Produit"}`.slice(0, 50),
    }));

    const payload = {
      ClientInfo: clientInfo,
      Transaction: {
        Reference1: order.id,
        Reference2: "",
        Reference3: "",
        Reference4: "",
        Reference5: "",
      },
      Shipments: [
        {
          Reference1: `CMD-${order.id.slice(-6).toUpperCase()}`,
          Reference2: shortRef2,
          Reference3: `Tel: ${formattedPhone}`,
          Shipper: {
            Reference1: process.env.ARAMEX_SHIPPER_REF || process.env.ARAMEX_SHIPPER_NAME || "Sobitas",
            Reference2: "",
            AccountNumber: clientInfo.AccountNumber,
            PartyAddress: {
              Line1: process.env.ARAMEX_SHIPPER_ADDRESS || "Rue Ribat",
              Line2: "",
              Line3: "",
              City: process.env.ARAMEX_SHIPPER_CITY || "Sousse",
              StateOrProvinceCode: "",
              PostCode: "",
              CountryCode: process.env.ARAMEX_SHIPPER_COUNTRY || "TN",
            },
            Contact: {
              Department: "",
              PersonName: ".",
              Title: "",
              CompanyName: process.env.ARAMEX_SHIPPER_NAME || "Sobitas",
              PhoneNumber1: process.env.ARAMEX_SHIPPER_PHONE || "0021671160800",
              PhoneNumber1Ext: "",
              PhoneNumber2: "",
              PhoneNumber2Ext: "",
              FaxNumber: "",
              CellPhone: process.env.ARAMEX_SHIPPER_PHONE || "0021671160800",
              EmailAddress: process.env.ARAMEX_SHIPPER_EMAIL || "contact@sobitas.tn",
              Type: "",
            },
          },
          Consignee: {
            Reference1: "",
            Reference2: "",
            AccountNumber: "",
            PartyAddress: {
              Line1: address,
              Line2: "",
              Line3: "",
              City: city,
              StateOrProvinceCode: "",
              PostCode: "",
              CountryCode: "TN",
            },
            Contact: {
              Department: "",
              PersonName: ".",
              Title: "",
              CompanyName: consigneeName,
              PhoneNumber1: formattedPhone,
              PhoneNumber1Ext: "",
              PhoneNumber2: "",
              PhoneNumber2Ext: "",
              FaxNumber: "",
              CellPhone: formattedPhone,
              EmailAddress: email,
              Type: "",
            },
          },
          ThirdParty: {
            Reference1: "",
            Reference2: "",
            AccountNumber: "",
            PartyAddress: {
              Line1: "",
              Line2: "",
              Line3: "",
              City: "",
              StateOrProvinceCode: "",
              PostCode: "",
              CountryCode: "TN",
            },
            Contact: {
              Department: "",
              PersonName: "",
              Title: "",
              CompanyName: "",
              PhoneNumber1: "",
              PhoneNumber1Ext: "",
              PhoneNumber2: "",
              PhoneNumber2Ext: "",
              FaxNumber: "",
              CellPhone: "",
              EmailAddress: "",
              Type: "",
            },
          },
          ShippingDateTime: `/Date(${Date.now()}-0500)/`,
          DueDate: `/Date(${Date.now()}-0500)/`,
          Comments: `Contenu: ${descriptionOfGoods}`.slice(0, 150),
          PickupLocation: "Reception",
          OperationsInstructions: instructions.slice(0, 100),
          AccountingInstrcutions: `COD: ${codAmountTnd} TND`,
          ForeignHAWB: "",
          TransportType: 0,
          PickupGUID: "",
          Details: {
            Dimensions: null,
            ActualWeight: { Unit: "KG", Value: weight },
            ChargeableWeight: null,
            DescriptionOfGoods: descriptionOfGoods,
            GoodsOriginCountry: "TN",
            NumberOfPieces: pieces,
            ProductGroup: "DOM",
            ProductType: "ONP",
            PaymentType: "P",
            PaymentOptions: "",
            Services: isCod ? "CODS" : "",
            CashOnDeliveryAmount: isCod
              ? {
                  CurrencyCode: "TND",
                  Value: codAmountTnd,
                }
              : null,
            InsuranceAmount: null,
            CashAdditionalAmount: null,
            CashAdditionalAmountDescription: "",
            CustomsValueAmount: {
              CurrencyCode: "TND",
              Value: codAmountTnd,
            },
            CollectAmount: null,
            Items: itemsPayload.length > 0 ? itemsPayload : [],
          },
          Attachments: [],
        },
      ],
      LabelInfo: {
        ReportID: 9737,
        ReportType: "URL",
      },
    };

    this.logger.log(`Creating Aramex shipment for order ${order.id} with city ${city} and COD ${codAmountTnd} TND...`);

    try {
      const payloadStr = JSON.stringify(payload);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: payloadStr,
      });

      const responseText = await response.text();
      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch (parseErr) {
        this.logger.error(`Aramex raw response was not JSON: ${responseText}`);
        throw new BadRequestException("Réponse invalide reçue de l'API Aramex.");
      }

      if (data?.HasErrors || (data?.Notifications && data.Notifications.some((n: any) => n.Code))) {
        const errorMsg = data?.Notifications?.[0]?.Message || "Erreur lors de la création Aramex";
        this.logger.warn(`Aramex CreateShipment error for ${order.id}: ${errorMsg}`);
        throw new BadRequestException(`Aramex API: ${errorMsg}`);
      }

      const shipmentObj = data?.Shipments?.[0];
      if (shipmentObj?.HasErrors) {
        const errorMsg = shipmentObj?.Notifications?.[0]?.Message || "Erreur sur l'expédition Aramex";
        this.logger.warn(`Aramex shipment item error for ${order.id}: ${errorMsg}`);
        throw new BadRequestException(`Aramex API: ${errorMsg}`);
      }

      const hawb = shipmentObj?.ID;
      const labelUrl =
        shipmentObj?.ShipmentLabel?.LabelURL || data?.ShipmentLabel?.LabelURL || null;

      if (!hawb) {
        throw new BadRequestException("Aucun numéro de suivi (HAWB) retourné par Aramex.");
      }

      // Upsert shipment in database with initial tracking info
      const shipmentRecord = await (this.prisma.shipment as any).upsert({
        where: { orderId: order.id },
        update: {
          carrier: "aramex",
          tracking: hawb,
          hawb: hawb,
          labelUrl: labelUrl,
          status: "EXPEDIEE",
          trackingStatus: "CREATED",
          trackingCode: "SH014",
          trackingLabel: "Créée",
          trackingDescription: "Bordereau créé chez Aramex",
          trackingLocation: city,
          lastAramexSync: new Date(),
          lastTrackingUpdate: new Date(),
          weightKg: weight,
          pieces: pieces,
          codAmountMillimes: isCod ? codAmountTnd * 1000 : null,
          rawResponse: JSON.stringify(data),
        },
        create: {
          orderId: order.id,
          carrier: "aramex",
          tracking: hawb,
          hawb: hawb,
          labelUrl: labelUrl,
          status: "EXPEDIEE",
          trackingStatus: "CREATED",
          trackingCode: "SH014",
          trackingLabel: "Créée",
          trackingDescription: "Bordereau créé chez Aramex",
          trackingLocation: city,
          lastAramexSync: new Date(),
          lastTrackingUpdate: new Date(),
          weightKg: weight,
          pieces: pieces,
          codAmountMillimes: isCod ? codAmountTnd * 1000 : null,
          rawResponse: JSON.stringify(data),
        },
      });

      // Update Order Status to EXPEDIEE
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: "EXPEDIEE" },
      });

      return {
        success: true,
        hawb,
        labelUrl,
        shipment: shipmentRecord,
        raw: data,
      };
    } catch (err: any) {
      this.logger.error(`Failed to create Aramex shipment for ${order.id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * Synchronize single shipment with Aramex tracking API and persist to DB
   */
  async syncShipmentTracking(identifier: string) {
    let hawb = identifier;
    let shipmentId: string | null = null;
    let orderId: string | null = null;

    // Resolve shipment from DB if identifier is orderId or cuid or hawb
    const shipment = await (this.prisma.shipment as any).findFirst({
      where: {
        OR: [
          { orderId: identifier },
          { id: identifier },
          { hawb: identifier },
          { tracking: identifier },
        ],
      },
    });

    if (shipment) {
      shipmentId = shipment.id;
      orderId = shipment.orderId;
      hawb = shipment.hawb || shipment.tracking || identifier;
    }

    if (!hawb || !/^\d{6,}$/.test(hawb)) {
      throw new BadRequestException("Numéro HAWB invalide ou manquant.");
    }

    const endpoint = `${this.getBaseUrl()}/ShippingAPI.V2/Tracking/Service_1_0.svc/json/TrackShipments`;
    const payload = {
      ClientInfo: this.getClientInfo(),
      Transaction: {
        Reference1: hawb,
        Reference2: "",
        Reference3: "",
        Reference4: "",
        Reference5: "",
      },
      Shipments: [hawb],
      GetLastTrackingUpdateOnly: false,
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new BadRequestException("Réponse invalide du serveur Aramex.");
      }

      if (data?.HasErrors) {
        const msg = data?.Notifications?.[0]?.Message || "Erreur de suivi Aramex";
        throw new BadRequestException(`Aramex: ${msg}`);
      }

      const results = data?.TrackingResults?.[0]?.Value || [];
      const { checkpoints, normalized } = normalizeAramexCheckpoints(results);

      // Persist normalized tracking to DB if shipment exists
      let updatedShipment = shipment;
      if (shipmentId || orderId) {
        const updateData: any = {
          trackingStatus: normalized.status,
          trackingCode: normalized.code,
          trackingLabel: normalized.label,
          trackingDescription: normalized.description,
          trackingLocation: normalized.location,
          trackingEvents: JSON.stringify(checkpoints),
          lastAramexSync: new Date(),
          lastTrackingUpdate: normalized.lastUpdateDate || new Date(),
          rawResponse: JSON.stringify(data),
        };

        if (normalized.deliveredAt) {
          updateData.deliveredAt = normalized.deliveredAt;
        }
        if (normalized.returnedAt) {
          updateData.returnedAt = normalized.returnedAt;
        }

        updatedShipment = await (this.prisma.shipment as any).update({
          where: shipmentId ? { id: shipmentId } : { orderId: orderId! },
          data: updateData,
        });
      }

      return {
        success: true,
        hawb,
        shipment: updatedShipment,
        normalized,
        checkpoints,
        raw: data,
      };
    } catch (err: any) {
      this.logger.error(`Error tracking shipment ${hawb}: ${err.message}`);
      throw new BadRequestException(`Impossible de synchroniser le suivi Aramex: ${err.message}`);
    }
  }

  /**
   * Track an Aramex Shipment by HAWB or Order ID (delegates to sync)
   */
  async trackShipment(identifier: string) {
    return this.syncShipmentTracking(identifier);
  }

  /**
   * Batch synchronize active shipments from DB with Aramex API
   */
  async batchSyncShipments(customHawbs?: string[]) {
    let shipmentsToSync: any[] = [];

    if (customHawbs && customHawbs.length > 0) {
      shipmentsToSync = await (this.prisma.shipment as any).findMany({
        where: {
          OR: [{ hawb: { in: customHawbs } }, { tracking: { in: customHawbs } }],
        },
      });
    } else {
      // Find all shipments with HAWB that are not finalized (DELIVERED/RETURNED) or haven't been synced in > 15 mins
      shipmentsToSync = await (this.prisma.shipment as any).findMany({
        where: {
          OR: [
            { hawb: { not: null } },
            { tracking: { not: null } },
          ],
        },
        take: 100,
        orderBy: { updatedAt: "desc" },
      });
    }

    const hawbs = Array.from(
      new Set(
        shipmentsToSync
          .map((s) => s.hawb || s.tracking)
          .filter((h): h is string => Boolean(h && /^\d{6,}$/.test(h)))
      )
    );

    if (hawbs.length === 0) {
      return { success: true, count: 0, updated: [] };
    }

    const endpoint = `${this.getBaseUrl()}/ShippingAPI.V2/Tracking/Service_1_0.svc/json/TrackShipments`;
    const chunkSize = 25;
    const updatedRecords: any[] = [];

    for (let i = 0; i < hawbs.length; i += chunkSize) {
      const chunk = hawbs.slice(i, i + chunkSize);
      const payload = {
        ClientInfo: this.getClientInfo(),
        Transaction: {
          Reference1: `batch-sync-${Date.now()}`,
          Reference2: "",
          Reference3: "",
          Reference4: "",
          Reference5: "",
        },
        Shipments: chunk,
        GetLastTrackingUpdateOnly: false,
      };

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        const results = data?.TrackingResults || [];

        for (const res of results) {
          const itemHawb = res.Key;
          const values = res.Value || [];
          const { checkpoints, normalized } = normalizeAramexCheckpoints(values);

          const matchingShipment = shipmentsToSync.find(
            (s) => s.hawb === itemHawb || s.tracking === itemHawb
          );

          if (matchingShipment) {
            const updateData: any = {
              trackingStatus: normalized.status,
              trackingCode: normalized.code,
              trackingLabel: normalized.label,
              trackingDescription: normalized.description,
              trackingLocation: normalized.location,
              trackingEvents: JSON.stringify(checkpoints),
              lastAramexSync: new Date(),
              lastTrackingUpdate: normalized.lastUpdateDate || new Date(),
            };

            if (normalized.deliveredAt) {
              updateData.deliveredAt = normalized.deliveredAt;
            }
            if (normalized.returnedAt) {
              updateData.returnedAt = normalized.returnedAt;
            }

            const updated = await (this.prisma.shipment as any).update({
              where: { id: matchingShipment.id },
              data: updateData,
            });
            updatedRecords.push(updated);
          }
        }
      } catch (err: any) {
        this.logger.warn(`Batch tracking error for chunk: ${err.message}`);
      }
    }

    return {
      success: true,
      count: updatedRecords.length,
      updated: updatedRecords,
    };
  }

  /**
   * Print or Retrieve Label URL from Aramex
   */
  async printLabel(hawb: string) {
    const endpoint = `${this.getBaseUrl()}/ShippingAPI.V2/Shipping/Service_1_0.svc/json/PrintLabel`;
    const payload = {
      ClientInfo: this.getClientInfo(),
      Transaction: {
        Reference1: hawb,
        Reference2: "",
        Reference3: "",
        Reference4: "",
        Reference5: "",
      },
      ShipmentNumber: hawb,
      LabelInfo: {
        ReportID: 9737,
        ReportType: "URL",
      },
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new BadRequestException("Réponse invalide du serveur Aramex.");
      }

      const labelUrl = data?.ShipmentLabel?.LabelURL || null;
      return { success: true, hawb, labelUrl };
    } catch (err: any) {
      this.logger.error(`Error printing label for ${hawb}: ${err.message}`);
      throw new BadRequestException(`Erreur récupération bordereau: ${err.message}`);
    }
  }
}
