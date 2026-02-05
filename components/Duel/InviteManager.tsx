import React, { useState } from 'react';
import { Invite } from '../../types';

interface InviteManagerProps {
    invites: Invite[];
    onAccept: (invite: Invite, wager: number) => void;
    onReject: (invite: Invite) => void;
}

const InviteManager: React.FC<InviteManagerProps> = ({ invites, onAccept, onReject }) => {
    const [wager, setWager] = useState(100);
    const wagers = [100, 250, 500, 1000];

    if (invites.length === 0) return null;

    const currentInvite = invites[0];

    return (
        <div className="fixed top-4 right-4 z-[200] max-w-sm animate-in slide-in-from-right duration-500">
            <div className="bg-[#2c1e11] text-[#dcdcd7] p-5 rounded shadow-2xl border-2 border-[#8b6508] relative overflow-hidden">
                <div className="absolute inset-0 bg-[#8b6508]/10 pointer-events-none"></div>

                <h3 className="font-display text-lg tracking-widest font-black text-[#8b6508] mb-2 flex items-center gap-2">
                    <span>⚔️</span> MEYDAN OKUMA VAR!
                </h3>
                <p className="text-sm font-serif mb-4 leading-relaxed">
                    <span className="font-bold text-white text-lg block mb-1">{currentInvite.fromName}</span>
                    seni düelloya davet ediyor. Kabul ediyor musun?
                </p>

                {/* Wager Selection */}
                <div className="mb-4 bg-black/20 p-3 rounded border border-[#8b6508]/30">
                    <label className="text-[10px] text-[#8b6508] uppercase tracking-widest font-bold block mb-2">İDDİA BEDELİ (XP)</label>
                    <div className="flex justify-between gap-1">
                        {wagers.map(w => (
                            <button
                                key={w}
                                onClick={() => setWager(w)}
                                className={`flex-1 py-1 px-1 text-xs font-bold rounded transition-colors ${wager === w ? 'bg-[#8b6508] text-white' : 'bg-black/30 text-stone-400 hover:bg-black/50'}`}
                            >
                                {w}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => onAccept(currentInvite, wager)}
                        className="flex-1 bg-green-700 hover:bg-green-600 text-white font-bold py-3 px-3 rounded-sm text-xs uppercase tracking-wider transition-colors shadow-lg border-b-2 border-green-900"
                    >
                        KABUL ET
                    </button>
                    <button
                        onClick={() => onReject(currentInvite)}
                        className="flex-1 bg-red-800 hover:bg-red-700 text-white font-bold py-3 px-3 rounded-sm text-xs uppercase tracking-wider transition-colors shadow-lg border-b-2 border-red-950"
                    >
                        REDDET
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InviteManager;
