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
  title: "Full Picture",
  description: "Get the Full Picture - all-side news aggregator.",
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
