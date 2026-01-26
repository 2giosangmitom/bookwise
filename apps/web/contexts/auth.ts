"use client";

import { createContext, useContext } from "react";

export type AuthContextData = {
  accessToken: string;
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
    photoFileName: string | null;
    role: "ADMIN" | "MEMBER" | "LIBRARIAN";
  };
};

export type AuthContextValue = {
  auth: AuthContextData | null;
  setAuth: (v: AuthContextData | null) => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
