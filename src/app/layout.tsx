import type { Metadata } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Bond.Credit - NEAR Protocol DeFi Platform",
    template: "%s | Bond.Credit"
  },
  description: "Enterprise-grade DeFi yield optimization platform on NEAR Protocol. Earn high-yield returns through verified investment opportunities with real-time portfolio tracking and blockchain transparency.",
  keywords: [
    "NEAR Protocol",
    "DeFi",
    "Decentralized Finance",
    "Yield Farming",
    "Crypto Investment",
    "Bond.Credit",
    "NEAR Wallet",
    "Blockchain",
    "Smart Contracts",
    "Token Swap",
    "Staking",
    "Liquidity Pools",
    "Web3",
    "Cryptocurrency"
  ],
  authors: [{ name: "Bond.Credit Team" }],
  creator: "Bond.Credit",
  publisher: "Bond.Credit",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://bond-credit.vercel.app'),
  
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Bond.Credit",
    title: "Bond.Credit - NEAR Protocol DeFi Platform",
    description: "Enterprise-grade DeFi yield optimization on NEAR Protocol. Maximize returns with verified opportunities and real-time tracking.",
    images: [
      {
        url: "/logo/bod.png",
        width: 1200,
        height: 630,
        alt: "Bond.Credit Logo",
      }
    ],
  },
  
  twitter: {
    card: "summary_large_image",
    title: "Bond.Credit - NEAR Protocol DeFi Platform",
    description: "Enterprise-grade DeFi yield optimization on NEAR Protocol. Maximize your returns with verified opportunities.",
    images: ["/logo/bod.png"],
    creator: "@BondCredit",
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
  
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' }
  ],
  
  manifest: '/manifest.json',
  
  icons: {
    icon: '/logo/bod.png',
    shortcut: '/logo/bod.png',
    apple: '/logo/bod.png',
  },
  
  alternates: {
    canonical: '/',
  },
  
  category: 'finance',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${ibmPlexMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
