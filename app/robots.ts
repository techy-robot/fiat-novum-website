import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/keystatic/'], // Block API and Keystatic admin portals
    },
    sitemap: 'https://www.fiatnovum.com/sitemap.xml',
  };
}