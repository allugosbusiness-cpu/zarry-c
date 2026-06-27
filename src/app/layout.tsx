import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/layout/ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zarry C — Official Site | Music, Videos, Merch & Beats",
  description: "Listen to Justice Zari's latest albums, watch music videos, buy merch, join the fan club, book videography services, and license beats. Independent artist from Zimbabwe.",
  keywords: ["Justice Zari", "Zarry C", "Zimbabwe music", "Afrobeat", "Hip-hop", "music artist", "zarryc", "beat marketplace", "buy beats"],
  openGraph: {
    title: "Zarry C — Official Site",
    description: "Listen to Zarry C's latest albums, watch music videos, buy merch, join the fan club, and book videography services, download content.",
    url: "https://zarryc.com",
    siteName: "Zarry C",
    images: [
      {
        url: "/images/zarry c logo.png",
        width: 1200,
        height: 630,
        alt: "Zarry C — Official Artist Site",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zarry C — Official Site",
    description: "Listen to the latest album, watch videos, join the fan club.",
    images: ["/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon-icon.png",
    apple: "/images/zarry c logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-dark-950 text-white">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}