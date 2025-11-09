
import { Product } from '@/hooks/useProducts';

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export const generateSitemap = (products: Product[]): string => {
  const baseUrl = 'https://toolsy.store';
  const currentDate = new Date().toISOString().split('T')[0];
  
  const staticUrls: SitemapUrl[] = [
    {
      loc: `${baseUrl}/`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: 1.0
    },
    {
      loc: `${baseUrl}/tools`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: 0.9
    },
    {
      loc: `${baseUrl}/why-us`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.7
    },
    {
      loc: `${baseUrl}/about`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.6
    },
    {
      loc: `${baseUrl}/privacy-policy`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.5
    },
    {
      loc: `${baseUrl}/refund-policy`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.5
    }
  ];

  const productUrls: SitemapUrl[] = products.map(product => ({
    loc: `${baseUrl}/product/${product.slug}`,
    lastmod: product.updated_at.split('T')[0],
    changefreq: 'weekly',
    priority: 0.8
  }));

  const allUrls = [...staticUrls, ...productUrls];

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return xmlContent;
};

export const downloadSitemap = (content: string) => {
  const blob = new Blob([content], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sitemap.xml';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
