import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { App } from 'antd';
import './globals.css';
import { fetchApi } from '@/lib/api/apiClient';
import { MeResponse, RefreshTokenResponse } from '@/lib/api/types';
import AuthProvider from './_components/AuthProvider';
import QueryProvider from './_components/QueryProvider';
import { cookies } from 'next/headers';
import { getMe } from '@/lib/api/user';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'BookWise',
  description: 'A university library management system'
};

export default async function RootLayout({ children }: React.PropsWithChildren) {
  // Prefetch user data
  let user: MeResponse['data'] | null;
  let accessToken: string | null;
  try {
    const refreshResponse = await fetchApi<RefreshTokenResponse>('/auth/refresh-token', {
      method: 'POST',
      headers: {
        cookie: (await cookies()).toString()
      }
    });
    accessToken = refreshResponse.data.access_token;

    const fetchUserResponse = await getMe(accessToken);
    user = fetchUserResponse.data;
  } catch {
    user = null;
    accessToken = null;
  }

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <App>
          <QueryProvider>
            <AuthProvider user={user} accessToken={accessToken}>
              {children}
            </AuthProvider>
          </QueryProvider>
        </App>
      </body>
    </html>
  );
}
