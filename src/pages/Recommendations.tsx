import React, { useRef } from 'react';
import { Header } from '@/components/Header';
import { Seo } from '@/components/Seo';
import { ToolChatbot } from '@/components/ToolChatbot';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle, 
  Bot, 
  Filter,
  DollarSign,
  Sparkles, 
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Recommendations = () => {
  const chatbotRef = useRef<any>(null);

  const handleStartToolFinder = () => {
    // Trigger the chatbot to open
    const chatButton = document.querySelector('[data-chat-button]') as HTMLElement;
    if (chatButton) {
      chatButton.click();
    }
  };

  return (
    <>
      <Seo 
        title="Tool Finder - Find Your Perfect Tools | DAILYTECH TOOLS SOLUTIONS"
        description="Use our intelligent tool finder to discover the perfect premium tools based on your category and budget preferences."
        keywords="tool finder, tool recommendations, premium tools, category filter, budget tools"
        canonicalPath="/recommendations"
      />
      <Header />
      
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Hero Section */}
        <section className="py-20 px-6 md:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Smart Tool Finder
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                Find Your Perfect
                <span className="bg-gradient-to-r from-primary to-brand-teal bg-clip-text text-transparent"> Tools</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
                Our intelligent tool finder helps you discover the best premium tools based on your category preferences and budget. 
                Get personalized recommendations in seconds!
              </p>
            </motion.div>

            {/* How It Works */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
            >
              <Card className="text-center p-6 border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg group">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Filter className="w-8 h-8 text-primary" />
              </div>
                  <CardTitle className="text-xl">Choose Category</CardTitle>
      </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Select from AI, Design, Video, Writing, SEO, Productivity, or Creative tools. 
                    We'll show you the best options in your chosen category.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 border-2 border-brand-teal/20 hover:border-brand-teal/40 transition-all duration-300 hover:shadow-lg group">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-brand-teal/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <DollarSign className="w-8 h-8 text-brand-teal" />
          </div>
                  <CardTitle className="text-xl">Set Budget</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Tell us your budget range and we'll filter tools that fit perfectly. 
                    From under $5 to premium options, we have something for everyone.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 border-2 border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:shadow-lg group">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Bot className="w-8 h-8 text-green-500" />
        </div>
                  <CardTitle className="text-xl">Get Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Receive personalized tool recommendations with detailed information, 
                    pricing, and direct access to request the tools you need.
                  </p>
      </CardContent>
    </Card>
            </motion.div>

            {/* CTA Section */}
      <motion.div
              initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-gradient-to-r from-primary/10 to-brand-teal/10 rounded-2xl p-8 border border-primary/20"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-left">
                  <h3 className="text-2xl font-bold mb-2">Ready to Find Your Tools?</h3>
                  <p className="text-muted-foreground">
                    Click the chat button in the bottom right corner to start your personalized tool search!
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/tools">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      Browse All Tools
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-gradient-to-r from-primary to-brand-teal hover:from-primary/90 hover:to-brand-teal/90"
                    onClick={handleStartToolFinder}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Start Tool Finder
                  </Button>
                </div>
              </div>
              </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-6 md:px-8 bg-card/30">
          <div className="max-w-6xl mx-auto">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Use Our Tool Finder?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Get the most out of our premium tool collection with intelligent filtering and recommendations
                      </p>
                    </motion.div>

              <motion.div
              initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <Card className="text-center p-6 hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Filter className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Smart Filtering</h3>
                  <p className="text-sm text-muted-foreground">
                    Filter tools by category and price range to find exactly what you need
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-brand-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-6 h-6 text-brand-teal" />
                  </div>
                  <h3 className="font-semibold mb-2">Budget-Friendly</h3>
                  <p className="text-sm text-muted-foreground">
                    Find tools that fit your budget with our flexible price range options
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-6 h-6 text-green-500" />
                </div>
                  <h3 className="font-semibold mb-2">Instant Results</h3>
                  <p className="text-sm text-muted-foreground">
                    Get immediate recommendations without waiting for complex AI processing
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6 text-purple-500" />
              </div>
                  <h3 className="font-semibold mb-2">Easy to Use</h3>
                  <p className="text-sm text-muted-foreground">
                    Simple chat interface that guides you through the selection process
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            </div>
        </section>
        </main>

      {/* Floating Chatbot */}
      <ToolChatbot />
    </>
  );
};

export default Recommendations;
