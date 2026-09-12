import React from 'react';
import { FishItem } from '../../types';
import { Plus, Check, Sparkles } from 'lucide-react';

interface FishCardProps {
  fish: FishItem;
  onSelect: (fish: FishItem) => void;
  isSelected?: boolean;
}

export const FishCard: React.FC<FishCardProps> = ({
  fish,
  onSelect,
  isSelected = false,
}) => {
  return (
    <div
      onClick={() => onSelect(fish)}
      className={`group cursor-pointer rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col h-full bg-white ${
        isSelected
          ? 'ring-2 ring-brand-500 border-brand-500 shadow-soft-lg scale-[1.01]'
          : 'border-slate-200/80 hover:border-brand-300 hover:shadow-soft'
      }`}
    >
      {/* Image Container with Fallback */}
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
        <img
          src={fish.image}
          alt={fish.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // Fallback SVG placeholder if Unsplash image is blocked
            (e.target as HTMLImageElement).src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23e0f2fe"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%230284c7">🐟 ${encodeURIComponent(fish.name)}</text></svg>`;
          }}
        />
        
        {/* Availability / Badge Overlay */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {fish.badge && (
            <span className="bg-brand-900/90 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-400" />
              {fish.badge}
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <span className="bg-emerald-500/90 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-xs">
            In Stock
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-lg group-hover:text-brand-600 transition-colors leading-snug">
            {fish.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
            {fish.description}
          </p>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Price / kg (Demo)</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-slate-900">₹{fish.pricePerKg}</span>
              <span className="text-xs text-slate-500">/ {fish.unit}</span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(fish);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              isSelected
                ? 'bg-brand-600 text-white shadow-soft'
                : 'bg-brand-50 text-brand-700 hover:bg-brand-600 hover:text-white'
            }`}
          >
            {isSelected ? (
              <>
                <Check className="w-4 h-4" />
                <span>Selected</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Configure</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
