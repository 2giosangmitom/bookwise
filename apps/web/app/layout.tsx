import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { App } from 'antd';
import AuthHydrator from './_components/AuthHydrator';
import './globals.css';

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

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthHydrator />
        <App>{children}</App>
      </body>
    </html>
  );
}
