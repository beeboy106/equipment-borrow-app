'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { Item, CartItem } from '@/lib/types';
import { supabase } from '@/lib/supabase/client';
import {
  useCartStore,
  selectCart,
  selectIsCartOpen,
  selectTotalItemsCount,
  selectToastMessage,
} from '@/lib/store/cartStore';

export * from '@/lib/store/cartStore';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Item, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItemsCount: number;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const cart = useCartStore(selectCart);
  const isCartOpen = useCartStore(selectIsCartOpen);
  const totalItemsCount = useCartStore(selectTotalItemsCount);
  const toastMessage = useCartStore(selectToastMessage);

  const addToCart = useCartStore((s) => s.addToCart);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const setIsCartOpen = useCartStore((s) => s.setIsCartOpen);
  const showToast = useCartStore((s) => s.showToast);
  const setCurrentUserId = useCartStore((s) => s.setCurrentUserId);

  // ตรวจจับและแยกตะกร้าสินค้าตาม User ID เพื่อไม่ให้ตะกร้าของแต่ละบัญชีปะปนกัน
  useEffect(() => {
    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id || 'guest';
      setCurrentUserId(userId);
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const userId = session?.user?.id || 'guest';
      setCurrentUserId(userId);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setCurrentUserId]);

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
        toastMessage,
        showToast,
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
