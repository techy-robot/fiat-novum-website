// app/layout.tsx
import '@/styles/globals.css'
import "@/components/plasmic/fiat_novum/plasmic.css";
import PlasmicClientProvider from "./PlasmicClientProvider";

import PageSupportCustomFooter from "@/components/PageSupport/PageSupportCustomFooter"; 

import { Metadata } from 'next';

// Universal SEO Metadata fallback
export const metadata: Metadata = {
  metadataBase: new URL('https://www.fiatnovum.com'),
  title: {
    default: 'Fiat Novum | Engineering & Design Portfolio',
    template: '%s | Fiat Novum', // Automatically turns into e.g. "Blog | Fiat Novum" on subpages
  },
  description: 'Bridging the gap between hardware engineering and magic.',
  keywords: ['Hardware Engineering', 'KiCad', 'CAD Design', 'Software Developer'],
  authors: [{ name: 'Asher Edwards' }],
  creator: 'Asher Edwards',
  
  // Open Graph (Facebook, LinkedIn, Discord)
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.fiatnovum.com',
    siteName: 'Fiat Novum',
    title: 'Fiat Novum | Engineering & Design Portfolio',
    description: 'Bridging the gap between hardware engineering and magic.',
    images: [
      {
        url: '/og-image.jpg', // TODO: This should be /public folder, yet to be created
        width: 1200,
        height: 630,
        alt: 'Fiat Novum Portfolio Overview',
      },
    ],
  },

  // Twitter / X
  twitter: {
    card: 'summary_large_image',
    title: 'Fiat Novum | Engineering & Design',
    description: 'Bridging the gap between hardware engineering and magic.',
    images: ['/og-image.jpg'],
  },

  // Search Engine Crawlers
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="en">
      <body>
        
        <PlasmicClientProvider>
          
          <main>
            {children} 
          </main>

          <footer>
             {/* Render it as a standard React component */}
             <PageSupportCustomFooter />
          </footer>

        </PlasmicClientProvider>
        
      </body>
    </html>
  );
}