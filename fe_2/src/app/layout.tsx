import type { Metadata } from "next";
import { DM_Serif_Display } from "next/font/google";
import "./globals.css";

const dmSerifDisplay = DM_Serif_Display({
  weight: ['400'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://full-picture.vercel.app'),
  title: "Full Picture",
  description: "See the angles behind every story - a comprehensive news platform that brings you multiple perspectives on current events.",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.png' },
    ],
    apple: [
      { url: '/apple-icon.png' },
    ],
  },
  openGraph: {
    title: "Full Picture",
    description: "See the angles behind every story - a comprehensive news platform that brings you multiple perspectives on current events.",
    url: "https://full-picture.vercel.app",
    siteName: "Full Picture",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Full Picture - See the angles behind every story",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Full Picture",
    description: "See the angles behind every story - a comprehensive news platform that brings you multiple perspectives on current events.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={dmSerifDisplay.className}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Special+Gothic&family=Special+Gothic+Expanded+One&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
