import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X, Home, ShoppingCart, User, Search, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePersistentCart } from "@/hooks/usePersistentCart";

export const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { getTotalItems } = usePersistentCart();

  const navigationItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Tools", href: "/tools", icon: Search },
    { name: "Cart", href: "/cart", icon: ShoppingCart, badge: getTotalItems() },
    { name: "Contact", href: "/contact", icon: MessageCircle },
  ];

  const handleNavigation = (href: string) => {
    navigate(href);
    setIsOpen(false);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      {/* Bottom Navigation Bar */}
      <div className="flex items-center justify-around py-2">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.href)}
              className="flex flex-col items-center justify-center p-2 min-w-0 flex-1 relative"
            >
              <div className="relative">
                <IconComponent className="w-5 h-5" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 truncate">{item.name}</span>
            </button>
          );
        })}
      </div>

      {/* Floating Action Button for WhatsApp */}
      <Button
        onClick={() => window.open('https://wa.me/2348141988239', '_blank')}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    </div>
  );
};
