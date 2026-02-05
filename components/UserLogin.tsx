import React, { useState } from 'react';
import { retrieveUserByPin } from '../services/firebase';
import { Button } from './Admin/MaterialUI';
import { UserProfile } from '../types';

interface UserLoginProps {
    onSuccess: (user: UserProfile) => void;
    onCancel: () => void;
}

const UserLogin: React.FC<UserLoginProps> = ({ onSuccess, onCancel }) => {
    const [username, setUsername] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (loading) return;
        if (!username.trim() || pin.length < 6) {
            setError("Lütfen geçerli bir isim ve 6 haneli mühür (PIN) giriniz.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const user = await retrieveUserByPin(username.trim(), pin.trim());
            if (user) {
                onSuccess(user);
            } else {
                setError("Mühür veya isim hatalı. Kayıtlı böyle bir muhafız bulunamadı.");
                setLoading(false);
            }
        } catch (err) {
            setError("Giriş sırasında bir hata oluştu. Bağlantınızı kontrol edin.");
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#dcdcd7] rounded-sm p-1 max-w-md w-full animate-in zoom-in duration-300 relative shadow-2xl">
                {/* Decorative Borders */}
                <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-[#8b6508]"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-[#8b6508]"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-[#8b6508]"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-[#8b6508]"></div>

                <div className="bg-white/80 p-8 rounded-sm parchment-bg relative">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-[#8b6508]/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#8b6508]/40">
                            <span className="text-3xl">🛡️</span>
                        </div>
                        <h2 className="text-2xl font-display font-black text-[#2c1e11] tracking-widest uppercase">MUHAFIZ GİRİŞİ</h2>
                        <p className="text-[#8b6508] text-[10px] font-bold uppercase tracking-[0.2em] mt-2">KİMLİĞİNİZİ DOĞRULAYIN</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded flex items-center gap-3 text-red-700 text-xs font-bold uppercase">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-[#8b6508] uppercase tracking-wider mb-1">MUHAFIZ ADI</label>
                            <input
                                type="text"
                                className="w-full p-3 bg-white border-2 border-[#8b6508]/20 focus:border-[#8b6508] outline-none font-bold text-[#2c1e11] placeholder:text-stone-300 transition-colors uppercase"
                                placeholder="İSİM GİRİNİZ"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-[#8b6508] uppercase tracking-wider mb-1">GİZLİ MÜHÜR (PIN)</label>
                            <input
                                type="text"
                                maxLength={6}
                                className="w-full p-3 bg-white border-2 border-[#8b6508]/20 focus:border-[#8b6508] outline-none font-display font-black text-xl text-[#2c1e11] tracking-[0.5em] text-center placeholder:text-stone-200 transition-colors uppercase"
                                placeholder="******"
                                value={pin}
                                onChange={e => setPin(e.target.value)}
                            />
                            <p className="text-[9px] text-stone-400 mt-1 text-right italic">6 karakterli parolanız</p>
                        </div>

                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full mt-4 py-4 bg-[#2c1e11] text-[#dcdcd7] font-display text-sm tracking-[0.4em] font-black shadow-lg hover:bg-black transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "DOĞRULANIYOR..." : "MÜHRÜ KIR VE GİR"}
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#8b6508]/20"></div></div>
                            <div className="relative flex justify-center text-[10px]"><span className="px-2 bg-[#fdfbf7] text-[#8b6508]/60 uppercase font-black">veya</span></div>
                        </div>

                        <button
                            onClick={onCancel}
                            className="w-full py-3 text-[#8b6508] font-display text-[10px] tracking-[0.4em] font-black uppercase hover:bg-[#8b6508]/10 transition-all border border-[#8b6508]/20"
                        >
                            VAZGEÇ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserLogin;
