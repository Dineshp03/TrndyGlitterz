export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description?: string;
  stock?: number;
  featured?: boolean;
  isImported?: boolean;
  images?: string[]; // Additional images (8+ supported)
  oldPrice?: number;
}

export const products: Product[] = [];
