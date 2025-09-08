
export type Product = {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  images: string[];
  category: string;
  variants: Variant[];
  inventory: InventoryItem[];
};

export type Variant = {
    type: string;
    options: VariantOption[];
}

export type VariantOption = {
    value: string;
}

export type InventoryItem = {
    id: string; // Combination of variant values, e.g., "Small-Red"
    price: number;
    stock: number;
}

export type CartItem = {
  product: Product;
  quantity: number;
  variant?: VariantOption;
};

export type Category = {
  id: string;
  name: string;
};

export type MenuItem = {
  label: string;
  href: string;
};

export type ThemeSettings = {
  palette: string;
  headlineFont: string;
  bodyFont: string;
  logoUrl?: string;
  logoWidth?: number;
  menuItems?: MenuItem[];
  headerType?: 'standard' | 'centered' | 'split' | 'minimalist' | 'logo-top';
};
