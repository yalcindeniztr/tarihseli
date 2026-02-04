
import React, { useRef, useEffect, useState } from 'react';

interface ARViewProps {
  onCollect: () => void;
  rewardId: string;
}

const ARView: React.FC<ARViewProps> = ({ onCollect, rewardId }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [isCollecting, setIsCollecting] = useState(false);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setStreamError("Kamera erişimi reddedildi veya bulunamadı.");
        console.error(err);
      }
    }
    setupCamera();
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handleTap = () => {
    if (isCollecting) return;
    setIsCollecting(true);
    setTimeout(() => {
      onCollect();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      />
      
      {/* Hasselblad Grain/Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      
      <div className="relative z-10 flex-grow flex items-center justify-center">
        {streamError ? (
          <div className="text-white text-center p-8 bg-red-900/50 rounded-xl">
            {streamError}
          </div>
        ) : (
          <div 
            onClick={handleTap}
            className={`cursor-pointer transition-all duration-1000 ${isCollecting ? 'animate-key-turn scale-150 opacity-0' : 'animate-float-key'}`}
          >
            {/* Photorealistic Brass Key */}
            <div className="w-32 h-32 relative">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border-4 border-amber-600 brass-texture shadow-2xl" />
               <div className="absolute top-10 left-1/2 -translate-x-1/2 w-4 h-20 brass-texture shadow-2xl" />
               <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-6 brass-texture shadow-2xl rounded-sm" />
               <div className="absolute inset-0 bg-white/10 blur-sm rounded-full pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      <div className="relative z-10 p-6 bg-stone-900/80 backdrop-blur-md border-t border-amber-500/20 text-center">
        <h3 className="font-display text-amber-500 tracking-widest mb-2">GİZEMLİ NESNE TESPİT EDİLDİ</h3>
        <p className="text-stone-300 text-sm italic">Cihazınızı hareket ettirerek nesneye yaklaşın ve almak için üzerine dokunun.</p>
        <button 
          onClick={onCollect} 
          className="mt-4 px-6 py-2 bg-stone-800 text-stone-400 text-xs uppercase tracking-widest rounded border border-stone-700"
        >
          Kamerayı Kapat
        </button>
      </div>
    </div>
  );
};

export default ARView;
