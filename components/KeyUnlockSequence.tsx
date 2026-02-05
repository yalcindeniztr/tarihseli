
import React, { useEffect, useState } from 'react';

interface KeyUnlockSequenceProps {
    onComplete: () => void;
    nodeTitle?: string;
}

const KeyUnlockSequence: React.FC<KeyUnlockSequenceProps> = ({ onComplete, nodeTitle }) => {
    const [phase, setPhase] = useState<'KEY_APPROACH' | 'BOX_APPEAR' | 'UNLOCKING' | 'OPENED'>('KEY_APPROACH');

    useEffect(() => {
        // Timeline of events
        const sequence = async () => {
            // Phase 1: Key Approach (0s - 2s)
            await new Promise(r => setTimeout(r, 2000));

            // Phase 2: Box Appears (2s - 3s)
            setPhase('BOX_APPEAR');
            await new Promise(r => setTimeout(r, 1000));

            // Phase 3: Key Enters Lock (3s - 4.5s)
            setPhase('UNLOCKING');
            await new Promise(r => setTimeout(r, 1500));

            // Phase 4: Box Opens (4.5s - 6s)
            setPhase('OPENED');
            await new Promise(r => setTimeout(r, 1500));

            // Done
            onComplete();
        };

        sequence();
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[200] bg-black/90 flex flex-col items-center justify-center overflow-hidden">

            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,125,107,0.3)_0%,transparent_70%)] pointer-events-none" />

            {/* PHASE 1 & 2: THE KEY */}
            <div className={`transition-all duration-1000 ease-in-out absolute z-20 
        ${phase === 'KEY_APPROACH' ? 'scale-[2.0] rotate-[360deg] top-1/2' : ''}
        ${phase === 'BOX_APPEAR' ? 'scale-100 top-[60%] opacity-100' : ''}
        ${phase === 'UNLOCKING' ? 'scale-50 top-[52%] !opacity-0 transition-opacity duration-300' : ''}
        ${phase === 'OPENED' ? 'hidden' : ''}
      `}>
                {/* Reusing ARView Key Design */}
                <div className="w-32 h-32 relative animate-float-key">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border-4 border-amber-400 brass-texture shadow-[0_0_30px_gold]" />
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 w-4 h-20 brass-texture shadow-2xl" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-6 brass-texture shadow-2xl rounded-sm" />
                </div>
            </div>

            {/* PHASE 2, 3, 4: THE BOX */}
            <div className={`transition-all duration-1000 transform
        ${phase === 'KEY_APPROACH' ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}
        ${phase === 'UNLOCKING' ? 'animate-pulse' : ''}
      `}>
                <div className="w-64 h-64 relative perspective-1000">
                    {/* Main Box Body */}
                    <div className={`w-full h-full bg-[#3e342b] border-8 border-[#8b7d6b] rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex items-center justify-center transition-transform duration-1000 ${phase === 'OPENED' ? 'rotate-x-12 scale-110 shadow-[0_0_100px_gold]' : ''}`}>

                        {/* Ornate Patterns */}
                        <div className="absolute inset-2 border-2 border-dashed border-[#dcdcd7]/20" />
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-20" />

                        {/* The Lock */}
                        <div className={`w-20 h-24 bg-[#1a1512] rounded-lg border-4 border-[#8b7d6b] flex flex-col items-center justify-center relative transition-all duration-500 ${phase === 'OPENED' ? 'opacity-0 scale-150' : 'opacity-100'}`}>
                            <div className="w-4 h-4 rounded-full bg-black mb-1" />
                            <div className="w-2 h-8 bg-black rounded-b-full" />
                            {/* Shiny glint on lock */}
                            <div className="absolute -top-2 -right-2 text-2xl animate-ping">✨</div>
                        </div>

                        {/* Light Beam when Opened */}
                        {phase === 'OPENED' && (
                            <div className="absolute inset-0 flex items-center justify-center z-50">
                                <div className="w-full h-full bg-white animate-ping opacity-50 rounded-full blur-xl" />
                                <h2 className="absolute text-3xl md:text-5xl font-display text-white font-black tracking-widest drop-shadow-[0_4px_4px_rgba(0,0,0,1)] scale-150 transition-transform">KİLİT AÇILDI!</h2>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="absolute bottom-20 text-center">
                <p className="text-amber-500 font-display tracking-[0.5em] text-sm animate-pulse">
                    {phase === 'KEY_APPROACH' && "ANAHTAR BULUNDU!"}
                    {phase === 'BOX_APPEAR' && "KİLİT HEDEF ALINIYOR..."}
                    {phase === 'UNLOCKING' && "MÜHÜR AÇILIYOR..."}
                    {phase === 'OPENED' && ""}
                </p>
                {nodeTitle && <p className="text-stone-500 text-xs mt-2 uppercase tracking-widest opacity-60">{nodeTitle}</p>}
            </div>

        </div>
    );
};

export default KeyUnlockSequence;
