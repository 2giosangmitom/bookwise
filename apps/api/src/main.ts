import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "./app.module.js";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import packageJson from "../package.json" with { type: "json" };

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  const config = new DocumentBuilder()
    .setTitle("Bookwise API")
    .setDescription("Bookwise API documentation")
    .setVersion(packageJson.version)
    .addTag("🔒Auth", "Authentication module")
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, documentFactory);

  await app.listen(process.env.PORT ?? 8080);
}
void bootstrap();
