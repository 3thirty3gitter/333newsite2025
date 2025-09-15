
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { CartItem, Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AddToCartParams {
    product: Product;
    variantId?: string;
    variantLabel?: string;
    price: number;
    image: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (params: AddToCartParams) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const addToCart = useCallback(({ product, variantId, variantLabel, price, image }: AddToCartParams) => {
    const cartItemId = `${product.id}${variantId ? `-${variantId}` : ''}`;
    
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === cartItemId);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { 
          id: cartItemId, 
          product, 
          quantity: 1, 
          variantId, 
          variantLabel, 
          price, 
          image 
      }];
    });
    toast({
      title: 'Added to cart',
      description: `${product.name} ${variantLabel ? `(${variantLabel})` : ''} has been added.`,
    });
  }, [toast]);

  const removeFromCart = useCallback((cartItemId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== cartItemId));
  }, []);

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
