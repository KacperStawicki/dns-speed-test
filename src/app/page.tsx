// src/app/page.tsx

"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import DNSSpeedTest from "../components/DNSSpeedTest";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full flex justify-end mb-4">
        <ThemeToggle />
      </div>
      <h1 className="text-4xl font-bold mb-8">DNS and Download Speed Test</h1>
      <DNSSpeedTest />
    </main>
  );
}
