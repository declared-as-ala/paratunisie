import "dotenv/config";
import { join } from "path";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });

  // Product images downloaded by the catalogue importer (MediaService) are
  // written to public/uploads/products and stored on Product.image as the
  // relative "/uploads/products/xxx.webp" path — nothing served that path
  // over HTTP before this, so every product image (storefront AND chat)
  // 404'd regardless of how the frontend built the URL. Served at root,
  // not under setGlobalPrefix's "api/v1", since that's the path already
  // baked into every stored image value.
  app.useStaticAssets(join(process.cwd(), "public"));

  app.useBodyParser("json", { limit: "8mb" });
  app.useBodyParser("urlencoded", { limit: "8mb", extended: true });
  app.use(cookieParser());
  app.setGlobalPrefix("api/v1");

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: (origin, callback) => {
      // Reflect the origin header so credentials work from any dashboard or client domain
      callback(null, origin || true);
    },
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Accept",
      "Authorization",
      "Cookie",
      "X-Requested-With",
      "Origin",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers",
    ],
    exposedHeaders: ["Set-Cookie"],
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`ParaTunisie API running on http://localhost:${port}/api/v1`);
}
bootstrap();
