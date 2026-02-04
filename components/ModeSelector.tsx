
import React, { useState } from 'react';
import { GameMode } from '../types';

interface ModeSelectorProps {
  onComplete: (mode: GameMode, names: string[]) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ onComplete }) => {
  const [mode, setMode] = useState<GameMode | null>(null);
  const [names, setNames] = useState<string[]>(['', '']);

  const handleFinish = () => {
    if (mode === 'SOLO' && names[0]) {
      onComplete('SOLO', [names[0]]);
    } else if (mode === 'DUEL' && names[0] && names[1]) {
      onComplete('DUEL', [names[0], names[1]]);
    }
  };

  return (
    <div className="w-full flex items-center justify-center p-2">
      <div className="w-full max-w-xl p-10 parchment-bg relative rounded-sm border-[4px] border-double border-[#8b6508] animate-in zoom-in duration-500 shadow-2xl">
        <div className="texture-overlay" />
        <div className="ornate-corner corner-tl border-[#8b6508] opacity-40"></div>
        <div className="ornate-corner corner-tr border-[#8b6508] opacity-40"></div>
        <div className="ornate-corner corner-bl border-[#8b6508] opacity-40"></div>
        <div className="ornate-corner corner-br border-[#8b6508] opacity-40"></div>

        <div className="text-center space-y-8 relative z-10">
          {!mode ? (
            <>
              <div className="space-y-2">
                <h1 className="font-display text-3xl text-[#2c1e11] tracking-[0.2em] font-black">YOLCULUK PLANI</h1>
                <p className="text-[#8b6508] text-[9px] uppercase tracking-[0.5em] font-extrabold">MUHAFIZ ARŞİVİNE KAYDOLUN</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                <button 
                  onClick={() => setMode('SOLO')} 
                  className="group p-8 border-2 border-[#8b6508]/30 hover:border-[#8b6508] transition-all rounded-lg bg-white/40 shadow-lg hover:shadow-xl flex flex-col items-center"
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform drop-shadow-md">🧭</div>
                  <h2 className="font-display text-lg text-[#2c1e11] tracking-widest font-black uppercase">TEKLİ KEŞİF</h2>
                  <p className="text-[7px] text-[#2c1e11]/60 mt-2 uppercase tracking-widest font-bold">BİREYSEL ARAŞTIRMA</p>
                </button>
                
                <button 
                  onClick={() => setMode('DUEL')} 
                  className="group p-8 border-2 border-[#8b6508]/30 hover:border-[#8b6508] transition-all rounded-lg bg-white/40 shadow-lg hover:shadow-xl flex flex-col items-center"
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform drop-shadow-md">⚔️</div>
                  <h2 className="font-display text-lg text-[#2c1e11] tracking-widest font-black uppercase">DÜELLO</h2>
                  <p className="text-[7px] text-[#2c1e11]/60 mt-2 uppercase tracking-widest font-bold">TAKIM REKABETİ</p>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <h1 className="font-display text-2xl text-[#2c1e11] tracking-widest font-black uppercase">İSİM ARŞİVİ</h1>
                <p className="text-[#8b6508] text-[9px] uppercase tracking-[0.5em] font-bold">KADİM KAYITLAR HAZIRLANIYOR</p>
              </div>

              <div className="space-y-6 max-w-sm mx-auto">
                <div className="relative">
                  <input 
                    type="text" 
                    autoFocus
                    placeholder={mode === 'SOLO' ? "Muhafız İsmi..." : "1. Takım İsmi..."}
                    className="w-full bg-white/60 border-b-4 border-[#8b6508] p-4 outline-none text-[#2c1e11] font-display text-lg placeholder:text-stone-300 focus:bg-white/80 transition-all shadow-inner font-black"
                    value={names[0]}
                    onChange={e => setNames([e.target.value, names[1]])}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl opacity-20">📜</span>
                </div>
                
                {mode === 'DUEL' && (
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="2. Takım İsmi..."
                      className="w-full bg-white/60 border-b-4 border-[#8b6508] p-4 outline-none text-[#2c1e11] font-display text-lg placeholder:text-stone-300 focus:bg-white/80 transition-all shadow-inner font-black"
                      value={names[1]}
                      onChange={e => setNames([names[0], e.target.value])}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl opacity-20">⚔️</span>
                  </div>
                )}
                
                <div className="pt-4 space-y-4">
                  <button 
                    onClick={handleFinish}
                    className={`w-full py-5 bg-[#2c1e11] text-stone-100 font-display text-sm tracking-[0.3em] font-black shadow-2xl hover:bg-black transition-all hover:scale-105 active:scale-95 ${(mode === 'SOLO' ? !names[0] : (!names[0] || !names[1])) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={(mode === 'SOLO' ? !names[0] : (!names[0] || !names[1]))}
                  >
                    MÜHRÜ BAS VE BAŞLAT
                  </button>
                  <button 
                    onClick={() => setMode(null)} 
                    className="text-[10px] text-stone-500 hover:text-[#2c1e11] uppercase tracking-[0.4em] font-black transition-colors"
                  >
                    ← SEÇİMİ DEĞİŞTİR
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModeSelector;
