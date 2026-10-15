import React from 'react';
import { Book } from '../types/bookstore';

interface BookCoverProps {
  book: Book;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
}

export const BookCover: React.FC<BookCoverProps> = ({ book, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-16 h-22 text-[9px] p-1.5',
    md: 'w-36 h-48 text-[11px] p-3',
    lg: 'w-48 h-64 text-xs p-4',
    hero: 'w-56 h-76 text-sm p-5',
  };

  const { bg, text, accent, spine } = book.coverPalette;

  return (
    <div
      className={`relative rounded-r-md rounded-l-xs shadow-md overflow-hidden bg-gradient-to-br ${bg} text-stone-100 flex flex-col justify-between select-none transition-transform duration-300 group-hover:scale-[1.02] ${sizeClasses[size]} ${className}`}
      style={{
        boxShadow: '2px 4px 12px rgba(0, 0, 0, 0.28), inset 4px 0 6px rgba(0,0,0,0.35)',
      }}
    >
      {/* Book Spine Shadow / Crease */}
      <div className={`absolute top-0 bottom-0 left-0 w-2.5 ${spine} opacity-40 shadow-inner border-r border-white/10`} />
      <div className="absolute top-0 bottom-0 left-2.5 w-[1px] bg-white/15" />
      <div className="absolute top-0 bottom-0 left-3 w-[1px] bg-black/25" />

      {/* Decorative Foil Inset Frame */}
      <div className={`absolute inset-2 border ${accent} rounded-xs pointer-events-none opacity-80`} />

      {/* Top Header / Category Kicker */}
      <div className="relative pl-3.5 pt-1 z-10">
        <p className="text-[10px] uppercase tracking-widest text-stone-300/80 font-sans truncate">
          {book.publisher}
        </p>
      </div>

      {/* Middle: Title & Author */}
      <div className="relative pl-3.5 pr-1.5 py-2 z-10 my-auto text-left">
        <h4 className={`font-serif font-semibold leading-tight line-clamp-3 ${text} drop-shadow-sm`}>
          {book.title}
        </h4>
        <div className="w-6 h-[1.5px] bg-amber-400/60 my-2" />
        <p className="font-sans text-[11px] text-stone-200/90 tracking-wide line-clamp-1">
          {book.author}
        </p>
      </div>

      {/* Bottom: Year / ISBN hint */}
      <div className="relative pl-3.5 pb-1 z-10 flex items-center justify-between text-[9px] text-stone-400/80 font-mono">
        <span>{book.year}</span>
        <span className="truncate max-w-[65px]">{book.isbn.slice(-5)}</span>
      </div>

      {/* Textured Paper Lighting Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/25 via-transparent to-white/10 pointer-events-none" />
    </div>
  );
};
