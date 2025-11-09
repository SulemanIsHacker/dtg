import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Shield, Check, Eye, TrendingDown, Zap, Crown, Lock, Award, Sparkles, ArrowRight, Clock, Users, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { CurrencyDisplay } from "./CurrencyDisplay";
import { OptimizedImage } from "./OptimizedImage";
import { useState } from "react";

interface ToolCardProps {
  name: string;
  description: string;
  features?: string[] | null;
  image: string;
  category: string;
  rating: number;
  slug: string;
  verified?: boolean;
  pricingPlans: Array<{
    plan_type: string;
    monthly_price?: string;
    yearly_price?: string;
    is_enabled: boolean;
  }>;
}

// Utility function to get the display price (monthly preferred)
const getDisplayPrice = (pricingPlans: ToolCardProps['pricingPlans']) => {
  if (!pricingPlans || pricingPlans.length === 0) return null;
  
  // First try to find a monthly plan
  let monthly = pricingPlans.find(plan => plan.is_enabled && plan.monthly_price && plan.monthly_price !== '');
  if (monthly) {
    // Extract numeric value from price string (remove "PKR", "Rs", etc.)
    const priceValue = monthly.monthly_price.replace(/[^\d.,]/g, '').replace(',', '');
    return { price: priceValue, period: 'month' };
  }
  
  // If no monthly, try yearly
  let yearly = pricingPlans.find(plan => plan.is_enabled && plan.yearly_price && plan.yearly_price !== '');
  if (yearly) {
    // Extract numeric value from price string (remove "PKR", "Rs", etc.)
    const priceValue = yearly.yearly_price.replace(/[^\d.,]/g, '').replace(',', '');
    return { price: priceValue, period: 'year' };
  }
  
  return null;
};

export const ToolCard = ({
  name,
  description,
  features,
  image,
  category,
  rating,
  slug,
  verified = true,
  pricingPlans,
}: ToolCardProps) => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [isLiked, setIsLiked] = useState(false);
  
  const handleViewProduct = () => {
    navigate(`/product/${slug}`);
  };

  const displayPrice = getDisplayPrice(pricingPlans);
  const isHighRating = rating >= 4.5;
  const isPremium = category === 'AI' || category === 'SEO';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={!shouldReduceMotion ? { 
        scale: 1.03, 
        y: -12,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1)" 
      } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="relative overflow-hidden group cursor-pointer rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 w-full my-4 bg-gradient-to-br from-card via-card/95 to-card/90 border border-border/40 hover:border-primary/50 backdrop-blur-sm"
      onClick={handleViewProduct}
      tabIndex={0}
      role="button"
      aria-label={`View details and plans for ${name}`}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleViewProduct(); }}
    >
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-brand-teal/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Floating Particles Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-4 right-4 w-2 h-2 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-100 animate-pulse" />
        <div className="absolute top-8 right-8 w-1 h-1 bg-brand-teal/30 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-200 animate-pulse" />
        <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-yellow-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-300 animate-pulse" />
      </div>
      
      {/* Top Trust Indicators */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start">
        <div className="flex gap-2">
          {verified && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 shadow-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 rounded-full backdrop-blur-sm">
                <Shield className="w-3 h-3" />
                Verified
              </Badge>
            </motion.div>
          )}
          {isHighRating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 rounded-full backdrop-blur-sm">
                <Award className="w-3 h-3" />
                Top Rated
              </Badge>
            </motion.div>
          )}
        </div>
        <div className="flex gap-2">
          {isPremium && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 rounded-full backdrop-blur-sm">
                <Crown className="w-3 h-3" />
                Premium
              </Badge>
            </motion.div>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Heart 
              className={`w-4 h-4 transition-colors duration-300 ${
                isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'
              }`} 
            />
          </motion.button>
        </div>
      </div>

       <CardContent className="p-0">
         {/* Enhanced Product Image */}
         <div className="relative h-52 sm:h-60 overflow-hidden">
           <OptimizedImage
             src={image}
             alt={`${name} - Premium ${category} tool available at DAILYTECH TOOLS SOLUTIONS`}
             className="w-full h-full group-hover:scale-110 transition-transform duration-700"
             sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
           />
           {/* Enhanced Image Overlay */}
           <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
           <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-brand-teal/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
           
           {/* Category Badge with Animation */}
           <motion.div 
             className="absolute bottom-3 left-3"
             initial={{ opacity: 0, y: 10 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5 }}
             viewport={{ once: true }}
           >
             <Badge className="bg-white/95 backdrop-blur-sm text-gray-900 border-0 shadow-lg px-3 py-1.5 text-xs font-semibold rounded-full hover:bg-white transition-colors duration-300">
               {category}
             </Badge>
           </motion.div>

           {/* Rating Badge */}
           <motion.div 
             className="absolute bottom-3 right-3"
             initial={{ opacity: 0, y: 10 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.1 }}
             viewport={{ once: true }}
           >
             <div className="bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5">
               <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
               <span className="text-xs font-bold text-gray-900">{rating}</span>
             </div>
           </motion.div>

           {/* Hover Overlay Content */}
           <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
             <motion.div
               initial={{ scale: 0.8, opacity: 0 }}
               whileHover={{ scale: 1, opacity: 1 }}
               transition={{ duration: 0.3 }}
               className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-xl"
             >
               <Eye className="w-6 h-6 text-primary" />
             </motion.div>
           </div>
         </div>

         <div className="p-5">
           {/* Header Section */}
           <div className="mb-4">
             <h3 className="font-bold text-lg sm:text-xl text-foreground group-hover:text-primary transition-colors leading-tight mb-2">
               {name}
             </h3>
             <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{description}</p>
           </div>

           {/* Enhanced Pricing Section */}
           {displayPrice && (
             <motion.div 
               className="mb-5 p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-brand-teal/10 rounded-2xl border border-primary/20 relative overflow-hidden"
               initial={{ opacity: 0, y: 10 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5 }}
               viewport={{ once: true }}
             >
               {/* Animated Background Pattern */}
               <div className="absolute inset-0 opacity-5">
                 <div className="absolute inset-0 bg-gradient-to-r from-primary to-brand-teal transform rotate-12 scale-150 animate-pulse" />
               </div>
               
               <div className="relative z-10">
                 <div className="flex items-center justify-between mb-3">
                   <div className="flex items-center gap-2">
                     <Clock className="w-4 h-4 text-primary" />
                     <span className="text-sm font-medium text-muted-foreground">
                       {displayPrice.period === 'month' ? 'Monthly Plan' : 'Yearly Plan'}
                     </span>
                   </div>
                   <Badge className="bg-gradient-to-r from-primary to-brand-teal text-white border-0 shadow-md px-3 py-1 text-xs font-semibold rounded-full">
                     <Sparkles className="w-3 h-3 mr-1" />
                     {displayPrice.period === 'month' ? 'Popular' : 'Best Value'}
                   </Badge>
                 </div>
                 
                 <div className="flex items-baseline gap-2 mb-3">
                   <CurrencyDisplay 
                     pkrAmount={parseFloat(displayPrice.price)} 
                     size="lg"
                     variant="highlight"
                     className="bg-gradient-to-r from-primary to-brand-teal bg-clip-text text-transparent text-2xl font-bold"
                   />
                   <span className="text-sm text-muted-foreground font-medium">
                     /{displayPrice.period}
                   </span>
                 </div>
                 
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <Lock className="w-4 h-4 text-primary" />
                     <span className="text-sm text-muted-foreground font-medium">Secure Access</span>
                   </div>
                   <div className="flex items-center gap-1">
                     <Users className="w-3 h-3 text-brand-teal" />
                     <span className="text-xs text-muted-foreground">Shared Account</span>
                   </div>
                 </div>
               </div>
             </motion.div>
           )}

           {/* Enhanced Features */}
           {features && features.length > 0 && (
             <div className="space-y-2 mb-5">
               {features.slice(0, 3).map((feature, index) => (
                 <motion.div 
                   key={index} 
                   className="flex items-center gap-3 text-sm"
                   initial={{ opacity: 0, x: -10 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   transition={{ duration: 0.5, delay: index * 0.1 }}
                   viewport={{ once: true }}
                 >
                   <div className="w-5 h-5 bg-gradient-to-r from-primary to-brand-teal rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                     <Check className="w-3 h-3 text-white" />
                   </div>
                   <span className="text-muted-foreground font-medium line-clamp-1">{feature}</span>
                 </motion.div>
               ))}
               {features.length > 3 && (
                 <div className="text-xs text-muted-foreground ml-8">
                   +{features.length - 3} more features
                 </div>
               )}
             </div>
           )}

           {/* Enhanced CTA Button */}
           <motion.div
             initial={{ opacity: 0, y: 10 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5 }}
             viewport={{ once: true }}
           >
             <Button 
               className="w-full bg-gradient-to-r from-primary via-primary to-brand-teal hover:from-primary/90 hover:via-primary/90 hover:to-brand-teal/90 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden group/btn"
               onClick={handleViewProduct}
             >
               {/* Button Background Effect */}
               <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
               
               <div className="relative z-10 flex items-center justify-center gap-2">
                 <Eye className="w-5 h-5" />
                 <span className="text-base">View Details & Plans</span>
                 <ArrowRight className="w-4 h-4 opacity-70 group-hover/btn:translate-x-1 transition-transform duration-300" />
               </div>
             </Button>
           </motion.div>
         </div>
       </CardContent>
    </motion.div>
  );
};
