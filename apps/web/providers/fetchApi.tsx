"use client";

import { FetchApiContext } from "@/contexts/fetch-api";
import { createAutoRefreshClient } from "@/lib/utils";
import { useMemo } from "react";

export default function FetchApiProvider({ children }: React.PropsWithChildren) {
  const autoRefreshClient = useMemo(() => createAutoRefreshClient(), []);

  return <FetchApiContext.Provider value={autoRefreshClient}>{children}</FetchApiContext.Provider>;
}
