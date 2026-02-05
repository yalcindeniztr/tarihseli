import React, { useState } from 'react';
import { loginWithGoogle } from '../../services/firebase';
import { Button } from './MaterialUI'; // Reusing your existing UI components

interface AdminLoginProps {
    onSuccess: () => void;
    onCancel: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        setError(null);
        const success = await loginWithGoogle();
        if (success) {
            setTimeout(() => {
                onSuccess();
            }, 100);
        } else {
            setError("Giriş yapılamadı. Lütfen tekrar deneyin.");
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative overflow-hidden animate-in zoom-in duration-300">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-purple-600"></div>

                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-blue-100">
                        <span className="text-4xl">🛡️</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Yönetici Girişi</h2>
                    <p className="text-slate-500 text-sm mt-2">Devam etmek için Google ile giriş yapın.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-700 text-sm">
                        <span>⚠️</span> {error}
                    </div>
                )}

                <div className="space-y-4">
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 text-slate-700 font-bold py-3.5 rounded-xl hover:bg-slate-50 transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="animate-spin">⌛</span>
                        ) : (
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                        )}
                        {loading ? "Giriş Yapılıyor..." : "Google ile Giriş Yap"}
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                        <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-400">veya</span></div>
                    </div>

                    <Button fullWidth variant="ghost" onClick={onCancel}>
                        Vazgeç ve Oyuna Dön
                    </Button>
                </div>

                <p className="text-center text-[10px] text-red-600 font-bold mt-8 uppercase tracking-widest">
                    ⚠️ Sadece yalcindeniztr@gmail.com erişim sağlayabilir.
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
