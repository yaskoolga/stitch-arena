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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://stitch-arena.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "StitchArena — Cross-Stitch Progress Tracker with AI Detection",
    template: "%s | StitchArena",
  },
  description: "Track your cross-stitch projects with AI-powered stitch detection. Join the community, participate in challenges, and showcase your embroidery work. Free cross-stitch tracking app.",
  keywords: [
    'cross stitch',
    'embroidery',
    'needlework',
    'cross stitch tracker',
    'AI stitch detection',
    'cross stitch app',
    'embroidery tracker',
    'cross stitch community',
    'cross stitch challenges',
    'handmade',
    'crafts',
  ],
  authors: [{ name: 'StitchArena' }],
  creator: 'StitchArena',
  publisher: 'StitchArena',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'StitchArena',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'StitchArena',
    title: 'StitchArena — Cross-Stitch Progress Tracker with AI Detection',
    description: 'Track your cross-stitch projects with AI-powered stitch detection. Join the community and participate in challenges.',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'StitchArena - Cross-Stitch Progress Tracker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StitchArena — Cross-Stitch Progress Tracker',
    description: 'Track your cross-stitch projects with AI-powered stitch detection.',
    images: [`${SITE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
