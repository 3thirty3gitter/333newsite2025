export type Product = {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  image: string;
  category: string;
  variants: Variant[];
};

export type Variant = {
    type: string;
    options: VariantOption[];
}

export type VariantOption = {
    value: string;
    priceModifier: number;
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
