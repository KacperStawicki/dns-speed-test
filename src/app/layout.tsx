// src/app/layout.tsx

import { ThemeProvider } from "@/components/ThemeProvider";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DNS Speed Test | Find Your Fastest DNS Server",
  description:
    "Test and compare DNS servers to find the fastest one for your network. Improve your internet speed and reduce latency with our comprehensive DNS speed test tool.",
  keywords:
    "DNS, speed test, network optimization, internet performance, DNS server comparison",
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
