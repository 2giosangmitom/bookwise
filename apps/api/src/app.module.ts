import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { DatabaseExceptionFilter } from "./filters/database";
import { AuthModule } from "./modules/auth/auth.module";
import { UserModule } from "./modules/user/user.module";
import { AuthorModule } from "./modules/author/author.module";
import { BookModule } from "./modules/book/book.module";
import { LoanModule } from "./modules/loan/loan.module";
import { CategoryModule } from "./modules/category/category.module";
import { BookCopyModule } from "./modules/bookCopy/bookCopy.module";
import { ReservationModule } from "./modules/reservation/reservation.module";
import { PublisherModule } from "./modules/publisher/publisher.module";
import { SessionModule } from "./modules/session/session.module";
import { S3UtilsModule } from "./utils/s3";
import { RedisUtils } from "./utils/redis";
import { JwtModule } from "@nestjs/jwt";
import z from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  CORS_METHODS: z.string(),
  CORS_ORIGIN: z.string(),
  S3_URL: z.string(),
  S3_ACCESS_KEY: z.string(),
  S3_SECRET_KEY: z.string(),
  JWT_SECRET: z.string(),
  COOKIE_SECRET: z.string(),
});

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (config) => {
        const parseResult = z.safeParse(envSchema, config);
        if (!parseResult.success) {
          const missings = [];
          for (const issue of parseResult.error.issues) {
            missings.push(...issue.path);
          }
          throw new Error(`Missing required environment variables: ${missings.join(", ")}`);
        }

        return parseResult.data;
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        url: configService.get("DATABASE_URL"),
        synchronize: false,
        migrationsRun: false,
        autoLoadEntities: true,
        logging: process.env.NODE_ENV === "development",
      }),
    }),
    S3UtilsModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        endpoint: configService.getOrThrow("S3_URL"),
        region: "us-east-1",
        credentials: {
          accessKeyId: configService.getOrThrow("S3_ACCESS_KEY"),
          secretAccessKey: configService.getOrThrow("S3_SECRET_KEY"),
        },
        forcePathStyle: true, // Must be enabled for RustFS compatibility
      }),
    }),
    RedisUtils.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        url: configService.getOrThrow("REDIS_URL"),
      }),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow("JWT_SECRET"),
      }),
    }),
    AuthModule,
    UserModule,
    BookModule,
    AuthorModule,
    LoanModule,
    CategoryModule,
    BookCopyModule,
    ReservationModule,
    PublisherModule,
    SessionModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: DatabaseExceptionFilter,
    },
  ],
})
export class AppModule {}
