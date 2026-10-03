'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export interface CartLine {
  artworkId: string;
  title: string;
  unitPriceCents: number;
  currency: string;
  quantity: number;
  image: string;
  maxQuantity: number; // available stock / edition count
}

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotalCents: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addLine: (line: Omit<CartLine, 'quantity'>, quantity?: number) => void;
  removeLine: (artworkId: string) => void;
  updateQuantity: (artworkId: string, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'atelier-cart-v1';

function readStored(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLines(readStored());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
      } catch {
        /* storage full — ignore */
      }
    }
  }, [lines, hydrated]);

  const addLine = useCallback((line: Omit<CartLine, 'quantity'>, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.artworkId === line.artworkId);
      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, line.maxQuantity);
        return prev.map((l) =>
          l.artworkId === line.artworkId ? { ...l, quantity: nextQty } : l
        );
      }
      return [...prev, { ...line, quantity: Math.min(quantity, line.maxQuantity) }];
    });
    setIsOpen(true);
  }, []);

  const removeLine = useCallback((artworkId: string) => {
    setLines((prev) => prev.filter((l) => l.artworkId !== artworkId));
  }, []);

  const updateQuantity = useCallback((artworkId: string, quantity: number) => {
    setLines((prev) =>
      prev.map((l) =>
        l.artworkId === artworkId
          ? { ...l, quantity: Math.max(1, Math.min(quantity, l.maxQuantity)) }
          : l
      )
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((n, l) => n + l.quantity, 0);
    const subtotalCents = lines.reduce((n, l) => n + l.quantity * l.unitPriceCents, 0);
    return {
      lines, count, subtotalCents, isOpen,
      openCart, closeCart, addLine, removeLine, updateQuantity, clear,
    };
  }, [lines, isOpen, addLine, removeLine, updateQuantity, clear, openCart, closeCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
