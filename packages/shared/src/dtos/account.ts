import { type ApiResponse } from "./types.js";

export type SignUpResponse = ApiResponse<{
  userId: string;
}>;
