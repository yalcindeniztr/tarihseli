import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { Button, Input, Switch, Badge } from './MaterialUI';

interface UserInspectorProps {
    user: UserProfile;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedUser: UserProfile) => Promise<void>;
}

const UserInspector: React.FC<UserInspectorProps> = ({ user, isOpen, onClose, onSave }) => {
    const [editedUser, setEditedUser] = useState<UserProfile>(user);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setEditedUser(user);
    }, [user]);

    if (!isOpen) return null;

    const handleSave = async () => {
        setIsSaving(true);
        await onSave(editedUser);
        setIsSaving(false);
        onClose();
    };

    const handleChange = (field: keyof UserProfile, value: any) => {
        setEditedUser(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-slate-900 text-white p-6 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-2xl font-bold">
                                {editedUser.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{editedUser.username}</h2>
                                <p className="text-slate-400 text-sm font-mono">{editedUser.id}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                            {editedUser.isBanned && <Badge variant="danger">YASAKLI</Badge>}
                            {!editedUser.isBanned && <Badge variant="success">AKTİF</Badge>}
                            <Badge variant="info">Level {editedUser.level}</Badge>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-2xl">×</button>
                </div>

                {/* Scrollable Content */}
                <div className="p-8 overflow-y-auto space-y-8 flex-1">

                    {/* Stats Section */}
                    <section>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Oyun İstatistikleri</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700">Level</label>
                                <input
                                    type="number"
                                    value={editedUser.level}
                                    onChange={e => handleChange('level', parseInt(e.target.value))}
                                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700">XP (Deneyim)</label>
                                <input
                                    type="number"
                                    value={editedUser.xp}
                                    onChange={e => handleChange('xp', parseInt(e.target.value))}
                                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700">Altın / Jeton</label>
                                <input
                                    type="number"
                                    value={editedUser.coins || 0}
                                    onChange={e => handleChange('coins', parseInt(e.target.value))}
                                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Security Section */}
                    <section>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Güvenlik & Erişim</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                                <div>
                                    <h4 className="font-bold text-red-900">Kullanıcıyı Yasakla (BAN)</h4>
                                    <p className="text-sm text-red-700/80">Bu kullanıcının oyuna erişimini engeller.</p>
                                </div>
                                <Switch
                                    checked={!!editedUser.isBanned}
                                    onChange={checked => handleChange('isBanned', checked)}
                                />
                            </div>

                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Güvenlik PIN Kodu</label>
                                <input
                                    type="text"
                                    value={editedUser.pin || ''}
                                    onChange={e => handleChange('pin', e.target.value)}
                                    maxLength={6}
                                    placeholder="PIN Yok"
                                    className="w-full p-2 border border-slate-300 rounded font-mono tracking-widest bg-white"
                                />
                            </div>
                        </div>
                    </section>

                    {/* User Data Raw (Read Only) */}
                    <section>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Ham Veri</h3>
                        <pre className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs overflow-x-auto">
                            {JSON.stringify(editedUser, null, 2)}
                        </pre>
                    </section>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose} disabled={isSaving}>İptal</Button>
                    <Button onClick={handleSave} disabled={isSaving} startIcon={isSaving ? '⏳' : '💾'}>
                        {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UserInspector;
