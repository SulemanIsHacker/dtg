import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { ToolCardWithCart } from "@/components/ToolCardWithCart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Search, MessageCircle, ShoppingCart } from "lucide-react";
import { ProgressLoader } from "@/components/LoadingSpinner";
import { ToolsLoadingAnimation } from "@/components/ToolsLoadingAnimation";
import { supabase } from "@/integrations/supabase/client";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { Seo } from "@/components/Seo";
import { usePersistentCart } from "@/hooks/usePersistentCart";
import { useNavigate } from "react-router-dom";

const categories = ["All", "AI", "SEO", "Design", "Video", "Creative", "Writing", "Productivity"];

const ToolsContent = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [plansMap, setPlansMap] = useState<Record<string, any[]>>({});
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState('');
  const { getTotalItems } = usePersistentCart();
  const navigate = useNavigate();

  // Cache keys
  const CACHE_KEYS = {
    PRODUCTS: 'toolsy_products_cache',
    PLANS: 'toolsy_plans_cache',
    TIMESTAMP: 'toolsy_cache_timestamp'
  };

  // Cache duration: 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000;

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
      console.error('Error loading from cache:', error);
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
      console.error('Error saving to cache:', error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      // Check cache first
      if (isCacheValid() && loadFromCache()) {
        setLoadingProgress(100);
        setLoadingStep('Loaded from cache');
        setTimeout(() => {
          setLoadingStep('');
          setLoading(false);
        }, 1000);
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
          
          setTimeout(() => {
            setLoadingStep('');
            setLoading(false);
          }, 1000);
        } else {
          setLoadingProgress(100);
          setLoadingStep('No products found');
          setTimeout(() => {
            setLoadingStep('');
            setLoading(false);
          }, 1000);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoadingStep('Error loading data');
        setTimeout(() => {
          setLoadingStep('');
          setLoading(false);
        }, 2000);
      }
    };
    
    fetchData();
  }, []);

  const filteredTools = products.filter(tool => {
    const matchesCategory = selectedCategory === "All" || tool.category === selectedCategory;
    const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) || tool.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-1 w-full py-12 px-2 sm:px-4 flex items-center justify-center">
          <ToolsLoadingAnimation 
            progress={loadingProgress}
            step={loadingStep}
            text="Loading Premium Tools..."
          />
        </main>
      </div>
    );
  }

  return (
    <>
      <Seo 
        title="All Tools | DAILYTECH TOOLS SOLUTIONS"
        description="Browse our complete collection of premium AI and SEO tools at unbeatable prices. Find the perfect tool for your digital needs with genuine licenses and 24/7 support."
        canonicalPath="/tools"
      />
      <SchemaMarkup type="tools" products={products} />
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-1 w-full py-12 px-2 sm:px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-brand-teal bg-clip-text text-transparent" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              All Tools
            </h1>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
              <div className="flex flex-wrap gap-2 items-center">
                <Filter className="w-5 h-5 text-muted-foreground mr-2 self-center" />
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className={`cursor-pointer px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm ${selectedCategory === category ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="w-full sm:w-64 flex items-center gap-2 bg-card rounded-lg px-2 py-1 border border-border">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search tools..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 text-sm w-full"
                  />
                </div>
                {getTotalItems() > 0 && (
                  <Button
                    onClick={() => navigate('/cart')}
                    className="bg-gradient-to-r from-primary to-brand-teal hover:from-primary/90 hover:to-brand-teal/90 text-white"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Cart ({getTotalItems()})
                  </Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-6">
              {filteredTools.length > 0 ? (
                filteredTools.map((tool) => (
                  <ToolCardWithCart 
                    key={tool.id}
                    name={tool.name}
                    description={tool.description}
                    features={tool.features}
                    image={tool.main_image_url || ''}
                    category={tool.category}
                    rating={tool.rating}
                    slug={tool.slug}
                    productId={tool.id}
                    pricingPlans={plansMap[tool.id] || []}
                  />
                ))
              ) : ((search.trim() !== "" || selectedCategory !== "All") && (
                <div className="col-span-full text-center py-12">
                  <div className="max-w-md mx-auto">
                    <p className="text-muted-foreground text-base sm:text-lg mb-4">
                      {search ? `No tools found matching "${search}"` : "No tools found in this category."}
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                      Can't find what you're looking for? Contact us on WhatsApp and we'll help you find the perfect tool!
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
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

const Tools = () => {
  return <ToolsContent />;
};

export default Tools;
