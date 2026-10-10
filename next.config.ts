import type { NextConfig } from "next";

// Local dev only: the production API's CORS allowlist excludes localhost, so the
// browser calls /api-proxy on this server and Next forwards it server-side.
const apiProxyTarget = process.env.API_PROXY_TARGET;

const nextConfig: NextConfig = {
  reactStrictMode: false,
  devIndicators: false,
  async rewrites() {
    if (!apiProxyTarget) return [];
    return [{ source: "/api-proxy/:path*", destination: `${apiProxyTarget}/:path*` }];
  },
  async redirects() {
    return [
      {
        source: "/invite",
        destination:
          "https://discord.com/oauth2/authorize?client_id=526971716711350273",
        permanent: true,
      },
      {
        source: "/discord",
        destination: "https://discord.gg/ppuppun",
        permanent: true,
      },
      {
        source: "/faq",
        destination: "https://docs.clashperk.com/faq",
        permanent: true,
      },
      {
        source: "/guide",
        destination: "https://docs.clashperk.com/overview/getting-set-up",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
