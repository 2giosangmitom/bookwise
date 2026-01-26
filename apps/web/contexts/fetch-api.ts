import { createAutoRefreshClient } from "@/lib/utils";
import { createContext, useContext } from "react";

export type FetchApiContextData = ReturnType<typeof createAutoRefreshClient>;

export const FetchApiContext = createContext<FetchApiContextData | null>(null);

export function useFetchApiContext() {
  const context = useContext(FetchApiContext);
  if (!context) {
    throw new Error("useFetchApiContext must be used within an FetchApiProvider");
  }
  return context;
}
