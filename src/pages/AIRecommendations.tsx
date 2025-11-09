import React from 'react';
import { Header } from '@/components/Header';
import { AIRecommendationBot } from '@/components/AIRecommendationBot';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Target, 
  DollarSign, 
  Zap, 
  MessageCircle,
  CheckCircle,
  Star,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';

const AIRecommendations = () => {
  return (
    <>
      <Seo 
        title="AI Tool Recommender | Find Your Perfect Premium Tool"
        description="Get personalized tool recommendations powered by AI. Tell us your needs and budget, and we'll suggest the best premium tools for you."
        canonicalPath="/ai-recommendations"
        image="/dtg.jpeg"
        keywords="AI tool recommender, tool recommendations, find perfect tool, personalized recommendations, premium tools"
      />
      
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-20">
          {/* Hero Section */}
          <section className="py-16 px-6 md:px-8 bg-gradient-to-br from-primary/5 via-background to-brand-teal/5">
            <div className="max-w-6xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                AI-Powered Recommendations
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Find Your Perfect
                <span className="bg-gradient-to-r from-primary to-brand-teal bg-clip-text text-transparent"> Premium Tool</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                Our AI assistant analyzes your needs, budget, and experience level to recommend the best premium tools for you. 
                Get personalized suggestions in seconds!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button size="lg" className="text-lg px-8 py-4">
                  <Target className="w-5 h-5 mr-2" />
                  Start AI Recommendation
                </Button>
                <Link to="/tools">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                    Browse All Tools
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="py-16 px-6 md:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Our AI analyzes your requirements and matches them with our premium tool collection
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <Card className="text-center p-6 border-2 border-primary/20 hover:border-primary/40 transition-colors">
                  <CardHeader className="pb-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Tell Us Your Needs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Describe what you want to accomplish, your budget range, and experience level. 
                      Our AI will ask the right questions to understand your requirements.
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center p-6 border-2 border-primary/20 hover:border-primary/40 transition-colors">
                  <CardHeader className="pb-4">
                    <div className="w-16 h-16 bg-brand-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-8 h-8 text-brand-teal" />
                    </div>
                    <CardTitle className="text-xl">AI Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Our advanced AI analyzes your requirements against our database of premium tools, 
                      considering features, pricing, and user ratings.
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center p-6 border-2 border-primary/20 hover:border-primary/40 transition-colors">
                  <CardHeader className="pb-4">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <CardTitle className="text-xl">Get Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Receive personalized tool recommendations with detailed explanations, 
                      pricing in your preferred currency, and direct access to request the tool.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* AI Recommendation Bot Section */}
          <section className="py-16 px-6 md:px-8 bg-card/30">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Try Our AI Recommender</h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Start a conversation with our AI assistant and get personalized tool recommendations
                </p>
              </div>

              <div className="max-w-4xl mx-auto">
                <AIRecommendationBot variant="embedded" />
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="py-16 px-6 md:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Use Our AI Recommender?</h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Get the most out of our premium tool collection with intelligent recommendations
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Personalized Matching</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Our AI considers your specific needs, budget, and experience level to find the perfect tool match.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-teal/10 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-brand-teal" />
                    </div>
                    <h3 className="text-lg font-semibold">Budget-Conscious</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Get recommendations that fit your budget with transparent pricing in your preferred currency.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-green-500" />
                    </div>
                    <h3 className="text-lg font-semibold">Quality Assured</h3>
                  </div>
                  <p className="text-muted-foreground">
                    All recommended tools are genuine premium software with verified licenses and excellent ratings.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-semibold">Instant Results</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Get recommendations in seconds, not hours. Our AI processes your requirements quickly and accurately.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-purple-500" />
                    </div>
                    <h3 className="text-lg font-semibold">Easy Access</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Request any recommended tool directly through WhatsApp with our streamlined process.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-orange-500" />
                    </div>
                    <h3 className="text-lg font-semibold">No Commitment</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Get recommendations without any obligation. Only request tools you're genuinely interested in.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 px-6 md:px-8 bg-gradient-to-r from-primary/10 to-brand-teal/10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Find Your Perfect Tool?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Start a conversation with our AI assistant and discover the premium tools that match your needs perfectly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-4">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start AI Recommendation
                </Button>
                <Link to="/tools">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                    Browse All Tools
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default AIRecommendations;
