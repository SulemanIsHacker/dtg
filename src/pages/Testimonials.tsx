
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, Users, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Seo } from "@/components/Seo";
import { useProducts } from "@/hooks/useProducts";

const Testimonials = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { products, loading } = useProducts();

  const categories = [
    { name: "All Tools", value: "all" },
    { name: "AI Tools", value: "AI" },
    { name: "SEO Tools", value: "SEO" },
    { name: "Design Tools", value: "Design" },
    { name: "Video Tools", value: "Video" },
    { name: "Writing Tools", value: "Writing" },
    { name: "Creative Tools", value: "Creative" },
    { name: "Productivity", value: "Productivity" }
  ];

  const filteredTools = selectedCategory === "all" 
    ? products 
    : products.filter(tool => tool.category === selectedCategory);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <>
      <Seo 
        title="Customer Testimonials | Real Reviews from DAILYTECH TOOLS SOLUTIONS Users"
        description="Read authentic testimonials from satisfied customers who trust DAILYTECH TOOLS SOLUTIONS for premium AI and SEO tools. See why thousands choose us over competitors."
        canonicalPath="/testimonials"
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-background"
      >
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Customer Testimonials
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Don't just take our word for it. See what our satisfied customers say about their experience with DAILYTECH TOOLS SOLUTIONS's premium tools and services.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.value)}
                className="transition-all duration-200"
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Products Grid */}
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredTools.map((tool) => (
              <motion.div
                key={tool.name}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  className="relative hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 cursor-pointer group"
                  onClick={() => navigate(`/testimonials/${tool.slug}`)}
                >
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img 
                      src={tool.main_image_url || '/placeholder.svg'} 
                      alt={tool.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 mb-2">
                        {renderStars(tool.rating)}
                        <span className="text-white text-sm font-medium">{tool.rating}</span>
                      </div>
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        {tool.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {tool.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {tool.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>500+ reviews</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MessageCircle className="w-4 h-4" />
                        <span>View testimonials</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {filteredTools.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No tools found for this category.</p>
            </div>
          )}

          {/* Call to Action Section */}
          <div className="mt-16 text-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Join Our Satisfied Customers?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Get access to premium AI and SEO tools at unbeatable prices. Start your journey with DAILYTECH TOOLS SOLUTIONS today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/tools')}
                size="lg"
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                Browse All Tools
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => window.open('https://wa.me/2348141988239', '_blank')}
              >
                Contact Us on WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Testimonials;
