import { ConfigurableModuleBuilder, Module } from "@nestjs/common";
import { RedisClientOptions, createClient } from "@redis/client";

export const redisClientSymbol = Symbol("Redis");

const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } = new ConfigurableModuleBuilder<RedisClientOptions>()
  .setClassMethodName("register")
  .build();

@Module({
  providers: [
    {
      provide: redisClientSymbol,
      useFactory: (options: RedisClientOptions) => {
        return createClient(options);
      },
      inject: [MODULE_OPTIONS_TOKEN],
    },
  ],
  exports: [redisClientSymbol],
})
export class RedisUtils extends ConfigurableModuleClass {}
