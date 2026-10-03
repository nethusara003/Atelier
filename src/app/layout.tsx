import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/components/cart/CartProvider';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { PageTransition } from '@/components/layout/PageTransition';
import { JsonLd, artistJsonLd, organizationJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://atelier-voss.com';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Atelier Voss — Original Handmade Art & Craft',
    template: '%s · Atelier Voss',
  },
  description:
    'Original paintings, ceramics, sculpture and textiles by Elena Voss. Handmade in small numbers in a Paris studio — one-of-one pieces and limited editions.',
  keywords: ['handmade art', 'ceramics', 'original paintings', 'textile art', 'sculpture', 'Elena Voss'],
  authors: [{ name: 'Elena Voss' }],
  openGraph: {
    type: 'website',
    siteName: 'Atelier Voss',
    title: 'Atelier Voss — Original Handmade Art & Craft',
    description:
      'Original paintings, ceramics, sculpture and textiles by Elena Voss, handmade in a Paris studio.',
    images: [{ url: '/images/artworks/painting-1.jpg', width: 1200, height: 1500, alt: 'Field Study No. 4 by Elena Voss' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Atelier Voss — Original Handmade Art & Craft',
    description: 'Original paintings, ceramics, sculpture and textiles, handmade in a Paris studio.',
    images: ['/images/artworks/painting-1.jpg'],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#FAF7F2',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="grain">
        <JsonLd data={[artistJsonLd(), organizationJsonLd()]} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-charcoal focus:px-4 focus:py-2 focus:text-ivory"
        >
          Skip to content
        </a>
        <CartProvider>
          <SiteHeader />
          <PageTransition>
            <main id="main">{children}</main>
          </PageTransition>
          <SiteFooter />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
