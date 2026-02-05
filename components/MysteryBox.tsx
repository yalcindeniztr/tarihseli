
import React, { useState } from 'react';
import { RiddleNode } from '../types';
import { validateAnswer } from '../services/logicEngine';
import MapClue from './MapClue';

interface MysteryBoxProps {
  node: RiddleNode;
  onSuccess: () => void;
}

const MysteryBox: React.FC<MysteryBoxProps> = ({ node, onSuccess }) => {
  const [step, setStep] = useState<'HISTORY' | 'MATH' | 'OPENING_BOX' | 'MAP'>('HISTORY');
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
      setStep('OPENING_BOX');
      setUserInput('');
      setError(false);
      // Box opening animation, then show map to find the final key
      setTimeout(() => {
        setStep('MAP');
      }, 2500);
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  const handleMapDiscovery = () => {
    onSuccess(); // Complete the node when key is found on map
  };

  return (
    <div className="relative w-full mx-auto p-12 rounded-sm parchment-bg gold-border shadow-[0_50px_100px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-500">
      <div className="absolute inset-0 texture-overlay opacity-10" />
      <div className="ornate-corner corner-tl opacity-50"></div>
      <div className="ornate-corner corner-tr opacity-50"></div>
      <div className="ornate-corner corner-bl opacity-50"></div>
      <div className="ornate-corner corner-br opacity-50"></div>

      <div className="relative z-10">
        <div className="text-center mb-6">
          <h2 className="text-[11px] uppercase tracking-[0.6em] text-[#8b6508] mb-3 font-black">KADİM MÜHÜR #{node.order + 1}</h2>
          <h1 className="text-3xl font-serif-vintage italic text-stone-900 font-black">{node.title}</h1>
          <div className="w-20 h-1 bg-[#c5a059] mx-auto mt-4 rounded-full"></div>
        </div>

        {/* STEP 1: MAP & KEY FINDING */}
        {step === 'MAP' && (
          <MapClue
            imageUrl={node.mapImageUrl}
            targetZone={node.targetZone}
            hint={node.locationHint}
            onDiscover={handleMapDiscovery}
          />
        )}

        {/* STEP 2: BOX OPENING ANIMATION */}
        {step === 'OPENING_BOX' && (
          <div className="flex flex-col items-center justify-center py-12 animate-in fade-in zoom-in duration-700">
            <div className="text-8xl mb-8 animate-bounce">📦</div>
            <p className="text-[#8b6508] font-display text-sm tracking-[0.3em] font-black animate-pulse">KADİM SANDIK AÇILIYOR...</p>
            <div className="w-full h-2 bg-stone-200 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-[#c5a059] animate-[loading_2s_ease-in-out_forwards]"></div>
            </div>
          </div>
        )}

        {/* STEP 3: HISTORY QUESTION */}
        {step === 'HISTORY' && (
          <form onSubmit={handleHistorySubmit} className="space-y-10 animate-in slide-in-from-bottom-6">
            <div className="text-center mb-4">
              <span className="text-4xl">📜</span>
            </div>
            <div className="bg-white/40 p-8 rounded-sm border border-[#c5a059]/10 shadow-inner relative">
              <div className="absolute -top-3 -left-3 text-4xl opacity-20">❝</div>
              <p className="text-stone-700 text-center font-serif-vintage text-xl italic leading-relaxed">
                {node.historyQuestion}
              </p>
              <div className="absolute -bottom-3 -right-3 text-4xl opacity-20">❞</div>
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

        {/* STEP 4: MATH LOGIC */}
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
      </div>

      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default MysteryBox;
