import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  imageKey: string;
  quantity: number;
  flavour?: string | undefined;
  weight?: string | undefined;
  designNotes?: string | undefined;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  total: number;
  add: (line: CartLine) => void;
  setQuantity: (slug: string, quantity: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "nathans-cart";

const CartContext = createContext<CartContextValue>({
  lines: [],
  count: 0,
  total: 0,
  add: () => {},
  setQuantity: () => {},
  remove: () => {},
  clear: () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, ready]);

  const value = useMemo<CartContextValue>(() => {
    return {
      lines,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      total: lines.reduce((n, l) => n + l.quantity * l.price, 0),
      add: (line) =>
        setLines((prev) => {
          const existing = prev.find((l) => l.slug === line.slug);
          if (existing) {
            return prev.map((l) =>
              l.slug === line.slug
                ? {
                    ...l,
                    quantity: l.quantity + line.quantity,
                    flavour: line.flavour || l.flavour,
                    weight: line.weight || l.weight,
                    designNotes: line.designNotes || l.designNotes,
                  }
                : l,
            );
          }
          return [...prev, line];
        }),
      setQuantity: (slug, quantity) =>
        setLines((prev) =>
          quantity <= 0
            ? prev.filter((l) => l.slug !== slug)
            : prev.map((l) => (l.slug === slug ? { ...l, quantity } : l)),
        ),
      remove: (slug) => setLines((prev) => prev.filter((l) => l.slug !== slug)),
      clear: () => setLines([]),
    };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
