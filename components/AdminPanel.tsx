import React, { useState, useEffect, useMemo } from 'react';
import { GameState, RiddleNode, Category, UserProfile } from '../types';
import { INITIAL_CATEGORIES } from '../constants';
import { syncCategoriesToCloud, fetchAllUsersFromCloud, deleteUserFromCloud, fetchSystemSettings, saveSystemSettings, deleteInactiveUsers } from '../services/firebase';
import { clearDatabase } from '../services/db';
import NodeEditor from './Admin/NodeEditor';
import { Button, Card, Modal, Badge, IconButton, Input, Switch } from './Admin/MaterialUI';

interface AdminPanelProps {
  gameState: GameState | null;
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ gameState, setGameState, onClose }) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'CONTENT' | 'USERS' | 'SYSTEM'>('DASHBOARD');
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [isEditingNode, setIsEditingNode] = useState<string | null>(null);
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [deployProgress, setDeployProgress] = useState(0);

  // System Settings State
  const [settings, setSettings] = useState({
    autoSync: false, // Default to false so user notices if it loads true
    maintenanceMode: false
  });

  // Load Settings from Cloud on Mount
  useEffect(() => {
    const loadSettings = async () => {
      const saved = await fetchSystemSettings();
      if (saved) {
        setSettings(saved);
      }
    };
    loadSettings();
  }, [activeTab]); // Reload when tab changes just in case

  const handleSettingChange = async (key: 'autoSync' | 'maintenanceMode', value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveSystemSettings(newSettings);
  };



  // Dialog State Management
  const [dialogState, setDialogState] = useState<{
    type: 'ADD_CATEGORY' | 'EDIT_CATEGORY' | 'CONFIRM' | null;
    title?: string;
    message?: string;
    onConfirm?: () => void;
    inputValue?: string;
  }>({ type: null, isOpen: false } as any);

  const closeDialog = () => setDialogState({ type: null } as any);

  // Local Categories
  const categories = useMemo(() => gameState?.categories || INITIAL_CATEGORIES, [gameState]);

  useEffect(() => {
    if (activeTab === 'USERS') refreshUsers();
  }, [activeTab]);

  const refreshUsers = async () => {
    const users = await fetchAllUsersFromCloud();
    setAllUsers(users);
  };

  const handlePushToCloud = () => {
    setDialogState({
      type: 'CONFIRM',
      title: 'Yayınla (Deploy)',
      message: "Tüm yerel değişiklikler Firebase'e aktarılacak. Bu işlem mevcut kullanıcı verilerini etkileyebilir. Onaylıyor musunuz?",
      onConfirm: async () => {
        closeDialog();
        setIsDeploying(true);
        setDeployProgress(20);
        await syncCategoriesToCloud(categories);
        setDeployProgress(100);
        setTimeout(() => {
          setIsDeploying(false);
          setDeployProgress(0);
        }, 800);
      }
    });
  };

  const updateGlobalCategories = (newCategories: Category[]) => {
    setGameState(prev => prev ? { ...prev, categories: [...newCategories] } : null);
  };

  // CATEGORY OPERATIONS
  const handleAddCategory = () => {
    setDialogState({
      type: 'ADD_CATEGORY',
      title: 'Yeni Dönem Ekle',
      inputValue: '',
      onConfirm: () => { } // Logic handled in render modal
    });
  };

  const confirmAddCategory = (name: string) => {
    if (!name) return;
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: name,
      description: 'Yeni keşfedilen bir tarih dönemi.',
      nodes: []
    };
    updateGlobalCategories([...categories, newCat]);
    setSelectedCatId(newCat.id);
    closeDialog();
  };

  const confirmEditCategory = (newName: string) => {
    if (newName && selectedCatId) {
      const updated = categories.map(c => c.id === selectedCatId ? { ...c, name: newName } : c);
      updateGlobalCategories(updated);
    }
    closeDialog();
  };

  const handleDeleteCategory = (id: string) => {
    setDialogState({
      type: 'CONFIRM',
      title: 'Dönemi Sil',
      message: "Bu dönemi ve içindeki TÜM aşamaları silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
      onConfirm: () => {
        updateGlobalCategories(categories.filter(c => c.id !== id));
        if (selectedCatId === id) setSelectedCatId('');
        closeDialog();
      }
    });
  };

  const handleUpdateCategory = (id: string) => {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    setDialogState({
      type: 'EDIT_CATEGORY',
      title: 'Dönem İsmini Güncelle',
      inputValue: cat.name
    });
  };

  // NODE OPERATIONS
  const handleSaveNode = (node: RiddleNode) => {
    const updatedCategories = categories.map(cat => {
      if (cat.id === selectedCatId) {
        const existingIdx = cat.nodes.findIndex(n => n.id === node.id);
        const newNodes = existingIdx > -1
          ? cat.nodes.map(n => n.id === node.id ? node : n)
          : [...cat.nodes, { ...node, order: cat.nodes.length }];
        return { ...cat, nodes: newNodes.sort((a, b) => a.order - b.order) };
      }
      return cat;
    });
    updateGlobalCategories(updatedCategories);
    setIsEditingNode(null);
    setIsAddingNode(false);
  };

  const handleDeleteNode = (nodeId: string) => {
    setDialogState({
      type: 'CONFIRM',
      title: 'Aşamayı Sil',
      message: "Bu aşama kalıcı olarak silinecek. Emin misiniz?",
      onConfirm: () => {
        const updatedCategories = categories.map(cat => {
          if (cat.id === selectedCatId) {
            return { ...cat, nodes: cat.nodes.filter(n => n.id !== nodeId) };
          }
          return cat;
        });
        updateGlobalCategories(updatedCategories);
        closeDialog();
      }
    });
  };

  // SYSTEM OPERATIONS
  const handleResetSystem = () => {
    setDialogState({
      type: 'CONFIRM',
      title: 'Sistemi Sıfırla',
      message: "DİKKAT! Tüm veritabanı (profil, puanlar, içerik) silinecek ve uygulama sıfırlanacak. Bu işlem kesinlikle geri alınamaz. Devam edilsin mi?",
      onConfirm: async () => {
        await clearDatabase();
        window.location.reload();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[300] bg-slate-100 flex flex-col md:flex-row overflow-hidden font-sans">

      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-white border-r border-slate-200 flex flex-col z-20 shadow-xl">
        <div className="p-6 flex flex-col items-center border-b border-slate-100 bg-slate-50/50">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center text-3xl mb-4 text-white">
            ⚡
          </div>
          <h2 className="font-bold text-slate-800 tracking-tight text-lg">MASTER PANEL</h2>
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1 bg-slate-100 px-2 py-0.5 rounded">Pro Edition v3.0</span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {[
            { id: 'DASHBOARD', icon: '📊', label: 'Dashboard' },
            { id: 'CONTENT', icon: 'folder', label: 'İçerik Yönetimi' },
            { id: 'USERS', icon: 'people', label: 'Kullanıcılar' },
            { id: 'SYSTEM', icon: 'settings', label: 'Sistem Ayarları' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
            >
              <span className="material-icons-outlined text-lg">{tab.icon === 'folder' ? '📂' : tab.icon === 'people' ? '👥' : tab.icon === 'settings' ? '⚙️' : tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/30 space-y-3">
          <Button fullWidth variant="primary" onClick={handlePushToCloud} startIcon="☁️">
            Verileri Kaydet
          </Button>
          <div className="text-[10px] text-center text-slate-400 px-2 leading-tight">
            *Kod güncellemeleri için masaüstündeki kısa yolu kullanın.
          </div>
          <Button fullWidth variant="outline" onClick={() => onClose()} startIcon="👁️">
            Oyuna Dön (Siteyi Gör)
          </Button>
          <Button
            fullWidth
            variant="danger"
            onClick={() => {
              sessionStorage.removeItem('ADMIN_AUTH');
              sessionStorage.removeItem('ADMIN_OPEN');
              window.location.reload();
            }}
            startIcon="🔒"
          >
            Güvenli Çıkış
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto p-6 md:p-10 relative">

        {/* Loading Overlay */}
        {isDeploying && (
          <div className="absolute inset-0 z-[400] bg-white/90 backdrop-blur flex flex-col items-center justify-center p-12">
            <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${deployProgress}%` }} />
            </div>
            <h3 className="text-blue-600 font-bold text-xl uppercase tracking-widest animate-pulse">Senkronizasyon...</h3>
            <p className="text-slate-400 mt-2 text-sm font-medium">Lütfen bekleyin, veriler güncelleniyor.</p>
          </div>
        )}

        {activeTab === 'DASHBOARD' && (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
              <h1 className="text-3xl font-bold text-slate-800">Genel Durum</h1>
              <p className="text-slate-500 mt-1">Sistem performans ve içerik özeti</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-l-4 border-l-blue-500">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg text-2xl">📚</div>
                  <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Dönemler</p>
                    <p className="text-3xl font-bold text-slate-800">{categories.length}</p>
                  </div>
                </div>
              </Card>
              <Card className="border-l-4 border-l-emerald-500">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg text-2xl">💎</div>
                  <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Toplam Aşama</p>
                    <p className="text-3xl font-bold text-slate-800">{categories.reduce((a, c) => a + c.nodes.length, 0)}</p>
                  </div>
                </div>
              </Card>
              <Card className="border-l-4 border-l-purple-500">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-lg text-2xl">👥</div>
                  <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Kullanıcılar</p>
                    <p className="text-3xl font-bold text-slate-800">{allUsers.length}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'CONTENT' && (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">İçerik Yönetimi</h1>
                <p className="text-slate-500 mt-1">Tarih dönemlerini ve aşamaları düzenle</p>
              </div>
              <Button onClick={handleAddCategory} startIcon="+">Yeni Dönem</Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`px-6 py-4 rounded-xl font-bold text-sm transition-all shadow-sm border text-left ${selectedCatId === cat.id
                    ? 'bg-blue-600 border-blue-600 text-white shadow-blue-500/30'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-60 font-medium">{cat.nodes.length} Aşama</span>
                  </div>
                </button>
              ))}
            </div>

            {selectedCatId && (
              <Card
                title={categories.find(c => c.id === selectedCatId)?.name}
                actions={
                  <>
                    <Button size="sm" variant="outline" onClick={() => handleUpdateCategory(selectedCatId)}>Düzenle</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDeleteCategory(selectedCatId)}>Sil</Button>
                    <Button size="sm" onClick={() => setIsAddingNode(true)}>+ Aşama Ekle</Button>
                  </>
                }
              >
                {isAddingNode && (
                  <div className="mb-8 bg-slate-50 p-6 rounded-xl border border-slate-200 animate-in fade-in">
                    <h4 className="font-bold text-slate-700 mb-4">Yeni Aşama Ekle</h4>
                    <NodeEditor order={categories.find(c => c.id === selectedCatId)?.nodes.length || 0} onSave={handleSaveNode} onCancel={() => setIsAddingNode(false)} />
                  </div>
                )}

                <div className="space-y-4">
                  {categories.find(c => c.id === selectedCatId)?.nodes.map((node, index) => (
                    <div key={node.id}>
                      {isEditingNode === node.id ? (
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 animate-in fade-in">
                          <h4 className="font-bold text-slate-700 mb-4">Aşamayı Düzenle</h4>
                          <NodeEditor node={node} order={node.order} onSave={handleSaveNode} onCancel={() => setIsEditingNode(null)} />
                        </div>
                      ) : (
                        <div className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-lg hover:shadow-md transition-all hover:border-blue-200">
                          <div className="flex items-center gap-4">
                            <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold flex items-center justify-center text-xs">
                              {index + 1}
                            </span>
                            <div>
                              <h4 className="font-bold text-slate-800">{node.title}</h4>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="info">Yıl: {node.correctYear}</Badge>
                                <Badge variant="warning">Kod: {node.mathResult}</Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="ghost" onClick={() => setIsEditingNode(node.id)}>Düzenle</Button>
                            <IconButton size="sm" variant="danger" onClick={() => handleDeleteNode(node.id)}>🗑️</IconButton>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {categories.find(c => c.id === selectedCatId)?.nodes.length === 0 && (
                    <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                      <p className="text-slate-400 font-medium">Bu dönemde henüz hiç aşama yok.</p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'USERS' && (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-slate-800">Kullanıcı Listesi</h1>
              <Button variant="outline" onClick={refreshUsers}>Listeyi Yenile ↻</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allUsers.map(user => (
                <Card key={user.id} className="relative group hover:shadow-lg transition-all">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <IconButton variant="danger" size="sm" onClick={() =>
                      setDialogState({
                        type: 'CONFIRM',
                        title: 'Kullanıcıyı Sil',
                        message: `${user.username} kullanıcısını silmek istediğinize emin misiniz?`,
                        onConfirm: async () => {
                          await deleteUserFromCloud(user.id);
                          refreshUsers();
                          closeDialog();
                        }
                      })
                    }>🗑️</IconButton>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-3xl mb-3">💂</div>
                    <h3 className="font-bold text-lg text-slate-800">{user.username}</h3>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Seviye {user.level}</p>

                    <div className="w-full mt-6 bg-slate-50 rounded-lg p-3">
                      <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase">
                        <span>İlerleme</span>
                        <span>{user.xp} XP</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (user.xp / (user.level * 1000)) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'SYSTEM' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <h1 className="text-3xl font-bold text-slate-800">Sistem Ayarları</h1>

            <Card title="Gelişmiş Seçenekler">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-800">Otomatik Senkronizasyon</h4>
                    <p className="text-sm text-slate-500">Verileri her değişiklikte buluta gönder.</p>
                  </div>
                  <Switch
                    checked={settings.autoSync}
                    onChange={(checked) => handleSettingChange('autoSync', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-800">Bakım Modu</h4>
                    <p className="text-sm text-slate-500">Kullanıcı erişimini geçici olarak durdur.</p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                  />
                </div>
              </div>
            </Card>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 mb-6">
              <h4 className="font-bold text-amber-700 mb-2">Veritabanı Temizliği</h4>
              <p className="text-amber-600/80 text-sm mb-4">Depolama alanını rahatlatmak için aktif olmayan (Sv. 1) kullanıcıları sil.</p>
              <Button variant="secondary" onClick={async () => {
                const count = await deleteInactiveUsers();
                alert(`${count} adet pasif kullanıcı silindi.`);
                refreshUsers();
              }}>Pasif Kullanıcıları Temizle</Button>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-xl p-6">
              <h4 className="font-bold text-red-700 mb-2">Tehlikeli Bölge</h4>
              <p className="text-red-600/80 text-sm mb-4">Bu işlemler geri alınamaz ve veri kaybına yol açabilir.</p>
              <Button variant="danger" onClick={handleResetSystem}>Sistemi Tamamen Sıfırla</Button>
            </div>
          </div>
        )}
      </main>

      {/* Dialogs */}
      <Modal
        isOpen={!!dialogState.type}
        onClose={closeDialog}
        title={dialogState.title || ''}
        actions={
          <>
            <Button variant="ghost" onClick={closeDialog}>İptal</Button>
            {(dialogState.type === 'ADD_CATEGORY' || dialogState.type === 'EDIT_CATEGORY') && (
              <Button onClick={() => {
                if (dialogState.type === 'ADD_CATEGORY') confirmAddCategory(dialogState.inputValue);
                if (dialogState.type === 'EDIT_CATEGORY') confirmEditCategory(dialogState.inputValue);
              }}>Kaydet</Button>
            )}
            {dialogState.type === 'CONFIRM' && (
              <Button variant="danger" onClick={dialogState.onConfirm}>Onayla</Button>
            )}
          </>
        }
      >
        {(dialogState.type === 'ADD_CATEGORY' || dialogState.type === 'EDIT_CATEGORY') ? (
          <Input
            autoFocus
            label="Dönem İsmi"
            value={dialogState.inputValue}
            onChange={e => setDialogState({ ...dialogState, inputValue: e.target.value })}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                if (dialogState.type === 'ADD_CATEGORY') confirmAddCategory(dialogState.inputValue);
                if (dialogState.type === 'EDIT_CATEGORY') confirmEditCategory(dialogState.inputValue);
              }
            }}
          />
        ) : (
          <p className="text-slate-600">{dialogState.message}</p>
        )}
      </Modal>

    </div>
  );
};

export default AdminPanel;
