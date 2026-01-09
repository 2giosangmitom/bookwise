import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string(),
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
      }),
    }),
  ],
})
export class AppModule {}
