import { Book, User, Order, PaymentTransaction } from '../types/bookstore';
import { COMPREHENSIVE_BOOKS } from './booksData';

export const INITIAL_BOOKS: Book[] = COMPREHENSIVE_BOOKS;

export const INITIAL_CUSTOMERS: User[] = [
  {
    id: 'usr-admin',
    name: 'Eleanor Vance',
    email: 'admin@bookheavean.com',
    role: 'admin',
    phone: '+1 (555) 234-8901',
    address: '450 Lexington Avenue, Suite 1200',
    city: 'New York',
    postalCode: '10017',
    joinedDate: '2024-01-15',
    avatarSeed: 'admin',
    totalOrders: 14,
    totalSpent: 840.50
  },
  {
    id: 'usr-cust-1',
    name: 'Julian Henderson',
    email: 'julian.henderson@example.com',
    role: 'customer',
    phone: '+1 (555) 678-1234',
    address: '742 Evergreen Terrace',
    city: 'Springfield',
    postalCode: '97477',
    joinedDate: '2024-06-20',
    avatarSeed: 'julian',
    totalOrders: 3,
    totalSpent: 148.50
  },
  {
    id: 'usr-cust-2',
    name: 'Maya Patel',
    email: 'maya.patel@example.com',
    role: 'customer',
    phone: '+1 (555) 902-3344',
    address: '128 Beacon Street, Apt 4B',
    city: 'Boston',
    postalCode: '02116',
    joinedDate: '2024-08-11',
    avatarSeed: 'maya',
    totalOrders: 5,
    totalSpent: 265.00
  },
  {
    id: 'usr-cust-3',
    name: 'David Chen',
    email: 'david.chen@example.com',
    role: 'customer',
    phone: '+1 (555) 431-7788',
    address: '210 Mission Boulevard',
    city: 'San Francisco',
    postalCode: '94105',
    joinedDate: '2024-09-02',
    avatarSeed: 'david',
    totalOrders: 1,
    totalSpent: 48.50
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'ORD-2026-9182',
    userId: 'usr-cust-1',
    customerName: 'Julian Henderson',
    customerEmail: 'julian.henderson@example.com',
    items: [
      {
        bookId: 'book-clean-code',
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        author: 'Robert C. Martin',
        isbn: '978-0132350884',
        price: 44.99,
        quantity: 1,
        coverPalette: {
          bg: 'from-blue-950 to-slate-900',
          text: 'text-sky-300',
          accent: 'border-sky-400/40',
          spine: 'bg-blue-950',
        }
      },
      {
        bookId: 'book-pragmatic-programmer',
        title: 'The Pragmatic Programmer: Your Journey To Mastery',
        author: 'David Thomas & Andrew Hunt',
        isbn: '978-0135957059',
        price: 49.95,
        quantity: 1,
        coverPalette: {
          bg: 'from-stone-900 to-amber-950',
          text: 'text-amber-200',
          accent: 'border-amber-400/40',
          spine: 'bg-stone-900',
        }
      }
    ],
    subtotal: 94.94,
    discount: 0,
    tax: 7.59,
    shippingFee: 0,
    total: 102.53,
    paymentMethod: 'credit_card',
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    shippingAddress: {
      fullName: 'Julian Henderson',
      email: 'julian.henderson@example.com',
      phone: '+1 (555) 678-1234',
      addressLine: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'OR',
      postalCode: '97477',
      country: 'United States'
    },
    createdAt: '2026-09-28T14:22:10Z',
    updatedAt: '2026-10-02T11:45:00Z',
    trackingNumber: 'TRK-USPS-88491204',
    transactionId: 'TXN-CC-994821'
  },
  {
    id: 'ord-1002',
    orderNumber: 'ORD-2026-9241',
    userId: 'usr-cust-2',
    customerName: 'Maya Patel',
    customerEmail: 'maya.patel@example.com',
    items: [
      {
        bookId: 'book-intro-algorithms',
        title: 'Introduction to Algorithms (CLRS)',
        author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
        isbn: '978-0262046305',
        price: 89.00,
        quantity: 1,
        coverPalette: {
          bg: 'from-neutral-900 to-zinc-950',
          text: 'text-blue-400',
          accent: 'border-blue-500/40',
          spine: 'bg-neutral-900',
        }
      }
    ],
    subtotal: 89.00,
    discount: 8.90,
    tax: 6.41,
    shippingFee: 0,
    total: 86.51,
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    orderStatus: 'shipped',
    shippingAddress: {
      fullName: 'Maya Patel',
      email: 'maya.patel@example.com',
      phone: '+1 (555) 902-3344',
      addressLine: '128 Beacon Street, Apt 4B',
      city: 'Boston',
      state: 'MA',
      postalCode: '02116',
      country: 'United States'
    },
    createdAt: '2026-10-10T09:15:30Z',
    updatedAt: '2026-10-12T16:00:00Z',
    trackingNumber: 'TRK-FEDEX-44219083',
    transactionId: 'TXN-UPI-388201'
  },
  {
    id: 'ord-1003',
    orderNumber: 'ORD-2026-9305',
    userId: 'usr-cust-3',
    customerName: 'David Chen',
    customerEmail: 'david.chen@example.com',
    items: [
      {
        bookId: 'book-atomic-habits',
        title: 'Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones',
        author: 'James Clear',
        isbn: '978-0735211292',
        price: 24.00,
        quantity: 1,
        coverPalette: {
          bg: 'from-amber-950 to-stone-900',
          text: 'text-amber-200',
          accent: 'border-amber-400/40',
          spine: 'bg-amber-950',
        }
      }
    ],
    subtotal: 24.00,
    discount: 0,
    tax: 1.92,
    shippingFee: 4.50,
    total: 30.42,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    orderStatus: 'processing',
    shippingAddress: {
      fullName: 'David Chen',
      email: 'david.chen@example.com',
      phone: '+1 (555) 431-7788',
      addressLine: '210 Mission Boulevard',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'United States'
    },
    createdAt: '2026-10-13T18:40:00Z',
    updatedAt: '2026-10-13T19:00:00Z',
    trackingNumber: 'TRK-UPS-19482019',
    transactionId: 'TXN-COD-PENDING'
  }
];

export const INITIAL_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: 'txn-1',
    transactionRef: 'TXN-CC-994821',
    orderId: 'ord-1001',
    orderNumber: 'ORD-2026-9182',
    customerName: 'Julian Henderson',
    customerEmail: 'julian.henderson@example.com',
    amount: 102.53,
    method: 'credit_card',
    status: 'paid',
    gateway: 'Stripe Secure Core',
    timestamp: '2026-09-28T14:23:45Z',
    details: 'Mastercard ending in 4242 (Auth Code: 89312)'
  },
  {
    id: 'txn-2',
    transactionRef: 'TXN-UPI-388201',
    orderId: 'ord-1002',
    orderNumber: 'ORD-2026-9241',
    customerName: 'Maya Patel',
    customerEmail: 'maya.patel@example.com',
    amount: 86.51,
    method: 'upi',
    status: 'paid',
    gateway: 'Instant UPI / QR Portal',
    timestamp: '2026-10-10T09:16:12Z',
    details: 'VPA: mayapatel@okbank (NPCI Ref: 48920184)'
  },
  {
    id: 'txn-3',
    transactionRef: 'TXN-COD-PENDING',
    orderId: 'ord-1003',
    orderNumber: 'ORD-2026-9305',
    customerName: 'David Chen',
    customerEmail: 'david.chen@example.com',
    amount: 30.42,
    method: 'cod',
    status: 'pending',
    gateway: 'Cash on Delivery Dispatch',
    timestamp: '2026-10-13T18:40:00Z',
    details: 'Due upon doorstep delivery receipt'
  }
];
