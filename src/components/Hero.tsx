import React from 'react';
import { Book } from '../types/bookstore';
import { BookCover } from './BookCover';
import { StarRating } from './StarRating';
import { ArrowRight, Sparkles, BookOpen, Truck, ShieldCheck, Heart } from 'lucide-react';

interface HeroProps {
  featuredBook: Book;
  onExploreCatalog: () => void;
  onSelectBook: (book: Book) => void;
  onAddToCart: (book: Book) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (bookId: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  featuredBook,
  onExploreCatalog,
  onSelectBook,
  onAddToCart,
  isWishlisted = false,
  onToggleWishlist,
}) => {
  return (
    <section className="bg-neutral-900 text-stone-100 py-12 md:py-16 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Editorial Headline & Value */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="flex items-center gap-2 text-xs text-amber-400 font-medium tracking-wide">
              <span>Independent Editorial Curation</span>
              <span aria-hidden="true">·</span>
              <span>Curated Literary & Academic Library</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-100 leading-tight tracking-tight">
              A refined library for curious minds and software craft.
            </h1>

            <p className="text-base text-stone-300 max-w-xl leading-relaxed">
              Explore essential editions across systems engineering, literature, philosophy, and architectural thought. Complete with integrated order fulfillment, real-time inventory tracking, and multi-channel payment verification.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onExploreCatalog}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                <span>Browse Full Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onSelectBook(featuredBook)}
                className="px-5 py-3 border border-neutral-700 hover:border-neutral-500 text-stone-200 text-sm font-medium rounded-lg transition-colors"
              >
                View Spotlight Title
              </button>
            </div>

            {/* Proof Points & Values (Adherent to Anti-slop: clean text, no colored pills) */}
            <div className="pt-6 border-t border-neutral-800/80 grid grid-cols-3 gap-4 text-xs text-stone-400">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Verified Editions & ISBNs</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Express Dispatch Available</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Secure Payments Gateway</span>
              </div>
            </div>

          </div>

          {/* Right Column: Featured Spotlight Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="p-6 bg-neutral-950/70 border border-neutral-800 rounded-xl shadow-xl max-w-md w-full">
              
              <div className="flex items-center justify-between text-xs text-stone-400 pb-3 border-b border-neutral-800">
                <span className="flex items-center gap-1.5 text-amber-300 font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  Editor's Choice
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-stone-400">In Stock: {featuredBook.stock} units</span>
                  {onToggleWishlist && (
                    <button
                      type="button"
                      onClick={() => onToggleWishlist(featuredBook.id)}
                      title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                      className={`p-1.5 rounded-full border transition-colors ${
                        isWishlisted
                          ? 'bg-rose-950/60 border-rose-500 text-rose-400'
                          : 'bg-neutral-900 border-neutral-700 text-stone-400 hover:text-rose-400 hover:border-neutral-600'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 flex gap-5 items-start">
                <div 
                  className="cursor-pointer shrink-0"
                  onClick={() => onSelectBook(featuredBook)}
                >
                  <BookCover book={featuredBook} size="md" />
                </div>

                <div className="space-y-2 text-left">
                  <span className="text-[11px] text-amber-400 font-sans tracking-wide">
                    {featuredBook.category}
                  </span>
                  <h3 
                    onClick={() => onSelectBook(featuredBook)}
                    className="font-serif text-lg font-bold text-stone-100 line-clamp-2 hover:text-amber-200 cursor-pointer transition-colors"
                  >
                    {featuredBook.title}
                  </h3>
                  <p className="text-xs text-stone-400">
                    By {featuredBook.author}
                  </p>
                  
                  <div className="pt-0.5">
                    <StarRating
                      rating={featuredBook.rating}
                      reviewsCount={featuredBook.reviewsCount}
                      size="xs"
                      showNumeric={true}
                    />
                  </div>
                  
                  <div className="pt-1 flex items-baseline gap-2">
                    <span className="text-xl font-bold font-mono text-stone-100 tabular-nums">
                      ${featuredBook.price.toFixed(2)}
                    </span>
                    {featuredBook.originalPrice && (
                      <span className="text-xs text-stone-500 line-through font-mono tabular-nums">
                        ${featuredBook.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-400 line-clamp-2 pt-1">
                    {featuredBook.description}
                  </p>

                  <div className="pt-3 flex gap-2">
                    <button
                      onClick={() => onAddToCart(featuredBook)}
                      className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-semibold rounded-md transition-colors whitespace-nowrap"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => onSelectBook(featuredBook)}
                      className="px-3 py-1.5 border border-neutral-700 hover:border-neutral-600 text-stone-300 text-xs font-medium rounded-md transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
