'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export type CartItem = {
  id: string;       // product/variant id
  name: string;
  price: number;    // in dollars (not cents)
  image: string;
  size: string;     // locked after adding — non-editable
  quantity: number; // 1–99
  slug: string;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;  // sidebar visibility
};

type Action =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { id: string; size: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; size: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_ITEMS'; payload: CartItem[] }
  | { type: 'TOGGLE_SIDEBAR'; payload?: boolean };

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const clampQty = (n: number) => Math.max(1, Math.min(99, n));

// ─────────────────────────────────────────────────────────────────────────────
// Reducer
// ─────────────────────────────────────────────────────────────────────────────
function cartReducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      // Same product + same size → merge quantities (cap 99)
      const existing = state.items.find(
        i => i.id === action.payload.id && i.size === action.payload.size,
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.payload.id && i.size === action.payload.size
              ? { ...i, quantity: clampQty(i.quantity + action.payload.quantity) }
              : i,
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: clampQty(action.payload.quantity) }],
      };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(
          i => !(i.id === action.payload.id && i.size === action.payload.size),
        ),
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.payload.id && i.size === action.payload.size
            ? { ...i, quantity: clampQty(action.payload.quantity) }
            : i,
        ),
      };

    case 'CLEAR_CART':
      return { ...state, items: [] };

    case 'SET_ITEMS':
      return { ...state, items: action.payload };

    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        isOpen: action.payload !== undefined ? action.payload : !state.isOpen,
      };

    default:
      return state;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────
interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  subtotal: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, quantity: number) => void;
  clearCart: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false });

  // Hydrate from localStorage once on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('rhx_cart');
      if (stored) {
        const parsed = JSON.parse(stored) as CartItem[];
        if (Array.isArray(parsed)) {
          dispatch({ type: 'SET_ITEMS', payload: parsed });
        }
      }
    } catch (_) {
      /* ignore corrupt data */
    }
  }, []);

  // Persist whenever items change (skip the first render where items = [])
  const didMount = React.useRef(false);
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    localStorage.setItem('rhx_cart', JSON.stringify(state.items));
  }, [state.items]);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    document.body.style.overflow = state.isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [state.isOpen]);

  // Stable helpers
  const addItem = useCallback((item: CartItem) => dispatch({ type: 'ADD_ITEM', payload: item }), []);
  const removeItem = useCallback((id: string, size: string) => dispatch({ type: 'REMOVE_ITEM', payload: { id, size } }), []);
  const updateQuantity = useCallback((id: string, size: string, quantity: number) => dispatch({ type: 'UPDATE_QUANTITY', payload: { id, size, quantity } }), []);
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);
  const openSidebar = useCallback(() => dispatch({ type: 'TOGGLE_SIDEBAR', payload: true }), []);
  const closeSidebar = useCallback(() => dispatch({ type: 'TOGGLE_SIDEBAR', payload: false }), []);
  const toggleSidebar = useCallback(() => dispatch({ type: 'TOGGLE_SIDEBAR' }), []);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        totalItems,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        openSidebar,
        closeSidebar,
        toggleSidebar,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────
export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
};
