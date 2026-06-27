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
  title: "Justice Zari — Official Site | Music, Videos, Merch & Fan Club",
  description: "Listen to Justice Zari's latest album, watch music videos, buy merch, join the fan club, book videography services, and license beats. Independent artist from Harare, Zimbabwe.",
  keywords: ["Justice Zari", "JUSTICEZARI", "Zimbabwe music", "Afrobeat", "Hip-hop", "music artist", "videography", "beat marketplace", "fan club"],
  openGraph: {
    title: "Justice Zari — Official Site",
    description: "Listen to Justice Zari's latest album, watch music videos, buy merch, join the fan club, and book videography services.",
    url: "https://justicezari.com",
    siteName: "JUSTICEZARI",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Justice Zari — Official Artist Site",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Justice Zari — Official Site",
    description: "Listen to the latest album, watch videos, join the fan club.",
    images: ["/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/images/zarry c logo.png",
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