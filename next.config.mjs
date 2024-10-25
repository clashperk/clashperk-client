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
      }
    ];
  }
};

export default nextConfig;
