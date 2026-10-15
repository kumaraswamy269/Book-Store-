import React, { useState, useEffect } from 'react';
import { Book, BookReview, User } from '../types/bookstore';
import { BookCover } from './BookCover';
import { StarRating } from './StarRating';
import { 
  X, 
  Check, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  Heart, 
  ThumbsUp, 
  MessageSquare, 
  PenTool, 
  Star,
  CheckCircle2
} from 'lucide-react';
import { getBookReviews, saveBookReview, voteReviewHelpful, getCurrentUser } from '../services/storageService';

interface BookDetailModalProps {
  book: Book | null;
  onClose: () => void;
  onAddToCart: (book: Book, quantity: number) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (bookId: string) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  onClose,
  onAddToCart,
  isWishlisted = false,
  onToggleWishlist,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  // Reviews state
  const [reviews, setReviews] = useState<BookReview[]>([]);
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    if (book) {
      setReviews(getBookReviews(book.id));
      setIsWritingReview(false);
      setReviewSuccess(false);
      setQuantity(1);
    }
  }, [book]);

  if (!book) return null;

  const isOutOfStock = book.stock <= 0;

  const handleAdd = () => {
    if (isOutOfStock) return;
    onAddToCart(book, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewComment.trim()) return;

    const user = getCurrentUser();
    const newRev: BookReview = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      bookId: book.id,
      userId: user.id,
      userName: user.name,
      rating: reviewRating,
      title: reviewTitle.trim(),
      comment: reviewComment.trim(),
      createdAt: new Date().toISOString(),
      verifiedPurchase: true,
      helpfulCount: 0,
    };

    saveBookReview(newRev);
    setReviews(getBookReviews(book.id));
    setReviewSuccess(true);
    setReviewTitle('');
    setReviewComment('');
    setTimeout(() => {
      setIsWritingReview(false);
      setReviewSuccess(false);
    }, 1800);
  };

  const handleVoteHelpful = (revId: string) => {
    voteReviewHelpful(revId);
    setReviews(getBookReviews(book.id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-200 z-10">
        
        {/* Header with Close & Wishlist */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-xs border-b border-neutral-100 px-6 py-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="font-medium text-neutral-800">{book.category}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">ISBN: {book.isbn}</span>
          </div>

          <div className="flex items-center gap-2">
            {onToggleWishlist && (
              <button
                type="button"
                onClick={() => onToggleWishlist(book.id)}
                title={isWishlisted ? 'Saved in wishlist' : 'Save to wishlist'}
                className={`p-2 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer ${
                  isWishlisted
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:text-rose-500 hover:bg-neutral-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
                <span className="hidden sm:inline">{isWishlisted ? 'Saved' : 'Wishlist'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Cover Display */}
          <div className="md:col-span-5 flex flex-col items-center justify-start bg-neutral-50 p-6 rounded-2xl border border-neutral-100">
            <BookCover book={book} size="lg" />

            <div className="mt-5 w-full space-y-2 text-xs text-neutral-600 border-t border-neutral-200/80 pt-4 font-sans">
              <div className="flex justify-between py-1">
                <span className="text-neutral-400">Publisher:</span>
                <span className="font-medium text-neutral-800">{book.publisher}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-400">Publication Year:</span>
                <span className="font-mono text-neutral-800">{book.year}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-400">Print Length:</span>
                <span className="font-mono text-neutral-800">{book.pages} pages</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-400">Language:</span>
                <span className="font-medium text-neutral-800">{book.language}</span>
              </div>
            </div>
          </div>

          {/* Details & Community Reviews Tabs */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div className="space-y-4">
              
              <div>
                <h2 className="text-2xl font-serif font-bold text-neutral-900 leading-tight">
                  {book.title}
                </h2>
                <p className="text-sm font-medium text-amber-800 mt-1">
                  By {book.author}
                </p>
              </div>

              {/* Rating & Stock */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <StarRating
                  rating={book.rating}
                  reviewsCount={book.reviewsCount}
                  size="md"
                  showNumeric={true}
                />
                <span aria-hidden="true" className="text-neutral-300">·</span>
                <span className={`font-mono font-medium ${isOutOfStock ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {isOutOfStock ? 'Out of stock' : `${book.stock} units available in warehouse`}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-3xl font-bold font-mono text-neutral-900 tabular-nums">
                  ${book.price.toFixed(2)}
                </span>
                {book.originalPrice && (
                  <span className="text-sm text-neutral-400 line-through font-mono tabular-nums">
                    ${book.originalPrice.toFixed(2)}
                  </span>
                )}
                {book.originalPrice && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Save ${(book.originalPrice - book.price).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Sub-tabs: Details vs Reviews */}
              <div className="flex border-b border-neutral-200 pt-2 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'details'
                      ? 'border-neutral-900 text-neutral-900 font-bold'
                      : 'border-transparent text-neutral-400 hover:text-neutral-700'
                  }`}
                >
                  Overview & Synopsis
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'reviews'
                      ? 'border-neutral-900 text-neutral-900 font-bold'
                      : 'border-transparent text-neutral-400 hover:text-neutral-700'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                  <span>Reader Reviews ({reviews.length})</span>
                </button>
              </div>

              {/* TAB 1: DETAILS */}
              {activeTab === 'details' && (
                <div className="space-y-3">
                  <p className="text-xs text-neutral-700 leading-relaxed">
                    {book.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 text-[11px] text-neutral-600 pt-1">
                    {book.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 bg-neutral-100 rounded-md text-neutral-700 font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: REVIEWS */}
              {activeTab === 'reviews' && (
                <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                  
                  {/* Write a Review Button / Form */}
                  {!isWritingReview ? (
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                      <span className="text-xs text-neutral-500 font-medium">
                        Verified community feedback
                      </span>
                      <button
                        onClick={() => setIsWritingReview(true)}
                        className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <PenTool className="w-3 h-3" />
                        <span>Write a Review</span>
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleReviewSubmit} className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-neutral-900">Share Your Reader Thoughts</span>
                        <button
                          type="button"
                          onClick={() => setIsWritingReview(false)}
                          className="text-neutral-400 hover:text-neutral-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {reviewSuccess && (
                        <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Review submitted! Thank you for supporting the literary community.</span>
                        </div>
                      )}

                      {/* Star selector */}
                      <div className="flex items-center gap-1">
                        <span className="text-neutral-600 mr-2">Your Rating:</span>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setReviewRating(s)}
                            className="p-0.5 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star className={`w-4 h-4 ${s <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`} />
                          </button>
                        ))}
                      </div>

                      <input
                        type="text"
                        required
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        placeholder="Review headline (e.g. Masterful explanations)"
                        className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs"
                      />

                      <textarea
                        rows={2}
                        required
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="What did you love about this book? How did it help your study or leisure?"
                        className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs"
                      />

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsWritingReview(false)}
                          className="px-2.5 py-1 text-neutral-600 hover:bg-neutral-200 rounded text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 bg-neutral-900 text-white rounded text-xs font-semibold hover:bg-neutral-800"
                        >
                          Post Review
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Reviews List */}
                  {reviews.length === 0 ? (
                    <p className="text-xs text-neutral-400 italic py-4 text-center">
                      No customer reviews yet. Be the first to share your thoughts!
                    </p>
                  ) : (
                    reviews.map((rev) => (
                      <div key={rev.id} className="p-3 bg-neutral-50/80 rounded-xl border border-neutral-100 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-neutral-900">{rev.userName}</span>
                            {rev.verifiedPurchase && (
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium border border-emerald-200">
                                Verified Purchase
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-amber-500 font-mono text-[11px]">
                          {'★'.repeat(rev.rating)}
                          <strong className="text-neutral-800 ml-1 font-sans">{rev.title}</strong>
                        </div>

                        <p className="text-neutral-600 text-[11px] leading-relaxed">
                          {rev.comment}
                        </p>

                        <div className="pt-1 flex items-center justify-end">
                          <button
                            onClick={() => handleVoteHelpful(rev.id)}
                            className="text-[10px] text-neutral-500 hover:text-neutral-800 flex items-center gap-1 cursor-pointer font-mono"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>Helpful ({rev.helpfulCount})</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}

                </div>
              )}

            </div>

            {/* Purchase Action Box */}
            <div className="mt-8 pt-6 border-t border-neutral-200 space-y-4">
              
              <div className="flex items-center gap-4">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-neutral-300 rounded-xl overflow-hidden bg-white">
                  <button
                    disabled={quantity <= 1 || isOutOfStock}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 transition-colors font-mono cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-sm font-semibold font-mono text-neutral-900 min-w-[36px] text-center">
                    {quantity}
                  </span>
                  <button
                    disabled={quantity >= book.stock || isOutOfStock}
                    onClick={() => setQuantity((q) => Math.min(book.stock, q + 1))}
                    className="px-3 py-2 text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 transition-colors font-mono cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart CTA */}
                <button
                  disabled={isOutOfStock}
                  onClick={handleAdd}
                  className={`flex-1 py-3 px-5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    isOutOfStock
                      ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                      : added
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-xs'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Shopping Cart</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add {quantity} to Cart · ${(book.price * quantity).toFixed(2)}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-2 gap-3 text-[11px] text-neutral-500 pt-1">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Next-day packaging dispatch</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Authentic publisher guaranteed</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
