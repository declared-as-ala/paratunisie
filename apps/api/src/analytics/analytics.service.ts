import { Injectable, Logger } from "@nestjs/common";
import { OrderStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CollectEventDto, EventTypeDto } from "./dto/collect-event.dto";
import { AnalyticsQueryDto } from "./dto/analytics-query.dto";

const BOT_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /crawling/i,
  /headlesschrome/i,
  /googlebot/i,
  /bingbot/i,
  /yandex/i,
  /baiduspider/i,
  /duckduckbot/i,
  /slurp/i,
  /facebookexternalhit/i,
  /curl/i,
  /python-requests/i,
  /wget/i,
  /postman/i,
  /lighthouse/i,
  /pingdom/i,
];

const CONFIRMED_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.EN_ATTENTE,
  OrderStatus.TENTATIVE_CONTACT,
  OrderStatus.CONFIRMEE,
  OrderStatus.PREPARATION,
  OrderStatus.PRETE_EXPEDITION,
  OrderStatus.EXPEDIEE,
  OrderStatus.LIVREE,
];

export interface PeriodRange {
  start: Date;
  end: Date;
  prevStart: Date;
  prevEnd: Date;
  label: string;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  // ─── 1. Ingestion / Event Collection ───────────────────────────────────

  async collectEvent(dto: CollectEventDto, clientHeaders: Record<string, any>) {
    const userAgent = (clientHeaders["user-agent"] || "").toString();

    // 1. Bot & Admin filter
    if (this.isBot(userAgent)) {
      return { status: "ignored", reason: "bot_detected" };
    }

    if (dto.pagePath.startsWith("/admin") || dto.pagePath.startsWith("/api/")) {
      return { status: "ignored", reason: "admin_path" };
    }

    try {
      const geo = this.resolveGeo(clientHeaders);
      const clientInfo = this.parseUserAgent(userAgent);
      const channel = this.resolveChannel(dto.referrer, dto.utmSource, dto.utmMedium);

      const now = new Date();

      // Find or create session
      let session = await this.prisma.analyticsSession.findUnique({
        where: { sessionToken: dto.sessionToken },
      });

      if (!session) {
        // Check if visitor is returning
        const previousSession = await this.prisma.analyticsSession.findFirst({
          where: { visitorId: dto.visitorId },
          select: { id: true },
        });

        const isNewVisitor = !previousSession;

        session = await this.prisma.analyticsSession.create({
          data: {
            visitorId: dto.visitorId,
            sessionToken: dto.sessionToken,
            startedAt: now,
            lastActiveAt: now,
            durationSeconds: 0,
            pageViewsCount: dto.eventType === EventTypeDto.PAGE_VIEW ? 1 : 0,
            isBounce: true,
            isNewVisitor,
            country: geo.country,
            countryCode: geo.countryCode,
            city: geo.city,
            deviceType: clientInfo.deviceType,
            browser: clientInfo.browser,
            os: clientInfo.os,
            referrer: dto.referrer?.slice(0, 500),
            channel,
            utmSource: dto.utmSource?.slice(0, 100),
            utmMedium: dto.utmMedium?.slice(0, 100),
            utmCampaign: dto.utmCampaign?.slice(0, 100),
            utmContent: dto.utmContent?.slice(0, 100),
            utmTerm: dto.utmTerm?.slice(0, 100),
            hasOrder: dto.eventType === EventTypeDto.PURCHASE,
            orderId: dto.orderId,
          },
        });
      } else {
        // Update existing session activity
        const durationSeconds = Math.max(0, Math.round((now.getTime() - session.startedAt.getTime()) / 1000));
        const newPageViews = session.pageViewsCount + (dto.eventType === EventTypeDto.PAGE_VIEW ? 1 : 0);
        const isBounce = newPageViews <= 1;

        await this.prisma.analyticsSession.update({
          where: { id: session.id },
          data: {
            lastActiveAt: now,
            durationSeconds,
            pageViewsCount: newPageViews,
            isBounce,
            hasOrder: session.hasOrder || dto.eventType === EventTypeDto.PURCHASE,
            orderId: dto.orderId || session.orderId,
          },
        });
      }

      // Create granular event record
      await this.prisma.analyticsEvent.create({
        data: {
          sessionId: session.id,
          visitorId: dto.visitorId,
          eventType: dto.eventType as any,
          pageUrl: dto.pageUrl.slice(0, 1000),
          pagePath: dto.pagePath.slice(0, 500),
          pageType: dto.pageType || this.inferPageType(dto.pagePath),
          pageTitle: dto.pageTitle?.slice(0, 255),
          timeOnPageSeconds: dto.timeOnPageSeconds || 0,
          productId: dto.productId,
          categoryId: dto.categoryId,
          brandId: dto.brandId,
          orderId: dto.orderId,
          searchKeyword: dto.searchKeyword?.trim().toLowerCase().slice(0, 255),
          searchResultsCount: dto.searchResultsCount,
          priceMillimes: dto.priceMillimes,
          quantity: dto.quantity,
          metadata: dto.metadata ? JSON.stringify(dto.metadata) : "{}",
          createdAt: now,
        },
      });

      return { status: "success", sessionId: session.id };
    } catch (err: any) {
      this.logger.warn(`Analytics collection error: ${err.message}`);
      return { status: "error", message: err.message };
    }
  }

  // ─── 2. Overview KPIs with Period Comparisons ───────────────────────────

  async getOverview(query: AnalyticsQueryDto) {
    const range = this.resolvePeriodRange(query);
    const sessionWhere = this.buildSessionWhere(query, range.start, range.end);
    const prevSessionWhere = this.buildSessionWhere(query, range.prevStart, range.prevEnd);

    // Current period metrics
    const [
      totalSessions,
      uniqueVisitorsGroup,
      pageViewsSum,
      bouncedSessions,
      newVisitorsCount,
      currentOrders,
    ] = await Promise.all([
      this.prisma.analyticsSession.count({ where: sessionWhere }),
      this.prisma.analyticsSession.groupBy({
        by: ["visitorId"],
        where: sessionWhere,
      }),
      this.prisma.analyticsSession.aggregate({
        where: sessionWhere,
        _sum: { pageViewsCount: true, durationSeconds: true },
      }),
      this.prisma.analyticsSession.count({
        where: { ...sessionWhere, isBounce: true },
      }),
      this.prisma.analyticsSession.count({
        where: { ...sessionWhere, isNewVisitor: true },
      }),
      this.prisma.order.findMany({
        where: {
          createdAt: { gte: range.start, lte: range.end },
          status: { in: CONFIRMED_ORDER_STATUSES },
        },
        select: { id: true, totalMillimes: true },
      }),
    ]);

    // Previous period metrics
    const [
      prevSessions,
      prevUniqueVisitorsGroup,
      prevPageViewsSum,
      prevBouncedSessions,
      prevOrders,
    ] = await Promise.all([
      this.prisma.analyticsSession.count({ where: prevSessionWhere }),
      this.prisma.analyticsSession.groupBy({
        by: ["visitorId"],
        where: prevSessionWhere,
      }),
      this.prisma.analyticsSession.aggregate({
        where: prevSessionWhere,
        _sum: { pageViewsCount: true, durationSeconds: true },
      }),
      this.prisma.analyticsSession.count({
        where: { ...prevSessionWhere, isBounce: true },
      }),
      this.prisma.order.findMany({
        where: {
          createdAt: { gte: range.prevStart, lte: range.prevEnd },
          status: { in: CONFIRMED_ORDER_STATUSES },
        },
        select: { id: true, totalMillimes: true },
      }),
    ]);

    const uniqueVisitors = uniqueVisitorsGroup.length;
    const prevUniqueVisitors = prevUniqueVisitorsGroup.length;
    const pageViews = pageViewsSum._sum.pageViewsCount || 0;
    const prevPageViews = prevPageViewsSum._sum.pageViewsCount || 0;

    const totalOrdersCount = currentOrders.length;
    const prevOrdersCount = prevOrders.length;

    const totalRevenueMillimes = currentOrders.reduce((sum, o) => sum + (o.totalMillimes || 0), 0);
    const prevRevenueMillimes = prevOrders.reduce((sum, o) => sum + (o.totalMillimes || 0), 0);

    const revenueTnd = Math.round(totalRevenueMillimes / 1000);
    const prevRevenueTnd = Math.round(prevRevenueMillimes / 1000);

    const conversionRate = uniqueVisitors > 0 ? (totalOrdersCount / uniqueVisitors) * 100 : 0;
    const prevConversionRate = prevUniqueVisitors > 0 ? (prevOrdersCount / prevUniqueVisitors) * 100 : 0;

    const avgOrderValueTnd = totalOrdersCount > 0 ? Math.round(revenueTnd / totalOrdersCount) : 0;
    const prevAvgOrderValueTnd = prevOrdersCount > 0 ? Math.round(prevRevenueTnd / prevOrdersCount) : 0;

    const bounceRate = totalSessions > 0 ? (bouncedSessions / totalSessions) * 100 : 0;
    const prevBounceRate = prevSessions > 0 ? (prevBouncedSessions / prevSessions) * 100 : 0;

    const avgDurationSeconds =
      totalSessions > 0 ? Math.round((pageViewsSum._sum.durationSeconds || 0) / totalSessions) : 0;
    const avgPagesPerSession = totalSessions > 0 ? Number((pageViews / totalSessions).toFixed(1)) : 0;

    return {
      period: range.label,
      dateRange: {
        current: { from: range.start.toISOString(), to: range.end.toISOString() },
        previous: { from: range.prevStart.toISOString(), to: range.prevEnd.toISOString() },
      },
      kpis: {
        visitors: {
          current: totalSessions,
          previous: prevSessions,
          changePercent: this.calculatePercentChange(totalSessions, prevSessions),
        },
        uniqueVisitors: {
          current: uniqueVisitors,
          previous: prevUniqueVisitors,
          changePercent: this.calculatePercentChange(uniqueVisitors, prevUniqueVisitors),
        },
        pageViews: {
          current: pageViews,
          previous: prevPageViews,
          changePercent: this.calculatePercentChange(pageViews, prevPageViews),
        },
        sessions: {
          current: totalSessions,
          previous: prevSessions,
          changePercent: this.calculatePercentChange(totalSessions, prevSessions),
        },
        orders: {
          current: totalOrdersCount,
          previous: prevOrdersCount,
          changePercent: this.calculatePercentChange(totalOrdersCount, prevOrdersCount),
        },
        revenue: {
          current: revenueTnd,
          previous: prevRevenueTnd,
          changePercent: this.calculatePercentChange(revenueTnd, prevRevenueTnd),
        },
        conversionRate: {
          current: Number(conversionRate.toFixed(2)),
          previous: Number(prevConversionRate.toFixed(2)),
          changePercent: this.calculatePercentChange(conversionRate, prevConversionRate),
        },
        avgOrderValue: {
          current: avgOrderValueTnd,
          previous: prevAvgOrderValueTnd,
          changePercent: this.calculatePercentChange(avgOrderValueTnd, prevAvgOrderValueTnd),
        },
        bounceRate: {
          current: Number(bounceRate.toFixed(1)),
          previous: Number(prevBounceRate.toFixed(1)),
          changePercent: this.calculatePercentChange(bounceRate, prevBounceRate),
        },
        avgPagesPerSession,
        avgDurationSeconds,
        newVisitorsCount,
        returningVisitorsCount: Math.max(0, totalSessions - newVisitorsCount),
      },
    };
  }

  // ─── 3. Timeseries Chart Data ──────────────────────────────────────────

  async getTimeseries(query: AnalyticsQueryDto) {
    const range = this.resolvePeriodRange(query);
    const metric = query.metric || "visitors";
    const sessionWhere = this.buildSessionWhere(query, range.start, range.end);

    const diffDays = Math.max(1, Math.round((range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24)));
    const isHourly = diffDays <= 1;

    // Fetch sessions and orders in range
    const [sessions, orders, pageViewEvents] = await Promise.all([
      this.prisma.analyticsSession.findMany({
        where: sessionWhere,
        select: { startedAt: true, visitorId: true },
      }),
      this.prisma.order.findMany({
        where: {
          createdAt: { gte: range.start, lte: range.end },
          status: { in: CONFIRMED_ORDER_STATUSES },
        },
        select: { createdAt: true, totalMillimes: true },
      }),
      this.prisma.analyticsEvent.findMany({
        where: {
          createdAt: { gte: range.start, lte: range.end },
          eventType: EventTypeDto.PAGE_VIEW as any,
        },
        select: { createdAt: true },
      }),
    ]);

    // Build timeline buckets
    const buckets = new Map<string, { visitors: number; uniqueVisitors: Set<string>; pageViews: number; sessions: number; orders: number; revenue: number }>();

    const cursor = new Date(range.start);
    while (cursor <= range.end) {
      const key = isHourly
        ? cursor.toISOString().slice(0, 13) + ":00" // YYYY-MM-DDTHH:00
        : cursor.toISOString().slice(0, 10); // YYYY-MM-DD

      if (!buckets.has(key)) {
        buckets.set(key, {
          visitors: 0,
          uniqueVisitors: new Set(),
          pageViews: 0,
          sessions: 0,
          orders: 0,
          revenue: 0,
        });
      }

      if (isHourly) {
        cursor.setHours(cursor.getHours() + 1);
      } else {
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    // Populate sessions
    sessions.forEach((s) => {
      const key = isHourly
        ? s.startedAt.toISOString().slice(0, 13) + ":00"
        : s.startedAt.toISOString().slice(0, 10);
      const b = buckets.get(key);
      if (b) {
        b.sessions += 1;
        b.visitors += 1;
        b.uniqueVisitors.add(s.visitorId);
      }
    });

    // Populate page views
    pageViewEvents.forEach((pv) => {
      const key = isHourly
        ? pv.createdAt.toISOString().slice(0, 13) + ":00"
        : pv.createdAt.toISOString().slice(0, 10);
      const b = buckets.get(key);
      if (b) b.pageViews += 1;
    });

    // Populate orders & revenue
    orders.forEach((o) => {
      const key = isHourly
        ? o.createdAt.toISOString().slice(0, 13) + ":00"
        : o.createdAt.toISOString().slice(0, 10);
      const b = buckets.get(key);
      if (b) {
        b.orders += 1;
        b.revenue += Math.round((o.totalMillimes || 0) / 1000);
      }
    });

    const data = Array.from(buckets.entries()).map(([timeKey, b]) => {
      let val = 0;
      switch (metric) {
        case "unique_visitors":
          val = b.uniqueVisitors.size;
          break;
        case "page_views":
          val = b.pageViews;
          break;
        case "sessions":
          val = b.sessions;
          break;
        case "orders":
          val = b.orders;
          break;
        case "revenue":
          val = b.revenue;
          break;
        case "visitors":
        default:
          val = b.visitors;
          break;
      }

      return {
        date: timeKey,
        label: isHourly ? timeKey.slice(11, 16) : timeKey.slice(5, 10),
        value: val,
        visitors: b.visitors,
        uniqueVisitors: b.uniqueVisitors.size,
        pageViews: b.pageViews,
        sessions: b.sessions,
        orders: b.orders,
        revenue: b.revenue,
      };
    });

    return { metric, isHourly, points: data };
  }

  // ─── 4. Conversion Funnel ──────────────────────────────────────────────

  async getConversionFunnel(query: AnalyticsQueryDto) {
    const range = this.resolvePeriodRange(query);

    const [
      allVisitorsGroup,
      productViewsGroup,
      addToCartGroup,
      checkoutGroup,
      ordersGroup,
    ] = await Promise.all([
      this.prisma.analyticsSession.groupBy({
        by: ["visitorId"],
        where: this.buildSessionWhere(query, range.start, range.end),
      }),
      this.prisma.analyticsEvent.groupBy({
        by: ["visitorId"],
        where: {
          createdAt: { gte: range.start, lte: range.end },
          eventType: EventTypeDto.PRODUCT_VIEW as any,
        },
      }),
      this.prisma.analyticsEvent.groupBy({
        by: ["visitorId"],
        where: {
          createdAt: { gte: range.start, lte: range.end },
          eventType: EventTypeDto.ADD_TO_CART as any,
        },
      }),
      this.prisma.analyticsEvent.groupBy({
        by: ["visitorId"],
        where: {
          createdAt: { gte: range.start, lte: range.end },
          eventType: EventTypeDto.BEGIN_CHECKOUT as any,
        },
      }),
      this.prisma.order.count({
        where: {
          createdAt: { gte: range.start, lte: range.end },
          status: { in: CONFIRMED_ORDER_STATUSES },
        },
      }),
    ]);

    const totalVisitors = Math.max(1, allVisitorsGroup.length);
    const productViews = productViewsGroup.length;
    const addToCart = addToCartGroup.length;
    const checkout = checkoutGroup.length;
    const purchases = ordersGroup;

    const steps = [
      {
        step: 1,
        name: "Visiteurs du site",
        count: totalVisitors,
        conversionFromPrevious: 100,
        overallConversion: 100,
        dropOffRate: 0,
      },
      {
        step: 2,
        name: "Vue Produit",
        count: productViews,
        conversionFromPrevious: Number(((productViews / totalVisitors) * 100).toFixed(1)),
        overallConversion: Number(((productViews / totalVisitors) * 100).toFixed(1)),
        dropOffRate: Number((Math.max(0, 100 - (productViews / totalVisitors) * 100)).toFixed(1)),
      },
      {
        step: 3,
        name: "Ajout au panier",
        count: addToCart,
        conversionFromPrevious: productViews > 0 ? Number(((addToCart / productViews) * 100).toFixed(1)) : 0,
        overallConversion: Number(((addToCart / totalVisitors) * 100).toFixed(1)),
        dropOffRate: productViews > 0 ? Number((Math.max(0, 100 - (addToCart / productViews) * 100)).toFixed(1)) : 0,
      },
      {
        step: 4,
        name: "Début Commande",
        count: checkout,
        conversionFromPrevious: addToCart > 0 ? Number(((checkout / addToCart) * 100).toFixed(1)) : 0,
        overallConversion: Number(((checkout / totalVisitors) * 100).toFixed(1)),
        dropOffRate: addToCart > 0 ? Number((Math.max(0, 100 - (checkout / addToCart) * 100)).toFixed(1)) : 0,
      },
      {
        step: 5,
        name: "Commandes Validées",
        count: purchases,
        conversionFromPrevious: checkout > 0 ? Number(((purchases / checkout) * 100).toFixed(1)) : 0,
        overallConversion: Number(((purchases / totalVisitors) * 100).toFixed(1)),
        dropOffRate: checkout > 0 ? Number((Math.max(0, 100 - (purchases / checkout) * 100)).toFixed(1)) : 0,
      },
    ];

    return { steps };
  }

  // ─── 5. Top Products Analytics ─────────────────────────────────────────

  async getTopProducts(query: AnalyticsQueryDto) {
    const range = this.resolvePeriodRange(query);

    // 1. Aggregate views and add_to_cart events per product
    const [viewEvents, cartEvents, orderItems] = await Promise.all([
      this.prisma.analyticsEvent.groupBy({
        by: ["productId"],
        where: {
          createdAt: { gte: range.start, lte: range.end },
          eventType: EventTypeDto.PRODUCT_VIEW as any,
          productId: { not: null },
        },
        _count: { _all: true },
      }),
      this.prisma.analyticsEvent.groupBy({
        by: ["productId"],
        where: {
          createdAt: { gte: range.start, lte: range.end },
          eventType: EventTypeDto.ADD_TO_CART as any,
          productId: { not: null },
        },
        _count: { _all: true },
      }),
      this.prisma.orderItem.findMany({
        where: {
          order: {
            createdAt: { gte: range.start, lte: range.end },
            status: { in: CONFIRMED_ORDER_STATUSES },
          },
        },
        select: {
          productId: true,
          quantity: true,
          priceMillimes: true,
        },
      }),
    ]);

    // Product ID sets
    const productIds = new Set<string>();
    viewEvents.forEach((v) => v.productId && productIds.add(v.productId));
    cartEvents.forEach((c) => c.productId && productIds.add(c.productId));
    orderItems.forEach((oi) => oi.productId && productIds.add(oi.productId));

    // Fetch product details
    const products = await this.prisma.product.findMany({
      where: { id: { in: Array.from(productIds) } },
      include: { brand: true, category: true, variants: true },
    });

    const productsMap = new Map(products.map((p) => [p.id, p]));

    // Maps for metrics
    const viewsMap = new Map(viewEvents.map((v) => [v.productId!, v._count._all]));
    const cartMap = new Map(cartEvents.map((c) => [c.productId!, c._count._all]));

    const purchaseCountMap = new Map<string, number>();
    const revenueMap = new Map<string, number>();

    orderItems.forEach((oi) => {
      if (!oi.productId) return;
      const count = purchaseCountMap.get(oi.productId) || 0;
      purchaseCountMap.set(oi.productId, count + oi.quantity);

      const rev = revenueMap.get(oi.productId) || 0;
      revenueMap.set(oi.productId, rev + (oi.priceMillimes * oi.quantity));
    });

    // Build rows
    const rows = Array.from(productIds).map((id) => {
      const p = productsMap.get(id);
      const views = viewsMap.get(id) || 0;
      const addToCart = cartMap.get(id) || 0;
      const purchases = purchaseCountMap.get(id) || 0;
      const revenueMillimes = revenueMap.get(id) || 0;
      const revenueTnd = Math.round(revenueMillimes / 1000);

      const conversionRate = views > 0 ? Number(((purchases / views) * 100).toFixed(2)) : 0;
      const viewToCartRate = views > 0 ? Number(((addToCart / views) * 100).toFixed(2)) : 0;
      const cartToPurchaseRate = addToCart > 0 ? Number(((purchases / addToCart) * 100).toFixed(2)) : 0;

      const currentPrice = p?.variants?.[0]?.priceMillimes ? Math.round(p.variants[0].priceMillimes / 1000) : 0;

      return {
        id,
        name: p?.name || "Produit Inconnu",
        slug: p?.slug || "",
        image: p?.image || "/assets/product-fallback.webp",
        brandName: p?.brand?.name || "ParaTunisie",
        categoryName: p?.category?.name || "Nutrition",
        currentPriceTnd: currentPrice,
        inStock: p?.inStock || false,
        views,
        addToCart,
        purchases,
        revenueTnd,
        conversionRate,
        viewToCartRate,
        cartToPurchaseRate,
      };
    });

    // Sort by views desc by default
    rows.sort((a, b) => b.views - a.views);

    return { products: rows };
  }

  // ─── 6. Top Pages Analytics ───────────────────────────────────────────

  async getTopPages(query: AnalyticsQueryDto) {
    const range = this.resolvePeriodRange(query);

    const pages = await this.prisma.analyticsEvent.groupBy({
      by: ["pagePath", "pageType"],
      where: {
        createdAt: { gte: range.start, lte: range.end },
        eventType: EventTypeDto.PAGE_VIEW as any,
      },
      _count: { _all: true },
      _avg: { timeOnPageSeconds: true },
      orderBy: { _count: { pagePath: "desc" } },
      take: 50,
    });

    const rows = pages.map((pg) => {
      const views = pg._count._all;
      const avgDuration = Math.round(pg._avg.timeOnPageSeconds || 0);

      return {
        pagePath: pg.pagePath,
        pageType: pg.pageType,
        views,
        avgDurationSeconds: avgDuration,
      };
    });

    return { pages: rows };
  }

  // ─── 7. Country & Geographic Analytics ─────────────────────────────────

  async getCountryStats(query: AnalyticsQueryDto) {
    const range = this.resolvePeriodRange(query);
    const sessionWhere = this.buildSessionWhere(query, range.start, range.end);

    const [countrySessions, countryPageviews] = await Promise.all([
      this.prisma.analyticsSession.groupBy({
        by: ["country", "countryCode"],
        where: sessionWhere,
        _count: { _all: true },
        _sum: { pageViewsCount: true },
      }),
      this.prisma.analyticsSession.groupBy({
        by: ["countryCode"],
        where: { ...sessionWhere, hasOrder: true },
        _count: { _all: true },
      }),
    ]);

    const ordersMap = new Map(countryPageviews.map((c) => [c.countryCode || "TN", c._count._all]));

    const totalSessions = countrySessions.reduce((sum, c) => sum + c._count._all, 0);

    const rows = countrySessions.map((c) => {
      const code = c.countryCode || "TN";
      const name = c.country || "Tunisie";
      const visitors = c._count._all;
      const pageViews = c._sum.pageViewsCount || visitors;
      const orders = ordersMap.get(code) || 0;
      const conversionRate = visitors > 0 ? Number(((orders / visitors) * 100).toFixed(2)) : 0;
      const sharePercent = totalSessions > 0 ? Number(((visitors / totalSessions) * 100).toFixed(1)) : 0;

      return {
        country: name,
        countryCode: code,
        visitors,
        pageViews,
        orders,
        conversionRate,
        sharePercent,
      };
    });

    rows.sort((a, b) => b.visitors - a.visitors);

    return { countries: rows };
  }

  // ─── 8. Traffic Sources & UTM Attribution ──────────────────────────────

  async getSourceStats(query: AnalyticsQueryDto) {
    const range = this.resolvePeriodRange(query);
    const sessionWhere = this.buildSessionWhere(query, range.start, range.end);

    const channels = await this.prisma.analyticsSession.groupBy({
      by: ["channel", "utmSource", "utmMedium", "utmCampaign"],
      where: sessionWhere,
      _count: { _all: true },
      _sum: { pageViewsCount: true },
    });

    const orderedChannels = await this.prisma.analyticsSession.groupBy({
      by: ["channel"],
      where: { ...sessionWhere, hasOrder: true },
      _count: { _all: true },
    });

    const ordersMap = new Map(orderedChannels.map((c) => [c.channel, c._count._all]));

    const rows = channels.map((ch) => {
      const visitors = ch._count._all;
      const pageViews = ch._sum.pageViewsCount || visitors;
      const orders = ordersMap.get(ch.channel) || 0;
      const conversionRate = visitors > 0 ? Number(((orders / visitors) * 100).toFixed(2)) : 0;

      return {
        channel: this.formatChannelLabel(ch.channel),
        rawChannel: ch.channel,
        utmSource: ch.utmSource || "-",
        utmMedium: ch.utmMedium || "-",
        utmCampaign: ch.utmCampaign || "-",
        visitors,
        pageViews,
        orders,
        conversionRate,
      };
    });

    rows.sort((a, b) => b.visitors - a.visitors);

    return { sources: rows };
  }

  // ─── 9. Device & Browser Analytics ─────────────────────────────────────

  async getDeviceStats(query: AnalyticsQueryDto) {
    const range = this.resolvePeriodRange(query);
    const sessionWhere = this.buildSessionWhere(query, range.start, range.end);

    const [devices, browsers] = await Promise.all([
      this.prisma.analyticsSession.groupBy({
        by: ["deviceType"],
        where: sessionWhere,
        _count: { _all: true },
      }),
      this.prisma.analyticsSession.groupBy({
        by: ["browser"],
        where: sessionWhere,
        _count: { _all: true },
      }),
    ]);

    const total = devices.reduce((sum, d) => sum + d._count._all, 0);

    const deviceRows = devices.map((d) => ({
      device: d.deviceType || "mobile",
      count: d._count._all,
      percent: total > 0 ? Number(((d._count._all / total) * 100).toFixed(1)) : 0,
    }));

    const browserRows = browsers.map((b) => ({
      browser: b.browser || "Chrome",
      count: b._count._all,
      percent: total > 0 ? Number(((b._count._all / total) * 100).toFixed(1)) : 0,
    }));

    deviceRows.sort((a, b) => b.count - a.count);
    browserRows.sort((a, b) => b.count - a.count);

    return { devices: deviceRows, browsers: browserRows };
  }

  // ─── 10. Search Analytics & Zero Results ────────────────────────────────

  async getSearchAnalytics(query: AnalyticsQueryDto) {
    const range = this.resolvePeriodRange(query);

    const searchEvents = await this.prisma.analyticsEvent.groupBy({
      by: ["searchKeyword"],
      where: {
        createdAt: { gte: range.start, lte: range.end },
        eventType: EventTypeDto.SEARCH as any,
        searchKeyword: { not: null },
      },
      _count: { _all: true },
      _avg: { searchResultsCount: true },
      orderBy: { _count: { searchKeyword: "desc" } },
      take: 40,
    });

    const topSearches = searchEvents.map((s) => ({
      keyword: s.searchKeyword!,
      count: s._count._all,
      avgResults: Math.round(s._avg.searchResultsCount || 0),
    }));

    const zeroResultSearches = topSearches.filter((s) => s.avgResults === 0);

    return { topSearches, zeroResultSearches };
  }

  // ─── 11. Realtime Active Analytics (Last 5 mins) ────────────────────────

  async getRealtimeStats() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const [activeSessions, recentEvents] = await Promise.all([
      this.prisma.analyticsSession.findMany({
        where: { lastActiveAt: { gte: fiveMinutesAgo } },
        select: { visitorId: true, country: true, countryCode: true, deviceType: true },
      }),
      this.prisma.analyticsEvent.findMany({
        where: { createdAt: { gte: fiveMinutesAgo } },
        select: { pagePath: true, pageType: true, productId: true },
        take: 100,
      }),
    ]);

    const uniqueActiveVisitors = new Set(activeSessions.map((s) => s.visitorId)).size;

    // Top current pages
    const pageCounts = new Map<string, number>();
    recentEvents.forEach((e) => {
      pageCounts.set(e.pagePath, (pageCounts.get(e.pagePath) || 0) + 1);
    });

    const activePages = Array.from(pageCounts.entries())
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Active countries
    const countryCounts = new Map<string, number>();
    activeSessions.forEach((s) => {
      const c = s.country || "Tunisie";
      countryCounts.set(c, (countryCounts.get(c) || 0) + 1);
    });

    const activeCountries = Array.from(countryCounts.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);

    return {
      activeVisitorsNow: uniqueActiveVisitors,
      activePages,
      activeCountries,
    };
  }

  // ─── 12. CSV Export ───────────────────────────────────────────────────

  async exportCsv(type: string, query: AnalyticsQueryDto): Promise<string> {
    switch (type) {
      case "products": {
        const { products } = await this.getTopProducts(query);
        const headers = ["Produit", "Marque", "Catégorie", "Prix (DT)", "En Stock", "Vues", "Ajouts Panier", "Ventes", "Revenu (DT)", "Taux Conversion (%)"];
        const rows = products.map((p) => [
          `"${p.name.replace(/"/g, '""')}"`,
          `"${p.brandName}"`,
          `"${p.categoryName}"`,
          p.currentPriceTnd,
          p.inStock ? "Oui" : "Non",
          p.views,
          p.addToCart,
          p.purchases,
          p.revenueTnd,
          `${p.conversionRate}%`,
        ]);
        return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      }
      case "pages": {
        const { pages } = await this.getTopPages(query);
        const headers = ["Chemin", "Type", "Vues", "Durée Moyenne (s)"];
        const rows = pages.map((p) => [
          `"${p.pagePath}"`,
          `"${p.pageType}"`,
          p.views,
          p.avgDurationSeconds,
        ]);
        return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      }
      case "countries": {
        const { countries } = await this.getCountryStats(query);
        const headers = ["Pays", "Code", "Visiteurs", "Pages Vues", "Commandes", "Taux Conversion (%)", "Part (%)"];
        const rows = countries.map((c) => [
          `"${c.country}"`,
          `"${c.countryCode}"`,
          c.visitors,
          c.pageViews,
          c.orders,
          `${c.conversionRate}%`,
          `${c.sharePercent}%`,
        ]);
        return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      }
      case "sources": {
        const { sources } = await this.getSourceStats(query);
        const headers = ["Canal", "UTM Source", "UTM Medium", "UTM Campaign", "Visiteurs", "Pages Vues", "Commandes", "Conversion (%)"];
        const rows = sources.map((s) => [
          `"${s.channel}"`,
          `"${s.utmSource}"`,
          `"${s.utmMedium}"`,
          `"${s.utmCampaign}"`,
          s.visitors,
          s.pageViews,
          s.orders,
          `${s.conversionRate}%`,
        ]);
        return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      }
      case "searches": {
        const { topSearches } = await this.getSearchAnalytics(query);
        const headers = ["Terme Recherché", "Nombre de Recherches", "Résultats Moyens"];
        const rows = topSearches.map((s) => [
          `"${s.keyword}"`,
          s.count,
          s.avgResults,
        ]);
        return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      }
      default:
        return "Type non supporté";
    }
  }

  // ─── Internal Helpers ─────────────────────────────────────────────────

  private resolvePeriodRange(query: AnalyticsQueryDto): PeriodRange {
    const period = query.period || "7d";
    const now = new Date();
    // Tunisia time UTC+1
    const tunisNow = new Date(now.getTime() + 60 * 60 * 1000);

    if (period === "custom" && query.from && query.to) {
      const start = new Date(`${query.from}T00:00:00.000Z`);
      const end = new Date(`${query.to}T23:59:59.999Z`);
      const durationMs = end.getTime() - start.getTime();
      const prevEnd = new Date(start.getTime() - 1);
      const prevStart = new Date(prevEnd.getTime() - durationMs);
      return { start, end, prevStart, prevEnd, label: `${query.from} au ${query.to}` };
    }

    switch (period) {
      case "today": {
        const start = new Date(tunisNow);
        start.setUTCHours(0, 0, 0, 0);
        const end = new Date(tunisNow);
        end.setUTCHours(23, 59, 59, 999);

        const prevStart = new Date(start.getTime() - 24 * 60 * 60 * 1000);
        const prevEnd = new Date(end.getTime() - 24 * 60 * 60 * 1000);
        return { start, end, prevStart, prevEnd, label: "Aujourd'hui" };
      }
      case "yesterday": {
        const start = new Date(tunisNow.getTime() - 24 * 60 * 60 * 1000);
        start.setUTCHours(0, 0, 0, 0);
        const end = new Date(tunisNow.getTime() - 24 * 60 * 60 * 1000);
        end.setUTCHours(23, 59, 59, 999);

        const prevStart = new Date(start.getTime() - 24 * 60 * 60 * 1000);
        const prevEnd = new Date(end.getTime() - 24 * 60 * 60 * 1000);
        return { start, end, prevStart, prevEnd, label: "Hier" };
      }
      case "30d": {
        const start = new Date(tunisNow);
        start.setUTCDate(start.getUTCDate() - 29);
        start.setUTCHours(0, 0, 0, 0);
        const end = new Date(tunisNow);

        const prevEnd = new Date(start.getTime() - 1);
        const prevStart = new Date(start);
        prevStart.setUTCDate(prevStart.getUTCDate() - 30);
        return { start, end, prevStart, prevEnd, label: "30 derniers jours" };
      }
      case "this_month": {
        const start = new Date(tunisNow.getUTCFullYear(), tunisNow.getUTCMonth(), 1);
        const end = new Date(tunisNow);

        const prevStart = new Date(tunisNow.getUTCFullYear(), tunisNow.getUTCMonth() - 1, 1);
        const prevEnd = new Date(tunisNow.getUTCFullYear(), tunisNow.getUTCMonth(), 0, 23, 59, 59, 999);
        return { start, end, prevStart, prevEnd, label: "Ce mois-ci" };
      }
      case "last_month": {
        const start = new Date(tunisNow.getUTCFullYear(), tunisNow.getUTCMonth() - 1, 1);
        const end = new Date(tunisNow.getUTCFullYear(), tunisNow.getUTCMonth(), 0, 23, 59, 59, 999);

        const prevStart = new Date(tunisNow.getUTCFullYear(), tunisNow.getUTCMonth() - 2, 1);
        const prevEnd = new Date(tunisNow.getUTCFullYear(), tunisNow.getUTCMonth() - 1, 0, 23, 59, 59, 999);
        return { start, end, prevStart, prevEnd, label: "Mois dernier" };
      }
      case "3mo": {
        const start = new Date(tunisNow);
        start.setUTCDate(start.getUTCDate() - 89);
        start.setUTCHours(0, 0, 0, 0);
        const end = new Date(tunisNow);

        const prevEnd = new Date(start.getTime() - 1);
        const prevStart = new Date(start);
        prevStart.setUTCDate(prevStart.getUTCDate() - 90);
        return { start, end, prevStart, prevEnd, label: "3 derniers mois" };
      }
      case "this_year": {
        const start = new Date(tunisNow.getUTCFullYear(), 0, 1);
        const end = new Date(tunisNow);

        const prevStart = new Date(tunisNow.getUTCFullYear() - 1, 0, 1);
        const prevEnd = new Date(tunisNow.getUTCFullYear() - 1, 11, 31, 23, 59, 59, 999);
        return { start, end, prevStart, prevEnd, label: "Cette année" };
      }
      case "7d":
      default: {
        const start = new Date(tunisNow);
        start.setUTCDate(start.getUTCDate() - 6);
        start.setUTCHours(0, 0, 0, 0);
        const end = new Date(tunisNow);

        const prevEnd = new Date(start.getTime() - 1);
        const prevStart = new Date(start);
        prevStart.setUTCDate(prevStart.getUTCDate() - 7);
        return { start, end, prevStart, prevEnd, label: "7 derniers jours" };
      }
    }
  }

  private buildSessionWhere(query: AnalyticsQueryDto, start: Date, end: Date): Prisma.AnalyticsSessionWhereInput {
    const where: Prisma.AnalyticsSessionWhereInput = {
      startedAt: { gte: start, lte: end },
    };

    if (query.country) {
      where.countryCode = { equals: query.country, mode: "insensitive" };
    }

    if (query.channel) {
      where.channel = query.channel;
    }

    if (query.device) {
      where.deviceType = query.device;
    }

    return where;
  }

  private calculatePercentChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Number((((current - previous) / previous) * 100).toFixed(1));
  }

  private isBot(userAgent: string): boolean {
    if (!userAgent) return false;
    return BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
  }

  private resolveGeo(headers: Record<string, any>): { country: string; countryCode: string; city: string | null } {
    const cfCountry = headers["cf-ipcountry"] || headers["x-country-code"];
    const cfCity = headers["cf-ipcity"] || headers["x-city"];

    if (cfCountry && typeof cfCountry === "string") {
      const code = cfCountry.toUpperCase();
      const name = this.countryCodeToName(code);
      return { country: name, countryCode: code, city: typeof cfCity === "string" ? cfCity : null };
    }

    // Default to Tunisia
    return { country: "Tunisie", countryCode: "TN", city: null };
  }

  private countryCodeToName(code: string): string {
    const map: Record<string, string> = {
      TN: "Tunisie",
      FR: "France",
      DZ: "Algérie",
      MA: "Maroc",
      LY: "Libye",
      DE: "Allemagne",
      IT: "Italie",
      CA: "Canada",
      US: "États-Unis",
      BE: "Belgique",
      CH: "Suisse",
      QA: "Qatar",
      AE: "Émirats Arabes Unis",
      SA: "Arabie Saoudite",
      TR: "Turquie",
    };
    return map[code] || code;
  }

  private parseUserAgent(ua: string): { deviceType: string; browser: string; os: string } {
    let deviceType = "desktop";
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      deviceType = "tablet";
    } else if (/mobile|iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(ua)) {
      deviceType = "mobile";
    }

    let browser = "Chrome";
    if (/edg/i.test(ua)) browser = "Edge";
    else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
    else if (/opera|opr/i.test(ua)) browser = "Opera";
    else if (/chrome|crios/i.test(ua)) browser = "Chrome";
    else if (/safari/i.test(ua)) browser = "Safari";

    let os = "Windows";
    if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
    else if (/android/i.test(ua)) os = "Android";
    else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
    else if (/linux/i.test(ua)) os = "Linux";
    else if (/windows/i.test(ua)) os = "Windows";

    return { deviceType, browser, os };
  }

  private resolveChannel(referrer?: string, utmSource?: string, utmMedium?: string): string {
    const src = (utmSource || "").toLowerCase();
    const med = (utmMedium || "").toLowerCase();

    if (src.includes("facebook") || src.includes("fb") || med.includes("facebook")) return "social_facebook";
    if (src.includes("instagram") || src.includes("ig")) return "social_instagram";
    if (src.includes("tiktok") || src.includes("tt")) return "social_tiktok";
    if (src.includes("google") && (med.includes("cpc") || med.includes("ad") || med.includes("ppc"))) return "paid_search";
    if (src.includes("google")) return "organic_search";

    if (!referrer || referrer === "" || referrer.includes("paratunisie.com")) {
      return "direct";
    }

    if (referrer.includes("google.") || referrer.includes("bing.") || referrer.includes("yahoo.")) {
      return "organic_search";
    }

    if (referrer.includes("facebook.com") || referrer.includes("fb.com")) return "social_facebook";
    if (referrer.includes("instagram.com")) return "social_instagram";
    if (referrer.includes("tiktok.com")) return "social_tiktok";

    return "referral";
  }

  private formatChannelLabel(channel: string): string {
    const map: Record<string, string> = {
      direct: "Accès Direct",
      organic_search: "Recherche Google / Organique",
      paid_search: "Google Ads / Publicités",
      social_facebook: "Facebook",
      social_instagram: "Instagram",
      social_tiktok: "TikTok",
      referral: "Sites Référents",
      other: "Autre",
    };
    return map[channel] || channel;
  }

  private inferPageType(path: string): string {
    if (path === "/" || path === "") return "home";
    if (path.startsWith("/produits/")) return "product";
    if (path.startsWith("/shop") || path.startsWith("/catalogue")) return "shop";
    if (path.startsWith("/marques")) return "brand";
    if (path.startsWith("/besoins")) return "category";
    if (path.startsWith("/conseils")) return "blog";
    if (path.startsWith("/panier")) return "cart";
    if (path.startsWith("/checkout")) return "checkout";
    return "other";
  }
}
