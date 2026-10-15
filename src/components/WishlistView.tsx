import React from 'react';
import { Book } from '../types/bookstore';
import { BookCover } from './BookCover';
import { StarRating } from './StarRating';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

interface WishlistViewProps {
  wishlistBooks: Book[];
  onRemoveFromWishlist: (bookId: string) => void;
  onAddToCart: (book: Book) => void;
  onSelectBook: (book: Book) => void;
  onBrowseCatalog: () => void;
  onMoveAllToCart: () => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({
  wishlistBooks,
  onRemoveFromWishlist,
  onAddToCart,
  onSelectBook,
  onBrowseCatalog,
  onMoveAllToCart,
}) => {
  const totalValue = wishlistBooks.reduce((acc, b) => acc + b.price, 0);
  const inStockCount = wishlistBooks.filter((b) => b.stock > 0).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-rose-700 font-semibold tracking-wide">
            <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
            <span>Saved for Later</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 tracking-tight mt-1">
            My Wishlist
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            {wishlistBooks.length === 0
              ? 'Keep track of publications you want to read or purchase next'
              : `${wishlistBooks.length} ${wishlistBooks.length === 1 ? 'publication' : 'publications'} saved · Total Value: $${totalValue.toFixed(2)}`}
          </p>
        </div>

        {wishlistBooks.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={onBrowseCatalog}
              className="px-3.5 py-2 text-xs font-medium border border-neutral-300 hover:bg-neutral-100 text-neutral-700 rounded-lg transition-colors"
            >
              Continue Browsing
            </button>

            <button
              disabled={inStockCount === 0}
              onClick={onMoveAllToCart}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-neutral-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add All In-Stock to Cart ({inStockCount})</span>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {wishlistBooks.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-2xl p-14 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-xl font-bold text-neutral-900">
            Your Wishlist is Empty
          </h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
            Click the heart icon on any book card in our catalog to save titles for later review, price monitoring, or future orders.
          </p>
          <button
            onClick={onBrowseCatalog}
            className="mt-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs rounded-lg transition-colors shadow-2xs inline-flex items-center gap-2"
          >
            <span>Explore Bookstore Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistBooks.map((book) => {
            const isOutOfStock = book.stock <= 0;

            return (
              <div
                key={book.id}
                className="group bg-white border border-neutral-200/90 rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition-all relative"
              >
                {/* Wishlist Remove Badge / Heart Toggle */}
                <button
                  onClick={() => onRemoveFromWishlist(book.id)}
                  title="Remove from wishlist"
                  aria-label={`Remove ${book.title} from wishlist`}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-rose-50 text-rose-600 border border-neutral-200/80 shadow-xs transition-colors"
                >
                  <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
                </button>

                <div>
                  {/* Book Cover */}
                  <div
                    onClick={() => onSelectBook(book)}
                    className="cursor-pointer flex justify-center py-4 bg-neutral-50 rounded-lg border border-neutral-100 group-hover:bg-amber-50/20 transition-colors"
                  >
                    <BookCover book={book} size="md" />
                  </div>

                  {/* Clean Metadata & Star Rating */}
                  <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
                    <span className="truncate max-w-[130px]">{book.category}</span>
                    <span className="font-mono text-neutral-400">{book.year}</span>
                  </div>

                  <div className="mt-1.5">
                    <StarRating
                      rating={book.rating}
                      reviewsCount={book.reviewsCount}
                      size="sm"
                      showNumeric={true}
                    />
                  </div>

                  {/* Title & Author */}
                  <h3
                    onClick={() => onSelectBook(book)}
                    className="mt-1 font-serif text-base font-bold text-neutral-900 leading-snug line-clamp-2 cursor-pointer hover:text-amber-800 transition-colors"
                  >
                    {book.title}
                  </h3>

                  <p className="text-xs text-neutral-600 mt-1 line-clamp-1">
                    By {book.author}
                  </p>

                  <p className="text-xs text-neutral-500 mt-2 line-clamp-2 leading-relaxed">
                    {book.description}
                  </p>
                </div>

                {/* Footer: Price & Move to Cart */}
                <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold font-mono text-neutral-900 tabular-nums">
                        ${book.price.toFixed(2)}
                      </span>
                      {book.originalPrice && (
                        <span className="text-xs text-neutral-400 line-through font-mono tabular-nums">
                          ${book.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-neutral-500">
                      {isOutOfStock ? (
                        <span className="text-rose-600 font-medium">Out of stock</span>
                      ) : book.stock <= 5 ? (
                        <span className="text-amber-600">Only {book.stock} left</span>
                      ) : (
                        <span>{book.stock} in stock</span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onRemoveFromWishlist(book.id)}
                      className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 rounded-lg transition-colors"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      disabled={isOutOfStock}
                      onClick={() => onAddToCart(book)}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                        isOutOfStock
                          ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                          : 'bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-2xs'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Move to Cart</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
