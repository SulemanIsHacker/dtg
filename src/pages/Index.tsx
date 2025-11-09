import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { TrustSection } from "@/components/TrustSection";
import { ToolCard } from "@/components/ToolCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { useProducts } from "@/hooks/useProducts";
import { MessageCircle, Filter, Search, Sparkles, Bot, CheckCircle, Shield, Zap, Award, ArrowRight, Clock, DollarSign } from "lucide-react";
import { ProgressLoader } from "@/components/LoadingSpinner";
import { ToolsLoadingAnimation } from "@/components/ToolsLoadingAnimation";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollAnimation, FadeIn, SlideUp, StaggeredAnimation } from "@/components/ScrollAnimation";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { ToolChatbot } from "@/components/ToolChatbot";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [plansMap, setPlansMap] = useState<Record<string, any[]>>({});
  const [plansLoading, setPlansLoading] = useState(false);
  const [toolsLoaded, setToolsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState('');
  const toolsSectionRef = useRef<HTMLDivElement>(null);

  // Cache keys
  const CACHE_KEYS = {
    PRODUCTS: 'toolsy_products_cache',
    PLANS: 'toolsy_plans_cache',
    TIMESTAMP: 'toolsy_cache_timestamp'
  };

  // Cache duration: 10 minutes
  const CACHE_DURATION = 10 * 60 * 1000;

  // Check if cache is valid
  const isCacheValid = () => {
    const timestamp = localStorage.getItem(CACHE_KEYS.TIMESTAMP);
    if (!timestamp) return false;
    return Date.now() - parseInt(timestamp) < CACHE_DURATION;
  };

  // Load from cache
  const loadFromCache = () => {
    try {
      const cachedProducts = localStorage.getItem(CACHE_KEYS.PRODUCTS);
      const cachedPlans = localStorage.getItem(CACHE_KEYS.PLANS);
      
      if (cachedProducts && cachedPlans) {
        setProducts(JSON.parse(cachedProducts));
        setPlansMap(JSON.parse(cachedPlans));
        return true;
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error loading from cache:', error);
      }
    }
    return false;
  };

  // Save to cache
  const saveToCache = (productsData: any[], plansData: Record<string, any[]>) => {
    try {
      localStorage.setItem(CACHE_KEYS.PRODUCTS, JSON.stringify(productsData));
      localStorage.setItem(CACHE_KEYS.PLANS, JSON.stringify(plansData));
      localStorage.setItem(CACHE_KEYS.TIMESTAMP, Date.now().toString());
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error saving to cache:', error);
      }
    }
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !toolsLoaded) {
          setToolsLoaded(true);
        }
      },
      { threshold: 0.1 }
    );
    if (toolsSectionRef.current) {
      observer.observe(toolsSectionRef.current);
    }
    return () => {
      if (toolsSectionRef.current) {
        observer.unobserve(toolsSectionRef.current);
      }
    };
  }, [toolsLoaded]);

  // Fetch products when toolsLoaded becomes true
  useEffect(() => {
    if (!toolsLoaded) return;
    
    const fetchProducts = async () => {
      // Check cache first
      if (isCacheValid() && loadFromCache()) {
        setLoadingProgress(100);
        setLoadingStep('Loaded from cache');
        setTimeout(() => setLoadingStep(''), 1000);
        return;
      }

      setLoading(true);
      setLoadingProgress(0);
      setLoadingStep('Fetching products...');
      
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setProducts(data || []);
        setLoadingProgress(50);
        setLoadingStep('Products loaded, fetching pricing plans...');
        
        // Fetch pricing plans immediately after products
        const productIds = (data || []).map(product => product.id);
        
        if (productIds.length > 0) {
          const { data: plansData, error: plansError } = await supabase
            .from('pricing_plans')
            .select('*')
            .in('product_id', productIds)
            .eq('is_enabled', true);
          
          if (plansError) throw plansError;
          
          // Group plans by product_id
          const map: Record<string, any[]> = {};
          plansData?.forEach(plan => {
            if (!map[plan.product_id]) {
              map[plan.product_id] = [];
            }
            map[plan.product_id].push(plan);
          });
          
          setPlansMap(map);
          setLoadingProgress(100);
          setLoadingStep('All data loaded!');
          
          // Save to cache
          saveToCache(data || [], map);
          
          setTimeout(() => setLoadingStep(''), 1000);
        } else {
          setLoadingProgress(100);
          setLoadingStep('No products found');
          setTimeout(() => setLoadingStep(''), 1000);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoadingStep('Error loading data');
        setTimeout(() => setLoadingStep(''), 2000);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [toolsLoaded]);

  const categories = ["All", "AI", "SEO", "Design", "Video", "Creative", "Writing", "Productivity"];
  
  const filteredTools = products.filter(tool => {
    const matchesCategory = selectedCategory === "All" || tool.category === selectedCategory;
    const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) || tool.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleWhatsAppContact = () => {
    const message = "Hi! I'm interested in your premium tools. Can you help me choose the best one for my needs?";
    window.open(`https://wa.me/2348141988239?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <>
      <Seo 
        title="DAILYTECH TOOLS SOLUTIONS | Premium AI & SEO Tools at Unbeatable Prices"
        description="Get access to premium AI and SEO tools at unbeatable prices. DAILYTECH TOOLS SOLUTIONS offers genuine software, no scams, and 24/7 support for all your digital needs."
        canonicalPath="/"
        image="/dtg.jpeg"
        keywords="AI tools, SEO tools, premium tools, genuine software, discounted tools, cheap AI tools, cheap SEO tools, DAILYTECH TOOLS SOLUTIONS"
      />
      <SchemaMarkup type="homepage" products={products} />
      <div className="min-h-screen bg-background flex flex-col overflow-x-hidden w-full">
        <Header />
        <main className="flex-1 w-full">
          <HeroSection />
          
          {/* Features Showcase Section */}
          <section className="py-20 px-6 md:px-8 w-full bg-gradient-to-br from-primary/5 via-background to-brand-cyan/5">
            <div className="w-full max-w-7xl mx-auto">
              <FadeIn className="text-center mb-16">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Sparkles className="w-4 h-4" />
                  Why Choose DAILYTECH TOOLS SOLUTIONS
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                  Premium Tools Made
                  <span className="bg-gradient-text bg-clip-text text-transparent"> Accessible</span>
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                  Get access to the world's best AI and SEO tools at a fraction of the cost. 
                  All subscriptions are genuine, verified, and backed by our quality guarantee.
                </p>
              </FadeIn>

              <StaggeredAnimation 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
                staggerDelay={0.1}
                direction="up"
                distance={30}
              >
                <div className="text-center group">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-glow">
                    <Shield className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">100% Genuine</h3>
                  <p className="text-muted-foreground">All tools purchased directly from official sources. No cracked software.</p>
                </div>

                <div className="text-center group">
                  <div className="w-20 h-20 bg-gradient-to-br from-brand-cyan/20 to-brand-cyan/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-glow-teal">
                    <Zap className="w-10 h-10 text-brand-cyan" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Instant Access</h3>
                  <p className="text-muted-foreground">Get your tools within minutes of payment. No waiting, no delays.</p>
                </div>

                <div className="text-center group">
                  <div className="w-20 h-20 bg-gradient-to-br from-brand-orange/20 to-brand-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-glow">
                    <MessageCircle className="w-10 h-10 text-brand-orange" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">24/7 Support</h3>
                  <p className="text-muted-foreground">Direct WhatsApp support for any issues. Real people, real help.</p>
                </div>

                <div className="text-center group">
                  <div className="w-20 h-20 bg-gradient-to-br from-brand-yellow/20 to-brand-yellow/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-glow">
                    <Award className="w-10 h-10 text-brand-yellow" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Quality Guarantee</h3>
                  <p className="text-muted-foreground">Full refund if any tool doesn't work as expected. Your satisfaction is our priority.</p>
                </div>
              </StaggeredAnimation>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-16 px-6 md:px-8 w-full bg-card/30">
            <div className="w-full max-w-7xl mx-auto">
              <StaggeredAnimation 
                className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
                staggerDelay={0.15}
                direction="up"
                distance={20}
              >
                <div className="group">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">50+</div>
                  <div className="text-muted-foreground font-medium">Premium Tools</div>
                </div>
                <div className="group">
                  <div className="text-3xl md:text-4xl font-bold text-brand-teal mb-2 group-hover:scale-110 transition-transform duration-300">1000+</div>
                  <div className="text-muted-foreground font-medium">Happy Customers</div>
                </div>
                <div className="group">
                  <div className="text-3xl md:text-4xl font-bold text-green-500 mb-2 group-hover:scale-110 transition-transform duration-300">24/7</div>
                  <div className="text-muted-foreground font-medium">Support Available</div>
                </div>
                <div className="group">
                  <div className="text-3xl md:text-4xl font-bold text-yellow-500 mb-2 group-hover:scale-110 transition-transform duration-300">100%</div>
                  <div className="text-muted-foreground font-medium">Genuine Tools</div>
                </div>
              </StaggeredAnimation>
            </div>
          </section>

          {/* Tools Section */}
          <section id="tools" className="py-20 px-6 md:px-8 w-full bg-background" ref={toolsSectionRef}>
            <div className="w-full max-w-7xl mx-auto">
              <FadeIn className="text-center mb-16 space-y-6">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Filter className="w-4 h-4" />
                  Featured Tools
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                  <Link to="/tools" className="hover:opacity-80 transition-opacity">Premium Tools</Link> at
                  <span className="bg-gradient-to-r from-primary to-brand-teal bg-clip-text text-transparent"> Unbeatable Prices</span>
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                  Choose from our collection of <Link to="/about" className="text-primary hover:underline">verified premium tools</Link>. All subscriptions are <Link to="/why-us" className="text-primary hover:underline">genuine and purchased directly from official sources</Link>.
                </p>
                <div className="flex flex-wrap justify-center gap-6 pt-4">
                  <Link to="/tools" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl">
                    View All Tools
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </FadeIn>

              {/* Category Filter and Search */}
              <SlideUp className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-12" delay={0.2}>
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Filter className="w-5 h-5" />
                    <span className="text-sm font-medium">Filter by category:</span>
                  </div>
                  {categories.map((category) => (
                    <Badge
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                        selectedCategory === category 
                          ? "bg-primary text-primary-foreground shadow-lg border-primary" 
                          : "hover:bg-accent hover:shadow-md border-border/50"
                      }`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
                <div className="w-full lg:w-80 flex items-center gap-3 bg-card rounded-xl px-4 py-3 border border-border shadow-sm hover:shadow-md transition-shadow">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search tools..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 text-base w-full placeholder:text-muted-foreground"
                  />
                </div>
              </SlideUp>

              {/* Tools Grid */}
              {(!toolsLoaded || loading) ? (
                <ToolsLoadingAnimation 
                  progress={loadingProgress}
                  step={loadingStep}
                  text="Loading Premium Tools..."
                />
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key="tools-grid"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-10"
                  >
                    {filteredTools.slice(0, 6).map((tool, index) => (
                      <motion.div
                        key={tool.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <ToolCard 
                          name={tool.name}
                          description={tool.description}
                          features={tool.features}
                          image={tool.main_image_url || ''}
                          category={tool.category}
                          rating={tool.rating}
                          slug={tool.slug}
                          pricingPlans={plansMap[tool.id] || []}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}

              {!loading && toolsLoaded && filteredTools.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <div className="max-w-md mx-auto">
                    <p className="text-muted-foreground text-base sm:text-lg mb-4">
                      {search ? `No tools found matching "${search}"` : "No tools found in this category."}
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                      Can't find what you're looking for? <Link to="/about" className="text-primary hover:underline">Contact us</Link> on WhatsApp and we'll help you find the perfect tool!
                    </p>
                    <Button 
                      variant="whatsapp" 
                      size="default"
                      onClick={() => {
                        const message = `Hi! I'm looking for a tool but couldn't find it on your website. ${search ? `I searched for: "${search}"` : ''} Can you help me find what I need?`;
                        window.open(`https://wa.me/2348141988239?text=${encodeURIComponent(message)}`, '_blank');
                      }}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Ask on WhatsApp
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </section>
          
          {/* Tool Finder Section */}
          <section className="py-20 px-6 md:px-8 bg-gradient-to-br from-primary/5 via-background to-brand-teal/5 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-teal/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
            
            <div className="w-full max-w-6xl mx-auto relative z-10">
              <FadeIn className="text-center mb-16">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Sparkles className="w-4 h-4" />
                  Smart Tool Finder
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                  Can't Decide Which Tool You Need?
                  <span className="bg-gradient-to-r from-primary to-brand-teal bg-clip-text text-transparent"> Let Us Help!</span>
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-8">
                  Our intelligent tool finder helps you discover the perfect premium tools based on your category preferences and budget. 
                  Get personalized recommendations in seconds!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link to="/recommendations">
                    <Button size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-primary to-brand-teal hover:from-primary/90 hover:to-brand-teal/90 shadow-lg hover:shadow-xl transition-all duration-300">
                      <Bot className="w-5 h-5 mr-2" />
                      Try Tool Finder
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="text-lg px-8 py-4 border-2 hover:bg-primary/10 transition-all duration-300"
                    onClick={handleWhatsAppContact}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Ask on WhatsApp
                  </Button>
                </div>
              </FadeIn>

              <StaggeredAnimation 
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
                staggerDelay={0.2}
                direction="up"
                distance={40}
              >
                <Card className="text-center p-6 border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg group h-full">
                  <CardHeader className="pb-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <MessageCircle className="w-8 h-8 text-primary" />
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

                <Card className="text-center p-6 border-2 border-brand-teal/20 hover:border-brand-teal/40 transition-all duration-300 hover:shadow-lg group h-full">
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

                <Card className="text-center p-6 border-2 border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:shadow-lg group h-full">
                  <CardHeader className="pb-4">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <CardTitle className="text-xl">Get Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Receive personalized tool recommendations with detailed explanations, 
                      pricing in your preferred currency, and direct access to request the tool.
                    </p>
                  </CardContent>
                </Card>
              </StaggeredAnimation>
            </div>
          </section>

          {/* Trust Section */}
          <TrustSection />
          
          {/* Contact Section */}
          <section id="contact" className="py-20 px-6 md:px-8 bg-gradient-to-br from-primary/5 via-background to-brand-teal/5 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-teal/5 rounded-full blur-3xl"></div>
            
            <div className="w-full max-w-4xl mx-auto text-center relative z-10">
              <FadeIn>
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <MessageCircle className="w-4 h-4" />
                  Get Started Today
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                  Ready to Get Started?
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                  Contact us on WhatsApp to get instant access to any tool. We'll verify your identity 
                  and provide you with <Link to="/why-us" className="text-primary hover:underline">genuine subscription access</Link> within minutes.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button 
                    variant="whatsapp" 
                    size="lg" 
                    className="text-lg px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={handleWhatsAppContact}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Start Conversation on WhatsApp
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="text-lg px-8 py-4 border-2 hover:bg-primary/10 transition-all duration-300"
                    asChild
                  >
                    <Link to="/tools">
                      <ArrowRight className="w-5 h-5 mr-2" />
                      Browse All Tools
                    </Link>
                  </Button>
                </div>
              </FadeIn>
              
              <StaggeredAnimation 
                className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8"
                staggerDelay={0.15}
                direction="up"
                distance={25}
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Instant Response</h3>
                  <p className="text-sm text-muted-foreground">Get replies within minutes, not hours</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-brand-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-brand-teal" />
                  </div>
                  <h3 className="font-semibold mb-2">Secure Payment</h3>
                  <p className="text-sm text-muted-foreground">Safe and encrypted transactions</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <h3 className="font-semibold mb-2">Guaranteed Access</h3>
                  <p className="text-sm text-muted-foreground">100% working tools or full refund</p>
                </div>
              </StaggeredAnimation>
            </div>
          </section>
        </main>
        {/* Footer */}
        <footer className="py-6 sm:py-8 px-2 sm:px-4 border-t border-border/50 w-full bg-card/30">
          <div className="w-full max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 text-foreground">DAILYTECH TOOLS SOLUTIONS</h3>
                <p className="text-muted-foreground text-sm">
                  <Link to="/about" className="hover:text-primary transition-colors">Genuine premium tools</Link> at affordable prices.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-3 text-foreground">Quick Links</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link to="/tools" className="hover:text-primary transition-colors">All Tools</Link></li>
                  <li><Link to="/why-us" className="hover:text-primary transition-colors">Why Choose Us</Link></li>
                  <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3 text-foreground">Categories</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link to="/tools?category=AI" className="hover:text-primary transition-colors">AI Tools</Link></li>
                  <li><Link to="/tools?category=SEO" className="hover:text-primary transition-colors">SEO Tools</Link></li>
                  <li><Link to="/tools?category=Design" className="hover:text-primary transition-colors">Design Tools</Link></li>
                  <li><Link to="/tools?category=Video" className="hover:text-primary transition-colors">Video Tools</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3 text-foreground">Trust & Support</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link to="/why-us" className="hover:text-primary transition-colors">Quality Guarantee</Link></li>
                  <li><Link to="/about" className="hover:text-primary transition-colors">24/7 Support</Link></li>
                  <li><Link to="/why-us" className="hover:text-primary transition-colors">No Scam Policy</Link></li>
                  <li><Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/refund-policy" className="hover:text-primary transition-colors">Refund Policy</Link></li>
                </ul>
              </div>
            </div>
            <div className="text-center pt-6 border-t border-border/50">
              <p className="text-muted-foreground text-xs sm:text-sm">
                © 2024 DAILYTECH TOOLS SOLUTIONS. Providing <Link to="/about" className="text-primary hover:underline">genuine premium tools</Link> at affordable prices.
              </p>
              <p className="text-muted-foreground text-[10px] sm:text-xs mt-2">
                All tools are purchased legally from official sources and shared in compliance with their terms of service. 
                <Link to="/privacy-policy" className="text-primary hover:underline ml-1">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </footer>
      </div>
      
      {/* Floating Chatbot */}
      <ToolChatbot />
    </>
  );
};

export default Index;
