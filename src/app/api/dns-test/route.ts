// src/app/api/dns-test/route.ts

import { NextRequest, NextResponse } from "next/server";
import dns from "dns";
import { promisify } from "util";
import https from "https";

const resolve4 = promisify(dns.resolve4);

interface DNSResults {
  [domain: string]: number[];
}

interface TestResult {
  dnsServer: string;
  dnsResults: DNSResults;
  downloadSpeed: number | null;
  pingSpikes: number;
  packetLoss: number;
}

async function testDownloadSpeed(
  urlString: string,
  dnsServer: string
): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    const startTime = Date.now();
    let downloadedBytes = 0;
    const testDuration = 5000; // Test for 5 seconds

    // Set the DNS server
    dns.setServers([dnsServer]);

    function makeRequest(url: string) {
      const parsedUrl = new URL(url);
      parsedUrl.protocol = "https:";

      const req = https.get(parsedUrl, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          // Handle redirect
          if (response.headers.location) {
            makeRequest(response.headers.location);
          } else {
            reject(new Error("Redirect location not provided"));
          }
          return;
        }

        if (response.statusCode !== 200) {
          reject(new Error(`HTTP error! status: ${response.statusCode}`));
          return;
        }

        response.on("data", (chunk) => {
          downloadedBytes += chunk.length;
          const elapsedTime = Date.now() - startTime;

          if (elapsedTime >= testDuration) {
            req.destroy();
            const speedMbps =
              (downloadedBytes * 8) / (1000000 * (elapsedTime / 1000));
            resolve(speedMbps);
          }
        });

        response.on("end", () => {
          const elapsedTime = Date.now() - startTime;
          const speedMbps =
            (downloadedBytes * 8) / (1000000 * (elapsedTime / 1000));
          resolve(speedMbps);
        });
      });

      req.on("error", (error) => {
        console.error("Download test error:", error);
        reject(error);
      });

      // Set a timeout in case the download takes too long
      req.setTimeout(testDuration + 5000, () => {
        req.destroy();
        reject(new Error("Download test timed out"));
      });
    }

    makeRequest(urlString);
  }).finally(() => {
    // Reset DNS servers to default after the test
    dns.setServers([]);
  });
}

async function performDnsTest(
  dnsServer: string,
  domain: string,
  testCount: number
): Promise<{ times: number[]; pingSpikes: number; packetLoss: number }> {
  const resolver = new dns.Resolver();
  resolver.setServers([dnsServer]);

  const times: number[] = [];
  let pingSpikes = 0;
  let packetLoss = 0;
  const spikeThreshold = 50; // A spike is 50ms higher than the previous ping

  for (let i = 0; i < testCount; i++) {
    try {
      const startTime = process.hrtime();
      await resolve4(domain);
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const responseTime = seconds * 1000 + nanoseconds / 1e6;

      // Check for ping spike
      if (i > 0) {
        const previousPing = times[i - 1];
        if (responseTime > previousPing + spikeThreshold) {
          pingSpikes++;
        }
      }

      times.push(responseTime);
    } catch (error) {
      packetLoss++;
    }
  }

  return { times, pingSpikes, packetLoss };
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    dnsServers,
    domains,
    downloadUrl,
    testCount = 5,
    downloadTestDuration = 5,
  } = body;

  if (
    !dnsServers ||
    !domains ||
    dnsServers.length === 0 ||
    domains.length === 0
  ) {
    return new Response(
      JSON.stringify({
        error: "At least one DNS server and one domain are required",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const results: TestResult[] = [];
        const totalSteps =
          dnsServers.length * domains.length * testCount +
          (downloadUrl ? dnsServers.length : 0);
        let currentStep = 0;

        for (let i = 0; i < dnsServers.length; i++) {
          const dnsServer = dnsServers[i];
          const dnsResults: DNSResults = {};
          let downloadSpeed: number | null = null;
          let totalPingSpikes = 0;
          let totalPacketLoss = 0;

          controller.enqueue(
            encoder.encode(
              `data: {"progress": "Testing DNS server ${i + 1}/${
                dnsServers.length
              }: ${dnsServer}"}\n\n`
            )
          );

          for (let j = 0; j < domains.length; j++) {
            const domain = domains[j];
            controller.enqueue(
              encoder.encode(
                `data: {"progress": "Testing domain ${j + 1}/${
                  domains.length
                }: ${domain}"}\n\n`
              )
            );

            const { times, pingSpikes, packetLoss } = await performDnsTest(
              dnsServer,
              domain,
              testCount
            );
            dnsResults[domain] = times;
            totalPingSpikes += pingSpikes;
            totalPacketLoss += packetLoss;
            currentStep += testCount;
            controller.enqueue(
              encoder.encode(
                `data: {"progress": "DNS tests completed for ${domain}", "percent": ${Math.round(
                  (currentStep / totalSteps) * 100
                )}}\n\n`
              )
            );
          }

          if (downloadUrl) {
            controller.enqueue(
              encoder.encode(
                `data: {"progress": "Starting download speed test for ${dnsServer}"}\n\n`
              )
            );
            try {
              downloadSpeed = await testDownloadSpeed(downloadUrl, dnsServer);
              currentStep++;
              controller.enqueue(
                encoder.encode(
                  `data: {"progress": "Download speed test completed for ${dnsServer}", "percent": ${Math.round(
                    (currentStep / totalSteps) * 100
                  )}}\n\n`
                )
              );
            } catch (error) {
              console.error(
                `Download speed test error for ${dnsServer}:`,
                error
              );
              downloadSpeed = null;
              controller.enqueue(
                encoder.encode(
                  `data: {"progress": "Download speed test failed for ${dnsServer}", "percent": ${Math.round(
                    (currentStep / totalSteps) * 100
                  )}}\n\n`
                )
              );
            }
          }

          results.push({
            dnsServer,
            dnsResults,
            downloadSpeed,
            pingSpikes: totalPingSpikes,
            packetLoss: totalPacketLoss,
          });
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ results })}\n\n`)
        );
        controller.close();
      } catch (error) {
        console.error("Test execution error:", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: "Test execution failed" })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
