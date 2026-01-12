import { type ApiResponse } from "./index.js";

export type SignUpResponse = ApiResponse<{
  userId: string;
}>;
