export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  joinedDate: string;
  avatarSeed: string;
  totalOrders: number;
  totalSpent: number;
}

export type BookCategory = 
  | 'Fiction & Literature'
  | 'Technology & Computing'
  | 'Philosophy & Thought'
  | 'Business & Economics'
  | 'Science & Nature'
  | 'Art & Architecture';

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: BookCategory;
  price: number;
  originalPrice?: number;
  stock: number;
  description: string;
  publisher: string;
  year: number;
  pages: number;
  language: string;
  rating: number; // 1.0 to 5.0 stars rating scale
  reviewsCount: number;
  featured?: boolean;
  coverPalette: {
    bg: string;
    text: string;
    accent: string;
    spine: string;
  };
  tags: string[];
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export type OrderStatus = 'placed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'upi' | 'cod' | 'paypal';
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  bookId: string;
  title: string;
  author: string;
  isbn: string;
  price: number;
  quantity: number;
  coverPalette: {
    bg: string;
    text: string;
    accent: string;
    spine: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shippingFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  shippingAddress: ShippingAddress;
  createdAt: string;
  updatedAt: string;
  trackingNumber: string;
  transactionId: string;
}

export interface PaymentTransaction {
  id: string;
  transactionRef: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  gateway: string;
  timestamp: string;
  details: string;
}

export interface BookReview {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
}

export interface AdminNotification {
  id: string;
  type: 'new_order' | 'status_change' | 'low_stock' | 'new_review';
  title: string;
  message: string;
  orderId?: string;
  orderNumber?: string;
  customerName?: string;
  amount?: number;
  status?: OrderStatus;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'normal';
}
