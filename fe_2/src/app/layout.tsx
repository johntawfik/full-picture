import type { Metadata } from "next";
import "./globals.css";


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
    <html lang="en">
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Special+Gothic&family=Special+Gothic+Expanded+One&display=swap" rel="stylesheet" precedence="default"/>
      <body>
        {children}
      </body>
    </html>
  );
}
