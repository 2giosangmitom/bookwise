"use client";

import { AuthContext, AuthContextData } from "@/contexts/auth";
import { API_CONNECTION } from "@/lib/constants";
import { functional } from "@bookwise/sdk";
import { useEffect, useState } from "react";

export default function AuthProvider({ children, value }: React.PropsWithChildren<{ value: AuthContextData | null }>) {
  const [auth, setAuth] = useState<AuthContextData | null>(value);

  useEffect(() => {
    if (!auth) {
      functional.api.auth.signout(API_CONNECTION);
    }
  }, [auth]);

  return <AuthContext.Provider value={{ auth, setAuth }}>{children}</AuthContext.Provider>;
}
