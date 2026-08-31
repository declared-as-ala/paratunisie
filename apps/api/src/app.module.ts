import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { CatalogueModule } from "./catalogue/catalogue.module";
import { OrdersModule } from "./orders/orders.module";
import { CustomersModule } from "./customers/customers.module";
import { RoutinesModule } from "./routines/routines.module";
import { WishlistModule } from "./wishlist/wishlist.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { LoyaltyModule } from "./loyalty/loyalty.module";
import { ContentModule } from "./content/content.module";
import { HomepageModule } from "./homepage/homepage.module";
import { AdminAuthModule } from "./admin-auth/admin-auth.module";
import { InventoryModule } from "./inventory/inventory.module";
import { SuppliersModule } from "./suppliers/suppliers.module";
import { PurchasingModule } from "./purchasing/purchasing.module";
import { ReportingModule } from "./reporting/reporting.module";
import { ProfitabilityModule } from "./profitability/profitability.module";
import { ImportsModule } from "./imports/imports.module";
import { NavigationModule } from "./navigation/navigation.module";
import { DiagnosticModule } from "./diagnostic/diagnostic.module";
import { SearchModule } from "./search/search.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { MetaCapiModule } from "./meta-capi/meta-capi.module";
import { ProductRequestsModule } from "./product-requests/product-requests.module";
import { ShippingModule } from "./shipping/shipping.module";
import { AnalyticsModule } from "./analytics/analytics.module";

@Module({
  imports: [
    PrismaModule,
    CatalogueModule,
    OrdersModule,
    CustomersModule,
    RoutinesModule,
    WishlistModule,
    ReviewsModule,
    LoyaltyModule,
    ContentModule,
    HomepageModule,
    AdminAuthModule,
    InventoryModule,
    SuppliersModule,
    PurchasingModule,
    ReportingModule,
    ProfitabilityModule,
    ImportsModule,
    NavigationModule,
    DiagnosticModule,
    NotificationsModule,
    SearchModule,
    MetaCapiModule,
    ProductRequestsModule,
    ShippingModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
