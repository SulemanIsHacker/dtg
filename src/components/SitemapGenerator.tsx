
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Loader2 } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { generateSitemap, downloadSitemap } from '@/utils/sitemapGenerator';
import { useToast } from '@/hooks/use-toast';

export const SitemapGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { products, loading } = useProducts();
  const { toast } = useToast();

  const handleGenerateSitemap = async () => {
    if (loading) {
      toast({
        title: "Please wait",
        description: "Products are still loading. Please try again in a moment.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const sitemapContent = generateSitemap(products);
      downloadSitemap(sitemapContent);
      
      toast({
        title: "Sitemap Generated!",
        description: `Successfully generated sitemap with ${products.length + 4} URLs.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate sitemap. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const totalUrls = products.length + 4; // 4 static pages + products

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <CardTitle>Sitemap Generator</CardTitle>
        <CardDescription>
          Generate an XML sitemap for toolsy.store with all pages and products
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground text-center">
          <p>Will include:</p>
          <ul className="mt-2 space-y-1">
            <li>• 4 Static pages (Home, Tools, etc.)</li>
            <li>• {products.length} Product pages</li>
            <li className="font-medium">Total: {totalUrls} URLs</li>
          </ul>
        </div>
        
        <Button 
          onClick={handleGenerateSitemap}
          disabled={isGenerating || loading}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Generate & Download Sitemap
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground text-center">
          The sitemap will be downloaded as sitemap.xml and can be uploaded to your website root directory.
        </div>
      </CardContent>
    </Card>
  );
};
