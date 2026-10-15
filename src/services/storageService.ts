import { Book, User, Order, PaymentTransaction, CartItem, BookReview, AdminNotification, OrderStatus } from '../types/bookstore';
import { INITIAL_BOOKS, INITIAL_CUSTOMERS, INITIAL_ORDERS, INITIAL_TRANSACTIONS } from '../data/initialData';

const STORAGE_KEYS = {
  BOOKS: 'bookheavean_books_v2',
  CUSTOMERS: 'bookheavean_customers_v2',
  ORDERS: 'bookheavean_orders_v2',
  TRANSACTIONS: 'bookheavean_transactions_v2',
  CURRENT_USER: 'bookheavean_current_user_v2',
  CART: 'bookheavean_cart_v2',
  WISHLIST: 'bookheavean_wishlist_v2',
  REVIEWS: 'bookheavean_reviews_v2',
  NOTIFICATIONS: 'bookheavean_admin_notifications_v2',
};

type Listener = () => void;
type NewOrderListener = (order: Order) => void;
type StatusUpdateListener = (order: Order, prevStatus: OrderStatus) => void;

const listeners: Set<Listener> = new Set();
const newOrderListeners: Set<NewOrderListener> = new Set();
const statusUpdateListeners: Set<StatusUpdateListener> = new Set();

export const subscribeToStorage = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const subscribeToNewOrders = (listener: NewOrderListener) => {
  newOrderListeners.add(listener);
  return () => {
    newOrderListeners.delete(listener);
  };
};

export const subscribeToStatusUpdates = (listener: StatusUpdateListener) => {
  statusUpdateListeners.add(listener);
  return () => {
    statusUpdateListeners.delete(listener);
  };
};

const notifyListeners = () => {
  listeners.forEach((fn) => fn());
};

// Cross-tab synchronization
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (
      event.key === STORAGE_KEYS.ORDERS ||
      event.key === STORAGE_KEYS.BOOKS ||
      event.key === STORAGE_KEYS.NOTIFICATIONS ||
      event.key === STORAGE_KEYS.CUSTOMERS
    ) {
      notifyListeners();
    }
  });
}

// Gentle synthesized notification chime (no external MP3/audio file required)
export const playNotificationChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    // Clean harmonic chime D5 -> A5
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // Audio context may be restricted before user gesture
  }
};

// Books CRUD
export const getBooks = (): Book[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(INITIAL_BOOKS));
      return INITIAL_BOOKS;
    }
    const currentList: Book[] = JSON.parse(raw);
    if (currentList.length < INITIAL_BOOKS.length) {
      const storedIds = new Set(currentList.map((b) => b.id));
      const storedTitles = new Set(currentList.map((b) => b.title.toLowerCase().trim()));
      const missing = INITIAL_BOOKS.filter(
        (b) => !storedIds.has(b.id) && !storedTitles.has(b.title.toLowerCase().trim())
      );
      if (missing.length > 0) {
        const merged = [...currentList, ...missing];
        localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(merged));
        return merged;
      }
    }
    return currentList;
  } catch {
    return INITIAL_BOOKS;
  }
};

export const saveBook = (book: Book): void => {
  const books = getBooks();
  const index = books.findIndex((b) => b.id === book.id);
  let updated: Book[];
  if (index >= 0) {
    updated = [...books];
    updated[index] = book;
  } else {
    updated = [book, ...books];
  }
  localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(updated));
  notifyListeners();
};

export const deleteBook = (id: string): void => {
  const books = getBooks().filter((b) => b.id !== id);
  localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
  notifyListeners();
};

export const updateBookStock = (id: string, delta: number): void => {
  const books = getBooks();
  const book = books.find((b) => b.id === id);
  if (book) {
    book.stock = Math.max(0, book.stock + delta);
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
    notifyListeners();
  }
};

// Users / Customers
export const getCustomers = (): User[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
      return INITIAL_CUSTOMERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CUSTOMERS;
  }
};

export const saveCustomer = (customer: User): void => {
  const list = getCustomers();
  const index = list.findIndex((c) => c.id === customer.id);
  let updated: User[];
  if (index >= 0) {
    updated = [...list];
    updated[index] = customer;
  } else {
    updated = [customer, ...list];
  }
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(updated));
  notifyListeners();
};

// Current Session User
export const getCurrentUser = (): User => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  const customers = getCustomers();
  const defaultUser = customers.find((c) => c.role === 'customer') || INITIAL_CUSTOMERS[1];
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(defaultUser));
  return defaultUser;
};

export const setCurrentUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  notifyListeners();
};

// Orders
export const getOrders = (): Order[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ORDERS;
  }
};

export const saveOrder = (order: Order): void => {
  const orders = getOrders();
  const updated = [order, ...orders];
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));

  // Decrement stocks
  order.items.forEach((item) => {
    updateBookStock(item.bookId, -item.quantity);
  });

  // Record payment transaction
  const txn: PaymentTransaction = {
    id: `txn-${Date.now()}`,
    transactionRef: order.transactionId,
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    amount: order.total,
    method: order.paymentMethod,
    status: order.paymentStatus,
    gateway:
      order.paymentMethod === 'cod'
        ? 'Cash on Delivery Courier'
        : order.paymentMethod === 'upi'
        ? 'Unified Payments Interface'
        : 'Stripe Payments Core',
    timestamp: new Date().toISOString(),
    details: `${order.items.length} book titles total. Processed successfully.`,
  };
  saveTransaction(txn);

  // Update customer order count and spending
  const customers = getCustomers();
  const cust = customers.find((c) => c.id === order.userId);
  if (cust) {
    cust.totalOrders += 1;
    cust.totalSpent += order.total;
    saveCustomer(cust);
  }

  // Create real-time admin alert notification
  const notification: AdminNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type: 'new_order',
    title: `New Order Placed: #${order.orderNumber}`,
    message: `${order.customerName} placed order for ${order.items.length} book(s) totaling $${order.total.toFixed(2)} via ${order.paymentMethod.toUpperCase()}`,
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    amount: order.total,
    status: order.orderStatus,
    timestamp: new Date().toISOString(),
    read: false,
    priority: 'high',
  };
  saveAdminNotification(notification);

  // Trigger real-time order listeners & sound
  newOrderListeners.forEach((fn) => {
    try {
      fn(order);
    } catch {
      // listener safety
    }
  });

  notifyListeners();
};

export const updateOrderStatus = (orderId: string, status: Order['orderStatus']): void => {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  if (order) {
    const prevStatus = order.orderStatus;
    order.orderStatus = status;
    order.updatedAt = new Date().toISOString();
    if (status === 'delivered' && order.paymentMethod === 'cod') {
      order.paymentStatus = 'paid';
    }
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    // Create status change notification
    const notification: AdminNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'status_change',
      title: `Order #${order.orderNumber} Status Updated`,
      message: `Fulfillment stage progressed from ${prevStatus.toUpperCase()} to ${status.toUpperCase()}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      amount: order.total,
      status: status,
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'normal',
    };
    saveAdminNotification(notification);

    // Notify listeners
    statusUpdateListeners.forEach((fn) => {
      try {
        fn(order, prevStatus);
      } catch {
        // listener safety
      }
    });

    notifyListeners();
  }
};

// Simulated Incoming Order Generator (for live testing real-time notifications in Viva & Demo)
export const createSimulatedOrder = (): Order => {
  const books = getBooks();
  const customers = getCustomers().filter((c) => c.role === 'customer');
  const sampleCustomer =
    customers[Math.floor(Math.random() * customers.length)] || {
      id: `cust-${Date.now()}`,
      name: 'Eleanor Vance',
      email: 'eleanor.vance@bookheavean.io',
      phone: '+1 (555) 749-2104',
      address: '742 Evergreen Terrace',
      city: 'Boston',
    };

  // Pick 1 to 3 random in-stock books
  const inStock = books.filter((b) => b.stock > 0);
  const shuffled = [...(inStock.length > 0 ? inStock : books)].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, Math.floor(Math.random() * 2) + 1);

  const items = selected.map((b) => ({
    bookId: b.id,
    title: b.title,
    author: b.author,
    isbn: b.isbn,
    price: b.price,
    quantity: Math.min(b.stock, Math.floor(Math.random() * 2) + 1),
    coverPalette: b.coverPalette,
  }));

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal > 50 ? 0 : 4.99;
  const tax = Number((subtotal * 0.08).toFixed(2));
  const total = Number((subtotal + shippingFee + tax).toFixed(2));

  const methods: Order['paymentMethod'][] = ['credit_card', 'upi', 'cod', 'debit_card'];
  const method = methods[Math.floor(Math.random() * methods.length)];

  const orderNum = `ORD-${Date.now().toString().slice(-6)}`;
  const newOrder: Order = {
    id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    orderNumber: orderNum,
    userId: sampleCustomer.id,
    customerName: sampleCustomer.name,
    customerEmail: sampleCustomer.email,
    items,
    subtotal,
    discount: 0,
    tax,
    shippingFee,
    total,
    paymentMethod: method,
    paymentStatus: method === 'cod' ? 'pending' : 'paid',
    orderStatus: 'placed',
    shippingAddress: {
      fullName: sampleCustomer.name,
      email: sampleCustomer.email,
      phone: sampleCustomer.phone || '+1 (555) 019-2834',
      addressLine: sampleCustomer.address || '482 Beacon Street, Apt 4B',
      city: sampleCustomer.city || 'Cambridge',
      state: 'MA',
      postalCode: '02138',
      country: 'United States',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    trackingNumber: `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
    transactionId: `TXN-${Date.now().toString().slice(-8)}`,
  };

  saveOrder(newOrder);
  return newOrder;
};

// Payments & Transactions
export const getTransactions = (): PaymentTransaction[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TRANSACTIONS;
  }
};

export const saveTransaction = (txn: PaymentTransaction): void => {
  const list = getTransactions();
  const updated = [txn, ...list];
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
  notifyListeners();
};

// Shopping Cart
export const getCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CART);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveCart = (items: CartItem[]): void => {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items));
  notifyListeners();
};

export const clearCart = (): void => {
  localStorage.removeItem(STORAGE_KEYS.CART);
  notifyListeners();
};

// Customer Wishlist
export const getWishlist = (userId?: string): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    const allWishlists: Record<string, string[]> = raw ? JSON.parse(raw) : {};
    const key = userId || 'default';
    if (!allWishlists[key]) {
      allWishlists[key] = ['book-3', 'book-8'];
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(allWishlists));
    }
    return allWishlists[key] || [];
  } catch {
    return ['book-3', 'book-8'];
  }
};

export const toggleWishlist = (bookId: string, userId?: string): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    const allWishlists: Record<string, string[]> = raw ? JSON.parse(raw) : {};
    const key = userId || 'default';
    const current = allWishlists[key] || [];

    let updated: string[];
    if (current.includes(bookId)) {
      updated = current.filter((id) => id !== bookId);
    } else {
      updated = [bookId, ...current];
    }
    allWishlists[key] = updated;
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(allWishlists));
    notifyListeners();
    return updated;
  } catch {
    return [];
  }
};

export const clearWishlist = (userId?: string): void => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    const allWishlists: Record<string, string[]> = raw ? JSON.parse(raw) : {};
    const key = userId || 'default';
    allWishlists[key] = [];
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(allWishlists));
    notifyListeners();
  } catch {
    // fallback
  }
};

// Admin Notifications
export const getAdminNotifications = (): AdminNotification[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) {
      // Seed initial sample notification
      const initial: AdminNotification[] = [
        {
          id: 'notif-init-1',
          type: 'new_order',
          title: 'New Order Placed: #ORD-984102',
          message: 'Eleanor Vance ordered 2 books totaling $64.48 via CREDIT_CARD',
          orderId: 'ord-102',
          orderNumber: 'ORD-984102',
          customerName: 'Eleanor Vance',
          amount: 64.48,
          status: 'placed',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: false,
          priority: 'high',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveAdminNotification = (notif: AdminNotification): void => {
  const current = getAdminNotifications();
  const updated = [notif, ...current.slice(0, 49)]; // keep latest 50
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
  notifyListeners();
};

export const markNotificationRead = (notifId: string): void => {
  const current = getAdminNotifications();
  const updated = current.map((n) => (n.id === notifId ? { ...n, read: true } : n));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
  notifyListeners();
};

export const clearAllAdminNotifications = (): void => {
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
  notifyListeners();
};

// Book Reviews
const INITIAL_REVIEWS: BookReview[] = [
  {
    id: 'rev-1',
    bookId: 'book-1',
    userId: 'usr-cust-1',
    userName: 'Rosalind Franklin',
    rating: 5,
    title: 'Essential reading for every software architect',
    comment: 'The architectural principles explained transformed our engineering practices. Clean, decoupled code examples and practical boundary discussions.',
    createdAt: '2026-03-12T14:22:00Z',
    verifiedPurchase: true,
    helpfulCount: 24,
  },
  {
    id: 'rev-2',
    bookId: 'book-1',
    userId: 'usr-cust-2',
    userName: 'Alan Turing',
    rating: 5,
    title: 'Flawless foundation in systems architecture',
    comment: 'A masterclass in separation of concerns and dependency inversion. Worth every cent for any senior developer or student.',
    createdAt: '2026-03-18T09:10:00Z',
    verifiedPurchase: true,
    helpfulCount: 18,
  },
  {
    id: 'rev-3',
    bookId: 'book-2',
    userId: 'usr-cust-3',
    userName: 'Grace Hopper',
    rating: 5,
    title: 'Deep and comprehensive exploration of transformers',
    comment: 'Covers modern deep learning paradigms from self-attention mechanics to production fine-tuning. Beautiful binding and typography too.',
    createdAt: '2026-03-20T11:45:00Z',
    verifiedPurchase: true,
    helpfulCount: 31,
  },
  {
    id: 'rev-4',
    bookId: 'book-3',
    userId: 'usr-cust-4',
    userName: 'Linus Torvalds',
    rating: 5,
    title: 'The gold standard for distributed systems engineering',
    comment: 'Clear, rigorous explanations of consensus algorithms, replication logs, and partition tolerance. A must-have volume.',
    createdAt: '2026-03-25T16:30:00Z',
    verifiedPurchase: true,
    helpfulCount: 42,
  },
];

export const getBookReviews = (bookId?: string): BookReview[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    const reviews: BookReview[] = raw ? JSON.parse(raw) : INITIAL_REVIEWS;
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
    }
    if (bookId) {
      return reviews.filter((r) => r.bookId === bookId);
    }
    return reviews;
  } catch {
    return INITIAL_REVIEWS;
  }
};

export const saveBookReview = (review: BookReview): void => {
  const current = getBookReviews();
  const updated = [review, ...current];
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(updated));

  // Also update the book rating in catalog
  const books = getBooks();
  const book = books.find((b) => b.id === review.bookId);
  if (book) {
    const bookRevs = updated.filter((r) => r.bookId === book.id);
    const avg = bookRevs.reduce((sum, r) => sum + r.rating, 0) / bookRevs.length;
    book.rating = Number(avg.toFixed(1));
    book.reviewsCount = bookRevs.length;
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
  }

  notifyListeners();
};

export const voteReviewHelpful = (reviewId: string): void => {
  const current = getBookReviews();
  const updated = current.map((r) => (r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r));
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(updated));
  notifyListeners();
};

// Reset Database to Factory
export const resetDatabase = (): void => {
  localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(INITIAL_BOOKS));
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_CUSTOMERS[1]));
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
  localStorage.removeItem(STORAGE_KEYS.CART);
  localStorage.setItem(
    STORAGE_KEYS.WISHLIST,
    JSON.stringify({
      default: ['book-3', 'book-8'],
      'usr-cust-1': ['book-3', 'book-8'],
    })
  );
  localStorage.setItem(
    STORAGE_KEYS.NOTIFICATIONS,
    JSON.stringify([
      {
        id: 'notif-init-1',
        type: 'new_order',
        title: 'New Order Placed: #ORD-984102',
        message: 'Eleanor Vance ordered 2 books totaling $64.48 via CREDIT_CARD',
        orderId: 'ord-102',
        orderNumber: 'ORD-984102',
        customerName: 'Eleanor Vance',
        amount: 64.48,
        status: 'placed',
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'high',
      },
    ])
  );
  notifyListeners();
};
