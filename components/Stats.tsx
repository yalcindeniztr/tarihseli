
import React from 'react';
import { TeamProgress } from '../types';

interface StatsProps {
  teams: TeamProgress[];
  activeTeamIndex: number;
  totalNodes: number;
}

const Stats: React.FC<StatsProps> = ({ teams, activeTeamIndex, totalNodes }) => {
  return (
    <div className="w-full max-w-md mx-auto mb-10 space-y-6">
      <div className="flex justify-between gap-4">
        {teams.map((team, idx) => {
          const percentage = totalNodes > 0 ? Math.round((team.currentStage / totalNodes) * 100) : 0;
          const isActive = idx === activeTeamIndex;
          
          return (
            <div 
              key={idx} 
              className={`flex-1 p-4 border transition-all duration-500 rounded-sm ${isActive ? 'bg-amber-900/10 border-amber-600 scale-105 shadow-[0_0_15px_rgba(184,134,11,0.2)]' : 'bg-stone-900/40 border-stone-800 opacity-60'}`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={`text-[10px] font-display uppercase tracking-widest ${isActive ? 'text-amber-500' : 'text-stone-500'}`}>
                  {team.name}
                </span>
                <span className="text-amber-600 font-display text-sm">{percentage}%</span>
              </div>
              
              <div className="w-full h-1 bg-stone-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${isActive ? 'bg-amber-500 shadow-[0_0_5px_gold]' : 'bg-stone-600'}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="mt-3 flex gap-1 flex-wrap">
                {team.unlockedKeys.map((_, k) => (
                  <span key={k} className="text-[10px]" title="Kazanılan Anahtar">🔑</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="text-center">
        <p className="text-[9px] text-stone-600 uppercase tracking-[0.3em] font-bold">
          Sıradaki Hamle: <span className="text-amber-700">{teams[activeTeamIndex].name}</span>
        </p>
      </div>
    </div>
  );
};

export default Stats;
