import { type IConnection } from "@bookwise/sdk";

export const API_CONNECTION: IConnection = {
  host: process.env.NEXT_PUBLIC_API_URL!,
};
