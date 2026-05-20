import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type ProductVertical = "enterprise" | "healthcare" | "dental" | "automotive";

export interface ProductVerticalOption {
  id: ProductVertical;
  label: string;
}

export const PRODUCT_VERTICALS: ProductVerticalOption[] = [
  { id: "enterprise", label: "Enterprise" },
  { id: "healthcare", label: "Healthcare" },
  { id: "dental", label: "Dental" },
  { id: "automotive", label: "Automotive" },
];

const STORAGE_KEY = "birdeye:product-vertical";

function readStored(): ProductVertical {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "enterprise" || raw === "healthcare" || raw === "dental" || raw === "automotive") {
      return raw;
    }
  } catch {
    // ignore
  }
  return "enterprise";
}

interface ProductVerticalContextValue {
  vertical: ProductVertical;
  setVertical: (v: ProductVertical) => void;
}

const ProductVerticalContext = createContext<ProductVerticalContextValue>({
  vertical: "enterprise",
  setVertical: () => undefined,
});

export function ProductVerticalProvider({ children }: { children: ReactNode }) {
  const [vertical, setVerticalState] = useState<ProductVertical>(readStored);

  const setVertical = useCallback((v: ProductVertical) => {
    setVerticalState(v);
    try {
      localStorage.setItem(STORAGE_KEY, v);
    } catch {
      // ignore
    }
  }, []);

  return (
    <ProductVerticalContext.Provider value={{ vertical, setVertical }}>
      {children}
    </ProductVerticalContext.Provider>
  );
}

export function useProductVertical() {
  return useContext(ProductVerticalContext);
}
