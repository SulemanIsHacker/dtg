
import { useState, useEffect } from "react";
import { Menu, X, Shield, Award, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import PWAStatus from "./PWAStatus";
import { CurrencySelector } from "./CurrencySelector";
import { usePersistentCart } from "@/hooks/usePersistentCart";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { getTotalItems } = usePersistentCart();

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Tools", path: "/tools" },
    { name: "AI", path: "/recommendations" },
    { name: "Testimonials", path: "/testimonials" },
    { name: "Contact", path: "/contact" },
    { name: "Terms", path: "/refund-policy" }
  ];

  return (
    <header className="sticky top-0 z-50 w-full py-4 px-4">
      <div className="w-full max-w-7xl mx-auto">
        {/* Centered Rounded Header Container */}
        <div className={`bg-card/95 backdrop-blur-md rounded-full shadow-xl border border-border/50 px-4 md:px-6 lg:px-8 py-3 md:py-4 transition-all duration-1000 ease-out ${
          isVisible 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 -translate-y-8 scale-95'
        }`}>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div 
              className="flex items-center space-x-3 cursor-pointer group" 
              onClick={() => navigate('/')}
            >
              <div className="relative">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full shadow-lg group-hover:shadow-xl group-hover:shadow-primary/25 group-hover:scale-110 transition-all duration-500 ease-out overflow-hidden">
                  <img 
                    src="/dtg.jpeg" 
                    alt="DAILYTECH TOOLS SOLUTIONS Logo" 
                    className="w-full h-full object-contain group-hover:rotate-12 transition-transform duration-500 ease-out"
                  />
                </div>
                <div className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-primary rounded-full flex items-center justify-center shadow-sm group-hover:scale-125 group-hover:animate-pulse transition-all duration-300">
                  <Shield className="w-1 h-1 md:w-2 md:h-2 text-white" />
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-sm md:text-lg font-bold text-foreground leading-tight group-hover:text-primary group-hover:scale-105 transition-all duration-300 ease-out">DailyTech Tools</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2 lg:space-x-4 xl:space-x-8">
              {menuItems.map((item, index) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`text-muted-foreground font-medium text-xs md:text-sm transition-all duration-500 hover:text-primary relative group py-2 md:py-3 px-1 md:px-2 lg:px-4 rounded-xl overflow-hidden ${
                    isActive(item.path) ? 'text-primary' : ''
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: isVisible ? 'slideInFromRight 0.6s ease-out forwards' : 'none'
                  }}
                >
                  {/* Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 scale-0 group-hover:scale-100 transition-all duration-500 ease-out rounded-xl" />
                  
                  {/* Animated Border */}
                  <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-primary/30 transition-all duration-500 ease-out" />
                  
                  {/* Glow Effect */}
                  <div className="absolute inset-0 rounded-xl shadow-none group-hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all duration-500 ease-out" />
                  
                  {/* Text with Glow */}
                  <span className="relative z-10 group-hover:drop-shadow-[0_0_8px_rgba(34,197,94,0.6)] transition-all duration-300 ease-out">
                    {item.name}
                  </span>
                  
                  {/* Animated Underline */}
                  <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent group-hover:w-full group-hover:left-0 transition-all duration-500 ease-out rounded-full" />
                  
                  {/* Active State Indicator */}
                  {isActive(item.path) && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-brand-teal to-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                  )}
                  
                  {/* Ripple Effect */}
                  <div className="absolute inset-0 rounded-xl bg-primary/20 scale-0 group-active:scale-100 transition-transform duration-200 ease-out" />
                </button>
              ))}
            </nav>

            {/* Right side buttons */}
            <div className="hidden md:flex items-center gap-3 ml-2 lg:ml-4">
              {/* Cart Button - Always Visible */}
              <Button
                onClick={() => navigate('/cart')}
                variant="outline"
                size="sm"
                className={`transition-all duration-300 hover:scale-105 hover:shadow-lg relative ${
                  getTotalItems() > 0 
                    ? 'bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30 hover:from-orange-500/20 hover:to-red-500/20 hover:border-orange-500/50 hover:shadow-orange-500/25' 
                    : 'bg-gradient-to-r from-muted/10 to-muted/20 border-muted/30 hover:from-muted/20 hover:to-muted/30 hover:border-muted/50 hover:shadow-muted/25'
                }`}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Cart
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {getTotalItems()}
                  </span>
                )}
              </Button>
              
              <Button
                onClick={() => navigate('/subscriptions')}
                variant="outline"
                size="sm"
                className="bg-gradient-to-r from-primary/10 to-brand-teal/10 border-primary/30 hover:from-primary/20 hover:to-brand-teal/20 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
              >
                <Shield className="w-4 h-4 mr-2" />
                Subscription
              </Button>
              <CurrencySelector variant="compact" showLabel={false} />
            </div>


            {/* Mobile menu button */}
            <button
              className="md:hidden text-muted-foreground p-2 hover:bg-primary/10 rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-90"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="relative">
                {isMenuOpen ? (
                  <X className="h-6 w-6 animate-spin" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 animate-fadeInDown">
          <div className="bg-card/95 backdrop-blur-md rounded-2xl shadow-xl border border-border/50 px-6 py-6 max-w-7xl mx-auto animate-slideInUp">
            {/* Currency Selector and Buttons for Mobile */}
            <div className="mb-6 pb-4 border-b border-border/30 space-y-4">
              <CurrencySelector variant="default" showLabel={true} />
              
              {/* Cart Button for Mobile - Always Visible */}
              <Button
                onClick={() => {
                  navigate('/cart');
                  setIsMenuOpen(false);
                }}
                variant="outline"
                className={`w-full transition-all duration-300 relative ${
                  getTotalItems() > 0 
                    ? 'bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30 hover:from-orange-500/20 hover:to-red-500/20 hover:border-orange-500/50' 
                    : 'bg-gradient-to-r from-muted/10 to-muted/20 border-muted/30 hover:from-muted/20 hover:to-muted/30 hover:border-muted/50'
                }`}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Cart {getTotalItems() > 0 && `(${getTotalItems()})`}
              </Button>
              
              <Button
                onClick={() => {
                  navigate('/subscriptions');
                  setIsMenuOpen(false);
                }}
                variant="outline"
                className="w-full bg-gradient-to-r from-primary/10 to-brand-teal/10 border-primary/30 hover:from-primary/20 hover:to-brand-teal/20 hover:border-primary/50 transition-all duration-300"
              >
                <Shield className="w-4 h-4 mr-2" />
                Subscription
              </Button>
            </div>
            
            <nav className="space-y-3">
              {menuItems.map((item, index) => (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.path);
                    setIsMenuOpen(false);
                  }}
                  className={`block w-full text-left text-muted-foreground font-medium text-base transition-all duration-500 hover:text-primary py-4 px-6 rounded-xl relative group overflow-hidden ${
                    isActive(item.path) ? 'bg-gradient-to-r from-primary/10 to-brand-teal/10 text-primary border-l-4 border-primary' : ''
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: 'slideInFromLeft 0.4s ease-out forwards'
                  }}
                >
                  {/* Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 scale-0 group-hover:scale-100 transition-all duration-500 ease-out rounded-xl" />
                  
                  {/* Animated Border */}
                  <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-primary/30 transition-all duration-500 ease-out" />
                  
                  {/* Glow Effect */}
                  <div className="absolute inset-0 rounded-xl shadow-none group-hover:shadow-[0_0_15px_rgba(34,197,94,0.2)] transition-all duration-500 ease-out" />
                  
                  {/* Text with Glow */}
                  <span className="relative z-10 group-hover:drop-shadow-[0_0_6px_rgba(34,197,94,0.4)] transition-all duration-300 ease-out">
                    {item.name}
                  </span>
                  
                  {/* Animated Underline */}
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-brand-teal group-hover:w-full transition-all duration-500 ease-out rounded-full" />
                  
                  {/* Ripple Effect */}
                  <div className="absolute inset-0 rounded-xl bg-primary/20 scale-0 group-active:scale-100 transition-transform duration-200 ease-out" />
                  
                  {/* Icon Indicator */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full scale-0 group-hover:scale-100 transition-all duration-300 ease-out" />
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};
