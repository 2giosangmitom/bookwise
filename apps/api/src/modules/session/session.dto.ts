import { tags } from "typia";

export type SessionDto = {
  id: string & tags.Format<"uuid">;
  ipAddress: string;
  userAgent: string;
  deviceName?: string | null;
  os?: string | null;
  browser?: string | null;
  revoked: boolean;
  expiresAt: string & tags.Format<"date-time">;
  createdAt: string & tags.Format<"date-time">;
};

export type GetSessionsResponse = {
  message: string;
  data: {
    sessions: SessionDto[];
  };
};
