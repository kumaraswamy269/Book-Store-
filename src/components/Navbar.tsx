import React, { useState } from 'react';
import { ShoppingBag, User as UserIcon, ShieldCheck, Heart, LogIn, ChevronDown, LogOut, Settings } from 'lucide-react';
import { User } from '../types/bookstore';

interface NavbarProps {
  currentView: 'catalog' | 'wishlist' | 'orders' | 'admin' | 'login' | 'profile';
  onNavigate: (view: 'catalog' | 'wishlist' | 'orders' | 'admin' | 'login' | 'profile') => void;
  cartCount: number;
  onOpenCart: () => void;
  wishlistCount: number;
  currentUser: User;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  cartCount,
  onOpenCart,
  wishlistCount,
  currentUser,
  onOpenAuth,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-neutral-900 text-stone-100 border-b border-neutral-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        
        {/* Zone 1: Wordmark */}
        <button
          onClick={() => onNavigate('catalog')}
          className="text-xl font-serif font-bold tracking-tight text-amber-100 hover:text-white transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer flex items-center gap-2"
        >
          <span>Book Heavean</span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded font-mono font-normal">
            ONLINE STORE
          </span>
        </button>

        {/* Zone 2: Primary Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-300">
          <button
            onClick={() => onNavigate('catalog')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 hover:text-white cursor-pointer ${
              currentView === 'catalog' ? 'text-amber-300 border-b-2 border-amber-400 font-semibold' : ''
            }`}
          >
            Catalog & Search
          </button>

          <button
            onClick={() => onNavigate('wishlist')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 hover:text-white flex items-center gap-1.5 cursor-pointer ${
              currentView === 'wishlist' ? 'text-amber-300 border-b-2 border-amber-400 font-semibold' : ''
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${wishlistCount > 0 ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}`} />
            <span>Wishlist</span>
            {wishlistCount > 0 && (
              <span className="text-[11px] font-mono font-bold text-amber-300">
                ({wishlistCount})
              </span>
            )}
          </button>

          <button
            onClick={() => onNavigate('orders')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 hover:text-white cursor-pointer ${
              currentView === 'orders' ? 'text-amber-300 border-b-2 border-amber-400 font-semibold' : ''
            }`}
          >
            Track Orders
          </button>

          <button
            onClick={() => onNavigate('admin')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 hover:text-white cursor-pointer ${
              currentView === 'admin' ? 'text-amber-300 border-b-2 border-amber-400 font-semibold' : ''
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Admin Console</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" title="Live listener active" />
          </button>

          <button
            onClick={() => onNavigate('login')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 hover:text-white cursor-pointer ${
              currentView === 'login' ? 'text-amber-300 border-b-2 border-amber-400 font-semibold' : ''
            }`}
          >
            <LogIn className="w-3.5 h-3.5 text-stone-400" />
            <span>Login Page</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Wishlist + Cart + Account Menu) */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Wishlist Quick Button */}
          <button
            onClick={() => onNavigate('wishlist')}
            aria-label="View saved books wishlist"
            className="relative p-2 text-stone-300 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'text-rose-400 fill-rose-500/20' : ''}`} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-[11px] font-bold font-mono rounded-full flex items-center justify-center shadow-xs">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Trigger */}
          <button
            onClick={onOpenCart}
            aria-label="View shopping cart"
            className="relative p-2 text-stone-300 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-neutral-950 text-xs font-bold font-mono rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </button>

          {/* Account Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-stone-200 border border-neutral-700 rounded-xl transition-colors whitespace-nowrap cursor-pointer ml-1"
            >
              <div className="w-5 h-5 rounded-full bg-amber-400 text-neutral-950 font-bold text-[10px] flex items-center justify-center font-serif">
                {currentUser.name.charAt(0)}
              </div>
              <span className="max-w-[90px] sm:max-w-[120px] truncate">{currentUser.name.split(' ')[0]}</span>
              <span className="text-[10px] text-stone-400 uppercase font-mono hidden sm:inline">
                ({currentUser.role})
              </span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl py-2 z-40 text-xs text-stone-200 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-neutral-800">
                    <p className="font-semibold text-white truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-stone-400 truncate font-mono">{currentUser.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-amber-400/20 text-amber-300 rounded text-[10px] font-mono uppercase font-bold">
                      {currentUser.role}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigate('profile');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-neutral-800 flex items-center gap-2 text-stone-200 hover:text-white cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-stone-400" />
                      <span>Customer Profile & Address</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigate('orders');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-neutral-800 flex items-center gap-2 text-stone-200 hover:text-white cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4 text-stone-400" />
                      <span>My Order History</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigate('admin');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-neutral-800 flex items-center gap-2 text-amber-300 hover:text-amber-200 cursor-pointer font-medium"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>Admin Management Console</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenAuth();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-neutral-800 flex items-center gap-2 text-stone-300 hover:text-white cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4 text-stone-400" />
                      <span>Switch User / Role Dialog</span>
                    </button>
                  </div>

                  <div className="border-t border-neutral-800 pt-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigate('login');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-neutral-800 flex items-center gap-2 text-rose-400 hover:text-rose-300 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out / Switch Account</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>

      </div>

      {/* Mobile subnav row */}
      <div className="md:hidden flex items-center justify-around py-2 px-3 bg-neutral-950 border-t border-neutral-800 text-xs font-medium text-stone-300">
        <button
          onClick={() => onNavigate('catalog')}
          className={`py-1 ${currentView === 'catalog' ? 'text-amber-300 font-semibold' : ''}`}
        >
          Catalog
        </button>
        <button
          onClick={() => onNavigate('wishlist')}
          className={`py-1 flex items-center gap-1 ${currentView === 'wishlist' ? 'text-amber-300 font-semibold' : ''}`}
        >
          <span>Wishlist</span>
          {wishlistCount > 0 && <span className="font-mono text-[10px]">({wishlistCount})</span>}
        </button>
        <button
          onClick={() => onNavigate('orders')}
          className={`py-1 ${currentView === 'orders' ? 'text-amber-300 font-semibold' : ''}`}
        >
          Orders
        </button>
        <button
          onClick={() => onNavigate('admin')}
          className={`py-1 ${currentView === 'admin' ? 'text-amber-300 font-semibold' : ''}`}
        >
          Admin
        </button>
        <button
          onClick={() => onNavigate('login')}
          className={`py-1 ${currentView === 'login' ? 'text-amber-300 font-semibold' : ''}`}
        >
          Login
        </button>
      </div>
    </header>
  );
};
