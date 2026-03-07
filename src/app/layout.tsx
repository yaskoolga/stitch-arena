import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StitchArena — Cross-Stitch Progress Tracker",
  description: "Track your cross-stitch projects and daily stitching progress",
  icons: {
    icon: '/favicon.svg',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'StitchArena',
  },
  themeColor: '#8b5cf6',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Providers>
            {/* Skip to main content link for keyboard navigation */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-lg"
            >
              {(messages as any).common?.skipToMain || "Skip to main content"}
            </a>
            <Header />
            <div className="flex">
              <Sidebar />
              <main id="main-content" className="flex-1 md:ml-56 px-4 pt-16 pb-8 md:py-8 container mx-auto">{children}</main>
            </div>
            <Toaster richColors />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
