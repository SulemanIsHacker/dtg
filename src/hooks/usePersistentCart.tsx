import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartProduct {
  id: string;
  name: string;
  category: string;
  subscription_type: string;
  subscription_period: string;
  price: number;
  custom_price?: number | null;
  main_image_url?: string | null;
  pricing_plans?: Array<{
    plan_type: string;
    monthly_price?: string;
    yearly_price?: string;
    is_enabled: boolean;
  }>;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateProductPlan: (productId: string, subscription_type: string, subscription_period: string, newPrice: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'tool-pal-cart';

export const PersistentCartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cartItems]);

  const addToCart = (product: CartProduct) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // If product already exists, update it with new plan details
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, product: { ...product } }
            : item
        );
      } else {
        // Add new product to cart
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const updateProductPlan = (productId: string, subscription_type: string, subscription_period: string, newPrice: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId
          ? {
              ...item,
              product: {
                ...item.product,
                subscription_type,
                subscription_period,
                price: newPrice,
                custom_price: newPrice
              }
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product.custom_price || item.product.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const isInCart = (productId: string) => {
    return cartItems.some(item => item.product.id === productId);
  };

  const value: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateProductPlan,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isInCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const usePersistentCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('usePersistentCart must be used within a PersistentCartProvider');
  }
  return context;
};

