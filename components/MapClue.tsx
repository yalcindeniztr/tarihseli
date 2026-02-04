
import React, { useState } from 'react';

interface MapClueProps {
  imageUrl: string;
  targetZone: { x: number, y: number, radius: number };
  onDiscover: () => void;
  hint: string;
}

const MapClue: React.FC<MapClueProps> = ({ imageUrl, targetZone, onDiscover, hint }) => {
  const [clickEffect, setClickEffect] = useState<{ x: number, y: number } | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setClickEffect({ x, y });
    setTimeout(() => setClickEffect(null), 600);

    const distance = Math.sqrt(Math.pow(x - targetZone.x, 2) + Math.pow(y - targetZone.y, 2));

    if (distance <= targetZone.radius) {
      onDiscover();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="p-8 bg-white/60 border-2 border-[#c5a059]/40 rounded-sm shadow-inner relative">
        <div className="absolute top-0 left-0 p-2 text-xl opacity-20">📜</div>
        <p className="text-[#8b6508] font-display text-xs uppercase tracking-[0.4em] mb-3 text-center font-black">KONUM ARŞİVİ</p>
        <p className="text-stone-900 text-center font-serif-vintage italic text-xl leading-relaxed">"{hint}"</p>
      </div>

      <div
        className="relative aspect-[4/3] w-full max-h-[75vh] bg-stone-100 rounded-sm overflow-hidden cursor-crosshair border-4 border-[#8b6508] shadow-2xl group mx-auto"
        onClick={handleClick}
      >
        <img src={imageUrl} alt="Map" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />

        {/* Hasselblad style light overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.1)_100%)]" />
        <div className="absolute inset-0 border-[15px] border-white/20 pointer-events-none" />

        {clickEffect && (
          <div
            className="absolute w-12 h-12 border-4 border-[#ffd700] rounded-full animate-ping -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: `${clickEffect.x}%`, top: `${clickEffect.y}%` }}
          />
        )}
      </div>

      <div className="text-center space-y-2">
        <p className="text-[11px] text-[#8b6508] uppercase tracking-[0.4em] font-black">Haritaya dokunarak gizli nesneyi bulun</p>
        <div className="w-12 h-1 bg-[#c5a059] mx-auto rounded-full"></div>
      </div>
    </div>
  );
};

export default MapClue;
