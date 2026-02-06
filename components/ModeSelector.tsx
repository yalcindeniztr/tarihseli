
import React, { useState } from 'react';
import { GameMode } from '../types';

interface ModeSelectorProps {
  onComplete: (mode: GameMode, names: string[], pin: string) => void;
  onBack?: () => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ onComplete, onBack }) => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleFinish = () => {
    if (name.trim() && pin.length >= 6) {
      onComplete('SOLO', [name.trim()], pin.trim());
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
          <div className="space-y-2">
            <h1 className="font-display text-2xl text-[#2c1e11] tracking-widest font-black uppercase">İSİM ARŞİVİ</h1>
            <p className="text-[#8b6508] text-[9px] uppercase tracking-[0.5em] font-bold">KADİM KAYITLAR VE MÜHÜR OLUŞTURMA</p>
          </div>

          <div className="space-y-6 max-w-sm mx-auto">
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  placeholder="Muhafız İsmi..."
                  className="w-full bg-white/60 border-b-4 border-[#8b6508] p-4 outline-none text-[#2c1e11] font-display text-lg placeholder:text-stone-300 focus:bg-white/80 transition-all shadow-inner font-black uppercase"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl opacity-20">📜</span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="GİZLİ MÜHÜR (PIN)"
                  className="w-full bg-white/60 border-b-4 border-[#8b6508] p-4 outline-none text-[#2c1e11] font-display text-lg placeholder:text-stone-300 focus:bg-white/80 transition-all shadow-inner font-black uppercase tracking-[0.3em]"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl opacity-20">🔒</span>
                <p className="text-[9px] text-[#8b6508]/80 text-right mt-1 font-bold">EN AZ 6 KARAKTER (HARF/RAKAM)</p>
              </div>

              {/* Terms of Service Checkbox */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={e => setAcceptedTerms(e.target.checked)}
                  className="w-5 h-5 accent-[#8b6508] cursor-pointer"
                />
                <label htmlFor="terms" className="text-[10px] font-bold text-[#2c1e11] uppercase tracking-wider cursor-pointer select-none">
                  <span className="underline hover:text-[#8b6508]" onClick={(e) => { e.preventDefault(); setAcceptedTerms(!acceptedTerms); }}>KULLANIM ŞARTLARINI</span> OKUDUM, ANLADIM VE ONAYLIYORUM.
                </label>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <button
                onClick={handleFinish}
                className={`w-full py-5 bg-[#2c1e11] text-stone-100 font-display text-sm tracking-[0.3em] font-black shadow-2xl hover:bg-black transition-all hover:scale-105 active:scale-95 ${(!name.trim() || pin.length < 6 || !acceptedTerms) ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!name.trim() || pin.length < 6 || !acceptedTerms}
              >
                MÜHRÜ BAS VE BAŞLAT
              </button>

              {onBack && (
                <button
                  onClick={onBack}
                  className="w-full py-4 text-[#8b6508] font-display text-[10px] tracking-[0.4em] font-black uppercase hover:bg-[#8b6508]/10 transition-all border border-[#8b6508]/20"
                >
                  ← GERİ DÖN
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeSelector;
