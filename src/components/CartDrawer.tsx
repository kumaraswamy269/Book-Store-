import React, { useState } from 'react';
import { CartItem } from '../types/bookstore';
import { BookCover } from './BookCover';
import { X, Trash2, ArrowRight, ShoppingBag, Tag, Check } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (bookId: string, quantity: number) => void;
  onRemoveItem: (bookId: string) => void;
  onProceedToCheckout: (discountAmount: number, promoCode: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; percent: number } | null>(null);
  const [promoError, setPromoError] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.book.price * item.quantity, 0);
  const discountAmount = appliedPromo ? (subtotal * appliedPromo.percent) / 100 : 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = taxableAmount * 0.08;
  const shippingFee = subtotal > 50 || subtotal === 0 ? 0 : 4.50;
  const total = taxableAmount + tax + shippingFee;

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    if (code === 'BOOKWORM15') {
      setAppliedPromo({ code: 'BOOKWORM15', percent: 15 });
      setPromoError('');
    } else if (code === 'FOLIO20') {
      setAppliedPromo({ code: 'FOLIO20', percent: 20 });
      setPromoError('');
    } else {
      setPromoError('Invalid coupon. Try BOOKWORM15 for 15% off.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-neutral-950/60 backdrop-blur-2xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-neutral-200">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-neutral-800" />
              <h2 className="text-lg font-serif font-bold text-neutral-900">
                Shopping Cart
              </h2>
              <span className="text-xs font-mono text-neutral-500">
                ({items.reduce((sum, i) => sum + i.quantity, 0)} items)
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-neutral-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-3">
                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-semibold text-neutral-900 text-base">Your cart is empty</h3>
                <p className="text-xs text-neutral-500 max-w-xs">
                  Discover curated books across software architecture, philosophy, and modern fiction.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-4 py-2 text-xs font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              items.map(({ book, quantity }) => (
                <div key={book.id} className="py-4 flex gap-4 items-center">
                  <div className="shrink-0">
                    <BookCover book={book} size="sm" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-neutral-900 line-clamp-1">
                      {book.title}
                    </h4>
                    <p className="text-[11px] text-neutral-500 truncate">
                      {book.author}
                    </p>
                    <div className="mt-1 text-xs font-mono font-bold text-neutral-900 tabular-nums">
                      ${book.price.toFixed(2)}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-neutral-300 rounded bg-white text-xs">
                        <button
                          onClick={() => onUpdateQuantity(book.id, quantity - 1)}
                          className="px-2 py-0.5 text-neutral-600 hover:bg-neutral-100 font-mono"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 font-mono font-medium text-neutral-800 min-w-[24px] text-center">
                          {quantity}
                        </span>
                        <button
                          disabled={quantity >= book.stock}
                          onClick={() => onUpdateQuantity(book.id, quantity + 1)}
                          className="px-2 py-0.5 text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 font-mono"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => onRemoveItem(book.id)}
                        className="text-neutral-400 hover:text-rose-600 p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Panel */}
          {items.length > 0 && (
            <div className="border-t border-neutral-200 p-6 bg-neutral-50/80 space-y-4">
              
              {/* Promo Code Input */}
              <div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Coupon (e.g. BOOKWORM15)"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-neutral-300 rounded-md text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-amber-500 uppercase font-mono"
                    />
                  </div>
                  <button
                    onClick={handleApplyPromo}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-medium rounded-md transition-colors"
                  >
                    Apply
                  </button>
                </div>

                {appliedPromo && (
                  <p className="text-[11px] text-emerald-700 flex items-center gap-1 mt-1 font-medium">
                    <Check className="w-3 h-3" />
                    Code {appliedPromo.code} applied ({appliedPromo.percent}% off)
                  </p>
                )}
                {promoError && (
                  <p className="text-[11px] text-rose-600 mt-1">{promoError}</p>
                )}
              </div>

              {/* Price Calculations */}
              <div className="space-y-1.5 text-xs text-neutral-600 pt-2 border-t border-neutral-200">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums font-medium text-neutral-900">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount ({appliedPromo?.percent}%)</span>
                    <span className="font-mono tabular-nums">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Sales Tax (8%)</span>
                  <span className="font-mono tabular-nums font-medium text-neutral-900">
                    ${tax.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Standard Shipping</span>
                  <span className="font-mono tabular-nums font-medium text-neutral-900">
                    {shippingFee === 0 ? <span className="text-emerald-700">Free</span> : `$${shippingFee.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between text-base font-bold text-neutral-900 pt-2 border-t border-neutral-300">
                  <span className="font-serif">Total Due</span>
                  <span className="font-mono tabular-nums text-lg text-amber-900">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => onProceedToCheckout(discountAmount, appliedPromo?.code || '')}
                className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-neutral-400 text-center">
                Secure 256-bit SSL encrypted checkout
              </p>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
