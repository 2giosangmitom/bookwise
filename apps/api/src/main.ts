import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import helmet from "@fastify/helmet";
import packageJson from "../package.json";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  // Register helmet
  await app.getHttpAdapter().getInstance().register(helmet);

  const configService = app.get(ConfigService);

  app.enableCors({
    methods: configService.get("CORS_METHODS").split(","),
    origin: configService.get("CORS_ORIGIN").split(","),
    credentials: true,
  });

  app.setGlobalPrefix("/api");

  const config = new DocumentBuilder()
    .setTitle("Bookwise API")
    .setDescription("Bookwise API documentation")
    .setVersion(packageJson.version)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
