'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Item, CartItem } from '@/lib/types';
import { supabase } from '@/lib/supabase/client';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Item, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItemsCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('guest');

  // ตรวจจับและแยกตะกร้าสินค้าตาม User ID เพื่อไม่ให้ตะกร้าของแต่ละบัญชีปะปนกัน
  useEffect(() => {
    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id || 'guest';
      setCurrentUserId(userId);
      loadUserCart(userId);
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const userId = session?.user?.id || 'guest';
      setCurrentUserId(userId);
      loadUserCart(userId);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserCart = (userId: string) => {
    try {
      const savedCart = localStorage.getItem(`equipment_borrow_cart_${userId}`);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      } else {
        setCart([]);
      }
    } catch {
      setCart([]);
    }
  };

  // บันทึกตะกร้าแยกลงใน LocalStorage ตาม User ID ของผู้ใช้นั้นๆ
  useEffect(() => {
    try {
      localStorage.setItem(`equipment_borrow_cart_${currentUserId}`, JSON.stringify(cart));
    } catch {
      // Ignore localStorage errors
    }
  }, [cart, currentUserId]);

  const addToCart = (item: Item, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.item.id === item.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        return prev.map((i) => (i.item.id === item.id ? { ...i, quantity: newQty } : i));
      }
      return [...prev, { item, quantity: Math.max(1, quantity) }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => {
        if (i.item.id === itemId) {
          return { ...i, quantity };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem(`equipment_borrow_cart_${currentUserId}`);
      localStorage.removeItem('equipment_borrow_cart');
    } catch {
      // Ignore
    }
  };

  const totalItemsCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
