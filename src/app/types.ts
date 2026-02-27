export interface Product {
  id: string;
  name: string;
  price_retail?: number;  // For Supabase (snake_case)
  price_wholesale?: number;  // For Supabase (snake_case)
  priceRetail?: number;  // For frontend (camelCase) - legacy
  priceWholesale?: number;  // For frontend (camelCase) - legacy
  stock: number;
  sku: string;
  category: string;
  image?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem extends Product {
  quantity: number;
  priceType: "retail" | "wholesale";  // Track which price was used
  appliedPrice: number;  // The actual price used for this item
}

export interface Sale {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  priceType: "retail" | "wholesale";
}