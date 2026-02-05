import React from 'react';
import { Guild } from '../types';

interface GuildLeaderboardProps {
    guilds: Guild[];
}

const GuildLeaderboard: React.FC<GuildLeaderboardProps> = ({ guilds }) => {
    const sortedGuilds = [...guilds].sort((a, b) => b.totalScore - a.totalScore).slice(0, 10);

    return (
        <div className="bg-[#2c1e11]/5 p-6 rounded border border-[#8b7d6b]/30 shadow-inner">
            <h3 className="font-display text-sm text-[#8b7d6b] uppercase tracking-[0.4em] mb-6 font-black border-b border-[#8b7d6b]/20 pb-3 flex items-center gap-2">
                <span>🏆</span> LİDERLİK KÜRSÜSÜ (EN GÜÇLÜ LONCALAR)
            </h3>

            <div className="space-y-3">
                {sortedGuilds.length === 0 ? (
                    <p className="text-stone-500 font-serif-vintage italic text-center py-4">Henüz bir lonca kurulmadı.</p>
                ) : (
                    sortedGuilds.map((guild, index) => (
                        <div key={guild.id} className="flex items-center gap-4 bg-white/70 p-3 rounded border border-[#8b7d6b]/10 hover:border-[#8b7d6b]/40 transition-all shadow-sm group">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${index === 0 ? 'bg-yellow-500 text-white shadow-[0_0_10px_gold]' : index === 1 ? 'bg-slate-400 text-white' : index === 2 ? 'bg-orange-600 text-white' : 'bg-stone-200 text-stone-600'}`}>
                                {index + 1}
                            </div>
                            <div className="flex-grow">
                                <span className="text-stone-800 font-display text-xs tracking-widest font-black uppercase">{guild.name}</span>
                                <div className="flex items-center gap-4 mt-0.5">
                                    <span className="text-[9px] text-[#8b7d6b] font-bold uppercase">Lider: {guild.leaderName}</span>
                                    <span className="text-[9px] text-stone-500 font-bold uppercase">{guild.members.length} Muhafiz</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block text-[#8b7d6b] font-display text-sm font-black">{guild.totalScore}</span>
                                <span className="text-[8px] text-stone-400 uppercase font-black tracking-tighter">Kudret Puanı</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default GuildLeaderboard;
