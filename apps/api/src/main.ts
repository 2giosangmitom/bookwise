import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";
import { fastifyHelmet } from "@fastify/helmet";
import { fastifyCookie } from "@fastify/cookie";
import { fastifyMultipart } from "@fastify/multipart";
import { ConfigService } from "@nestjs/config";
import { SwaggerModule } from "@nestjs/swagger";
import { NestiaSwaggerComposer } from "@nestia/sdk";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  const configService = app.get(ConfigService);

  // Register fastify plugins
  const fastify = app.getHttpAdapter().getInstance();
  await fastify.register(fastifyHelmet as never);
  await fastify.register(fastifyCookie as never, {
    secret: configService.getOrThrow("COOKIE_SECRET"),
  });
  await fastify.register(fastifyMultipart as never);

  app.enableCors({
    methods: configService.getOrThrow<string>("CORS_METHODS").split(","),
    origin: configService.getOrThrow<string>("CORS_ORIGIN").split(","),
    credentials: true,
  });

  app.setGlobalPrefix("/api");

  const PORT = configService.get<number>("PORT") ?? 8080;
  const document = await NestiaSwaggerComposer.document(app, {
    openapi: "3.1",
    security: {
      bearer: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Local Server",
      },
    ],
    beautify: true,
  });
  SwaggerModule.setup("api", app, document as never);

  await app.listen(PORT);
}
bootstrap();
