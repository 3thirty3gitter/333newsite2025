
'use client';

import { CartProvider } from "@/context/CartProvider";
import { HistoryProvider } from "@/context/HistoryProvider";
import { Toaster } from "../ui/toaster";
import { Header } from "./Header";
import { Footer } from "./Footer";
import type { ThemeSettings } from "@/lib/types";

export function ClientProviders({ 
    children,
    settings 
}: { 
    children: React.ReactNode,
    settings: ThemeSettings,
}) {
  return (
    <HistoryProvider>
      <CartProvider>
        <Header settings={settings} />
        <main className="flex-grow">{children}</main>
        <Footer />
        <Toaster />
      </CartProvider>
    </HistoryProvider>
  );
}
