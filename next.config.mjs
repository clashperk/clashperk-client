/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async redirects() {
    return [
      {
        source: '/invite',
        destination:
          'https://discord.com/oauth2/authorize?client_id=526971716711350273',
        permanent: true
      },
      {
        source: '/discord',
        destination: 'https://discord.gg/ppuppun',
        permanent: true
      },
      {
        source: '/faq',
        destination: 'https://docs.clashperk.com/faq',
        permanent: true
      },
      {
        source: '/guide',
        destination: 'https://docs.clashperk.com/overview/getting-set-up',
        permanent: true
      },
      {
        source: '/clans/:path*',
        destination: '/web/clans/:path*',
        permanent: true
      },
      {
        source: '/charts/:path*',
        destination: '/web/charts/:path*',
        permanent: true
      },
      {
        source: '/players/:path*',
        destination: '/web/players/:path*',
        permanent: true
      },
      {
        source: '/members/:tag',
        destination: '/web/players/:tag/wars',
        permanent: true
      },
      {
        source: '/capital/:tag',
        destination: '/web/clans/:tag/capital-contribution',
        permanent: true
      },
    ];
  }
};

export default nextConfig;
