
import React, { useState } from 'react';

interface MapClueProps {
  imageUrl: string;
  targetZone: { x: number, y: number, radius: number };
  onDiscover: () => void;
  hint: string;
}

const MapClue: React.FC<MapClueProps> = ({ imageUrl, targetZone, onDiscover, hint }) => {
  const [clickEffect, setClickEffect] = useState<{ x: number, y: number } | null>(null);
  const [foundKey, setFoundKey] = useState<{ x: number, y: number } | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  // Initial scaling animation (4/3 aspect ratio zoom effect)
  React.useEffect(() => {
    const timer = setTimeout(() => setIsZoomed(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (foundKey) return; // Prevent multiple clicks during animation

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setClickEffect({ x, y });
    setTimeout(() => setClickEffect(null), 600);

    const distance = Math.sqrt(Math.pow(x - targetZone.x, 2) + Math.pow(y - targetZone.y, 2));

    if (distance <= targetZone.radius) {
      // Key Found! Start Animation Sequence
      setFoundKey({ x: targetZone.x, y: targetZone.y });

      // Sequence: Flash appeared -> Rise up -> Callback
      setTimeout(() => {
        onDiscover();
      }, 2000); // Wait for animation to finish
    }
  };

  return (
    <div className={`space-y-8 transition-all duration-1000 ease-out ${isZoomed ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
      <div className="p-8 bg-white/60 border-2 border-[#c5a059]/40 rounded-sm shadow-inner relative">
        <div className="absolute top-0 left-0 p-2 text-xl opacity-20">📜</div>
        <p className="text-[#8b6508] font-display text-xs uppercase tracking-[0.4em] mb-3 text-center font-black">KONUM ARŞİVİ</p>
        <p className="text-stone-900 text-center font-serif-vintage italic text-xl leading-relaxed">"{hint}"</p>
      </div>

      <div
        className="relative aspect-[4/3] w-full max-h-[75vh] bg-stone-100 rounded-sm overflow-hidden cursor-crosshair border-4 border-[#8b6508] shadow-2xl group mx-auto transform transition-transform duration-700"
        onClick={handleClick}
      >
        <img src={imageUrl} alt="Map" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />

        {/* Hasselblad style light overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.1)_100%)]" />
        <div className="absolute inset-0 border-[15px] border-white/20 pointer-events-none" />

        {/* Click Feedback (Ripple) */}
        {clickEffect && !foundKey && (
          <div
            className="absolute w-12 h-12 border-4 border-red-500/50 rounded-full animate-ping -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: `${clickEffect.x}%`, top: `${clickEffect.y}%` }}
          />
        )}

        {/* Found Key Animation */}
        {foundKey && (
          <div
            className="absolute z-50 pointer-events-none flex flex-col items-center justify-center transition-all duration-[2000ms] ease-in-out"
            style={{
              left: `${foundKey.x}%`,
              top: `${foundKey.y}%`,
              transform: 'translate(-50%, -50%)' // Start centered on click
            }}
          >
            {/* Key container that moves up */}
            <div className="animate-[flyUp_2s_ease-in-out_forwards]">
              <div className="text-6xl drop-shadow-[0_0_15px_rgba(255,215,0,0.8)] animate-[spin_1s_ease-out_1]">
                🗝️
              </div>
              <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
            </div>
          </div>
        )}
      </div>

      <div className="text-center space-y-2">
        <p className="text-[11px] text-[#8b6508] uppercase tracking-[0.4em] font-black">
          {foundKey ? "KİLİT AÇILIYOR..." : "MÜHRE DOKUNARAK GİZLİ NESNEYİ BULUN"}
        </p>
        <div className={`w-12 h-1 mx-auto rounded-full transition-colors duration-500 ${foundKey ? 'bg-green-500' : 'bg-[#c5a059]'}`}></div>
      </div>

      <style>{`
        @keyframes flyUp {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          50% { transform: translateY(-100px) scale(1.5); opacity: 1; }
          100% { transform: translateY(-200px) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default MapClue;
