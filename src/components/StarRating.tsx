import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 1 to 5 stars
  maxStars?: number;
  reviewsCount?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showNumeric?: boolean;
  interactive?: boolean;
  onRate?: (newRating: number) => void;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  reviewsCount,
  size = 'sm',
  showNumeric = true,
  interactive = false,
  onRate,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizes = {
    xs: 'text-[10px]',
    sm: 'text-xs',
    md: 'text-xs',
    lg: 'text-sm',
  };

  const currentVal = hoverRating !== null ? hoverRating : rating;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {/* 5-Star Row */}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxStars }).map((_, index) => {
          const starNumber = index + 1;
          const isFilled = currentVal >= starNumber;
          const isPartiallyFilled = !isFilled && currentVal > index && currentVal < starNumber;

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRate && onRate(starNumber)}
              onMouseEnter={() => interactive && setHoverRating(starNumber)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              className={`relative ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
              aria-label={`${starNumber} star rating`}
            >
              <Star
                className={`${starSizes[size]} text-amber-400 ${
                  isFilled
                    ? 'fill-amber-400'
                    : isPartiallyFilled
                    ? 'fill-amber-400/50'
                    : 'text-neutral-300 fill-neutral-100'
                } transition-colors`}
              />
            </button>
          );
        })}
      </div>

      {/* Numeric rating label (1.0 to 5.0) */}
      {showNumeric && (
        <span className={`font-mono font-semibold text-neutral-800 tabular-nums ${textSizes[size]}`}>
          {rating.toFixed(1)}
        </span>
      )}

      {/* Reviews count */}
      {reviewsCount !== undefined && (
        <span className={`font-sans text-neutral-400 ${textSizes[size]}`}>
          ({reviewsCount})
        </span>
      )}
    </div>
  );
};
