import type { SessionDto } from "./SessionDto";

export type GetSessionsResponse = {
  message: string;
  data: {
    sessions: SessionDto[];
  };
};
