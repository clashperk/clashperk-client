import { authCookieKey, authenticatedPathRegex } from '@/lib/constants';
import theme from '@/util/theme';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';
import type { Metadata, Viewport } from 'next';
import { Kanit } from 'next/font/google';
import { cookies, headers } from 'next/headers';
import { Toaster } from 'react-hot-toast';

import { ContextWrapper } from '@/hooks/useContext';
import { UserProfilesEntity } from '@/lib/dto';
import { redirect } from 'next/navigation';
import './globals.css';

const inter = Kanit({
  subsets: ['latin'],
  weight: ['100', '200', '400', '500', '600']
});

export const metadata = {
  title: 'ClashPerk',
  description:
    'Feature-Rich and Powerful Clash of Clans Discord bot with everything you will ever need.',
  generator: 'Next.js',
  manifest: '/manifest.json',
  keywords: ['nextjs', 'nextjs14', 'next14', 'pwa', 'next-pwa'],
  icons: [
    { rel: 'apple-touch-icon', url: 'icons/icon-192x192.png' },
    { rel: 'icon', url: 'icons/icon-192x192.png' }
  ]
} satisfies Metadata;

export const viewport: Viewport = {
  themeColor: 'black'
};

const validateAuth = async () => {
  const headersList = headers();
  const pathname = headersList.get('x-pathname') ?? '/';
  const accessToken = cookies().get(authCookieKey)?.value;

  const isAuthenticatedPath = authenticatedPathRegex.test(pathname);
  if (!isAuthenticatedPath) return null;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (res.status === 401 || res.status === 403) {
    return redirect('/');
  }

  const user = await res.json();
  return user as UserProfilesEntity;
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await validateAuth();

  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="generator" content={metadata.generator} />
        <link rel="manifest" href={metadata.manifest} />
        <meta name="keywords" content={metadata.keywords.join(', ')} />
        {/* {metadata.icons.map(({ rel, url }, idx) => (
          <link key={idx} rel={rel} href={url} />
        ))} */}
      </head>

      <GoogleAnalytics gaId="G-HGSPH1S4Y1" />
      <GoogleTagManager gtmId="GTM-NRBX87WR" />

      <body className={inter.className}>
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          containerClassName="toaster-wrapper"
          toastOptions={{
            className: 'single-toaster',
            duration: 5000,
            icon: null,
            style: {
              background: '#000',
              color: '#fff',
              padding: '5px 5px',
              borderRadius: '3px',
              fontSize: '14px'
            },
            success: { style: { background: '#000', color: '#fff' } },
            error: { style: { background: '#b33234', color: '#fff' } }
          }}
        />
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <ContextWrapper user={user}>{children}</ContextWrapper>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
