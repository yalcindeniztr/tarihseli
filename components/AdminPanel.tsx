import React, { useState, useEffect, useMemo } from 'react';
import { GameState, RiddleNode, Category, UserProfile, Period } from '../types';
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
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'CONTENT' | 'USERS' | 'GUILDS' | 'SYSTEM'>('DASHBOARD');

  // Navigation State
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');

  // Guild Admin State
  const [allGuilds, setAllGuilds] = useState<any[]>([]);
  const fetchAdminGuilds = async () => {
    // We need to import fetchAllGuilds from firebase.ts
    // Assuming it is accessible or passed. 
    // Since fetchAllUsersFromCloud is imported, fetchAllGuilds should be too.
    const { fetchAllGuilds } = await import('../services/firebase');
    const guilds = await fetchAllGuilds();
    setAllGuilds(guilds);
  };

  useEffect(() => {
    if (activeTab === 'GUILDS') fetchAdminGuilds();
  }, [activeTab]);

  // Interaction State
  const [isEditingNode, setIsEditingNode] = useState<string | null>(null);
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [deployProgress, setDeployProgress] = useState(0);

  // System Settings State
  const [settings, setSettings] = useState({
    autoSync: false,
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
  }, [activeTab]);

  const handleSettingChange = async (key: 'autoSync' | 'maintenanceMode', value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveSystemSettings(newSettings);
  };

  // Dialog State Management
  const [dialogState, setDialogState] = useState<{
    type: 'ADD_CATEGORY' | 'EDIT_CATEGORY' | 'ADD_PERIOD' | 'EDIT_PERIOD' | 'CONFIRM' | null;
    title?: string;
    message?: string;
    onConfirm?: () => void;
    inputValue?: string;
  }>({ type: null, isOpen: false } as any);

  const closeDialog = () => setDialogState({ type: null } as any);

  // Local Categories (Master Data)
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

  // --- CATEGORY OPERATIONS (Level 1) ---
  const handleAddCategory = () => {
    setDialogState({
      type: 'ADD_CATEGORY',
      title: 'Yeni Ana Kategori Ekle',
      inputValue: '',
      onConfirm: () => { }
    });
  };

  const confirmAddCategory = (name: string) => {
    if (!name) return;
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: name,
      description: 'Yeni kategori açıklaması.',
      periods: [],
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
      title: 'Kategoriyi Sil',
      message: "Bu kategoriyi, tüm dönemlerini ve sorularını silmek istediğinize emin misiniz?",
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
      title: 'Kategori İsmini Güncelle',
      inputValue: cat.name
    });
  };

  // --- PERIOD OPERATIONS (Level 2) ---
  const handleAddPeriod = () => {
    setDialogState({
      type: 'ADD_PERIOD',
      title: 'Yeni Dönem (Alt Başlık) Ekle',
      inputValue: '',
      onConfirm: () => { }
    });
  };

  const confirmAddPeriod = (name: string) => {
    if (!name || !selectedCatId) return;
    const updatedCategories = categories.map(cat => {
      if (cat.id === selectedCatId) {
        const newPeriod: Period = {
          id: `period-${Date.now()}`,
          name: name,
          nodes: []
        };
        return { ...cat, periods: [...(cat.periods || []), newPeriod] };
      }
      return cat;
    });
    updateGlobalCategories(updatedCategories);
    closeDialog();
  };

  const handleUpdatePeriod = (period: Period) => {
    setDialogState({
      type: 'EDIT_PERIOD',
      title: 'Dönem İsmini Güncelle',
      inputValue: period.name,
      onConfirm: () => { } // handled in render
    });
  };

  const confirmEditPeriod = (newName: string) => {
    if (!newName || !selectedCatId || !selectedPeriodId) return;
    const updatedCategories = categories.map(cat => {
      if (cat.id === selectedCatId) {
        return {
          ...cat,
          periods: cat.periods.map(p => p.id === selectedPeriodId ? { ...p, name: newName } : p)
        };
      }
      return cat;
    });
    updateGlobalCategories(updatedCategories);
    closeDialog();
  };

  const handleDeletePeriod = (periodId: string) => {
    setDialogState({
      type: 'CONFIRM',
      title: 'Dönemi Sil',
      message: "Bu dönemi ve içindeki tüm soruları silmek istediğinize emin misiniz?",
      onConfirm: () => {
        const updatedCategories = categories.map(cat => {
          if (cat.id === selectedCatId) {
            return { ...cat, periods: cat.periods.filter(p => p.id !== periodId) };
          }
          return cat;
        });
        updateGlobalCategories(updatedCategories);
        setSelectedPeriodId('');
        closeDialog();
      }
    });
  };

  // --- NODE OPERATIONS (Level 3) ---
  const handleSaveNode = (node: RiddleNode) => {
    const updatedCategories = categories.map(cat => {
      if (cat.id === selectedCatId) {
        // If Period Selected, save to Period
        if (selectedPeriodId) {
          const updatedPeriods = cat.periods.map(period => {
            if (period.id === selectedPeriodId) {
              const existingIdx = period.nodes.findIndex(n => n.id === node.id);
              const newNodes = existingIdx > -1
                ? period.nodes.map(n => n.id === node.id ? node : n)
                : [...period.nodes, { ...node, order: period.nodes.length }];
              return { ...period, nodes: newNodes.sort((a, b) => a.order - b.order) };
            }
            return period;
          });
          return { ...cat, periods: updatedPeriods };
        } else {
          // Save to Category (Root) - Backward Compatibility or intentional root nodes
          const existingIdx = cat.nodes.findIndex(n => n.id === node.id);
          const newNodes = existingIdx > -1
            ? cat.nodes.map(n => n.id === node.id ? node : n)
            : [...cat.nodes, { ...node, order: cat.nodes.length }];
          return { ...cat, nodes: newNodes.sort((a, b) => a.order - b.order) };
        }
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
      title: 'Soruyu Sil',
      message: "Bu soruyu silmek istediğinize emin misiniz?",
      onConfirm: () => {
        const updatedCategories = categories.map(cat => {
          if (cat.id === selectedCatId) {
            if (selectedPeriodId) {
              return {
                ...cat,
                periods: cat.periods.map(p => p.id === selectedPeriodId ? { ...p, nodes: p.nodes.filter(n => n.id !== nodeId) } : p)
              };
            } else {
              return { ...cat, nodes: cat.nodes.filter(n => n.id !== nodeId) };
            }
          }
          return cat;
        });
        updateGlobalCategories(updatedCategories);
        closeDialog();
      }
    });
  };

  const handleResetSystem = () => {
    setDialogState({
      type: 'CONFIRM',
      title: 'Sistemi Sıfırla',
      message: "DİKKAT! Tüm veritabanı silinecek. Emin misiniz?",
      onConfirm: async () => {
        await clearDatabase();
        window.location.reload();
      }
    });
  };

  // Helper to get active node list
  const getActiveNodes = () => {
    const cat = categories.find(c => c.id === selectedCatId);
    if (!cat) return [];
    if (selectedPeriodId) {
      return cat.periods.find(p => p.id === selectedPeriodId)?.nodes || [];
    }
    return cat.nodes || [];
  };

  const getBreadcrumbs = () => {
    if (!selectedCatId) return "Kategoriler";
    const cat = categories.find(c => c.id === selectedCatId);
    if (!selectedPeriodId) return `Kategoriler > ${cat?.name}`;
    const period = cat?.periods?.find(p => p.id === selectedPeriodId);
    return `Kategoriler > ${cat?.name} > ${period?.name}`;
  };

  return (
    <div className="fixed inset-0 z-[300] bg-slate-100 flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-white border-r border-slate-200 flex flex-col z-20 shadow-xl">
        <div className="p-6 flex flex-col items-center border-b border-slate-100 bg-slate-50/50">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center text-3xl mb-4 text-white">⚡</div>
          <h2 className="font-bold text-slate-800 tracking-tight text-lg">MASTER PANEL</h2>
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1 bg-slate-100 px-2 py-0.5 rounded">Pro Edition v3.1</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {[
            { id: 'DASHBOARD', icon: '📊', label: 'Dashboard' },
            { id: 'CONTENT', icon: 'folder', label: 'İçerik Yönetimi' },
            { id: 'USERS', icon: 'people', label: 'Kullanıcılar' },
            { id: 'SYSTEM', icon: 'settings', label: 'Sistem Ayarları' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
              <span className="material-icons-outlined text-lg">{tab.icon === 'folder' ? '📂' : tab.icon === 'people' ? '👥' : tab.icon === 'settings' ? '⚙️' : tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100 bg-slate-50/30 space-y-3">
          <Button fullWidth variant="primary" onClick={handlePushToCloud} startIcon="☁️">Verileri Kaydet</Button>
          <Button fullWidth variant="outline" onClick={() => onClose()} startIcon="👁️">Oyuna Dön</Button>
          <Button fullWidth variant="danger" onClick={() => { sessionStorage.removeItem('ADMIN_AUTH'); window.location.reload(); }} startIcon="🔒">Güvenli Çıkış</Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto p-6 md:p-10 relative">
        {/* Loading Overlay */}
        {isDeploying && (
          <div className="absolute inset-0 z-[400] bg-white/90 backdrop-blur flex flex-col items-center justify-center p-12">
            <h3 className="text-blue-600 font-bold text-xl uppercase tracking-widest animate-pulse">Senkronizasyon...</h3>
          </div>
        )}

        {activeTab === 'DASHBOARD' && (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header><h1 className="text-3xl font-bold text-slate-800">Genel Durum</h1></header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card title="Kategoriler" className="border-l-4 border-l-blue-500"><div className="text-3xl font-bold">{categories.length}</div></Card>
              <Card title="Kullanıcılar" className="border-l-4 border-l-purple-500"><div className="text-3xl font-bold">{allUsers.length}</div></Card>
            </div>
          </div>
        )}

        {activeTab === 'CONTENT' && (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">İçerik Yönetimi</h1>
                <p className="text-sm text-slate-500 mt-1 font-mono tracking-wide">{getBreadcrumbs()}</p>
              </div>
              <div className="flex gap-2">
                {selectedPeriodId && <Button size="sm" variant="ghost" onClick={() => setSelectedPeriodId('')}>← Dönemlere Dön</Button>}
                {selectedCatId && !selectedPeriodId && <Button size="sm" variant="ghost" onClick={() => setSelectedCatId('')}>← Kategorilere Dön</Button>}
              </div>
            </div>

            {/* LEVEL 1: CATEGORIES */}
            {!selectedCatId && (
              <>
                <div className="flex justify-end"><Button onClick={handleAddCategory} startIcon="+">Yeni Kategori Ekle</Button></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map(cat => (
                    <div key={cat.id} className="group relative bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all">
                      <h3 className="font-bold text-lg text-slate-800 mb-2">{cat.name}</h3>
                      <p className="text-slate-500 text-xs mb-4 line-clamp-2">{cat.description}</p>
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-50">
                        <span className="text-xs font-bold text-slate-400">{(cat.periods || []).length} Dönem</span>
                        <Button size="sm" onClick={() => setSelectedCatId(cat.id)}>İncele →</Button>
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <IconButton size="sm" onClick={() => handleUpdateCategory(cat.id)}>✏️</IconButton>
                        <IconButton size="sm" variant="danger" onClick={() => handleDeleteCategory(cat.id)}>🗑️</IconButton>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* LEVEL 2: PERIODS in Category */}
            {selectedCatId && !selectedPeriodId && (
              <div className="space-y-6">
                {/* Current Category Info */}
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex justify-between items-center">
                  <div>
                    <h2 className="font-bold text-xl text-blue-900">{categories.find(c => c.id === selectedCatId)?.name}</h2>
                    <p className="text-blue-700/70 text-sm">Bu kategorideki dönemler aşağıdadır.</p>
                  </div>
                  <Button onClick={handleAddPeriod} startIcon="+">Yeni Dönem Ekle</Button>
                </div>

                {/* Periods List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(categories.find(c => c.id === selectedCatId)?.periods || []).map(period => (
                    <div key={period.id} className="group bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedPeriodId(period.id)}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg text-xl">⏳</div>
                        <div className="opacity-0 group-hover:opacity-100 flex gap-1" onClick={e => e.stopPropagation()}>
                          <IconButton size="sm" onClick={() => {
                            setSelectedPeriodId(period.id);
                            setDialogState({ type: 'EDIT_PERIOD', title: 'Dönem Adı', inputValue: period.name });
                          }}>✏️</IconButton>
                          <IconButton size="sm" variant="danger" onClick={() => handleDeletePeriod(period.id)}>🗑️</IconButton>
                        </div>
                      </div>
                      <h4 className="font-bold text-slate-800 text-lg mb-1">{period.name}</h4>
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">{period.nodes.length} Soru</span>
                    </div>
                  ))}
                  {(categories.find(c => c.id === selectedCatId)?.periods || []).length === 0 && (
                    <div className="col-span-full text-center py-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                      Bu kategoride hiç dönem yok. Yukarıdan ekleyebilirsiniz.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* LEVEL 3: NODES (Questions) in Period */}
            {selectedCatId && selectedPeriodId && (
              <Card
                title={`Sorular: ${categories.find(c => c.id === selectedCatId)?.periods.find(p => p.id === selectedPeriodId)?.name}`}
                actions={<Button size="sm" onClick={() => setIsAddingNode(true)}>+ Yeni Soru Ekle</Button>}
              >
                {isAddingNode && (
                  <div className="mb-8 bg-slate-50 p-6 rounded-xl border border-slate-200 animate-in fade-in">
                    <h4 className="font-bold text-slate-700 mb-4">Yeni Soru Ekle</h4>
                    <NodeEditor order={getActiveNodes().length} onSave={handleSaveNode} onCancel={() => setIsAddingNode(false)} />
                  </div>
                )}

                <div className="space-y-3">
                  {getActiveNodes().map((node, index) => (
                    <div key={node.id}>
                      {isEditingNode === node.id ? (
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                          <NodeEditor node={node} order={node.order} onSave={handleSaveNode} onCancel={() => setIsEditingNode(null)} />
                        </div>
                      ) : (
                        <div className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-lg hover:shadow-sm">
                          <div className="flex items-center gap-4">
                            <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs">{index + 1}</span>
                            <div>
                              <h4 className="font-bold text-slate-800">{node.title}</h4>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="info">Tip: {node.questionType}</Badge>
                                <Badge variant="warning">Yıl: {node.correctYear}</Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                            <Button size="sm" variant="ghost" onClick={() => setIsEditingNode(node.id)}>Düzenle</Button>
                            <IconButton size="sm" variant="danger" onClick={() => handleDeleteNode(node.id)}>🗑️</IconButton>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

          </div>
        )}

        {/* --- USERS & SYSTEM TABS (Unchanged mostly) --- */}
        {activeTab === 'USERS' && (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in">
            <div className="flex justify-between items-center"><h1 className="text-3xl font-bold text-slate-800">Kullanıcılar</h1><Button onClick={refreshUsers}>Yenile</Button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allUsers.map(user => (
                <Card key={user.id} className="relative group">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100"><IconButton variant="danger" size="sm" onClick={() => deleteUserFromCloud(user.id).then(refreshUsers)}>🗑️</IconButton></div>
                  <div className="text-center"><h3 className="font-bold">{user.username}</h3><p>Lvl {user.level}</p></div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* --- GUILDS TAB --- */}
        {activeTab === 'GUILDS' && (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in">
            <div className="flex justify-between items-center"><h1 className="text-3xl font-bold text-slate-800">Loncalar ({allGuilds.length})</h1><Button onClick={fetchAdminGuilds}>Yenile</Button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allGuilds.map((g: any) => (
                <div key={g.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg text-slate-800">{g.name}</h4>
                      <Badge variant={g.privacy === 'CLOSED' ? 'danger' : 'success'}>{g.privacy === 'CLOSED' ? 'Gizli' : 'Açık'}</Badge>
                    </div>
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{g.description}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <span className="bg-slate-100 px-2 py-1 rounded">👑 {g.leaderName}</span>
                      <span className="bg-slate-100 px-2 py-1 rounded">👥 {g.members?.length || 0} Üye</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- SYSTEM TAB --- */}
        {activeTab === 'SYSTEM' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in">
            <h1 className="text-3xl font-bold text-slate-800">Sistem Ayarları</h1>
            <Card title="Genel Yapılandırma">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <div>
                    <span className="font-bold text-slate-700 block">Otomatik Senkronizasyon</span>
                    <span className="text-xs text-slate-400">Verileri otomatik olarak buluta yedekler.</span>
                  </div>
                  <Switch checked={settings.autoSync} onChange={c => handleSettingChange('autoSync', c)} />
                </div>
                <div className="flex justify-between items-center bg-red-50 p-4 rounded-lg border border-red-100">
                  <div>
                    <span className="font-bold text-red-800 block">🚨 BAKIM MODU</span>
                    <span className="text-xs text-red-600/80">Siteyi erişime kapatır ve sadece yöneticiler girebilir.</span>
                  </div>
                  <Switch checked={settings.maintenanceMode} onChange={c => handleSettingChange('maintenanceMode', c)} />
                </div>
              </div>
            </Card>
            <div className="pt-8 border-t border-slate-200">
              <h4 className="font-bold text-slate-400 text-xs mb-4 uppercase tracking-wider">TEHLİKELİ BÖLGE</h4>
              <Button fullWidth variant="danger" onClick={handleResetSystem}>SİSTEM SIFIRLAMA (HER ŞEYİ SİL)</Button>
            </div>
          </div>
        )}

        {activeTab === 'GUILDS' && (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in">
            <div className="flex justify-between items-center"><h1 className="text-3xl font-bold text-slate-800">Loncalar ({allGuilds.length})</h1><Button onClick={fetchAdminGuilds}>Yenile</Button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allGuilds.map((g: any) => (
                <div key={g.id} className="bg-white p-4 rounded border border-slate-200 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-700">{g.name}</h4>
                    <p className="text-xs text-slate-500">{g.members?.length || 0} Üye | Lider: {g.leaderName}</p>
                  </div>
                  {/* Add delete button if needed later */}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'SYSTEM' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Sistem</h1>
            <Card title="Ayarlar">
              <div className="flex justify-between mb-4 border-b pb-2"><span>Oto-Sync</span><Switch checked={settings.autoSync} onChange={c => handleSettingChange('autoSync', c)} /></div>
              <div className="flex justify-between mb-4 text-red-800 bg-red-50 p-2 rounded"><span> BAKIM MODU (Siteyi Kapatır)</span><Switch checked={settings.maintenanceMode} onChange={c => handleSettingChange('maintenanceMode', c)} /></div>
            </Card>
            <Button variant="danger" onClick={handleResetSystem}>Sıfırla</Button>
          </div>
        )}

      </main>

      {/* Unified Dialog */}
      <Modal isOpen={!!dialogState.type} onClose={closeDialog} title={dialogState.title || ''} actions={
        <>
          <Button variant="ghost" onClick={closeDialog}>İptal</Button>
          {['ADD_CATEGORY', 'EDIT_CATEGORY', 'ADD_PERIOD', 'EDIT_PERIOD'].includes(dialogState.type || '') && (
            <Button onClick={() => {
              if (dialogState.type === 'ADD_CATEGORY') confirmAddCategory(dialogState.inputValue!);
              if (dialogState.type === 'EDIT_CATEGORY') confirmEditCategory(dialogState.inputValue!);
              if (dialogState.type === 'ADD_PERIOD') confirmAddPeriod(dialogState.inputValue!);
              if (dialogState.type === 'EDIT_PERIOD') confirmEditPeriod(dialogState.inputValue!);
            }}>Kaydet</Button>
          )}
          {dialogState.type === 'CONFIRM' && <Button variant="danger" onClick={dialogState.onConfirm}>Onayla</Button>}
        </>
      }>
        {['ADD_CATEGORY', 'EDIT_CATEGORY', 'ADD_PERIOD', 'EDIT_PERIOD'].includes(dialogState.type || '') ? (
          <Input autoFocus label="İsim" value={dialogState.inputValue} onChange={e => setDialogState({ ...dialogState, inputValue: e.target.value })} />
        ) : <p>{dialogState.message}</p>}
      </Modal>

    </div>
  );
};

export default AdminPanel;
