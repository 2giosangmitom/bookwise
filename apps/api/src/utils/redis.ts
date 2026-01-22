import { ConfigurableModuleBuilder, Global, Inject, Injectable, Module } from "@nestjs/common";
import { RedisClientOptions, createClient } from "@redis/client";

export const redisClientSymbol = Symbol("Redis");

const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } = new ConfigurableModuleBuilder<RedisClientOptions>()
  .setClassMethodName("register")
  .build();

@Injectable()
export class RedisService {
  constructor(@Inject(redisClientSymbol) private client: ReturnType<typeof createClient>) {}

  /**
   * Adds an access token to the blacklist but not blacklists it.
   * @param accessTokenId The jwt id
   * @param ssid The session id
   * @param ttl The time-to-live of the black list key in seconds
   */
  addToBlacklist(accessTokenId: string, ssid: string, ttl: number) {
    return this.client.set(`blacklist:access_token:${ssid}:${accessTokenId}`, "false", {
      expiration: { type: "EX", value: ttl },
    });
  }

  /**
   * Blacklists an access token by its JWT ID.
   * @param accessTokenId The jwt id
   * @param ssid The session id
   */
  blackListAccessToken(accessTokenId: string, ssid: string) {
    return this.client.set(`blacklist:access_token:${ssid}:${accessTokenId}`, "true");
  }

  /**
   * Blacklists all access tokens related to a session.
   * @param ssid The session id
   */
  async blackListAllAccessTokensForSession(ssid: string): Promise<void> {
    const multi = this.client.multi();

    for await (const keys of this.client.scanIterator({
      MATCH: `blacklist:access_token:${ssid}:*`,
    })) {
      for (const key of keys) {
        multi.set(key, "true");
      }
    }

    await multi.exec();
  }

  /**
   * Checks if an access token is blacklisted by its JWT ID.
   * @param accessTokenId The jwt id
   * @param ssid The session id
   * @returns true if the token is blacklisted, false otherwise
   */
  async isAccessTokenBlackListed(accessTokenId: string, ssid: string): Promise<boolean> {
    const result = await this.client.get(`blacklist:access_token:${ssid}:${accessTokenId}`);
    return result === "true";
  }
}

@Global()
@Module({
  providers: [
    {
      provide: redisClientSymbol,
      useFactory: async (options: RedisClientOptions) => {
        const client = createClient(options);

        client.on("error", (err) => {
          console.error("Redis Client Error", err);
        });

        await client.connect();

        return client;
      },
      inject: [MODULE_OPTIONS_TOKEN],
    },
    RedisService,
  ],
  exports: [redisClientSymbol, RedisService],
})
export class RedisUtils extends ConfigurableModuleClass {}
