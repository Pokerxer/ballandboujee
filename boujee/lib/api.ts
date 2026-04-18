const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  description?: string;
  shortDescription?: string;
  image: string;
  images?: string[];
  category: string;
  subcategory?: string;
  sizes?: { size: string; stock: number; sku?: string }[];
  colors?: { name: string; hex?: string; images?: string[] }[];
  badge?: 'new' | 'limited' | 'sold-out' | 'hot' | 'sale' | null;
  featured?: boolean;
  inStock?: boolean;
  stockQuantity?: number;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  material?: string;
  careInstructions?: string;
  weight?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductsResponse {
  success: boolean;
  count: number;
  total: number;
  totalPages: number;
  currentPage: number;
  products: Product[];
}

export interface ProductResponse {
  success: boolean;
  product: Product;
  error?: string;
}

export interface GetProductsParams {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  badge?: string;
  sort?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const productsApi = {
  getProducts: async (params: GetProductsParams = {}): Promise<ProductsResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params.category) queryParams.set('category', params.category);
    if (params.minPrice) queryParams.set('minPrice', String(params.minPrice));
    if (params.maxPrice) queryParams.set('maxPrice', String(params.maxPrice));
    if (params.badge) queryParams.set('badge', params.badge);
    if (params.sort) queryParams.set('sort', params.sort);
    if (params.search) queryParams.set('search', params.search);
    if (params.page) queryParams.set('page', String(params.page));
    if (params.limit) queryParams.set('limit', String(params.limit));

    const url = `${API_URL}/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    
    return res.json();
  },

  getFeaturedProducts: async (): Promise<{ success: boolean; products: Product[] }> => {
    const res = await fetch(`${API_URL}/products/featured`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    return res.json();
  },

  getProductBySlug: async (slug: string): Promise<ProductResponse> => {
    const res = await fetch(`${API_URL}/products/slug/${slug}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    return res.json();
  },

  getProductById: async (id: string): Promise<ProductResponse> => {
    const res = await fetch(`${API_URL}/products/${id}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    return res.json();
  },
};
