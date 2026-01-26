import "./global.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthContextData } from "@/contexts/auth";
import { type Metadata } from "next";
import { functional } from "@bookwise/sdk";
import { API_CONNECTION } from "@/lib/constants";
import AuthProvider from "@/providers/auth";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Bookwise",
  description: "A library management system for universities and colleges.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  let contextData: AuthContextData | null;

  try {
    const refreshToken = cookieStore.get("refreshToken")?.value;
    const refreshResponse = await functional.api.auth.refresh({
      ...API_CONNECTION,
      headers: {
        Cookie: `refreshToken=${refreshToken}`,
      },
    });
    const accessToken = refreshResponse.data.accessToken;

    const meResponse = await functional.api.user.me.me({
      ...API_CONNECTION,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    contextData = {
      accessToken,
      user: meResponse.data,
    };
  } catch {
    contextData = null;
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider value={contextData}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children} Root layout
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
