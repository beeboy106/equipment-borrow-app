import { describe, it, expect, beforeEach } from 'vitest';
import {
  useCartStore,
  selectTotalItemsCount,
  selectItemQuantity,
} from './cartStore';
import { Item } from '@/lib/types';

const mockItem1: Item = {
  id: 'item-1',
  name: 'กล้อง DSLR Canon',
  description: 'กล้องสำหรับบันทึกภาพนิ่ง',
  category: 'โสตทัศนูปกรณ์',
  image_url: 'https://example.com/camera.jpg',
  total_quantity: 5,
  available_quantity: 5,
};

const mockItem2: Item = {
  id: 'item-2',
  name: 'ไมโครโฟนไร้สาย',
  description: 'ไมค์ลอยหนีบปกเสื้อ',
  category: 'เครื่องเสียง',
  image_url: 'https://example.com/mic.jpg',
  total_quantity: 10,
  available_quantity: 10,
};

describe('Zustand Cart Store (lib/store/cartStore.ts)', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    useCartStore.setState({ isCartOpen: false, toastMessage: null });
  });

  it('should initialize with an empty cart', () => {
    const state = useCartStore.getState();
    expect(state.cart).toEqual([]);
    expect(selectTotalItemsCount(state)).toBe(0);
  });

  it('should add item to cart and calculate correct quantity', () => {
    useCartStore.getState().addToCart(mockItem1, 1);

    const state = useCartStore.getState();
    expect(state.cart.length).toBe(1);
    expect(state.cart[0].item.id).toBe('item-1');
    expect(state.cart[0].quantity).toBe(1);
    expect(selectTotalItemsCount(state)).toBe(1);
    expect(selectItemQuantity('item-1')(state)).toBe(1);
  });

  it('should increment quantity when adding the same item multiple times', () => {
    useCartStore.getState().addToCart(mockItem1, 2);
    useCartStore.getState().addToCart(mockItem1, 3);

    const state = useCartStore.getState();
    expect(state.cart.length).toBe(1);
    expect(state.cart[0].quantity).toBe(5);
    expect(selectTotalItemsCount(state)).toBe(5);
    expect(selectItemQuantity('item-1')(state)).toBe(5);
  });

  it('should add different items and sum total count across items', () => {
    useCartStore.getState().addToCart(mockItem1, 2);
    useCartStore.getState().addToCart(mockItem2, 4);

    const state = useCartStore.getState();
    expect(state.cart.length).toBe(2);
    expect(selectTotalItemsCount(state)).toBe(6);
    expect(selectItemQuantity('item-1')(state)).toBe(2);
    expect(selectItemQuantity('item-2')(state)).toBe(4);
    expect(selectItemQuantity('non-existing')(state)).toBe(0);
  });

  it('should update item quantity correctly', () => {
    useCartStore.getState().addToCart(mockItem1, 2);
    useCartStore.getState().updateQuantity('item-1', 4);

    expect(selectItemQuantity('item-1')(useCartStore.getState())).toBe(4);
  });

  it('should remove item when quantity is updated to 0', () => {
    useCartStore.getState().addToCart(mockItem1, 2);
    useCartStore.getState().updateQuantity('item-1', 0);

    const state = useCartStore.getState();
    expect(state.cart.length).toBe(0);
    expect(selectTotalItemsCount(state)).toBe(0);
  });

  it('should remove item from cart explicitly', () => {
    useCartStore.getState().addToCart(mockItem1, 2);
    useCartStore.getState().addToCart(mockItem2, 1);
    useCartStore.getState().removeFromCart('item-1');

    const state = useCartStore.getState();
    expect(state.cart.length).toBe(1);
    expect(state.cart[0].item.id).toBe('item-2');
  });

  it('should clear all items in cart', () => {
    useCartStore.getState().addToCart(mockItem1, 2);
    useCartStore.getState().addToCart(mockItem2, 3);
    useCartStore.getState().clearCart();

    const state = useCartStore.getState();
    expect(state.cart).toEqual([]);
    expect(selectTotalItemsCount(state)).toBe(0);
  });

  it('should toggle isCartOpen drawer state', () => {
    expect(useCartStore.getState().isCartOpen).toBe(false);
    useCartStore.getState().setIsCartOpen(true);
    expect(useCartStore.getState().isCartOpen).toBe(true);
    useCartStore.getState().setIsCartOpen(false);
    expect(useCartStore.getState().isCartOpen).toBe(false);
  });
});
