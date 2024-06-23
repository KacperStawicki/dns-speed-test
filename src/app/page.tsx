// src/app/page.tsx

"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import DNSSpeedTest from "../components/DNSSpeedTest";
import { Card } from "@/components/ui/card";
import { AlertTriangle, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between w-full">
            <h1 className="text-4xl font-bold mb-8">
              DNS and Download Speed Test
            </h1>
            <ThemeToggle />
          </div>

          <Card className="p-6 shadow-lg mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <HelpCircle className="mr-2" /> How to Use This Tool
            </h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Review the list of DNS servers and domains. Add or remove as
                needed.
              </li>
              <li>
                Configure the test settings, including the number of tests and
                whether to run a download speed test.
              </li>
              <li>Click the "Run Tests" button to start the DNS speed test.</li>
              <li>
                Wait for the tests to complete. You'll see progress updates as
                the test runs.
              </li>
              <li>
                Once finished, review the results in the charts and detailed
                breakdown below.
              </li>
              <li>
                The tool will suggest the best DNS server based on the test
                results.
              </li>
            </ol>
            <p className="mt-4">
              This tool helps you find the fastest DNS server for your network,
              which can improve your internet browsing speed and reduce latency.
            </p>
            <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900 rounded-md flex items-start">
              <AlertTriangle className="mr-2 flex-shrink-0 text-yellow-700 dark:text-yellow-300" />
              <p className="text-yellow-700 dark:text-yellow-300">
                <strong>Important:</strong> For the most accurate results, avoid
                using your internet connection for downloads, streaming, or
                other bandwidth-intensive activities during the test. This
                ensures that the test measures your DNS and network performance
                without interference from other activities.
              </p>
            </div>
          </Card>
        </motion.div>
        <DNSSpeedTest />
      </div>
    </main>
  );
}
