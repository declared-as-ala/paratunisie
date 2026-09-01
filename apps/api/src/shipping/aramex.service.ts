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

      // Upsert shipment in database
      const shipmentRecord = await (this.prisma.shipment as any).upsert({
        where: { orderId: order.id },
        update: {
          carrier: "aramex",
          tracking: hawb,
          hawb: hawb,
          labelUrl: labelUrl,
          status: "EXPEDIEE",
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
   * Track an Aramex Shipment by HAWB or Order ID
   */
  async trackShipment(identifier: string) {
    let hawb = identifier;

    // Check if passed as orderId
    if (!/^\d{6,}$/.test(identifier)) {
      const shipment = await (this.prisma.shipment as any).findFirst({
        where: { OR: [{ orderId: identifier }, { hawb: identifier }, { tracking: identifier }] },
      });
      if (shipment?.hawb || shipment?.tracking) {
        hawb = shipment.hawb || shipment.tracking!;
      }
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

      const checkpoints = results.map((item: any) => {
        let formattedDate = item.UpdateDateTime || "";
        const m = formattedDate.match(/\/Date\((\d+)(?:[+-]\d+)?\)\//);
        if (m) {
          formattedDate = new Date(Number(m[1])).toLocaleString("fr-FR", { timeZone: "Africa/Tunis" });
        }
        return {
          date: formattedDate,
          location: item.UpdateLocation || "",
          description: item.UpdateDescription || "",
          code: item.UpdateCode || "",
          comments: item.Comments || "",
        };
      });

      return {
        success: true,
        hawb,
        checkpoints,
        raw: data,
      };
    } catch (err: any) {
      this.logger.error(`Error tracking shipment ${hawb}: ${err.message}`);
      throw new BadRequestException(`Impossible de suivre le colis Aramex: ${err.message}`);
    }
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
