
'use client';

import { CartProvider } from "@/context/CartProvider";
import { HistoryProvider } from "@/context/HistoryProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HistoryProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </HistoryProvider>
  );
}
