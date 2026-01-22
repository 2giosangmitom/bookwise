/// <reference types="@fastify/cookie" />

import { INestiaConfig } from "@nestia/sdk";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./src/app.module";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";

const NESTIA_CONFIG: INestiaConfig = {
  input: async () => {
    const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
    app.setGlobalPrefix("api");
    return app;
  },
  output: "../../packages/sdk/src",
  clone: true,
  swagger: {
    openapi: "3.1",
    output: "dist/swagger.json",
    security: {
      bearer: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    beautify: true,
  },
};
export default NESTIA_CONFIG;
