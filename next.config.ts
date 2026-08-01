import type { NextConfig } from "next";
import dns from "node:dns";

// Fix IPv6 localhost fetch errors in Node 18+ (often affects NextAuth)
dns.setDefaultResultOrder("ipv4first");
const nextConfig: NextConfig = {
  transpilePackages: ["react-markdown", "remark-gfm"],
};

export default nextConfig;
