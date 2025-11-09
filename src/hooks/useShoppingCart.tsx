import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Product {
  id: string;
  name: string;
  category: string;
  subscription_type: string;
  subscription_period: string;
  price: number;
  custom_price?: number | null;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface ShoppingCartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isInCart: (productId: string) => boolean;
}

const ShoppingCartContext = createContext<ShoppingCartContextType | undefined>(undefined);

export const useShoppingCart = () => {
  const context = useContext(ShoppingCartContext);
  if (!context) {
    throw new Error('useShoppingCart must be used within a ShoppingCartProvider');
  }
  return context;
};

interface ShoppingCartProviderProps {
  children: ReactNode;
}

export const ShoppingCartProvider = ({ children }: ShoppingCartProviderProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
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

  const value: ShoppingCartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isInCart,
  };

  return (
    <ShoppingCartContext.Provider value={value}>
      {children}
    </ShoppingCartContext.Provider>
  );
};
