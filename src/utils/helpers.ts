import { Product } from "../app/types";

// Convert database product (snake_case) to frontend product (camelCase)
export function dbToFrontendProduct(dbProduct: any): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    sku: dbProduct.sku,
    category: dbProduct.category,
    stock: dbProduct.stock,
    image: dbProduct.image,
    // Support both naming conventions
    priceRetail: dbProduct.price_retail || dbProduct.priceRetail || 0,
    priceWholesale: dbProduct.price_wholesale || dbProduct.priceWholesale || 0,
    price_retail: dbProduct.price_retail || dbProduct.priceRetail || 0,
    price_wholesale: dbProduct.price_wholesale || dbProduct.priceWholesale || 0,
    created_at: dbProduct.created_at,
    updated_at: dbProduct.updated_at,
  };
}

// Convert frontend product (camelCase) to database product (snake_case)
export function frontendToDbProduct(product: Partial<Product>): any {
  const dbProduct: any = {
    name: product.name,
    sku: product.sku,
    category: product.category,
    stock: product.stock,
    image: product.image,
  };

  // Handle both naming conventions
  if (product.priceRetail !== undefined) {
    dbProduct.price_retail = product.priceRetail;
  }
  if (product.price_retail !== undefined) {
    dbProduct.price_retail = product.price_retail;
  }
  if (product.priceWholesale !== undefined) {
    dbProduct.price_wholesale = product.priceWholesale;
  }
  if (product.price_wholesale !== undefined) {
    dbProduct.price_wholesale = product.price_wholesale;
  }

  return dbProduct;
}

// Format currency to Indonesian Rupiah
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Format date to Indonesian locale
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
