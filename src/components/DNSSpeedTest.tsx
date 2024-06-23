// src/components/DNSSpeedTest.tsx
"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { MatrixController, MatrixElement } from "chartjs-chart-matrix";
import { saveAs } from "file-saver";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Check,
  Cog,
  Copy,
  Download,
  ExternalLink,
  Globe,
  Loader,
  Play,
  Plus,
  Router,
  SatelliteDish,
  Search,
  Server,
  ServerCog,
  SquareStack,
  Trash2,
} from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import { useCopyToClipboard } from "usehooks-ts";
import { DNSLegend, popularDNSServers } from "./DNSLegend";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast, useToast } from "./ui/use-toast";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  MatrixController,
  MatrixElement,
  Title,
  Tooltip,
  Legend
);

const predefinedDnsServers = popularDNSServers.map((server) => server.ip);

const predefinedDomains = [
  "google.com",
  "cloudflare.com",
  "amazon.com",
  "steampowered.com",
  "ea.com",
  "epicgames.com",
  "playstation.com",
  "xbox.com",
  "blizzard.com",
  "riotgames.com",
  "ubisoft.com",
  "nintendo.com",
  "bethesda.net",
  "rockstargames.com",
  "twitch.tv",
  "discord.com",
  "leagueoflegends.com",
  "dota2.com",
  "fortnite.com",
  "minecraft.net",
  "roblox.com",
  "activision.com",
  "valvesoftware.com",
  "origin.com",
  "gog.com",
];

interface TestResult {
  dnsServer: string;
  dnsResults: {
    [domain: string]: number[];
  };
  downloadSpeed: number | null;
  pingSpikes: number;
  packetLoss: number;
  error?: string;
}

const useApiCall = () => {
  const { toast } = useToast();

  const callApi = useCallback(
    async (url: string, method: string, body: any) => {
      try {
        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response;
      } catch (error) {
        console.error("API call error:", error);
        toast({
          title: "Error",
          description:
            "An error occurred while making the API call. Please try again.",
          variant: "destructive",
        });
        throw error;
      }
    },
    [toast]
  );

  return { callApi };
};

const CopyableInput = React.memo(
  ({ value, onCopy }: { value: string; onCopy: (text: string) => void }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
      onCopy(value);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    };

    return (
      <div className="flex mt-1">
        <Input readOnly value={value} className="flex-grow" />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="ml-2"
          onClick={handleCopy}
        >
          {isCopied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  }
);

const DNSInstructions = React.memo(
  ({
    dnsServer,
    onCopy,
  }: {
    dnsServer: string;
    onCopy: (text: string) => void;
  }) => {
    const [currentTab, setCurrentTab] = useState("windows");

    return (
      <Tabs
        value={currentTab}
        onValueChange={setCurrentTab}
        className="w-full mt-4"
      >
        <TabsList>
          <TabsTrigger value="windows">Windows</TabsTrigger>
          <TabsTrigger value="macos">macOS</TabsTrigger>
          <TabsTrigger value="linux">Linux</TabsTrigger>
        </TabsList>
        <TabsContent value="windows">
          <ol className="list-decimal list-inside space-y-2">
            <li>Open Control Panel</li>
            <li>Click on "Network and Internet"</li>
            <li>Click on "Network and Sharing Center"</li>
            <li>Click on "Change adapter settings"</li>
            <li>
              Right-click on your active network connection and select
              "Properties"
            </li>
            <li>
              Select "Internet Protocol Version 4 (TCP/IPv4)" and click
              "Properties"
            </li>
            <li>Select "Use the following DNS server addresses"</li>
            <li>Enter {dnsServer} as the Preferred DNS server</li>
            <li>Click "OK" to save changes</li>
          </ol>
        </TabsContent>
        <TabsContent value="macos">
          <ol className="list-decimal list-inside space-y-2">
            <li>Click the Apple menu and go to System Preferences</li>
            <li>Click on "Network"</li>
            <li>Select your active network connection</li>
            <li>Click "Advanced" and then the "DNS" tab</li>
            <li>Click the "+" button to add a new DNS server</li>
            <li>Enter {dnsServer}</li>
            <li>Click "OK" and then "Apply" to save changes</li>
          </ol>
        </TabsContent>
        <TabsContent value="linux">
          <ol className="list-decimal list-inside space-y-2">
            <li>Open terminal</li>
            <li>
              Edit the resolv.conf file with sudo privileges:
              <CopyableInput
                value="sudo nano /etc/resolv.conf"
                onCopy={onCopy}
              />
            </li>
            <li>
              Add or modify the nameserver line:
              <CopyableInput
                value={`nameserver ${dnsServer}`}
                onCopy={onCopy}
              />
            </li>
            <li>Save the file (Ctrl+X, then Y, then Enter in nano)</li>
            <li>Restart the network service or reboot your system</li>
          </ol>
          <p className="mt-2 text-sm text-gray-600">
            Note: On some Linux distributions, you may need to modify
            NetworkManager settings instead.
          </p>
        </TabsContent>
      </Tabs>
    );
  }
);

export default function DNSSpeedTest() {
  const [dnsServers, setDnsServers] = useState(predefinedDnsServers);
  const [domains, setDomains] = useState(predefinedDomains);
  const [downloadUrl, setDownloadUrl] = useState(
    "http://link.testfile.org/150MB"
  );
  const [testCount, setTestCount] = useState(25);
  const [downloadTestDuration, setDownloadTestDuration] = useState(5);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [progressMessage, setProgressMessage] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showBestDNSAlert, setShowBestDNSAlert] = useState(false);
  const [bestDNS, setBestDNS] = useState("");
  const [enableDownloadTest, setEnableDownloadTest] = useState(true);
  const [_, copy] = useCopyToClipboard();

  const { callApi } = useApiCall();

  const deleteDnsServer = (index: number) => {
    const newDnsServers = dnsServers.filter((_, i) => i !== index);
    setDnsServers(newDnsServers);
  };

  const deleteDomain = (index: number) => {
    const newDomains = domains.filter((_, i) => i !== index);
    setDomains(newDomains);
  };

  const addDnsServer = () => setDnsServers([...dnsServers, ""]);
  const addDomain = () => setDomains([...domains, ""]);

  const updateDnsServer = (index: number, value: string) => {
    const newDnsServers = [...dnsServers];
    newDnsServers[index] = value;
    setDnsServers(newDnsServers);
  };

  const updateDomain = (index: number, value: string) => {
    const newDomains = [...domains];
    newDomains[index] = value;
    setDomains(newDomains);
  };

  const testDNS = async () => {
    setLoading(true);
    setProgress(0);
    setProgressMessage("");
    setResults([]);

    try {
      const response = await callApi("/api/dns-test", "POST", {
        dnsServers,
        domains,
        downloadUrl: enableDownloadTest ? downloadUrl : null,
        testCount,
        downloadTestDuration,
        enableDownloadTest,
      });

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response body is not readable");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(5));
            if (data.progress) {
              setProgressMessage(data.progress);
              if (data.percent) {
                setProgress(data.percent);
              }
            } else if (data.results) {
              setResults(data.results);
              setProgress(100);

              const bestDNS = calculateBestDNS(data.results);
              setBestDNS(bestDNS);
              setShowBestDNSAlert(true);
            } else if (data.error) {
              console.error("Error:", data.error);
              setProgressMessage(`Error: ${data.error}`);
            }
          }
        }
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setProgressMessage("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateBestDNS = (results: TestResult[]) => {
    return results.reduce((best, current) => {
      // Calculate average ping
      const currentAvgPing =
        Object.values(current.dnsResults)
          .flat()
          .reduce((sum, ping) => sum + ping, 0) /
        Object.values(current.dnsResults).flat().length;

      const bestAvgPing =
        Object.values(best.dnsResults)
          .flat()
          .reduce((sum, ping) => sum + ping, 0) /
        Object.values(best.dnsResults).flat().length;

      // Initialize scores
      let currentScore = 1 / currentAvgPing; // Inverse of average ping
      let bestScore = 1 / bestAvgPing;

      // Factor in download speed if available
      if (enableDownloadTest && current.downloadSpeed && best.downloadSpeed) {
        currentScore *= current.downloadSpeed;
        bestScore *= best.downloadSpeed;
      }

      // Factor in ping spikes (lower is better)
      const totalPings = Object.values(current.dnsResults).flat().length;
      const currentSpikePenalty = 1 - current.pingSpikes / totalPings;
      const bestSpikePenalty = 1 - best.pingSpikes / totalPings;
      currentScore *= currentSpikePenalty;
      bestScore *= bestSpikePenalty;

      // Factor in packet loss (lower is better)
      const currentPacketLossPercentage =
        (current.packetLoss / totalPings) * 100;
      const bestPacketLossPercentage = (best.packetLoss / totalPings) * 100;
      currentScore *= (100 - currentPacketLossPercentage) / 100;
      bestScore *= (100 - bestPacketLossPercentage) / 100;

      return currentScore > bestScore ? current : best;
    }).dnsServer;
  };

  const averagePingChartData = useMemo(() => {
    const calculateAveragePing = (results: TestResult[]) => {
      return results
        .map((result) => {
          const allPings = Object.values(result.dnsResults).flat();
          const averagePing =
            allPings.reduce((sum, ping) => sum + ping, 0) / allPings.length;
          return {
            dnsServer: result.dnsServer,
            averagePing: averagePing,
          };
        })
        .sort((a, b) => a.averagePing - b.averagePing);
    };

    const averagePingData = calculateAveragePing(results);

    return {
      labels: averagePingData.map((result) => result.dnsServer),
      datasets: [
        {
          label: "Average Ping (ms)",
          data: averagePingData.map((result) => result.averagePing),
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, [results]);

  const averagePingChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Average DNS Response Time Across All Domains",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Response Time (ms)",
        },
      },
    },
  };

  const filteredResults = useMemo(() => {
    return results.filter(
      (result) =>
        result.dnsServer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        Object.keys(result.dnsResults).some((domain) =>
          domain.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
  }, [results, searchTerm]);

  const exportResults = useCallback(() => {
    const jsonString = JSON.stringify(results, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    saveAs(blob, "dns_speed_test_results.json");
  }, [results]);

  const pingSpikeChartData = useMemo(() => {
    const sortedPingSpikeResults = [...results].sort(
      (a, b) => a.pingSpikes - b.pingSpikes
    );

    return {
      labels: sortedPingSpikeResults.map((result) => result.dnsServer),
      datasets: [
        {
          label: "Ping Spikes",
          data: sortedPingSpikeResults.map((result) => result.pingSpikes),
          backgroundColor: "rgba(255, 99, 132, 0.6)",
        },
      ],
    };
  }, [results]);

  const packetLossChartData = useMemo(() => {
    return {
      labels: results.map((result) => result.dnsServer),
      datasets: [
        {
          label: "Packet Loss (%)",
          data: results.map((result) => (result.packetLoss / testCount) * 100),
          backgroundColor: "rgba(153, 102, 255, 0.6)",
        },
      ],
    };
  }, [results, testCount]);

  const pingSpikeChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Ping Spikes (Sorted from Lowest to Highest)",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Ping Spikes",
        },
      },
    },
  };

  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "DNS Server Performance",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const downloadSpeedChartData = useMemo(() => {
    const sortedDownloadResults = Array.from(
      new Map(results.map((item) => [item.dnsServer, item]))
    )
      .map(([_, item]) => item)
      .sort((a, b) => (b.downloadSpeed || 0) - (a.downloadSpeed || 0));

    return {
      labels: sortedDownloadResults.map((result) => `${result.dnsServer}`),
      datasets: [
        {
          label: "Download Speed (Mbps)",
          data: sortedDownloadResults.map((result) => result.downloadSpeed),
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
      ],
    };
  }, [results]);

  const getBestDNSInfo = useCallback((dnsServer: string) => {
    return popularDNSServers.find((server) => server.ip === dnsServer) || null;
  }, []);

  const copyToClipboard = (text: string) => {
    copy(text)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "The command has been copied to your clipboard.",
        });
      })
      .catch(() => {
        toast({
          title: "Copy failed",
          description: "Failed to copy the command to clipboard.",
          variant: "destructive",
        });
      });
  };

  const memoizedDNSInstructions = useMemo(
    () => <DNSInstructions dnsServer={bestDNS} onCopy={copyToClipboard} />,
    [bestDNS, copyToClipboard]
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <DNSLegend />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <ServerCog className="mr-2" /> DNS Servers
          </h2>
          <div className="space-y-2">
            {dnsServers.map((server, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  type="text"
                  value={server}
                  onChange={(e) => updateDnsServer(index, e.target.value)}
                  placeholder="Enter DNS server IP"
                  className="w-full"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => deleteDnsServer(index)}
                  className="flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            onClick={addDnsServer}
            variant="outline"
            className="w-full mt-4"
          >
            <Plus className="mr-2" /> Add DNS Server
          </Button>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Globe className="mr-2" /> Domains
          </h2>
          <div className="space-y-2">
            {domains.map((domain, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  type="text"
                  value={domain}
                  onChange={(e) => updateDomain(index, e.target.value)}
                  placeholder="Enter domain to test"
                  className="w-full"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => deleteDomain(index)}
                  className="flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button onClick={addDomain} variant="outline" className="w-full mt-4">
            <Plus className="mr-2" /> Add Domain
          </Button>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Cog className="mr-2" /> Test Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="test-count" className="block mb-2">
                Number of DNS Tests
              </Label>
              <Input
                id="test-count"
                type="number"
                value={testCount}
                onChange={(e) => setTestCount(Number(e.target.value))}
                placeholder="Enter number of DNS tests"
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="enable-download-test" className="block mb-2">
                Enable Download Speed Test
              </Label>
              <Switch
                id="enable-download-test"
                checked={enableDownloadTest}
                onCheckedChange={setEnableDownloadTest}
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {enableDownloadTest && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Download className="mr-2" /> Download Speed Test
            </h2>
            <div>
              <Label htmlFor="file-url" className="block mb-2">
                Test File URL
              </Label>
              <Input
                id="file-url"
                type="text"
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                placeholder="Enter URL for download speed test"
                className="w-full mb-4"
              />
            </div>
            <div>
              <Label htmlFor="download-duration" className="block mb-2">
                Download Test Duration (s)
              </Label>
              <Input
                id="download-duration"
                type="number"
                value={downloadTestDuration}
                onChange={(e) =>
                  setDownloadTestDuration(Number(e.target.value))
                }
                placeholder="Enter download test duration"
                className="w-full"
              />
            </div>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="space-y-6"
      >
        <Button
          onClick={testDNS}
          disabled={loading}
          className="w-full py-6 text-lg font-semibold"
        >
          {loading ? "Testing..." : "Run Tests"}
          {loading ? (
            <Loader className="ml-2 animate-spin" />
          ) : (
            <SatelliteDish className="ml-2" />
          )}
        </Button>

        {loading && (
          <Card className="p-4">
            <h3 className="font-semibold mb-2 flex items-center">
              <Loader className="mr-2 animate-spin" />
              Progress:
            </h3>
            <Progress value={progress} className="mb-2" />
            <p>{progressMessage}</p>
            <p>{progress.toFixed(1)}%</p>
          </Card>
        )}
      </motion.div>

      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="space-y-6"
        >
          <Card className="p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Router className="mr-2" />
              Average DNS Response Time
            </h2>
            <p className="mb-4">
              Average response time across all tested domains for each DNS
              server
            </p>
            <Bar
              data={averagePingChartData}
              options={averagePingChartOptions}
            />
          </Card>

          <Card className="p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Download className="mr-2" />
              Download Speed Results
            </h2>
            <p className="mb-4">
              Download speed test for {downloadUrl} using different DNS servers
            </p>
            <Bar data={downloadSpeedChartData} />
          </Card>

          <Card className="p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Activity className="mr-2" />
              Ping Spikes
            </h2>
            <p className="mb-4">
              Number of ping spikes (50ms higher than previous reading) for each
              DNS server
            </p>
            <Bar data={pingSpikeChartData} options={pingSpikeChartOptions} />
          </Card>

          <Card className="p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <SquareStack className="mr-2" />
              Packet Loss
            </h2>
            <p className="mb-4">
              Percentage of failed DNS resolutions for each DNS server
            </p>
            <Bar data={packetLossChartData} options={chartOptions} />
          </Card>

          <Card className="p-6 shadow-lg space-y-4">
            <div className="flex justify-between">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Search className="mr-2" /> Test Results
              </h2>
              <Button onClick={exportResults}>Export Results</Button>
            </div>

            <Input
              type="text"
              placeholder="Search DNS Address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full mb-4"
            />
            <div className="space-y-4 mt-4">
              {filteredResults.map((result, index) => (
                <Card key={index} className="p-4 space-y-2">
                  <p className="font-semibold flex items-center">
                    <Server className="mr-2" /> DNS Server: {result.dnsServer}
                  </p>
                  {Object.entries(result.dnsResults).map(([domain, times]) => (
                    <div key={domain}>
                      <p className="flex items-center">
                        <Globe className="mr-2" /> Domain: {domain}
                      </p>
                      <p>
                        Average DNS Response Time:{" "}
                        {(
                          times.reduce((a, b) => a + b, 0) / times.length
                        ).toFixed(2)}{" "}
                        ms
                      </p>
                    </div>
                  ))}
                  <p className="flex items-center">
                    <Activity className="mr-2" />
                    Ping Spikes: {result.pingSpikes}
                  </p>
                  <p className="flex items-center">
                    <SquareStack className="mr-2" />
                    Packet Loss:{" "}
                    {((result.packetLoss / testCount) * 100).toFixed(2)}%
                  </p>
                  {result.downloadSpeed !== null ? (
                    <p className="flex items-center">
                      <Download className="mr-2" /> Download Speed:{" "}
                      {result.downloadSpeed.toFixed(2)} Mbps
                    </p>
                  ) : (
                    <p className="text-yellow-600 flex items-center">
                      <AlertTriangle className="mr-2" /> Download Speed: Test
                      failed or not performed
                    </p>
                  )}
                  {result.error && (
                    <p className="text-red-500 flex items-center">
                      <AlertTriangle className="mr-2" /> Error: {result.error}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
      <AlertDialog open={showBestDNSAlert} onOpenChange={setShowBestDNSAlert}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Best DNS Server</AlertDialogTitle>
            <AlertDialogDescription>
              Based on the test results, the best DNS server is:
              <strong className="block mt-2 text-lg">{bestDNS}</strong>
              {getBestDNSInfo(bestDNS) && (
                <a
                  href={getBestDNSInfo(bestDNS)?.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-500 hover:underline mt-2"
                >
                  Visit {getBestDNSInfo(bestDNS)?.name} website
                  <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              )}
              <p className="mt-2">
                This DNS server provided the best balance of Download speed, DNS
                response time, Ping spikes & Packet loss.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">
              How to change your DNS server:
            </h3>
            {memoizedDNSInstructions}
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowBestDNSAlert(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
