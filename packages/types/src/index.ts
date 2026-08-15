export type ProductSummary = {
  id: string;
  slug: string;
  brand: string;
  name: string;
  benefit: string;
  size: string;
  priceMillimes: number;
  category: string;
  concerns: string[];
  skinTypes: string[];
  image: string;
  description: string;
  benefits: string[];
  usage: string;
  sizes: { label: string; priceMillimes: number }[];
  routineTime: ("AM" | "PM")[];
};

export type CartItem = {
  productId: string;
  slug: string;
  brand: string;
  name: string;
  sizeLabel: string;
  priceMillimes: number;
  quantity: number;
  image: string;
};

export type Order = {
  id: string;
  userId: string;
  status: string;
  totalMillimes: number;
  gouvernorat: string;
  fullAddress: string;
  items: OrderItem[];
  createdAt: string;
};

export type OrderItem = {
  id: string;
  productId: string;
  productVariantId: string;
  quantity: number;
  priceMillimes: number;
  product?: ProductSummary;
};

export type Address = {
  id: string;
  gouvernorat: string;
  fullAddress: string;
  label?: string;
  isDefault: boolean;
};

export type Review = {
  id: string;
  rating: number;
  title?: string;
  body?: string;
  userName: string;
  verified: boolean;
  createdAt: string;
};

export type Routine = {
  id: string;
  tier: string;
  answers: unknown;
  items: { product: ProductSummary; slot: string; reason?: string }[];
  createdAt: string;
};

export type LoyaltyAccount = {
  tier: string;
  points: number;
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  content: string[];
};
