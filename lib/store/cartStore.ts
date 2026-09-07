import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Item, CartItem } from '@/lib/types';

export interface CartState {
  cart: CartItem[];
  isCartOpen: boolean;
  currentUserId: string;
  toastMessage: string | null;
}

export interface CartActions {
  addToCart: (item: Item, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setIsCartOpen: (open: boolean) => void;
  setCurrentUserId: (userId: string) => void;
  loadUserCart: (userId: string) => void;
  showToast: (msg: string) => void;
  clearToast: () => void;
}

export type CartStore = CartState & CartActions;

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useCartStore = create<CartStore>()(
  subscribeWithSelector((set, get) => ({
    cart: [],
    isCartOpen: false,
    currentUserId: 'guest',
    toastMessage: null,

    setCurrentUserId: (userId: string) => {
      set({ currentUserId: userId });
      get().loadUserCart(userId);
    },

    loadUserCart: (userId: string) => {
      if (typeof window === 'undefined') return;
      try {
        const saved = localStorage.getItem(`equipment_borrow_cart_${userId}`);
        if (saved) {
          set({ cart: JSON.parse(saved) });
        } else {
          set({ cart: [] });
        }
      } catch {
        set({ cart: [] });
      }
    },

    addToCart: (item: Item, quantity: number = 1) => {
      set((state) => {
        const existing = state.cart.find((c) => c.item.id === item.id);
        let updatedCart: CartItem[];
        if (existing) {
          const newQty = existing.quantity + quantity;
          updatedCart = state.cart.map((i) =>
            i.item.id === item.id ? { ...i, quantity: newQty } : i
          );
        } else {
          updatedCart = [...state.cart, { item, quantity: Math.max(1, quantity) }];
        }
        return { cart: updatedCart };
      });
      get().showToast(`เพิ่ม "${item.name}" ลงในตะกร้าแล้ว`);
    },

    removeFromCart: (itemId: string) => {
      set((state) => ({
        cart: state.cart.filter((i) => i.item.id !== itemId),
      }));
    },

    updateQuantity: (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        get().removeFromCart(itemId);
        return;
      }
      set((state) => ({
        cart: state.cart.map((i) =>
          i.item.id === itemId ? { ...i, quantity } : i
        ),
      }));
    },

    clearCart: () => {
      const { currentUserId } = get();
      set({ cart: [] });
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(`equipment_borrow_cart_${currentUserId}`);
          localStorage.removeItem('equipment_borrow_cart');
        } catch {
          // Ignore
        }
      }
    },

    setIsCartOpen: (open: boolean) => {
      set({ isCartOpen: open });
    },

    showToast: (msg: string) => {
      if (toastTimer) clearTimeout(toastTimer);
      set({ toastMessage: msg });
      toastTimer = setTimeout(() => {
        set({ toastMessage: null });
      }, 2500);
    },

    clearToast: () => {
      if (toastTimer) clearTimeout(toastTimer);
      set({ toastMessage: null });
    },
  }))
);

// Automatic localStorage synchronization via Zustand subscriber
if (typeof window !== 'undefined') {
  useCartStore.subscribe(
    (state) => state.cart,
    (cart) => {
      const currentUserId = useCartStore.getState().currentUserId;
      try {
        localStorage.setItem(
          `equipment_borrow_cart_${currentUserId}`,
          JSON.stringify(cart)
        );
      } catch {
        // Ignore localStorage quota errors
      }
    }
  );
}

// Atomic Selectors for optimal re-render isolation (state-management.md & atomic-component.md)
export const selectCart = (state: CartStore) => state.cart;
export const selectIsCartOpen = (state: CartStore) => state.isCartOpen;
export const selectToastMessage = (state: CartStore) => state.toastMessage;
export const selectTotalItemsCount = (state: CartStore) =>
  state.cart.reduce((sum, i) => sum + i.quantity, 0);
export const selectItemQuantity = (itemId: string) => (state: CartStore) =>
  state.cart.find((c) => c.item.id === itemId)?.quantity || 0;
