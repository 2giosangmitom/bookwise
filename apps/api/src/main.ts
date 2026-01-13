import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import packageJson from "../package.json";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  app.setGlobalPrefix("/api");

  const config = new DocumentBuilder()
    .setTitle("Bookwise API")
    .setDescription("Bookwise API documentation")
    .setVersion(packageJson.version)
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, documentFactory);

  await app.listen(process.env.PORT ?? 8080);
}
void bootstrap();
