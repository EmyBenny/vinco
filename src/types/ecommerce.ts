export type CategoryType =
  | 'All'
  | 'Towels'
  | 'Bathrobes'
  | 'Pyjamas'
  | 'Blankets'
  | 'Boxers'
  | 'Bedcovers'
  | 'Essentials';

export type OrderStatus = 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Product {
  id: string;
  title: string;
  subtitle: string;
  category: Exclude<CategoryType, 'All'>;
  price: number;
  stock: number;
  lowStockThreshold: number;
  description: string;
  fabricSpecs: string;
  colors: string[];
  sizes: string[];
  styles: string[];
  imageUrl: string;
  galleryImages: string[];
  featured: boolean;
  badge: string;
  rating: number;
  reviewCount: number;
  createdAtMs: number;
  updatedAtMs: number;
}

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  imageUrl: string;
  color: string;
  size: string;
  style: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  color: string;
  size: string;
  style: string;
  imageUrl: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerEmail: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentIntentId: string;
  paymentMethod: string;
  paymentLast4: string;
  shippingAddress: string;
  createdAtMs: number;
  updatedAtMs: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAtMs: number;
}

export interface NotificationItem {
  id: string;
  targetUserId: string;
  type: 'order_update' | 'promotion' | 'low_stock';
  title: string;
  message: string;
  orderId: string;
  readBy: string[];
  createdAtMs: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'customer' | 'admin';
  wishlist: string[];
}

export interface AdminEmailLog {
  id: string;
  recipient: string;
  subject: string;
  trigger: 'new_order' | 'low_stock' | 'order_cancelled';
  summary: string;
  deliveryMode: 'smtp' | 'internal_queue';
  status: 'sent' | 'queued';
  createdAt: string;
}

export interface FilterState {
  search: string;
  category: CategoryType;
  priceBand: 'all' | 'under20k' | '20kto40k' | 'over40k';
  color: string;
  inStockOnly: boolean;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating';
}

export const COLOR_SWATCH_MAP: Record<string, string> = {
  'Sharp Emerald': '#006837',
  'Deep Emerald': '#004D2C',
  'Royal Gold': '#D4AF37',
  'Sage Green': '#4F8A6B',
  Celadon: '#AEC3B0',
  'Mint Cream': '#E3EED4',
  'Warm Ivory': '#F6F3EB',
  Oatmeal: '#D6CEBF',
  Charcoal: '#27272A',
};

export function formatNaira(amount: number): string {
  return `₦${Math.round(amount).toLocaleString('en-NG')}`;
}
