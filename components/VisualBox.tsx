
import React from 'react';
import { RiddleNode, QuestStatus } from '../types';

interface VisualBoxProps {
  node: RiddleNode;
  onClick: (node: RiddleNode) => void;
  isActive: boolean;
}

const VisualBox: React.FC<VisualBoxProps> = ({ node, onClick, isActive }) => {
  const isLocked = node.status === QuestStatus.LOCKED;
  const isCompleted = node.status === QuestStatus.COMPLETED;

  return (
    <div 
      onClick={() => !isLocked && onClick(node)}
      className={`box-container w-40 h-40 cursor-pointer transition-all duration-700 ${isLocked ? 'grayscale opacity-30 cursor-not-allowed' : 'hover:scale-110'} ${isActive ? 'scale-110 z-20' : ''}`}
    >
      <div className={`box-3d relative w-full h-full ${isActive ? 'box-open' : ''}`}>
        {/* Lid - Gold and Parchment texture */}
        <div className={`box-lid absolute inset-0 z-10 bg-[#fcf4e0] rounded-sm border-2 ${isCompleted ? 'border-green-600' : 'border-[#c5a059]'} shadow-2xl`}>
           <div className="absolute inset-0 texture-overlay opacity-50" />
           <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-14 brass-texture rounded-sm flex items-center justify-center border-2 ${isCompleted ? 'border-green-800' : 'border-[#8b6508]'} shadow-lg`}>
              <span className="text-black text-xl font-black drop-shadow-sm">{isLocked ? '🔒' : (isCompleted ? '🎖️' : '🗝️')}</span>
           </div>
           <div className="absolute inset-x-0 bottom-4 text-center">
             <span className={`text-[10px] font-display ${isCompleted ? 'text-green-800' : 'text-[#8b6508]'} tracking-[0.4em] font-black uppercase`}>MÜHÜR #{node.order + 1}</span>
           </div>
        </div>

        {/* Interior - Light Stone / Parchment Interior */}
        <div className="absolute inset-0 bg-[#f8f1e0] rounded-sm border-2 border-stone-200 shadow-inner overflow-hidden">
          <div className="absolute inset-0 texture-overlay opacity-20" />
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
             {isCompleted ? (
               <div className="text-green-700 text-4xl font-display animate-pulse font-black">✓</div>
             ) : (
               <div className="text-[#c5a059] text-6xl font-display opacity-20 font-black">?</div>
             )}
          </div>
        </div>
        
        {/* Ambient Glow (Golden) */}
        {!isLocked && !isCompleted && !isActive && (
          <div className="absolute -inset-8 bg-[#ffd700]/10 blur-3xl rounded-full animate-pulse pointer-events-none" />
        )}
      </div>
    </div>
  );
};

export default VisualBox;
