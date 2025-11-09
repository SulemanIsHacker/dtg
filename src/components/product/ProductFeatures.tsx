import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Star, 
  Shield, 
  Zap, 
  Target, 
  Rocket, 
  Sparkles, 
  Globe,
  Lock,
  Award,
  Heart,
  TrendingUp
} from "lucide-react";

interface ProductFeaturesProps {
  product: any;
}

export const ProductFeatures = ({ product }: ProductFeaturesProps) => {
  if (!product) return null;

  // Parse features from string or array
  const parseFeatures = (features: any) => {
    if (Array.isArray(features)) {
      return features;
    }
    if (typeof features === 'string') {
      try {
        return JSON.parse(features);
      } catch {
        return features.split(',').map((f: string) => f.trim());
      }
    }
    return [];
  };

  const features = parseFeatures(product.features);
  const benefits = parseFeatures(product.benefits);

  // Feature icons mapping
  const featureIcons = {
    'security': Shield,
    'performance': Zap,
    'accuracy': Target,
    'speed': Rocket,
    'quality': Star,
    'innovation': Sparkles,
    'global': Globe,
    'privacy': Lock,
    'award': Award,
    'love': Heart,
    'trending': TrendingUp,
    'verified': CheckCircle
  };

  const getFeatureIcon = (feature: string) => {
    const lowerFeature = feature.toLowerCase();
    for (const [key, icon] of Object.entries(featureIcons)) {
      if (lowerFeature.includes(key)) {
        return icon;
      }
    }
    return CheckCircle; // Default icon
  };

  return (
    <div className="space-y-8">
      {/* Detailed Features Section */}
      <div>
        <h2 className="text-2xl font-bold mb-8 text-center">Complete Feature Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature: string, index: number) => {
            const IconComponent = getFeatureIcon(feature);
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature}</h3>
                  <p className="text-sm text-muted-foreground">
                    Full access to this premium feature with all plan types.
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Benefits */}
      {benefits.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Benefits
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit: string, index: number) => {
              const IconComponent = getFeatureIcon(benefit);
              return (
                <div key={index} className="flex items-start space-x-3 p-4 bg-card rounded-lg border">
                  <div className="p-2 bg-green-500/10 rounded-lg flex-shrink-0">
                    <IconComponent className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{benefit}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Product Stats */}
      <div>
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          Why Choose This Tool?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">100% Genuine</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Official subscriptions from verified sources. No cracked or pirated software.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mb-2">
                <Zap className="w-6 h-6 text-green-500" />
              </div>
              <CardTitle className="text-lg">Instant Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Get your account credentials immediately after payment confirmation.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-2">
                <Award className="w-6 h-6 text-blue-500" />
              </div>
              <CardTitle className="text-lg">24/7 Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Round-the-clock WhatsApp support for any issues or questions.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-gradient-to-r from-primary/5 to-brand-teal/5 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-center">Trust & Security</h3>
        <div className="flex flex-wrap justify-center gap-4">
          <Badge variant="secondary" className="px-4 py-2">
            <Shield className="w-4 h-4 mr-2" />
            Verified Original
          </Badge>
          <Badge variant="secondary" className="px-4 py-2">
            <Lock className="w-4 h-4 mr-2" />
            Secure Payment
          </Badge>
          <Badge variant="secondary" className="px-4 py-2">
            <CheckCircle className="w-4 h-4 mr-2" />
            Money Back Guarantee
          </Badge>
          <Badge variant="secondary" className="px-4 py-2">
            <Globe className="w-4 h-4 mr-2" />
            Global Access
          </Badge>
        </div>
      </div>
    </div>
  );
};
