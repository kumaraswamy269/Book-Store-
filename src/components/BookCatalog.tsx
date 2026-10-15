import React, { useState, useMemo } from 'react';
import { Book, BookCategory } from '../types/bookstore';
import { BookCover } from './BookCover';
import { StarRating } from './StarRating';
import { Search, SlidersHorizontal, Plus, Check, Heart, Star } from 'lucide-react';

interface BookCatalogProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
  onAddToCart: (book: Book) => void;
  cartItemIds: Set<string>;
  wishlistIds: Set<string>;
  onToggleWishlist: (bookId: string) => void;
}

const CATEGORIES: ('All' | BookCategory)[] = [
  'All',
  'Technology & Computing',
  'Fiction & Literature',
  'Philosophy & Thought',
  'Business & Economics',
  'Science & Nature',
  'Art & Architecture',
];

export const BookCatalog: React.FC<BookCatalogProps> = ({
  books,
  onSelectBook,
  onAddToCart,
  cartItemIds,
  wishlistIds,
  onToggleWishlist,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | BookCategory>('All');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'year'>('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !query ||
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          book.isbn.toLowerCase().includes(query) ||
          book.tags.some((t) => t.toLowerCase().includes(query));
        const matchesStock = !onlyInStock || book.stock > 0;
        const matchesRating = minRating === 0 || book.rating >= minRating;
        return matchesCategory && matchesSearch && matchesStock && matchesRating;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'year') return b.year - a.year;
        // featured default
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [books, selectedCategory, searchQuery, onlyInStock, minRating, sortBy]);

  const handleAddToCart = (book: Book) => {
    onAddToCart(book);
    setJustAddedId(book.id);
    setTimeout(() => {
      setJustAddedId(null);
    }, 1200);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="catalog-section">
      
      {/* Header and Controls */}
      <div className="space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-200 pb-5">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 tracking-tight">
              Curated Book Catalog
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              Showing {filteredBooks.length} of {books.length} publications in inventory
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, ISBN..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Categories Bar & Quick Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Segmented Category Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-100 rounded-lg border border-neutral-200/80">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-neutral-900 text-stone-100 shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Right Filters: In Stock & Sort */}
          <div className="flex items-center gap-3 self-end">
            <label className="flex items-center gap-2 text-xs font-medium text-neutral-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 border-neutral-300 focus:ring-amber-500"
              />
              <span>In Stock Only</span>
            </label>

            {/* Star Rating Filter */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <select
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value))}
                aria-label="Filter by minimum star rating"
                className="bg-white border border-neutral-300 rounded-md px-2 py-1.5 text-xs text-neutral-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value={0}>All Ratings</option>
                <option value={4.8}>★ 4.8 & above</option>
                <option value={4.5}>★ 4.5 & above</option>
                <option value={4.0}>★ 4.0 & above</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort books catalog by"
                className="bg-white border border-neutral-300 rounded-md px-2.5 py-1.5 text-xs text-neutral-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="year">Newest First</option>
              </select>
            </div>
          </div>

        </div>

      </div>

      {/* Catalog Grid */}
      {filteredBooks.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-white border border-neutral-200 rounded-xl mt-8">
          <p className="text-neutral-500 text-sm">
            No publications match your filter criteria "{searchQuery}".
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setMinRating(0);
              setOnlyInStock(false);
            }}
            className="px-4 py-2 text-xs font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-8">
          {filteredBooks.map((book) => {
            const isOutOfStock = book.stock <= 0;
            const isJustAdded = justAddedId === book.id;
            const inCart = cartItemIds.has(book.id);
            const isWishlisted = wishlistIds.has(book.id);

            return (
              <div
                key={book.id}
                className="group bg-white border border-neutral-200/90 rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition-all duration-200 relative"
              >
                {/* Heart Wishlist Toggle Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWishlist(book.id);
                  }}
                  title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                  aria-label={isWishlisted ? `Remove ${book.title} from wishlist` : `Add ${book.title} to wishlist`}
                  className={`absolute top-4 right-4 z-10 p-2 rounded-full border transition-all duration-200 ${
                    isWishlisted
                      ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-xs scale-105'
                      : 'bg-white/80 border-neutral-200/80 text-neutral-400 hover:text-rose-500 hover:bg-white hover:border-neutral-300'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isWishlisted ? 'fill-rose-600 scale-110' : 'hover:scale-110'
                    }`}
                  />
                </button>

                <div>
                  {/* Top Cover Showcase */}
                  <div
                    onClick={() => onSelectBook(book)}
                    className="cursor-pointer flex justify-center py-4 bg-neutral-50 rounded-lg border border-neutral-100 group-hover:bg-amber-50/30 transition-colors relative"
                  >
                    <BookCover book={book} size="md" />

                    {/* Quick View Overlay on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900/10 rounded-lg">
                      <span className="px-3 py-1.5 bg-neutral-900/90 text-stone-100 text-xs font-medium rounded-md shadow-xs backdrop-blur-xs">
                        View Details
                      </span>
                    </div>
                  </div>

                  {/* Clean unboxed metadata with dot separators */}
                  <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
                    <span className="truncate max-w-[140px]">{book.category}</span>
                    <span className="font-mono text-neutral-400">{book.year}</span>
                  </div>

                  {/* Star Rating Display (1-5 stars) */}
                  <div className="mt-2">
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
                    className="mt-2 font-serif text-lg font-bold text-neutral-900 leading-snug line-clamp-2 cursor-pointer hover:text-amber-800 transition-colors"
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

                {/* Bottom Row: Price & Actions */}
                <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <div className="flex flex-col">
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
                        <span>{book.stock} available</span>
                      )}
                    </span>
                  </div>

                  <button
                    disabled={isOutOfStock}
                    onClick={() => handleAddToCart(book)}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                      isOutOfStock
                        ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                        : isJustAdded
                        ? 'bg-emerald-600 text-white'
                        : inCart
                        ? 'bg-neutral-800 hover:bg-neutral-700 text-white'
                        : 'bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-2xs'
                    }`}
                  >
                    {isJustAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>{inCart ? 'Add More' : 'Add to Cart'}</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </section>
  );
};
