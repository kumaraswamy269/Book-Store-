import React, { useState, useEffect, useRef } from 'react';
import { 
  Book, 
  User, 
  Order, 
  PaymentTransaction, 
  BookCategory, 
  OrderStatus,
  AdminNotification 
} from '../types/bookstore';
import { BookCover } from './BookCover';
import { 
  BookOpen, 
  Users, 
  Package, 
  DollarSign, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  TrendingUp, 
  AlertTriangle,
  RotateCcw,
  Check,
  X,
  CreditCard,
  Eye,
  Bell,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  Download,
  RefreshCw,
  Truck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ArrowRight,
  Clock,
  Send,
  Zap,
  Filter
} from 'lucide-react';
import { 
  subscribeToNewOrders, 
  subscribeToStatusUpdates, 
  playNotificationChime,
  createSimulatedOrder,
  getAdminNotifications,
  markNotificationRead,
  clearAllAdminNotifications
} from '../services/storageService';

interface AdminDashboardProps {
  books: Book[];
  customers: User[];
  orders: Order[];
  transactions: PaymentTransaction[];
  onSaveBook: (book: Book) => void;
  onDeleteBook: (bookId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onViewInvoice: (order: Order) => void;
  onResetDatabase: () => void;
}

const CATEGORIES: BookCategory[] = [
  'Technology & Computing',
  'Fiction & Literature',
  'Philosophy & Thought',
  'Business & Economics',
  'Science & Nature',
  'Art & Architecture',
];

interface OrderAlertItem {
  id: string;
  order: Order;
  timestamp: number;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  books,
  customers,
  orders,
  transactions,
  onSaveBook,
  onDeleteBook,
  onUpdateOrderStatus,
  onViewInvoice,
  onResetDatabase,
}) => {
  const [activeTab, setActiveTab] = useState<'books' | 'customers' | 'orders' | 'payments'>('orders');
  const [bookSearch, setBookSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | OrderStatus>('all');
  const [customerSearch, setCustomerSearch] = useState('');
  
  // Real-time notification & Alert Banner State
  const [alertBanners, setAlertBanners] = useState<OrderAlertItem[]>([]);
  const [activeAlertIndex, setActiveAlertIndex] = useState(0);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isAutoSimulate, setIsAutoSimulate] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>(getAdminNotifications);

  // Dynamic status badges highlight tracking
  const [recentlyUpdatedOrders, setRecentlyUpdatedOrders] = useState<Record<string, { newStatus: OrderStatus; timestamp: number }>>({});
  const [newlyArrivedOrderIds, setNewlyArrivedOrderIds] = useState<Set<string>>(new Set());

  // Book Modal State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // Book Form State
  const [bookForm, setBookForm] = useState<Partial<Book>>({
    title: '',
    author: '',
    isbn: '',
    category: 'Technology & Computing',
    price: 29.99,
    stock: 15,
    publisher: 'Independent Press',
    year: 2024,
    pages: 320,
    language: 'English',
    description: '',
    rating: 4.8,
    reviewsCount: 12,
    coverPalette: {
      bg: 'from-slate-900 to-indigo-950',
      text: 'text-amber-300',
      accent: 'border-amber-400/40',
      spine: 'bg-indigo-950',
    },
    tags: ['General', 'Curated']
  });

  // Track initial known orders to prevent flooding on page load
  const knownOrderIdsRef = useRef<Set<string>>(new Set(orders.map((o) => o.id)));

  // Setup Real-time notification listeners from storageService
  useEffect(() => {
    // Subscribe to new orders from checkout or simulation
    const unsubNewOrder = subscribeToNewOrders((newOrder) => {
      // Add alert banner
      setAlertBanners((prev) => [
        {
          id: `alert-${newOrder.id}-${Date.now()}`,
          order: newOrder,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 9), // keep latest 10
      ]);
      setActiveAlertIndex(0);

      // Audio alert
      if (isSoundEnabled) {
        playNotificationChime();
      }

      // Mark newly arrived order for dynamic badge animation
      setNewlyArrivedOrderIds((prev) => new Set(prev).add(newOrder.id));
      setTimeout(() => {
        setNewlyArrivedOrderIds((prev) => {
          const next = new Set(prev);
          next.delete(newOrder.id);
          return next;
        });
      }, 18000);

      // Refresh notification list
      setAdminNotifications(getAdminNotifications());
    });

    // Subscribe to status transitions
    const unsubStatus = subscribeToStatusUpdates((order) => {
      setRecentlyUpdatedOrders((prev) => ({
        ...prev,
        [order.id]: { newStatus: order.orderStatus, timestamp: Date.now() },
      }));

      // Refresh notification list
      setAdminNotifications(getAdminNotifications());

      setTimeout(() => {
        setRecentlyUpdatedOrders((prev) => {
          const next = { ...prev };
          delete next[order.id];
          return next;
        });
      }, 7000);
    });

    return () => {
      unsubNewOrder();
      unsubStatus();
    };
  }, [isSoundEnabled]);

  // Synchronize orders when prop changes from other tabs or background
  useEffect(() => {
    orders.forEach((order) => {
      if (!knownOrderIdsRef.current.has(order.id)) {
        knownOrderIdsRef.current.add(order.id);
        
        // Add to alert banner queue
        setAlertBanners((prev) => {
          if (prev.some((a) => a.order.id === order.id)) return prev;
          return [
            {
              id: `alert-${order.id}-${Date.now()}`,
              order,
              timestamp: Date.now(),
            },
            ...prev.slice(0, 9),
          ];
        });

        if (isSoundEnabled) {
          playNotificationChime();
        }

        setNewlyArrivedOrderIds((prev) => new Set(prev).add(order.id));
        setAdminNotifications(getAdminNotifications());
      }
    });
  }, [orders, isSoundEnabled]);

  // Auto-simulate order streaming toggle (for demonstration)
  useEffect(() => {
    if (!isAutoSimulate) return;
    const timer = setInterval(() => {
      createSimulatedOrder();
    }, 28000); // simulate incoming order every 28s
    return () => clearInterval(timer);
  }, [isAutoSimulate]);

  // Auto-dismiss the active top alert banner after 12 seconds
  useEffect(() => {
    if (alertBanners.length === 0) return;
    const timeout = setTimeout(() => {
      setAlertBanners((prev) => prev.slice(1));
    }, 12000);
    return () => clearTimeout(timeout);
  }, [alertBanners]);

  // Handlers for Alert Banners
  const dismissCurrentAlert = () => {
    setAlertBanners((prev) => prev.filter((_, idx) => idx !== activeAlertIndex));
    if (activeAlertIndex >= alertBanners.length - 1) {
      setActiveAlertIndex(Math.max(0, alertBanners.length - 2));
    }
  };

  const dismissAllAlerts = () => {
    setAlertBanners([]);
    setActiveAlertIndex(0);
  };

  const handleSimulateClick = () => {
    const simOrder = createSimulatedOrder();
    // Switch tab to orders so admin sees the live reaction
    setActiveTab('orders');
    return simOrder;
  };

  // Export Orders as CSV
  const handleExportOrdersCSV = () => {
    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Customer Email',
      'Total Amount ($)',
      'Payment Method',
      'Payment Status',
      'Order Status',
      'Tracking Number',
      'Items Purchased',
    ];

    const rows = orders.map((o) => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleDateString(),
      `"${o.customerName.replace(/"/g, '""')}"`,
      o.customerEmail,
      o.total.toFixed(2),
      o.paymentMethod.toUpperCase(),
      o.paymentStatus.toUpperCase(),
      o.orderStatus.toUpperCase(),
      o.trackingNumber,
      `"${o.items.map((i) => `${i.quantity}x ${i.title}`).join('; ').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `book_heavean_orders_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics calculations
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrdersCount = orders.filter(
    (o) => o.orderStatus === 'placed' || o.orderStatus === 'processing'
  ).length;

  const lowStockBooksCount = books.filter((b) => b.stock <= 5).length;
  const totalBooksStock = books.reduce((sum, b) => sum + b.stock, 0);

  // Filtered views
  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.isbn.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.category.toLowerCase().includes(bookSearch.toLowerCase())
  );

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.orderStatus.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.trackingNumber.toLowerCase().includes(orderSearch.toLowerCase());

    const matchesStatus = orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
      (c.city && c.city.toLowerCase().includes(customerSearch.toLowerCase()))
  );

  // Book Handlers
  const handleOpenAddBook = () => {
    setEditingBook(null);
    setBookForm({
      id: `book-${Date.now()}`,
      title: '',
      author: '',
      isbn: `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      category: 'Technology & Computing',
      price: 29.99,
      stock: 20,
      publisher: 'Oxford Academic / Tech Press',
      year: 2024,
      pages: 350,
      language: 'English',
      description: 'Comprehensive volume addressing foundational concepts and practical enterprise implementations.',
      rating: 4.8,
      reviewsCount: 8,
      coverPalette: {
        bg: 'from-neutral-900 to-stone-800',
        text: 'text-amber-300',
        accent: 'border-amber-400/30',
        spine: 'bg-neutral-900',
      },
      tags: ['Enterprise', 'Architecture']
    });
    setIsBookModalOpen(true);
  };

  const handleOpenEditBook = (book: Book) => {
    setEditingBook(book);
    setBookForm({ ...book });
    setIsBookModalOpen(true);
  };

  const handleSaveBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookForm.title || !bookForm.author || !bookForm.isbn) return;

    const bookToSave: Book = {
      ...(editingBook || {}),
      ...(bookForm as Book),
      id: editingBook ? editingBook.id : bookForm.id || `book-${Date.now()}`,
      price: Number(bookForm.price) || 19.99,
      stock: Number(bookForm.stock) || 0,
      year: Number(bookForm.year) || 2024,
      pages: Number(bookForm.pages) || 300,
      rating: Math.min(5, Math.max(1, Number(bookForm.rating) || 4.8)),
    };

    onSaveBook(bookToSave);
    setIsBookModalOpen(false);
  };

  const unreadNotifsCount = adminNotifications.filter((n) => !n.read).length;
  const currentBanner = alertBanners[activeAlertIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* ============================================================ */}
      {/* 1. REAL-TIME ALERT TOAST BANNER (Prominent floating alert)    */}
      {/* ============================================================ */}
      {currentBanner && (
        <div className="relative overflow-hidden bg-gradient-to-r from-neutral-950 via-neutral-900 to-amber-950/90 text-white rounded-2xl p-4 sm:p-5 shadow-2xl border-2 border-amber-400/60 animate-in fade-in slide-in-from-top-4 duration-300">
          
          {/* Animated beacon light bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-400 animate-pulse" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            
            {/* Left: Live status beacon & order identity */}
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="relative flex h-3.5 w-3.5 mt-1 sm:mt-0 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 shadow-sm" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider flex items-center gap-1">
                    <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
                    LIVE NEW ORDER RECEIVED
                  </span>

                  <span className="font-mono font-bold text-amber-300 text-sm">
                    #{currentBanner.order.orderNumber}
                  </span>

                  <span className="text-[11px] text-stone-400">
                    · Just now
                  </span>

                  {alertBanners.length > 1 && (
                    <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 rounded-md text-[10px] font-mono font-semibold">
                      Alert {activeAlertIndex + 1} of {alertBanners.length}
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-200 mt-1 font-sans">
                  <strong>{currentBanner.order.customerName}</strong> ordered{' '}
                  <span className="text-amber-200 font-medium">
                    {currentBanner.order.items.map((i) => `${i.quantity}x ${i.title}`).join(', ')}
                  </span>{' '}
                  for <strong className="text-white font-mono">${currentBanner.order.total.toFixed(2)}</strong> via{' '}
                  <span className="uppercase text-[11px] font-mono text-stone-300">
                    {currentBanner.order.paymentMethod.replace('_', ' ')}
                  </span>
                </p>
              </div>
            </div>

            {/* Right: Quick action buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
              
              <button
                onClick={() => onViewInvoice(currentBanner.order)}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium border border-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>View Invoice</span>
              </button>

              <button
                onClick={() => {
                  onUpdateOrderStatus(currentBanner.order.id, 'processing');
                  dismissCurrentAlert();
                }}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Mark Processing</span>
              </button>

              <button
                onClick={() => {
                  onUpdateOrderStatus(currentBanner.order.id, 'shipped');
                  dismissCurrentAlert();
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Mark Shipped</span>
              </button>

              {alertBanners.length > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveAlertIndex((prev) => (prev > 0 ? prev - 1 : alertBanners.length - 1))}
                    className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-stone-300 rounded text-xs font-mono"
                    title="Previous Alert"
                  >
                    &larr;
                  </button>
                  <button
                    onClick={() => setActiveAlertIndex((prev) => (prev < alertBanners.length - 1 ? prev + 1 : 0))}
                    className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-stone-300 rounded text-xs font-mono"
                    title="Next Alert"
                  >
                    &rarr;
                  </button>
                </div>
              )}

              <button
                onClick={dismissCurrentAlert}
                className="p-1.5 text-stone-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer ml-1"
                title="Dismiss this alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Dismiss all indicator if queue > 1 */}
          {alertBanners.length > 1 && (
            <div className="mt-2 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-stone-400">
              <span>{alertBanners.length} new incoming orders queued in real-time notification listener</span>
              <button
                onClick={dismissAllAlerts}
                className="text-amber-400 hover:underline font-mono text-[10px] cursor-pointer"
              >
                Dismiss All Alerts
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. TOP TOOLBAR & SYSTEM CONTROL PANEL                        */}
      {/* ============================================================ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-700 font-semibold tracking-wide">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Dispatch Listener: Active</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>Local Database Synced</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 tracking-tight mt-0.5">
            Bookstore Management Console
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time fulfillment queue, dynamic order status lifecycle, inventory catalog, and customer records
          </p>
        </div>

        {/* Real-time actions & triggers */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Audio Chime Toggle */}
          <button
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className={`p-2 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              isSoundEnabled 
                ? 'bg-amber-50 border-amber-300 text-amber-900' 
                : 'bg-neutral-100 border-neutral-300 text-neutral-500'
            }`}
            title={isSoundEnabled ? 'Notification Sound Enabled' : 'Notification Sound Muted'}
          >
            {isSoundEnabled ? <Volume2 className="w-4 h-4 text-amber-700" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{isSoundEnabled ? 'Audio Chime ON' : 'Muted'}</span>
          </button>

          {/* Activity Drawer Trigger */}
          <button
            onClick={() => setIsNotifDrawerOpen(true)}
            className="relative p-2 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition-colors cursor-pointer"
            title="Open Notification History Center"
          >
            <Bell className="w-4 h-4 text-neutral-700" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 bg-rose-600 text-white font-mono text-[10px] font-bold rounded-full shadow-xs animate-bounce">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {/* SIMULATE LIVE INCOMING ORDER BUTTON */}
          <button
            onClick={handleSimulateClick}
            className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer group"
            title="Click to simulate an incoming customer order in real-time"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 group-hover:scale-125 transition-transform" />
            <span>Simulate Incoming Order</span>
          </button>

          {/* Auto Stream Toggle */}
          <button
            onClick={() => setIsAutoSimulate(!isAutoSimulate)}
            className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              isAutoSimulate 
                ? 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold' 
                : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
            }`}
            title="Continuously stream simulated customer orders every 28s"
          >
            <Radio className={`w-3.5 h-3.5 ${isAutoSimulate ? 'text-emerald-600 animate-pulse' : 'text-neutral-400'}`} />
            <span>Auto-Stream: {isAutoSimulate ? 'ON' : 'OFF'}</span>
          </button>

          {/* Export Orders CSV */}
          <button
            onClick={handleExportOrdersCSV}
            className="px-3 py-2 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download CSV report of all bookstore orders"
          >
            <Download className="w-3.5 h-3.5 text-neutral-500" />
            <span>Export CSV</span>
          </button>

          {/* Reset Database */}
          <button
            onClick={() => {
              if (window.confirm('Reset all demo orders, catalog and customers back to factory defaults?')) {
                onResetDatabase();
              }
            }}
            className="p-2 border border-neutral-300 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 rounded-lg text-xs transition-colors cursor-pointer"
            title="Reset Database to initial seed"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Add New Book */}
          <button
            onClick={handleOpenAddBook}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer ml-1"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add Book</span>
          </button>

        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. KPI METRIC SUMMARY STRIP                                  */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Revenue */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span className="font-medium">Total Paid Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-neutral-900 tabular-nums">
            ${totalRevenue.toFixed(2)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-700">
            <TrendingUp className="w-3 h-3" />
            <span>From {orders.filter((o) => o.paymentStatus === 'paid').length} settled orders</span>
          </div>
        </div>

        {/* Metric 2: Books Inventory */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span className="font-medium">Books & Inventory</span>
            <BookOpen className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-neutral-900 tabular-nums">
            {books.length} <span className="text-sm font-sans font-normal text-neutral-500">titles</span>
          </div>
          <div className="mt-1 text-[11px] text-neutral-500 font-mono">
            {totalBooksStock} units in warehouse
          </div>
        </div>

        {/* Metric 3: Pending Dispatches with Live Badge */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span className="font-medium">Pending Dispatches</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-neutral-900 tabular-nums flex items-baseline gap-2">
            <span>{pendingOrdersCount}</span>
            {pendingOrdersCount > 0 && (
              <span className="text-[10px] font-sans font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Action required
              </span>
            )}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            Placed or processing queue
          </div>
        </div>

        {/* Metric 4: Inventory Alerts */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span className="font-medium">Inventory Alerts</span>
            <AlertTriangle className={`w-4 h-4 ${lowStockBooksCount > 0 ? 'text-rose-500' : 'text-neutral-400'}`} />
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-neutral-900 tabular-nums">
            {lowStockBooksCount}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            {lowStockBooksCount > 0 ? (
              <span className="text-rose-600 font-medium">Titles with &le; 5 units left</span>
            ) : (
              'All stock levels healthy'
            )}
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 4. WORKSPACE TABS                                            */}
      {/* ============================================================ */}
      <div className="border-b border-neutral-200 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-2.5 px-4 text-xs font-semibold transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === 'orders'
              ? 'border-neutral-900 text-neutral-900 font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Package className="w-4 h-4 text-blue-600" />
          <span>Orders & Dispatches ({orders.length})</span>
          {pendingOrdersCount > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 border border-amber-300 rounded-full font-mono text-[10px]">
              {pendingOrdersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('books')}
          className={`py-2.5 px-4 text-xs font-semibold transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === 'books'
              ? 'border-neutral-900 text-neutral-900 font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-600" />
          <span>Books Catalog ({books.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`py-2.5 px-4 text-xs font-semibold transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === 'customers'
              ? 'border-neutral-900 text-neutral-900 font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-600" />
          <span>Customers Directory ({customers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`py-2.5 px-4 text-xs font-semibold transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === 'payments'
              ? 'border-neutral-900 text-neutral-900 font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <CreditCard className="w-4 h-4 text-emerald-600" />
          <span>Payments Ledger ({transactions.length})</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: MANAGE ORDERS (WITH DYNAMIC STATUS BADGES)            */}
      {/* ============================================================ */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          
          {/* Orders search and filter bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-3 rounded-xl border border-neutral-200">
            
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Search input */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search order #, customer, tracking..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <Filter className="w-3.5 h-3.5 text-neutral-400" />
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value as 'all' | OrderStatus)}
                  className="px-2.5 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium text-neutral-700"
                >
                  <option value="all">All Statuses ({orders.length})</option>
                  <option value="placed">Placed ({orders.filter((o) => o.orderStatus === 'placed').length})</option>
                  <option value="processing">Processing ({orders.filter((o) => o.orderStatus === 'processing').length})</option>
                  <option value="shipped">Shipped ({orders.filter((o) => o.orderStatus === 'shipped').length})</option>
                  <option value="delivered">Delivered ({orders.filter((o) => o.orderStatus === 'delivered').length})</option>
                  <option value="cancelled">Cancelled ({orders.filter((o) => o.orderStatus === 'cancelled').length})</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-neutral-500">
              <span className="font-mono">{filteredOrders.length} orders listed</span>
              <button
                onClick={handleExportOrdersCSV}
                className="text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV</span>
              </button>
            </div>
          </div>

          {/* Orders Table with Dynamic Status Badges */}
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4 font-mono">Order #</th>
                    <th className="py-3 px-4">Customer Details</th>
                    <th className="py-3 px-4">Books & Items</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Dynamic Order Status Badge</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-neutral-400">
                        No orders match the selected search or filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const isNewlyArrived = newlyArrivedOrderIds.has(order.id);
                      const recentUpdate = recentlyUpdatedOrders[order.id];

                      return (
                        <tr
                          key={order.id}
                          className={`transition-all duration-500 ${
                            isNewlyArrived
                              ? 'bg-amber-50/70 ring-2 ring-amber-400/50'
                              : recentUpdate
                              ? 'bg-emerald-50/50 ring-2 ring-emerald-400/40'
                              : 'hover:bg-neutral-50/70'
                          }`}
                        >
                          {/* Order Number & Timestamp */}
                          <td className="py-3.5 px-4 font-mono font-semibold text-neutral-900">
                            <div className="flex items-center gap-1.5">
                              <span>{order.orderNumber}</span>
                              {isNewlyArrived && (
                                <span className="px-1.5 py-0.5 bg-amber-500 text-neutral-950 text-[9px] font-bold rounded animate-pulse">
                                  NEW!
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-neutral-400 font-sans mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString()} ·{' '}
                              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </td>

                          {/* Customer */}
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-neutral-900">{order.customerName}</p>
                            <p className="text-neutral-500 text-[11px] font-mono">{order.customerEmail}</p>
                            <p className="text-neutral-400 text-[10px]">
                              {order.shippingAddress.city}, {order.shippingAddress.country}
                            </p>
                          </td>

                          {/* Items Summary */}
                          <td className="py-3.5 px-4 text-neutral-600 max-w-xs">
                            <p className="font-medium truncate text-neutral-800">
                              {order.items.map((i) => `${i.quantity}x ${i.title}`).join(', ')}
                            </p>
                            <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                              Trk: {order.trackingNumber}
                            </p>
                          </td>

                          {/* Total */}
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-neutral-900 tabular-nums">
                            ${order.total.toFixed(2)}
                          </td>

                          {/* Payment */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`font-mono text-[11px] uppercase font-bold px-2 py-0.5 rounded-md inline-block ${
                                order.paymentStatus === 'paid'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {order.paymentStatus} · {order.paymentMethod.replace('_', ' ')}
                            </span>
                          </td>

                          {/* DYNAMIC ORDER STATUS BADGE & QUICK SELECTOR */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1.5">
                              {/* Dynamic Visual Status Badge */}
                              <div className="flex items-center gap-2">
                                {order.orderStatus === 'placed' && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                                    </span>
                                    <span>Placed</span>
                                  </span>
                                )}

                                {order.orderStatus === 'processing' && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300 shadow-2xs">
                                    <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" />
                                    <span>Processing</span>
                                  </span>
                                )}

                                {order.orderStatus === 'shipped' && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-300 shadow-2xs">
                                    <Truck className="w-3 h-3 text-indigo-600" />
                                    <span>Shipped</span>
                                  </span>
                                )}

                                {order.orderStatus === 'delivered' && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Delivered</span>
                                  </span>
                                )}

                                {order.orderStatus === 'cancelled' && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300 shadow-2xs">
                                    <XCircle className="w-3 h-3 text-rose-600" />
                                    <span>Cancelled</span>
                                  </span>
                                )}

                                {recentUpdate && (
                                  <span className="text-[10px] font-mono bg-emerald-700 text-white px-1.5 py-0.5 rounded font-semibold animate-pulse">
                                    Updated!
                                  </span>
                                )}
                              </div>

                              {/* Interactive Transition Selector */}
                              <div className="flex items-center gap-1">
                                <select
                                  value={order.orderStatus}
                                  onChange={(e) =>
                                    onUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                                  }
                                  aria-label={`Update fulfillment status for order ${order.orderNumber}`}
                                  className="bg-white border border-neutral-300 text-neutral-800 text-[11px] rounded-md px-2 py-0.5 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                                >
                                  <option value="placed">placed</option>
                                  <option value="processing">processing</option>
                                  <option value="shipped">shipped</option>
                                  <option value="delivered">delivered</option>
                                  <option value="cancelled">cancelled</option>
                                </select>

                                {/* Quick advance button */}
                                {order.orderStatus === 'placed' && (
                                  <button
                                    onClick={() => onUpdateOrderStatus(order.id, 'processing')}
                                    className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] hover:bg-blue-100 transition-colors cursor-pointer"
                                    title="Advance to Processing"
                                  >
                                    &rarr; Process
                                  </button>
                                )}
                                {order.orderStatus === 'processing' && (
                                  <button
                                    onClick={() => onUpdateOrderStatus(order.id, 'shipped')}
                                    className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[10px] hover:bg-indigo-100 transition-colors cursor-pointer"
                                    title="Advance to Shipped"
                                  >
                                    &rarr; Ship
                                  </button>
                                )}
                                {order.orderStatus === 'shipped' && (
                                  <button
                                    onClick={() => onUpdateOrderStatus(order.id, 'delivered')}
                                    className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] hover:bg-emerald-100 transition-colors cursor-pointer"
                                    title="Mark Delivered"
                                  >
                                    &rarr; Deliver
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => onViewInvoice(order)}
                              className="px-2.5 py-1 text-xs font-medium border border-neutral-300 hover:bg-neutral-100 rounded-lg text-neutral-700 inline-flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-neutral-500" />
                              <span>Invoice</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: MANAGE BOOKS INVENTORY                                */}
      {/* ============================================================ */}
      {activeTab === 'books' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search title, author, ISBN, category..."
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">
                {filteredBooks.length} of {books.length} titles
              </span>
              <button
                onClick={handleOpenAddBook}
                className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-neutral-800 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Add Book</span>
              </button>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Title & Details</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Selling Price</th>
                    <th className="py-3 px-4 text-center">Stock</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredBooks.map((book) => {
                    const isLowStock = book.stock <= 5;
                    return (
                      <tr key={book.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-12 shrink-0 rounded overflow-hidden shadow-2xs">
                              <BookCover book={book} size="sm" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-neutral-900 truncate max-w-xs sm:max-w-md">
                                {book.title}
                              </p>
                              <p className="text-neutral-500 text-[11px]">{book.author}</p>
                              <p className="text-[10px] text-neutral-400 font-mono">ISBN: {book.isbn}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded text-[11px]">
                            {book.category}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-bold text-neutral-900 tabular-nums">
                          ${book.price.toFixed(2)}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full font-mono text-[11px] font-bold ${
                              book.stock === 0
                                ? 'bg-rose-100 text-rose-700 border border-rose-300'
                                : isLowStock
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-emerald-50 text-emerald-800'
                            }`}
                          >
                            {book.stock} units
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 font-mono text-[11px]">
                            <span className="text-amber-500 font-bold">★ {book.rating.toFixed(1)}</span>
                            <span className="text-neutral-400">({book.reviewsCount})</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditBook(book)}
                              className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors cursor-pointer"
                              title="Edit book details"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Permanently remove "${book.title}" from store inventory?`)) {
                                  onDeleteBook(book.id);
                                }
                              }}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                              title="Delete book"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: MANAGE CUSTOMERS                                      */}
      {/* ============================================================ */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search customers by name, email, city..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <span className="text-xs text-neutral-500">
              {filteredCustomers.length} registered accounts
            </span>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Customer Name & Role</th>
                    <th className="py-3 px-4">Contact Email & Phone</th>
                    <th className="py-3 px-4">Primary Address</th>
                    <th className="py-3 px-4 text-center">Orders Placed</th>
                    <th className="py-3 px-4 text-right">Total Spent</th>
                    <th className="py-3 px-4 text-right">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-neutral-900">{customer.name}</p>
                        <span className="font-mono text-[10px] uppercase text-neutral-400">
                          {customer.role}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <p className="text-neutral-700">{customer.email}</p>
                        <p className="text-neutral-400 font-mono text-[11px]">{customer.phone || 'N/A'}</p>
                      </td>

                      <td className="py-3 px-4 text-neutral-600">
                        {customer.address ? `${customer.address}, ${customer.city || ''}` : 'No address saved'}
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-semibold text-neutral-800 tabular-nums">
                        {customer.totalOrders}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-neutral-900 tabular-nums">
                        ${customer.totalSpent.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-neutral-500 text-[11px]">
                        {customer.joinedDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: PAYMENTS & AUDIT LEDGER                               */}
      {/* ============================================================ */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 flex justify-between items-center text-xs">
            <div>
              <p className="font-semibold text-neutral-900">Payment Gateway Reconciliation Audit</p>
              <p className="text-neutral-500">Live ledger of incoming transactions via Cards, UPI, and Cash on Delivery</p>
            </div>
            <div className="text-right">
              <span className="text-neutral-500">Total Settled:</span>
              <strong className="font-mono text-base ml-2 text-neutral-900 tabular-nums">
                ${totalRevenue.toFixed(2)}
              </strong>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4 font-mono">Txn Reference</th>
                    <th className="py-3 px-4 font-mono">Order #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4">Gateway</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-mono">
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-neutral-900">
                        {txn.transactionRef}
                      </td>
                      <td className="py-3 px-4 text-neutral-600">
                        {txn.orderNumber}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <p className="font-medium text-neutral-900">{txn.customerName}</p>
                        <p className="text-neutral-400 text-[11px]">{txn.customerEmail}</p>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-neutral-900 tabular-nums">
                        ${txn.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-sans text-neutral-600 text-[11px]">
                        {txn.gateway}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`uppercase text-[11px] font-bold px-2 py-0.5 rounded ${
                            txn.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {txn.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-neutral-500 text-[11px]">
                        {new Date(txn.timestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. SLIDE-OUT REAL-TIME NOTIFICATION HISTORY CENTER           */}
      {/* ============================================================ */}
      {isNotifDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-neutral-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-neutral-200 animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600" />
                <h3 className="font-serif font-bold text-sm text-neutral-900">
                  Real-Time Notification Center
                </h3>
              </div>
              <button
                onClick={() => setIsNotifDrawerOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification controls */}
            <div className="p-3 bg-neutral-100/70 border-b border-neutral-200 flex items-center justify-between text-[11px]">
              <span className="font-mono text-neutral-600">
                {adminNotifications.length} recorded events
              </span>
              <button
                onClick={() => {
                  clearAllAdminNotifications();
                  setAdminNotifications([]);
                }}
                className="text-neutral-500 hover:text-rose-700 cursor-pointer font-medium"
              >
                Clear Log
              </button>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 p-2">
              {adminNotifications.length === 0 ? (
                <div className="py-16 text-center text-neutral-400 text-xs">
                  No notifications recorded yet.
                </div>
              ) : (
                adminNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-xl transition-colors text-xs space-y-1 ${
                      notif.read ? 'bg-white opacity-80' : 'bg-amber-50/50 border border-amber-200/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900 text-[11px] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-neutral-600 text-[11px] leading-relaxed">
                      {notif.message}
                    </p>

                    {notif.orderId && (
                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-neutral-400">
                          Order #{notif.orderNumber}
                        </span>
                        <button
                          onClick={() => {
                            const o = orders.find((ord) => ord.id === notif.orderId);
                            if (o) {
                              onViewInvoice(o);
                              setIsNotifDrawerOpen(false);
                            }
                          }}
                          className="text-[11px] font-semibold text-amber-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Inspect</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. CREATE / EDIT BOOK MODAL                                  */}
      {/* ============================================================ */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs">
          <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-200">
            
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
              <h3 className="font-serif font-bold text-lg text-neutral-900">
                {editingBook ? 'Edit Book Details' : 'Add New Book to Inventory'}
              </h3>
              <button
                onClick={() => setIsBookModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBookSubmit} className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Book Title
                  </label>
                  <input
                    type="text"
                    required
                    value={bookForm.title}
                    onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-amber-500 font-medium"
                    placeholder="e.g. Clean Architecture in Java"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Author(s)
                  </label>
                  <input
                    type="text"
                    required
                    value={bookForm.author}
                    onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-amber-500"
                    placeholder="e.g. Robert C. Martin"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    ISBN-13
                  </label>
                  <input
                    type="text"
                    required
                    value={bookForm.isbn}
                    onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-amber-500 font-mono"
                    placeholder="978-0134494164"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Category / Genre
                  </label>
                  <select
                    value={bookForm.category}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, category: e.target.value as BookCategory })
                    }
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-amber-500 bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Publisher
                  </label>
                  <input
                    type="text"
                    value={bookForm.publisher}
                    onChange={(e) => setBookForm({ ...bookForm, publisher: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-amber-500"
                    placeholder="Prentice Hall / O'Reilly"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Selling Price ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={bookForm.price}
                    onChange={(e) => setBookForm({ ...bookForm, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={bookForm.stock}
                    onChange={(e) => setBookForm({ ...bookForm, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Publication Year
                  </label>
                  <input
                    type="number"
                    value={bookForm.year}
                    onChange={(e) => setBookForm({ ...bookForm, year: parseInt(e.target.value) || 2024 })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Page Count
                  </label>
                  <input
                    type="number"
                    value={bookForm.pages}
                    onChange={(e) => setBookForm({ ...bookForm, pages: parseInt(e.target.value) || 300 })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Rating (1.0 to 5.0 Stars)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={bookForm.rating}
                    onChange={(e) => setBookForm({ ...bookForm, rating: parseFloat(e.target.value) || 4.8 })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Book Synopsis & Description
                  </label>
                  <textarea
                    rows={3}
                    value={bookForm.description}
                    onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-amber-500"
                    placeholder="Enter detailed synopsis..."
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-100 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>{editingBook ? 'Save Changes' : 'Create Book'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
