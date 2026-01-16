import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";
import helmet from "@fastify/helmet";
import { ConfigService } from "@nestjs/config";
import { SwaggerModule } from "@nestjs/swagger";
import { NestiaSwaggerComposer } from "@nestia/sdk";

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

  const document = await NestiaSwaggerComposer.document(app, {
    openapi: "3.1",
    servers: [
      {
        url: "http://localhost:3000",
        description: "Localhost",
      },
    ],
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SwaggerModule.setup("api", app, document as any);

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
