// src/app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "DNS Speed Test | Find Your Fastest DNS Server",
  description:
    "Test and compare DNS servers to find the fastest one for your network. Improve your internet speed and reduce latency with our comprehensive DNS speed test tool.",
  keywords:
    "DNS, speed test, network optimization, internet performance, DNS server comparison",
  openGraph: {
    title: "DNS Speed Test | Find Your Fastest DNS Server",
    description:
      "Optimize your internet connection by finding the fastest DNS server for your network.",
    type: "website",
    url: "https://github.com/yourusername/dns-speed-test",
    images: [
      {
        url: "https://raw.githubusercontent.com/yourusername/dns-speed-test/main/public/og-image.png",
        width: 1200,
        height: 630,
        alt: "DNS Speed Test Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DNS Speed Test | Find Your Fastest DNS Server",
    description:
      "Optimize your internet connection by finding the fastest DNS server for your network.",
    images: [
      "https://raw.githubusercontent.com/yourusername/dns-speed-test/main/public/og-image.png",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
