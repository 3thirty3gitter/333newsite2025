export type Product = {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  image: string;
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
