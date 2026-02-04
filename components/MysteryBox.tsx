
import React, { useState } from 'react';
import { RiddleNode } from '../types';
import { validateAnswer } from '../services/logicEngine';
import MapClue from './MapClue';

interface MysteryBoxProps {
  node: RiddleNode;
  onSuccess: () => void;
}

const MysteryBox: React.FC<MysteryBoxProps> = ({ node, onSuccess }) => {
  const [step, setStep] = useState<'HISTORY' | 'MATH' | 'MAP'>('HISTORY');
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState(false);

  const handleHistorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAnswer(userInput, node)) {
      setStep('MATH');
      setUserInput('');
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  const handleMathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(userInput) === node.mathResult) {
      setStep('MAP');
      setUserInput('');
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div className="relative w-full max-w-lg mx-auto p-12 rounded-sm parchment-bg gold-border shadow-[0_50px_100px_rgba(0,0,0,0.3)] overflow-hidden">
      <div className="absolute inset-0 texture-overlay opacity-10" />
      <div className="ornate-corner corner-tl opacity-50"></div>
      <div className="ornate-corner corner-tr opacity-50"></div>
      <div className="ornate-corner corner-bl opacity-50"></div>
      <div className="ornate-corner corner-br opacity-50"></div>
      
      <div className="relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-[11px] uppercase tracking-[0.6em] text-[#8b6508] mb-3 font-black">KADİM MÜHÜR #{node.order + 1}</h2>
          <h1 className="text-3xl font-serif-vintage italic text-stone-900 font-black">{node.title}</h1>
          <div className="w-20 h-1 bg-[#c5a059] mx-auto mt-4 rounded-full"></div>
        </div>
        
        {step === 'HISTORY' && (
          <form onSubmit={handleHistorySubmit} className="space-y-10 animate-in slide-in-from-bottom-6">
            <div className="bg-white/40 p-8 rounded-sm border border-[#c5a059]/10 shadow-inner">
               <p className="text-stone-700 text-center font-serif-vintage text-xl italic leading-relaxed">
                 &ldquo;{node.historyQuestion}&rdquo;
               </p>
            </div>
            <div className="space-y-4">
              <input
                type="number"
                autoFocus
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Yıl Giriniz..."
                className={`w-full bg-transparent border-b-4 ${error ? 'border-red-600 animate-shake' : 'border-[#c5a059]'} py-5 text-center text-4xl font-display text-[#8b6508] outline-none transition-all placeholder:text-stone-300 font-black`}
              />
              <p className="text-center text-[10px] text-stone-400 uppercase tracking-widest font-bold">Lütfen geçerli bir miladi yıl giriniz.</p>
            </div>
            <button type="submit" className="w-full bg-[#2c1e11] text-[#fcf4e0] font-display py-6 rounded-sm uppercase text-xs tracking-[0.4em] hover:bg-black transition-all font-black shadow-xl shine-effect">TARİHİ MÜHÜRLE</button>
          </form>
        )}

        {step === 'MATH' && (
          <form onSubmit={handleMathSubmit} className="space-y-10 animate-in slide-in-from-bottom-6">
            <div className="p-10 bg-[#fcf4e0] rounded-sm border-2 border-[#c5a059] shadow-inner relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">🧮</div>
               <p className="text-[#8b6508] font-display text-xs uppercase mb-4 tracking-[0.4em] text-center font-black">ZİHİNSEL ANAHTAR</p>
               <p className="text-stone-900 text-center font-serif-vintage italic text-xl leading-relaxed">"Tarihin gizli sayısal kodu: <span className="text-[#8b6508] font-black not-italic block mt-4 text-3xl tracking-widest">{node.mathLogic}</span>"</p>
            </div>
            <div className="space-y-4">
              <input
                type="number"
                autoFocus
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Sonuç..."
                className={`w-full bg-transparent border-b-4 ${error ? 'border-red-600 animate-shake' : 'border-[#c5a059]'} py-5 text-center text-4xl font-display text-[#8b6508] outline-none transition-all placeholder:text-stone-300 font-black`}
              />
            </div>
            <button type="submit" className="w-full bg-[#8b6508] text-white font-display py-6 rounded-sm uppercase text-xs tracking-[0.4em] hover:bg-black transition-all font-black shadow-xl">KODU DOĞRULA</button>
          </form>
        )}

        {step === 'MAP' && (
          <MapClue 
            imageUrl={node.mapImageUrl}
            targetZone={node.targetZone}
            hint={node.locationHint}
            onDiscover={onSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default MysteryBox;
