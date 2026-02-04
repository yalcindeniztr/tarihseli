
import React, { useState } from 'react';

interface PasswordGateProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const PasswordGate: React.FC<PasswordGateProps> = ({ onSuccess, onCancel }) => {
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // YÖNETİCİ ŞİFRESİ: tarih123
    if (pass === 'tarih123') { 
      onSuccess();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-[#dcdcd7]/95 flex items-center justify-center p-6 backdrop-blur-md">
      <div className="w-full max-w-sm p-12 parchment-bg gold-border rounded-lg shadow-2xl text-center relative overflow-hidden">
        <div className="absolute inset-0 texture-overlay opacity-10"></div>
        <div className="ornate-corner corner-tl opacity-50"></div>
        <div className="ornate-corner corner-tr opacity-50"></div>
        <div className="ornate-corner corner-bl opacity-50"></div>
        <div className="ornate-corner corner-br opacity-50"></div>
        
        <div className="mb-10 relative z-10 animate-float">
          <span className="text-6xl drop-shadow-sm">🏛️</span>
        </div>
        <h2 className="font-display text-2xl text-[#8b7d6b] mb-12 uppercase tracking-[0.3em] font-black">Arşiv Girişi</h2>
        
        <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
          <div className="relative">
            <input 
              type="password"
              autoFocus
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="GİRİŞ ANAHTARI"
              className={`w-full bg-transparent border-b-4 ${error ? 'border-red-600 animate-shake' : 'border-[#8b7d6b]'} p-4 text-center text-[#8b7d6b] outline-none font-display text-xl tracking-widest transition-colors focus:border-[#706357] placeholder:text-stone-400 font-black`}
            />
          </div>
          <div className="flex gap-4">
            <button type="button" onClick={onCancel} className="flex-1 py-4 text-stone-500 text-[10px] uppercase font-display tracking-widest font-black hover:text-black transition-colors">GERİ DÖN</button>
            <button type="submit" className="flex-1 py-4 bg-[#8b7d6b] text-[#dcdcd7] text-[10px] uppercase font-display tracking-widest rounded shadow-xl hover:bg-black transition-all font-black">ERİŞİMİ AÇ</button>
          </div>
          <p className="text-[9px] text-stone-400 uppercase tracking-widest mt-8 italic font-extrabold">Yalnızca Kadim Koruyucular</p>
        </form>
      </div>
    </div>
  );
};

export default PasswordGate;
