/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { Book, User, Order, CartItem, OrderStatus } from './types/bookstore';
import {
  getBooks,
  getCustomers,
  getOrders,
  getTransactions,
  getCurrentUser,
  setCurrentUser,
  saveCustomer,
  getCart,
  saveCart,
  clearCart,
  saveBook,
  deleteBook,
  saveOrder,
  updateOrderStatus,
  resetDatabase,
  subscribeToStorage,
  getWishlist,
  toggleWishlist,
} from './services/storageService';

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { BookCatalog } from './components/BookCatalog';
import { BookDetailModal } from './components/BookDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderInvoiceModal } from './components/OrderInvoiceModal';
import { CustomerOrdersView } from './components/CustomerOrdersView';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { WishlistView } from './components/WishlistView';
import { LoginPage } from './components/LoginPage';
import { ProfilePage } from './components/ProfilePage';

export default function App() {
  const [currentView, setCurrentView] = useState<'catalog' | 'wishlist' | 'orders' | 'admin' | 'login' | 'profile'>('catalog');
  
  // Storage state
  const [books, setBooks] = useState<Book[]>(getBooks);
  const [customers, setCustomers] = useState<User[]>(getCustomers);
  const [orders, setOrders] = useState<Order[]>(getOrders);
  const [transactions, setTransactions] = useState(getTransactions);
  const [currentUser, setCurrentUserState] = useState<User>(getCurrentUser);
  const [cart, setCart] = useState<CartItem[]>(getCart);
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => getWishlist(getCurrentUser().id));

  // Modals & Drawers
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutDiscount, setCheckoutDiscount] = useState(0);
  const [checkoutPromoCode, setCheckoutPromoCode] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Sync state from storage whenever changes happen
  useEffect(() => {
    const unsubscribe = subscribeToStorage(() => {
      const curUser = getCurrentUser();
      setBooks(getBooks());
      setCustomers(getCustomers());
      setOrders(getOrders());
      setTransactions(getTransactions());
      setCurrentUserState(curUser);
      setCart(getCart());
      setWishlistIds(getWishlist(curUser.id));
    });
    return unsubscribe;
  }, []);

  // Cart operations
  const handleAddToCart = (book: Book, quantity: number = 1) => {
    const currentCart = getCart();
    const existingIndex = currentCart.findIndex((item) => item.book.id === book.id);
    let updated: CartItem[];

    if (existingIndex >= 0) {
      updated = [...currentCart];
      const newQty = Math.min(book.stock, updated[existingIndex].quantity + quantity);
      updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
    } else {
      updated = [...currentCart, { book, quantity: Math.min(book.stock, quantity) }];
    }

    saveCart(updated);
  };

  const handleUpdateCartQuantity = (bookId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(bookId);
      return;
    }
    const currentCart = getCart();
    const updated = currentCart.map((item) =>
      item.book.id === bookId ? { ...item, quantity } : item
    );
    saveCart(updated);
  };

  const handleRemoveCartItem = (bookId: string) => {
    const currentCart = getCart();
    const updated = currentCart.filter((item) => item.book.id !== bookId);
    saveCart(updated);
  };

  const handleProceedToCheckout = (discountAmount: number, promoCode: string) => {
    setCheckoutDiscount(discountAmount);
    setCheckoutPromoCode(promoCode);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (newOrder: Order) => {
    saveOrder(newOrder);
    clearCart();
    setIsCheckoutOpen(false);
    setConfirmedOrder(newOrder);
  };

  const handleCancelOrder = (orderId: string) => {
    if (window.confirm('Are you sure you want to cancel this order? Stock will be restored to warehouse.')) {
      updateOrderStatus(orderId, 'cancelled');
    }
  };

  // Wishlist operations
  const handleToggleWishlist = (bookId: string) => {
    const updated = toggleWishlist(bookId, currentUser.id);
    setWishlistIds(updated);
  };

  const wishlistBooks = useMemo(() => {
    return books.filter((b) => wishlistIds.includes(b.id));
  }, [books, wishlistIds]);

  const handleMoveAllWishlistToCart = () => {
    wishlistBooks
      .filter((b) => b.stock > 0)
      .forEach((b) => handleAddToCart(b, 1));
    setIsCartOpen(true);
  };

  // User auth operations
  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    setWishlistIds(getWishlist(user.id));
    if (user.role === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('catalog');
    }
  };

  const handleRegisterUser = (newUser: User) => {
    saveCustomer(newUser);
    setCurrentUser(newUser);
    setWishlistIds(getWishlist(newUser.id));
    if (newUser.role === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('catalog');
    }
  };

  const handleUpdateUserProfile = (updatedUser: User) => {
    saveCustomer(updatedUser);
    setCurrentUser(updatedUser);
  };

  const handleSignOut = () => {
    setCurrentView('login');
  };

  // Derived calculations
  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const cartItemIds = useMemo(() => {
    return new Set(cart.map((i) => i.book.id));
  }, [cart]);

  const wishlistIdSet = useMemo(() => {
    return new Set(wishlistIds);
  }, [wishlistIds]);

  const featuredBook = useMemo(() => {
    return books.find((b) => b.featured) || books[0];
  }, [books]);

  // Customer specific orders
  const customerOrders = useMemo(() => {
    if (currentUser.role === 'admin') {
      return orders;
    }
    return orders.filter(
      (o) => o.userId === currentUser.id || o.customerEmail === currentUser.email
    );
  }, [orders, currentUser]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans">
      
      {/* 3-Zone Top Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        wishlistCount={wishlistIds.length}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Content Areas based on current view */}
      <main className="flex-1">
        {currentView === 'catalog' && (
          <>
            <Hero
              featuredBook={featuredBook}
              onExploreCatalog={() => {
                const el = document.getElementById('catalog-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onSelectBook={(book) => setSelectedBook(book)}
              onAddToCart={(book) => handleAddToCart(book, 1)}
              isWishlisted={wishlistIdSet.has(featuredBook.id)}
              onToggleWishlist={handleToggleWishlist}
            />
            <BookCatalog
              books={books}
              onSelectBook={(book) => setSelectedBook(book)}
              onAddToCart={(book) => handleAddToCart(book, 1)}
              cartItemIds={cartItemIds}
              wishlistIds={wishlistIdSet}
              onToggleWishlist={handleToggleWishlist}
            />
          </>
        )}

        {currentView === 'wishlist' && (
          <WishlistView
            wishlistBooks={wishlistBooks}
            onRemoveFromWishlist={handleToggleWishlist}
            onAddToCart={(book) => handleAddToCart(book, 1)}
            onSelectBook={(book) => setSelectedBook(book)}
            onBrowseCatalog={() => setCurrentView('catalog')}
            onMoveAllToCart={handleMoveAllWishlistToCart}
          />
        )}

        {currentView === 'orders' && (
          <CustomerOrdersView
            orders={customerOrders}
            onViewInvoice={(order) => setConfirmedOrder(order)}
            onCancelOrder={handleCancelOrder}
            onBrowseBooks={() => setCurrentView('catalog')}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            books={books}
            customers={customers}
            orders={orders}
            transactions={transactions}
            onSaveBook={saveBook}
            onDeleteBook={deleteBook}
            onUpdateOrderStatus={(orderId, status: OrderStatus) =>
              updateOrderStatus(orderId, status)
            }
            onViewInvoice={(order) => setConfirmedOrder(order)}
            onResetDatabase={resetDatabase}
          />
        )}

        {currentView === 'login' && (
          <LoginPage
            currentUser={currentUser}
            customers={customers}
            onSelectUser={handleSelectUser}
            onRegisterUser={handleRegisterUser}
            onNavigateHome={() => setCurrentView('catalog')}
          />
        )}

        {currentView === 'profile' && (
          <ProfilePage
            currentUser={currentUser}
            onUpdateUser={handleUpdateUserProfile}
            onNavigate={(view) => setCurrentView(view)}
            onSignOut={handleSignOut}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 text-stone-400 py-12 border-t border-neutral-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <p className="font-serif font-bold text-stone-100 text-base">Book Heavean</p>
            <p className="text-stone-400">
              Online Bookstore Management System · Curated literary, academic, and technical titles.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-stone-400">
            <button
              onClick={() => setCurrentView('catalog')}
              className="hover:text-stone-200 transition-colors cursor-pointer"
            >
              Catalog
            </button>
            <button
              onClick={() => setCurrentView('wishlist')}
              className="hover:text-stone-200 transition-colors cursor-pointer"
            >
              Wishlist {wishlistIds.length > 0 && `(${wishlistIds.length})`}
            </button>
            <button
              onClick={() => setCurrentView('orders')}
              className="hover:text-stone-200 transition-colors cursor-pointer"
            >
              Order Tracking
            </button>
            <button
              onClick={() => setCurrentView('admin')}
              className="hover:text-stone-200 transition-colors cursor-pointer"
            >
              Admin Dashboard
            </button>
            <button
              onClick={() => setCurrentView('login')}
              className="hover:text-stone-200 transition-colors cursor-pointer"
            >
              Login / Register
            </button>
            <button
              onClick={() => setCurrentView('profile')}
              className="hover:text-stone-200 transition-colors cursor-pointer"
            >
              My Profile
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-neutral-800/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-2">
          <p>© 2026 Book Heavean Systems Inc. All rights reserved.</p>
          <div className="flex items-center gap-3 font-mono">
            <span>Verified Customer Reviews</span>
            <span aria-hidden="true">·</span>
            <span>Secure Checkout</span>
            <span aria-hidden="true">·</span>
            <span>Express Nationwide Dispatch</span>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <BookDetailModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onAddToCart={(book, qty) => handleAddToCart(book, qty)}
        isWishlisted={selectedBook ? wishlistIdSet.has(selectedBook.id) : false}
        onToggleWishlist={handleToggleWishlist}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        currentUser={currentUser}
        discountAmount={checkoutDiscount}
        promoCode={checkoutPromoCode}
        onOrderSuccess={handleOrderSuccess}
      />

      <OrderInvoiceModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        onGoToOrders={() => {
          setConfirmedOrder(null);
          setCurrentView('orders');
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        customers={customers}
        onSelectUser={handleSelectUser}
        onRegisterUser={handleRegisterUser}
      />

    </div>
  );
}
