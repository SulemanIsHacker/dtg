
import { useEffect } from 'react';

interface SeoProps {
  title: string;
  description: string;
  canonicalPath: string;
  image?: string;
  type?: string;
  keywords?: string;
  noindex?: boolean;
}

export const Seo = ({
  title,
  description,
  canonicalPath,
  image,
  type = 'website',
  keywords,
  noindex = false
}: SeoProps) => {
  useEffect(() => {
    const baseUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
    const canonicalUrl = `${baseUrl}${canonicalPath}`;
    const imageUrl = image ? (image.startsWith('http') ? image : `${baseUrl}${image}`) : `${baseUrl}/dtg.jpeg`;

    // Update or create title
    document.title = title;

    // Function to update or create meta tag
    const updateMeta = (selector: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name';
      const existingTag = document.querySelector(`meta[${attribute}="${selector}"]`);
      
      if (existingTag) {
        existingTag.setAttribute('content', content);
      } else {
        const meta = document.createElement('meta');
        meta.setAttribute(attribute, selector);
        meta.setAttribute('content', content);
        meta.setAttribute('data-managed', 'seo');
        document.head.appendChild(meta);
      }
    };

    // Update or create link tag
    const updateLink = (rel: string, href: string) => {
      const existingTag = document.querySelector(`link[rel="${rel}"]`);
      
      if (existingTag) {
        existingTag.setAttribute('href', href);
      } else {
        const link = document.createElement('link');
        link.setAttribute('rel', rel);
        link.setAttribute('href', href);
        link.setAttribute('data-managed', 'seo');
        document.head.appendChild(link);
      }
    };

    // Update basic meta tags
    updateMeta('description', description);
    if (keywords) {
      updateMeta('keywords', keywords);
    }

    // Update canonical link
    updateLink('canonical', canonicalUrl);

    // Update Open Graph tags
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:type', type, true);
    updateMeta('og:url', canonicalUrl, true);
    updateMeta('og:image', imageUrl, true);

    // Update Twitter Card tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', imageUrl);

    // Handle noindex
    if (noindex) {
      updateMeta('robots', 'noindex, nofollow');
    } else {
      // Remove noindex if it exists
      const robotsTag = document.querySelector('meta[name="robots"]');
      if (robotsTag && robotsTag.getAttribute('data-managed') === 'seo') {
        robotsTag.remove();
      }
    }
  }, [title, description, canonicalPath, image, type, keywords, noindex]);

  return null;
};
