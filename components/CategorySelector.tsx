
import React, { useState } from 'react';
import { Era, MainTopic, SubTopic } from '../types';

interface CategorySelectorProps {
  eras: Era[];
  onSelect: (subTopicId: string) => void; // Final selection is a SubTopic (which behaves like a Category)
  onBack: () => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ eras, onSelect, onBack }) => {
  const [selectedEra, setSelectedEra] = useState<Era | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<MainTopic | null>(null);

  const handleBack = () => {
    if (selectedTopic) {
      setSelectedTopic(null);
    } else if (selectedEra) {
      setSelectedEra(null);
    } else {
      onBack();
    }
  };

  const renderEras = () => (
    <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {eras.sort((a, b) => a.order - b.order).map(era => (
        <button
          key={era.id}
          onClick={() => setSelectedEra(era)}
          className="group relative p-10 md:p-12 parchment-bg gold-border rounded-sm text-left hover:border-[#8b7d6b] transition-all overflow-hidden hover:scale-[1.02] shadow-xl"
        >
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 text-8xl transition-opacity pointer-events-none">🏛️</div>
          <h3 className="font-display text-2xl md:text-3xl text-[#8b7d6b] mb-5 tracking-[0.1em] font-black">{era.name.toUpperCase()}</h3>
          <p className="text-stone-600 text-lg italic leading-relaxed font-serif-vintage mb-10 font-bold">{era.description}</p>
          <div className="flex justify-between items-center pt-8 border-t-2 border-[#8b7d6b]/20">
            <span className="text-[11px] text-stone-500 uppercase tracking-[0.4em] font-black">{era.topics.length} DÖNEM</span>
            <span className="text-[#8b7d6b] text-xs font-display font-black group-hover:translate-x-4 transition-transform tracking-widest">İNCELE →</span>
          </div>
        </button>
      ))}
    </div>
  );

  const renderTopics = () => (
    <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-right-4 duration-500">
      {selectedEra?.topics.sort((a, b) => a.order - b.order).map(topic => (
        <button
          key={topic.id}
          onClick={() => setSelectedTopic(topic)}
          className="group relative p-8 md:p-10 bg-white/80 border border-[#8b7d6b]/40 rounded-sm text-left hover:border-[#8b7d6b] transition-all hover:bg-white shadow-lg"
        >
          <h3 className="font-display text-xl md:text-2xl text-[#8b7d6b] mb-3 tracking-[0.1em] font-black">{topic.name.toUpperCase()}</h3>
          <p className="text-stone-600 text-sm leading-relaxed font-serif-vintage mb-6">{topic.description}</p>
          <div className="flex justify-between items-center pt-6 border-t border-[#8b7d6b]/10">
            <span className="text-[10px] text-stone-400 uppercase tracking-[0.2em] font-bold">{topic.subTopics.length} Alt Başlık</span>
            <span className="text-[#8b7d6b] text-[10px] font-display font-bold group-hover:translate-x-2 transition-transform tracking-wider">SEÇ →</span>
          </div>
        </button>
      ))}
    </div>
  );

  const renderSubTopics = () => (
    <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
      {selectedTopic?.subTopics.map(sub => (
        <button
          key={sub.id}
          onClick={() => onSelect(sub.id)}
          className="group relative p-6 bg-[#2c1e11] text-[#dcdcd7] border-2 border-[#8b6508] rounded-sm text-center hover:bg-[#3d2b1a] transition-all hover:scale-105 shadow-xl flex flex-col items-center justify-center min-h-[160px]"
        >
          <span className="text-3xl mb-3 opacity-50 group-hover:opacity-100 transition-opacity">📜</span>
          <h3 className="font-display text-lg tracking-widest font-black uppercase mb-2">{sub.name}</h3>
          <span className="text-[9px] text-[#8b6508] uppercase tracking-[0.2em] font-bold mt-auto">{sub.nodes.length} SORU</span>
        </button>
      ))}
    </div>
  );

  const getTitle = () => {
    if (selectedTopic) return selectedTopic.name.toUpperCase();
    if (selectedEra) return selectedEra.name.toUpperCase();
    return "DÖNEM ARŞİVLERİ";
  };

  const getSubtitle = () => {
    if (selectedTopic) return "İlgilendiğiniz alt başlığı seçin.";
    if (selectedEra) return "Keşfetmek istediğiniz konuyu seçin.";
    return "Keşfetmek istediğiniz şanlı devri seçiniz, muhafız.";
  };

  return (
    <div className="fixed inset-0 z-[70] bg-[#dcdcd7]/98 overflow-y-auto">
      <div className="min-h-full flex flex-col items-center justify-start py-20 px-8">

        {/* Header */}
        <div className="mb-16 text-center space-y-4 max-w-2xl animate-in fade-in duration-700">
          <h1 className="font-display text-3xl md:text-5xl text-[#8b7d6b] tracking-[0.3em] font-black uppercase drop-shadow-sm">{getTitle()}</h1>
          <div className="w-32 h-1.5 bg-[#8b7d6b] mx-auto rounded-full shadow-sm"></div>
          <p className="text-stone-600 font-serif-vintage italic text-xl mt-4 font-black">{getSubtitle()}</p>
        </div>

        {/* Content */}
        {!selectedEra && renderEras()}
        {selectedEra && !selectedTopic && renderTopics()}
        {selectedEra && selectedTopic && renderSubTopics()}

        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mt-20 px-12 py-4 border-2 border-[#8b7d6b] text-[#8b7d6b] font-display text-[11px] tracking-[0.6em] uppercase hover:bg-black hover:text-white font-black shadow-lg transition-all"
        >
          ← {selectedEra ? "GERİ DÖN" : "ANA MENÜ"}
        </button>
      </div>
    </div>
  );
};

export default CategorySelector;
