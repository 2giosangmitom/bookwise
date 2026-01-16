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
    methods: configService.getOrThrow<string>("CORS_METHODS").split(","),
    origin: configService.getOrThrow<string>("CORS_ORIGIN").split(","),
    credentials: true,
  });

  app.setGlobalPrefix("/api");

  const PORT = configService.get<number>("PORT") ?? 8080;
  const document = await NestiaSwaggerComposer.document(app, {
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Local Server",
      },
    ],
    beautify: true,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SwaggerModule.setup("api", app, document as any);

  await app.listen(PORT);
}
bootstrap();
