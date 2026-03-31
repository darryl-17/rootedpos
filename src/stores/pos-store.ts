import { create } from 'zustand';
import { CartItem, HeldOrder, Product } from '@/lib/types';
import { getData, setData } from '@/lib/mock-data';

interface POSState {
  cart: CartItem[];
  customerId: string | null;
  customerName: string | null;
  discount: number;
  discountType: 'fixed' | 'percent';
  note: string;
  heldOrders: HeldOrder[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  setCustomer: (id: string | null, name: string | null) => void;
  setDiscount: (amount: number, type: 'fixed' | 'percent') => void;
  setNote: (note: string) => void;
  holdOrder: () => void;
  recallOrder: (orderId: string) => void;
  removeHeldOrder: (orderId: string) => void;
  loadHeldOrders: () => void;
  getSubtotal: () => number;
  getTax: () => number;
  getDiscountAmount: () => number;
  getTotal: () => number;
}

export const usePOSStore = create<POSState>((set, get) => ({
  cart: [],
  customerId: null,
  customerName: null,
  discount: 0,
  discountType: 'fixed',
  note: '',
  heldOrders: [],

  addToCart: (product) => set((s) => {
    const existing = s.cart.find(i => i.product.id === product.id);
    if (existing) {
      return { cart: s.cart.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i) };
    }
    return { cart: [...s.cart, { product, quantity: 1 }] };
  }),

  removeFromCart: (productId) => set((s) => ({ cart: s.cart.filter(i => i.product.id !== productId) })),

  updateQuantity: (productId, qty) => set((s) => {
    if (qty <= 0) return { cart: s.cart.filter(i => i.product.id !== productId) };
    return { cart: s.cart.map(i => i.product.id === productId ? { ...i, quantity: qty } : i) };
  }),

  clearCart: () => set({ cart: [], customerId: null, customerName: null, discount: 0, discountType: 'fixed', note: '' }),

  setCustomer: (id, name) => set({ customerId: id, customerName: name }),
  setDiscount: (amount, type) => set({ discount: amount, discountType: type }),
  setNote: (note) => set({ note }),

  holdOrder: () => {
    const s = get();
    if (s.cart.length === 0) return;
    const order: HeldOrder = {
      id: Math.random().toString(36).slice(2, 11),
      items: [...s.cart],
      customerId: s.customerId || undefined,
      customerName: s.customerName || undefined,
      discount: s.discount,
      discountType: s.discountType,
      note: s.note,
      createdAt: new Date().toISOString(),
    };
    const updated = [...s.heldOrders, order];
    setData('heldOrders', updated);
    set({ heldOrders: updated, cart: [], customerId: null, customerName: null, discount: 0, discountType: 'fixed', note: '' });
  },

  recallOrder: (orderId) => {
    const s = get();
    const order = s.heldOrders.find(o => o.id === orderId);
    if (!order) return;
    const remaining = s.heldOrders.filter(o => o.id !== orderId);
    setData('heldOrders', remaining);
    set({
      heldOrders: remaining,
      cart: order.items,
      customerId: order.customerId || null,
      customerName: order.customerName || null,
      discount: order.discount,
      discountType: order.discountType,
      note: order.note,
    });
  },

  removeHeldOrder: (orderId) => set((s) => {
    const remaining = s.heldOrders.filter(o => o.id !== orderId);
    setData('heldOrders', remaining);
    return { heldOrders: remaining };
  }),

  loadHeldOrders: () => {
    const orders = getData<HeldOrder[]>('heldOrders');
    set({ heldOrders: orders });
  },

  getSubtotal: () => get().cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0),

  getTax: () => get().cart.reduce((sum, i) => sum + (i.product.price * i.quantity * i.product.taxRate / 100), 0),

  getDiscountAmount: () => {
    const s = get();
    const subtotal = s.getSubtotal();
    return s.discountType === 'percent' ? subtotal * (s.discount / 100) : s.discount;
  },

  getTotal: () => {
    const s = get();
    return Math.max(0, s.getSubtotal() - s.getDiscountAmount() + s.getTax());
  },
}));
