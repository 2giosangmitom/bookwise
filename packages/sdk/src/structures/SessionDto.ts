import type { Format } from "typia/lib/tags/Format";

export type SessionDto = {
  id: string & Format<"uuid">;
  ipAddress: string;
  userAgent: string;
  deviceName?: null | undefined | string;
  os?: null | undefined | string;
  browser?: null | undefined | string;
  revoked: boolean;
  expiresAt: string & Format<"date-time">;
  createdAt: string & Format<"date-time">;
};
