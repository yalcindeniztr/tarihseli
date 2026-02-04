
import React from 'react';
import { Category } from '../types';

interface CategorySelectorProps {
  categories: Category[];
  onSelect: (catId: string) => void;
  onBack: () => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ categories, onSelect, onBack }) => {
  return (
    <div className="fixed inset-0 z-[70] bg-[#dcdcd7]/98 overflow-y-auto">
      <div className="min-h-full flex flex-col items-center justify-start py-20 px-8">
        <div className="mb-16 text-center space-y-4 max-w-2xl">
          <h1 className="font-display text-3xl md:text-5xl text-[#8b7d6b] tracking-[0.3em] font-black uppercase drop-shadow-sm">DÖNEM ARŞİVLERİ</h1>
          <div className="w-32 h-1.5 bg-[#8b7d6b] mx-auto rounded-full shadow-sm"></div>
          <p className="text-stone-600 font-serif-vintage italic text-xl mt-4 font-black">Keşfetmek istediğiniz şanlı devri seçiniz, muhafız.</p>
        </div>

        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-10">
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className="group relative p-10 md:p-12 parchment-bg gold-border rounded-sm text-left hover:border-[#8b7d6b] transition-all overflow-hidden hover:scale-[1.02] shadow-xl"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 text-8xl transition-opacity pointer-events-none">🏛️</div>
              <h3 className="font-display text-2xl md:text-3xl text-[#8b7d6b] mb-5 tracking-[0.1em] font-black">{cat.name.toUpperCase()}</h3>
              <p className="text-stone-600 text-lg italic leading-relaxed font-serif-vintage mb-10 font-bold">{cat.description}</p>
              <div className="flex justify-between items-center pt-8 border-t-2 border-[#8b7d6b]/20">
                <span className="text-[11px] text-stone-500 uppercase tracking-[0.4em] font-black">{cat.nodes.length} KADİM MÜHÜR</span>
                <span className="text-[#8b7d6b] text-xs font-display font-black group-hover:translate-x-4 transition-transform tracking-widest">ARŞİVİ AÇ →</span>
              </div>
            </button>
          ))}
        </div>

        <button 
          onClick={onBack}
          className="mt-20 px-12 py-4 border-2 border-[#8b7d6b] text-[#8b7d6b] font-display text-[11px] tracking-[0.6em] uppercase hover:bg-black hover:text-white font-black shadow-lg transition-all"
        >
          ← SEÇİME DÖN
        </button>
      </div>
    </div>
  );
};

export default CategorySelector;
