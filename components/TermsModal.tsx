import React, { useState } from 'react';
import { Button } from './Admin/MaterialUI';

interface TermsModalProps {
    onAccept: () => void;
    isOpen: boolean;
}

const TermsModal: React.FC<TermsModalProps> = ({ onAccept, isOpen }) => {
    const [isChecked, setIsChecked] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 bg-slate-50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <span>📜</span> Kullanıcı Sözleşmesi ve Kurallar
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Oyuna başlamadan önce lütfen okuyup onaylayın.</p>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 text-slate-600 text-sm leading-relaxed">
                    <section>
                        <h3 className="font-bold text-slate-800 mb-2">1. Genel Kurallar</h3>
                        <p>
                            Tarihseli (bundan sonra "Oyun" olarak anılacaktır), tarih öğrenimini oyunlaştırma amacıyla geliştirilmiştir.
                            Oyuncular, oyun içerisinde genel ahlak kurallarına uymakla yükümlüdür. Hakaret, küfür, ayrımcılık veya
                            rahatsız edici kullanıcı adları kullanımı yasaktır.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-bold text-slate-800 mb-2">2. Veri Güvenliği ve Kayıt</h3>
                        <p>
                            Oyun, ilerlemenizi kaydetmek amacıyla kullanıcı adı, seviye ve oyun içi başarılarınızı bulut sunucularında (Firebase) saklar.
                            Oyunun sorunsuz çalışması için temel verilerinizin işlenmesini kabul etmiş sayılırsınız. Kişisel verileriniz üçüncü şahıslarla paylaşılmaz.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-bold text-slate-800 mb-2">3. Pasif Hesaplar</h3>
                        <p>
                            Sunucu performansını korumak amacıyla, <strong>10 gün boyunca giriş yapmayan</strong> ve seviyesi düşük (örn. Seviye 1)
                            olan pasif hesaplar sistem tarafından otomatik olarak silinebilir. Emeklerinizin kaybolmaması için düzenli giriş yapmanız önerilir.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-bold text-slate-800 mb-2">4. Sorumluluk Reddi</h3>
                        <p>
                            Yönetim, teknik aksaklıklar veya sunucu sorunlarından kaynaklanan veri kayıplarından sorumlu tutulamaz.
                            Oyun içi içerikler eğitim amaçlıdır ve kesin tarihsel gerçeklik iddiası taşımaz, kurgusal öğeler barındırabilir.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-bold text-slate-800 mb-2">5. Kabul Beyanı</h3>
                        <p>
                            Aşağıdaki kutucuğu işaretleyerek bu kuralları okuduğumu, anladığımı ve kabul ettiğimi beyan ederim.
                        </p>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-xl flex flex-col gap-4">
                    <label
                        className="flex items-center gap-3 cursor-pointer select-none group"
                        onClick={() => setIsChecked(!isChecked)}
                    >
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${isChecked ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white group-hover:border-blue-400'}`}>
                            {isChecked && <span className="text-white font-bold text-sm">✓</span>}
                        </div>
                        <span className="text-slate-700 font-medium">Kuralları okudum, anladım ve kabul ediyorum.</span>
                    </label>

                    <Button
                        fullWidth
                        variant={isChecked ? 'primary' : 'secondary'}
                        disabled={!isChecked}
                        onClick={onAccept}
                        className="py-4"
                    >
                        {isChecked ? "OYUNA BAŞLA" : "Lütfen Önce Onaylayın"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TermsModal;
