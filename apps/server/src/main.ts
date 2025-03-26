import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./AppModule";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: process.env.NODE_ENV === "production" ? ["https://darklake.fi"] : "*",
    allowedHeaders: "*",
    methods: ["GET", "PUT", "POST", "DELETE"],
    maxAge: 60 * 24 * 7,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
