

export type Product = {
  id: string;
  name: string;
  handle: string;
  description: string;
  longDescription: string;
  price: number;
  images: string[];
  category: string;
  vendor?: string;
  tags?: string[];
  variants: Variant[];
  inventory: InventoryItem[];
  status: 'active' | 'draft';
  compareAtPrice?: number | null;
  costPerItem?: number | null;
  isTaxable: boolean;
  trackQuantity: boolean;
  allowOutOfStockPurchase: boolean;
  seoTitle?: string;
  seoDescription?: string;
};

export type Variant = {
    type: string;
    options: VariantOption[];
}

export type VariantOption = {
    value: string;
    image?: string; // Optional image URL for the variant, e.g., for a color swatch
}

export type InventoryItem = {
    id: string; // Combination of variant values, e.g., "Small-Red"
    price: number;
    stock: number;
    sku?: string;
    barcode?: string;
    grams?: number;
}

export type CartItem = {
  id: string; // Combination of product ID and variant ID
  product: Product;
  quantity: number;
  variantId?: string;
  variantLabel?: string;
  price: number;
  image: string;
};

export type Collection = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
};

export type Contact = {
    name: string;
    email: string;
    phone: string;
    role: 'Primary' | 'Billing' | 'Shipping' | 'Other';
};

export type Customer = {
    id: string;
    clientType: 'ORGANIZATION' | 'INDIVIDUAL';
    company?: string;
    contacts: Contact[];
    billingStreet: string;
    billingCity: string;
    billingState: string;
    billingZip: string;
    shippingStreet: string;
    shippingCity: string;
    shippingState: string;
    shippingZip: string;
    taxExempt: boolean;
    taxExemptionNumber?: string;
    gstNumber?: string;
};

export type MenuItemChild = {
  label: string;
  href: string;
  description?: string;
}

export type MegaMenuColumn = {
  title: string;
  children: MenuItemChild[];
}

export type MenuItem = {
  label: string;
  href: string;
  menuType?: 'none' | 'simple' | 'mega';
  children?: MenuItemChild[];
  megaMenu?: MegaMenuColumn[];
};

export type Page = {
  id: string;
  name: string;
  path: string;
  sections: PageSection[];
}

export type SectionType = 'hero' | 'featured-products' | 'testimonials' | 'image-with-text' | 'faq' | 'collections' | 'spacer';

export type PageSection = {
  id: string;
  type: SectionType;
  props: {
    [key: string]: any;
  };
}

export type ThemeSettings = {
  palette: string;
  headlineFont: string;
  bodyFont: string;
  logoUrl?: string;
  logoWidth?: number;
  menuItems?: MenuItem[];
  headerType?: 'standard' | 'centered' | 'split' | 'minimalist' | 'logo-top';
  pages?: Page[];
  sections?: PageSection[]; // This will be deprecated in favor of pages.sections
};

export type DesignElement = {
    id: string;
    type: 'text' | 'image';
    rotation: number;
    position: { x: number, y: number };
}

export type TextElement = DesignElement & {
    type: 'text';
    text: string;
    fontSize: number;
};

export type ImageElement = DesignElement & {
    type: 'image';
    src: string;
    size: { width: number, height: number };
    aspectRatio: number;
};

export type DesignViewState = {
    textElements: TextElement[];
    imageElements: ImageElement[];
}

export type AllDesignsState = {
    [imageUrl: string]: DesignViewState;
}
    
