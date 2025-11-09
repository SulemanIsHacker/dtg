import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Share2, Twitter, Facebook, Linkedin, Copy, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SocialShareProps {
  productId: string;
  productName: string;
  productDescription: string;
  productSlug: string;
  className?: string;
}

export const SocialShare = ({ 
  productId, 
  productName, 
  productDescription, 
  productSlug,
  className = "" 
}: SocialShareProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const shareUrl = `${window.location.origin}/product/${productSlug}`;
  const shareText = `Check out ${productName} - ${productDescription}`;

  const trackShare = async (platform: string) => {
    try {
      await supabase.from('social_shares').insert({
        product_id: productId,
        platform,
        ip_address: null // Could be populated if needed
      });
    } catch (error) {
      console.error('Error tracking share:', error);
    }
  };

  const shareOnTwitter = () => {
    trackShare('twitter');
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareOnFacebook = () => {
    trackShare('facebook');
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank');
  };

  const shareOnLinkedIn = () => {
    trackShare('linkedin');
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedinUrl, '_blank');
  };

  const shareOnWhatsApp = () => {
    trackShare('whatsapp');
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      trackShare('copy');
      toast({
        title: "Link copied!",
        description: "Product link has been copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Share2 className="w-4 h-4" />
        Share
      </Button>

      {isOpen && (
        <Card className="absolute top-12 right-0 z-50 w-64 shadow-lg">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3 text-sm">Share this tool</h4>
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={shareOnTwitter}
                className="w-full justify-start gap-2 h-8"
              >
                <Twitter className="w-4 h-4 text-blue-500" />
                Twitter
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={shareOnFacebook}
                className="w-full justify-start gap-2 h-8"
              >
                <Facebook className="w-4 h-4 text-blue-600" />
                Facebook
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={shareOnLinkedIn}
                className="w-full justify-start gap-2 h-8"
              >
                <Linkedin className="w-4 h-4 text-blue-700" />
                LinkedIn
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={shareOnWhatsApp}
                className="w-full justify-start gap-2 h-8"
              >
                <MessageCircle className="w-4 h-4 text-green-600" />
                WhatsApp
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="w-full justify-start gap-2 h-8"
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};