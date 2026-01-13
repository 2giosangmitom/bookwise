import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { z } from "zod";
import { APP_FILTER } from "@nestjs/core";
import { DatabaseExceptionFilter } from "./filters/database";
import { AccountModule } from "./modules/account/account.module";
import { UserModule } from "./modules/user/user.module";
import { ZodExceptionFilter } from "./filters/zod";

const envSchema = z.object({
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  CORS_METHODS: z.string(),
  CORS_ORIGIN: z.string(),
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
      }),
    }),
    AccountModule,
    UserModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: DatabaseExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ZodExceptionFilter,
    },
  ],
})
export class AppModule {}
