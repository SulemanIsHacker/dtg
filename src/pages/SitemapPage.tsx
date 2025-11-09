
import { Header } from '@/components/Header';
import { SitemapGenerator } from '@/components/SitemapGenerator';

const SitemapPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-brand-teal bg-clip-text text-transparent">
            Sitemap Generator
          </h1>
          <p className="text-lg text-muted-foreground">
            Generate an XML sitemap for your toolsy.store website to help search engines discover and index all your pages.
          </p>
        </div>

        <div className="flex justify-center">
          <SitemapGenerator />
        </div>

        <div className="mt-12 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">How to use your sitemap:</h2>
          <div className="space-y-4 text-muted-foreground">
            <div className="bg-card p-4 rounded-lg border">
              <h3 className="font-medium text-foreground mb-2">1. Download the sitemap</h3>
              <p>Click the button above to generate and download your sitemap.xml file.</p>
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <h3 className="font-medium text-foreground mb-2">2. Upload to your website</h3>
              <p>Upload the sitemap.xml file to your website's root directory (toolsy.store/sitemap.xml).</p>
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <h3 className="font-medium text-foreground mb-2">3. Submit to search engines</h3>
              <p>Submit your sitemap URL to Google Search Console and Bing Webmaster Tools.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SitemapPage;
