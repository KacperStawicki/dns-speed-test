// components/DNSLegend.tsx
import { Server } from "lucide-react";
import { Card } from "./ui/card";

export const popularDNSServers = [
  {
    name: "Cloudflare",
    ip: "1.1.1.1",
    website: "https://www.cloudflare.com/dns/",
  },
  {
    name: "Google",
    ip: "8.8.8.8",
    website: "https://developers.google.com/speed/public-dns",
  },
  { name: "Quad9", ip: "9.9.9.9", website: "https://www.quad9.net/" },
  {
    name: "OpenDNS",
    ip: "208.67.222.222",
    website: "https://www.opendns.com/",
  },
  {
    name: "AdGuard DNS",
    ip: "94.140.14.14",
    website: "https://adguard-dns.io/en/public-dns.html",
  },
  {
    name: "Comodo Secure DNS",
    ip: "8.26.56.26",
    website: "https://www.comodo.com/secure-dns/",
  },
  {
    name: "CleanBrowsing",
    ip: "185.228.168.9",
    website: "https://cleanbrowsing.org/",
  },
  { name: "Yandex DNS", ip: "77.88.8.8", website: "https://dns.yandex.com/" },
  {
    name: "Cisco OpenDNS",
    ip: "208.67.220.220",
    website: "https://www.opendns.com/",
  },
  {
    name: "Verisign",
    ip: "64.6.64.6",
    website:
      "https://www.verisign.com/en_US/security-services/public-dns/index.xhtml",
  },
  {
    name: "Alternate DNS",
    ip: "76.76.19.19",
    website: "https://alternatedns.com/",
  },
  { name: "FDN", ip: "80.67.169.12", website: "https://www.fdn.fr/" },
];

export function DNSLegend() {
  return (
    <Card className="p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Server className="mr-2" /> Popular DNS Servers
      </h2>
      <ul className="space-y-2">
        {popularDNSServers.map((server) => (
          <li key={server.ip} className="flex justify-between">
            <span>{server.name}</span>
            <a
              href={server.website}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-blue-500 hover:underline"
            >
              {server.ip}
            </a>
          </li>
        ))}
      </ul>
    </Card>
  );
}
