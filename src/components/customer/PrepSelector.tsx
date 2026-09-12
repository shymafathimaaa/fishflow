import React from 'react';
import { PreparationType } from '../../types';
import { Scissors, Sparkles, Check, Package } from 'lucide-react';

interface PrepSelectorProps {
  selectedPrep: PreparationType;
  onChange: (prep: PreparationType) => void;
}

export const PrepSelector: React.FC<PrepSelectorProps> = ({
  selectedPrep,
  onChange,
}) => {
  const options: { type: PreparationType; title: string; desc: string; icon: React.ReactNode }[] = [
    {
      type: 'Whole',
      title: 'Whole Fish',
      desc: 'Intact fish, uncleaned. Best if cleaning yourself.',
      icon: <Package className="w-5 h-5" />,
    },
    {
      type: 'Cut',
      title: 'Cut into Slices',
      desc: 'Chopped into steaks/curry pieces without descaling.',
      icon: <Scissors className="w-5 h-5" />,
    },
    {
      type: 'Cleaned',
      title: 'Descaled & Cleaned',
      desc: 'Guts, gills, and scales removed. Left whole.',
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      type: 'Cut + Cleaned',
      title: 'Cut + Fully Cleaned',
      desc: 'Descaled, gutted, and sliced. Ready to marinate!',
      icon: <Scissors className="w-5 h-5 text-teal-500" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((opt) => {
        const isSelected = selectedPrep === opt.type;
        return (
          <div
            key={opt.type}
            onClick={() => onChange(opt.type)}
            className={`cursor-pointer p-4 rounded-xl border transition-all flex items-start gap-3 relative ${
              isSelected
                ? 'bg-brand-50/80 border-brand-500 ring-2 ring-brand-500/20 shadow-xs'
                : 'bg-white border-slate-200 hover:border-brand-200 hover:bg-slate-50/50'
            }`}
          >
            <div
              className={`p-2.5 rounded-lg shrink-0 ${
                isSelected ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {opt.icon}
            </div>
            
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-1.5">
                <span className={`font-bold text-sm ${isSelected ? 'text-brand-900' : 'text-slate-900'}`}>
                  {opt.title}
                </span>
                {opt.type === 'Cut + Cleaned' && (
                  <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    Popular
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">{opt.desc}</p>
            </div>

            {isSelected && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
