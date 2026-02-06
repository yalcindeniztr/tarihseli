import React, { useState, useEffect } from 'react';
import { UserProfile, Friend, Guild, Category } from '../types';
import { Modal, Button, Input } from './Admin/MaterialUI';
import { fetchAllUsersFromCloud, sendDuelInvite, getMuhafizByUsername, createNewGuild, joinGuild, leaveGuild, fetchAllGuilds } from '../services/firebase';
import GuildLeaderboard from './GuildLeaderboard';

interface ProfileDashboardProps {
  user: UserProfile;
  guild: Guild | null;
  categories: Category[]; // Add categories prop
  onDeleteProfile: () => void;
  onBack: () => void;
  onAdminAccess?: () => void;
  onUpdateUser: (updatedUser: UserProfile) => void;
}

// Basic User Summary for Search Results
interface UserSummary {
  id: string;
  username: string;
  level: number;
}

const ProfileDashboard: React.FC<ProfileDashboardProps> = ({ user, guild, categories, onDeleteProfile, onBack, onAdminAccess, onUpdateUser }) => {
  const [activeModal, setActiveModal] = useState<'NONE' | 'DELETE_CONFIRM' | 'JOIN_GUILD' | 'INVITE' | 'CREATE_GUILD' | 'FIND_GUILD' | 'INVENTORY' | 'KEY_DETAIL'>('NONE');
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);

  // Search / Invite State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [isInvitingDirectly, setIsInvitingDirectly] = useState(false);

  // Guild State
  const [isGuildLoading, setIsGuildLoading] = useState(false);
  const [newGuildName, setNewGuildName] = useState('');
  const [newGuildDesc, setNewGuildDesc] = useState('');
  const [availableGuilds, setAvailableGuilds] = useState<Guild[]>([]);

  // Load Guilds when modal opens
  useEffect(() => {
    if (activeModal === 'FIND_GUILD') {
      loadGuilds();
    }
  }, [activeModal]);

  const loadGuilds = async () => {
    setIsGuildLoading(true);
    const guilds = await fetchAllGuilds();
    setAvailableGuilds(guilds);
    setIsGuildLoading(false);
  };

  // --- Handlers ---

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const users = await fetchAllUsersFromCloud();
      const matches = users
        .filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()) && u.id !== user.id)
        .map(u => ({ id: u.id, username: u.username, level: u.level }));
      setSearchResults(matches);
    } catch (error) {
      console.error("Arama hatası:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendInvite = async (targetUser: UserSummary) => {
    await sendDuelInvite(user, targetUser.id);
    alert(`⚔️ ${targetUser.username} muhafızına düello daveti gönderildi!`);
  };

  const handleDirectInvite = async () => {
    if (!inviteUsername.trim()) return;
    setIsInvitingDirectly(true);
    try {
      const targetUser = await getMuhafizByUsername(inviteUsername);
      if (targetUser) {
        await sendDuelInvite(user, targetUser.id);
        alert(`⚔️ ${targetUser.username} muhafızına düello daveti gönderildi!`);
        setInviteUsername('');
      } else {
        alert("❌ Muhafız bulunamadı.");
      }
    } catch (error) {
      console.error("Davet hatası:", error);
      alert("Bir hata oluştu.");
    } finally {
      setIsInvitingDirectly(false);
    }
  };

  const handleCreateGuild = async () => {
    if (!newGuildName.trim()) return;
    setIsGuildLoading(true);
    try {
      await createNewGuild(user.id, user.username, newGuildName, newGuildDesc);
      alert("✅ Lonca başarıyla kuruldu!");
      setActiveModal('NONE');
      // Update local user state immediately
      onUpdateUser({ ...user, guildId: user.id }); // Guild ID is same as creator ID usually or returned. ideally fetch. 
      // For now assume ID pattern or re-fetch user.
      const updatedUser = await fetchAllUsersFromCloud().then(users => users.find(u => u.id === user.id));
      if (updatedUser) onUpdateUser(updatedUser);

    } catch (error) {
      console.error("Lonca kurma hatası:", error);
      alert("Lonca kurulamadı.");
    } finally {
      setIsGuildLoading(false);
    }
  };

  const handleJoinGuildAction = async (guildId: string) => {
    setIsGuildLoading(true);
    try {
      await joinGuild(guildId, user.id);
      alert("✅ Loncaya katıldın!");
      setActiveModal('NONE');
      // Update local state
      onUpdateUser({ ...user, guildId: guildId });
    } catch (error) {
      console.error("Katılma hatası:", error);
      alert("Loncaya katılınamadı.");
    } finally {
      setIsGuildLoading(false);
    }
  };

  const handleLeaveGuildAction = async () => {
    if (!user.guildId) return;
    if (!confirm("Loncadan ayrılmak istediğine emin misin?")) return;

    try {
      await leaveGuild(user.guildId, user.id);
      alert("Loncadan ayrıldın.");
      onUpdateUser({ ...user, guildId: undefined });
    } catch (error) {
      console.error("Ayrılma hatası:", error);
    }
  };

  const handleOpenFindGuild = () => {
    setActiveModal('FIND_GUILD');
  };

  // Helper to find key source
  const getKeySource = (keyId: string) => {
    for (const cat of categories) {
      const node = cat.nodes.find(n => n.rewardKeyId === keyId);
      if (node) return node.title;
    }
    return "Bilinmeyen Kaynak";
  };

  // Helper for Profile Titles
  const getTitleForLevel = (lvl: number) => {
    if (lvl >= 50) return "ZAMANIN EFENDİSİ";
    if (lvl >= 30) return "BÜYÜK ÜSTAT";
    if (lvl >= 20) return "TARİH KORUYUCUSU";
    if (lvl >= 10) return "KAYIP ZAMAN YOLCUSU";
    if (lvl >= 5) return "TECRÜBELİ MUHAFIZ";
    return "ACEMİ MUHAFIZ";
  };

  return (
    <>
      <div className="fixed inset-0 z-[150] bg-[#e6e6e1] overflow-y-auto animate-in fade-in duration-500 font-sans">
        <div className="max-w-6xl mx-auto p-4 md:p-8 relative">

          {/* Top Navigation Bar */}
          <div className="flex justify-between items-center mb-12 sticky top-0 bg-[#e6e6e1]/90 backdrop-blur-sm z-50 py-4 border-b border-[#8b7d6b]/10">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-[#5a4d3b] hover:text-[#2c1e11] transition-colors group"
            >
              <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
              <span className="font-display text-[11px] tracking-[0.2em] font-black uppercase">KARARGAHA DÖN</span>
            </button>

            {/* Admin Trigger (Subtle) */}
            <div
              className="w-6 h-6 rounded-full border border-[#8b7d6b]/20 hover:bg-[#8b7d6b] hover:border-transparent cursor-pointer transition-all duration-300 group flex items-center justify-center"
              onClick={onAdminAccess}
            >
              <span className="text-[10px] text-[#8b7d6b] group-hover:text-white opacity-50 group-hover:opacity-100">⚡</span>
            </div>
          </div>

          {/* MASTER PRO HEADER */}
          <header className="relative mb-20">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#8b7d6b]/30 to-transparent"></div>

            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 py-10">
              {/* Avatar Section */}
              <div className="relative group">
                <div className="absolute inset-0 bg-[#8b7d6b] rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-[#2c1e11] to-[#3e342b] rounded-full flex items-center justify-center shadow-2xl border-4 border-[#dcdcd7] relative z-10 overflow-hidden ring-4 ring-[#8b7d6b]/10">
                  {user.username === 'Müze Müdürü' ? (
                    <span className="text-6xl filter drop-shadow-lg">🏛️</span>
                  ) : (
                    <span className="text-6xl filter drop-shadow-lg">💂</span>
                  )}
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#8b7d6b] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg z-20 whitespace-nowrap">
                  Seviye {user.level}
                </div>
              </div>

              {/* User Info Section */}
              <div className="text-center md:text-left flex-grow">
                <h4 className="text-[#8b7d6b] font-display text-xs tracking-[0.4em] font-black uppercase mb-2 opacity-80">{getTitleForLevel(user.level)}</h4>
                <h1 className="text-4xl md:text-6xl font-display text-[#2c1e11] font-black uppercase tracking-tighter mb-4 drop-shadow-sm">{user.username}</h1>

                {/* XP Progress Bar */}
                <div className="max-w-md mx-auto md:mx-0">
                  <div className="flex justify-between text-[10px] font-bold text-[#8b6508] mb-1 uppercase tracking-widest">
                    <span>TECRÜBE (XP)</span>
                    <span>{user.xp} / {user.level * 1000}</span>
                  </div>
                  <div className="h-3 w-full bg-[#dcdcd7] rounded-full overflow-hidden shadow-inner border border-[#8b7d6b]/10">
                    <div
                      className="h-full bg-gradient-to-r from-[#8b6508] to-[#b8860b] shadow-[0_0_10px_#b8860b]"
                      style={{ width: `${Math.min((user.xp / (user.level * 1000)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-6 md:gap-10 border-t md:border-t-0 md:border-l border-[#8b7d6b]/20 pt-6 md:pt-0 md:pl-10">
                <div className="text-center group cursor-pointer" onClick={() => setActiveModal('INVENTORY')}>
                  <div className="text-3xl md:text-4xl font-black text-[#2c1e11] group-hover:text-[#8b6508] transition-colors mb-1">{user.unlockedKeys.length}</div>
                  <div className="text-[9px] text-[#8b7d6b] font-bold uppercase tracking-[0.2em]">MÜHÜRLER</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-black text-[#2c1e11] mb-1">{user.friends.length}</div>
                  <div className="text-[9px] text-[#8b7d6b] font-bold uppercase tracking-[0.2em]">DOSTLAR</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-black text-[#2c1e11] mb-1">{user.achievements.length}</div>
                  <div className="text-[9px] text-[#8b7d6b] font-bold uppercase tracking-[0.2em]">BAŞARIM</div>
                </div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* LEFT COLUMN: Personal (Inventory & Achievements) - Span 4 */}
            <div className="lg:col-span-4 space-y-8">
              {/* Inventory Card */}
              <div
                onClick={() => setActiveModal('INVENTORY')}
                className="bg-white p-6 rounded-xl shadow-[0_10px_30px_rgb(0,0,0,0.05)] border border-[#8b7d6b]/10 hover:border-[#8b7d6b]/30 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#8b6508]/5 rounded-bl-full -mr-4 -mt-4 group-hover:bg-[#8b6508]/10 transition-colors"></div>
                <h3 className="font-display text-xs text-[#8b7d6b] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                  <span>🗝️</span> KOLEKSİYON
                </h3>

                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-3xl font-black text-[#2c1e11]">{user.unlockedKeys.length}</span>
                    <span className="text-xs font-bold text-stone-400 ml-1">/ {categories.reduce((acc, c) => acc + (c.nodes?.filter(n => n.rewardKeyId).length || 0) + (c.periods?.reduce((pAcc, p) => pAcc + p.nodes.filter(n => n.rewardKeyId).length, 0) || 0), 0)}</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#8b6508] underline opacity-0 group-hover:opacity-100 transition-opacity">İNCELE →</span>
                </div>
              </div>

              {/* Achievements Card */}
              <div className="bg-white p-6 rounded-xl shadow-[0_10px_30px_rgb(0,0,0,0.05)] border border-[#8b7d6b]/10">
                <h3 className="font-display text-xs text-[#8b7d6b] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                  <span>🏆</span> BAŞARIMLAR
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.achievements.map((ach, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-[#f5f5f0] text-[#5a4d3b] text-[9px] font-bold rounded-full border border-[#dcdcd7] uppercase tracking-wide hover:bg-[#8b6508] hover:text-white transition-colors cursor-default">
                      {ach.replace(/_/g, ' ')}
                    </span>
                  ))}
                  {user.achievements.length === 0 && (
                    <div className="text-center w-full py-4 text-stone-300 italic text-xs">Henüz bir efsane yazılmadı...</div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Social (Guild & Friends) - Span 8 */}
            <div className="lg:col-span-8 space-y-10">

              {/* GUILD SECTION */}
              <section>
                <div className="flex justify-between items-end mb-6 pb-2 border-b border-[#8b7d6b]/10">
                  <h3 className="font-display text-sm text-[#2c1e11] font-black uppercase tracking-[0.3em]">MUHAFIZ BİRLİĞİ</h3>
                  {user.guildId && <span className="text-[10px] font-bold text-[#8b6508] bg-[#8b6508]/10 px-3 py-1 rounded-full">AKTİF ÜYE</span>}
                </div>

                {guild ? (
                  <div className="bg-gradient-to-br from-[#2c1e11] to-[#1a1512] rounded-2xl p-8 relative overflow-hidden text-[#dcdcd7] shadow-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div>
                        <h2 className="text-3xl font-display font-black tracking-widest text-[#efefef] mb-2">{guild.name.toUpperCase()}</h2>
                        <p className="text-white/60 text-xs max-w-lg leading-relaxed italic mb-6">"{guild.description}"</p>
                        <div className="flex gap-6">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-[#8b7d6b]">ÜYELER</span>
                            <span className="text-xl font-black">{guild.members.length}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-[#8b7d6b]">KUDRET</span>
                            <span className="text-xl font-black text-amber-500">{guild.totalScore}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        {/* <button className="px-6 py-3 bg-[#8b6508] text-white text-[10px] font-black tracking-[0.2em] uppercase rounded hover:bg-[#a0740a] transition-colors shadow-lg">
                                LİDER TABLOSU
                             </button> */}
                        <button
                          onClick={handleLeaveGuildAction}
                          className="px-6 py-3 border border-white/20 text-white/50 text-[10px] font-black tracking-[0.2em] uppercase rounded hover:bg-red-900/50 hover:text-white hover:border-red-500/50 transition-all"
                        >
                          BİRLİKTEN AYRIL
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#f0f0eb] rounded-2xl p-8 border-2 border-dashed border-[#dcdcd7] flex flex-col items-center justify-center text-center">
                    <div className="text-4xl mb-4 opacity-30">🛡️</div>
                    <h3 className="text-lg font-display font-black text-[#5a4d3b] mb-2">BİR YOLDAŞLIK BUL</h3>
                    <p className="text-xs text-stone-500 max-w-md mb-6 leading-relaxed">Tarihin tozlu sayfalarında yalnız yürümek zordur. Bir loncaya katılarak gücünü birleştir, efsaneleri birlikte çöz.</p>
                    <div className="flex gap-4">
                      <button onClick={handleOpenFindGuild} className="px-6 py-2 bg-[#2c1e11] text-white text-[10px] font-black uppercase tracking-widest rounded hover:bg-[#4a3b2a] transition-colors">LONCA ARA</button>
                      <button onClick={() => setActiveModal('CREATE_GUILD')} className="px-6 py-2 border border-[#2c1e11] text-[#2c1e11] text-[10px] font-black uppercase tracking-widest rounded hover:bg-[#2c1e11] hover:text-white transition-colors">YENİ KUR</button>
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  <GuildLeaderboard guilds={availableGuilds.length > 0 ? availableGuilds : []} />
                </div>
              </section>

              {/* FRIENDS SECTION */}
              <section>
                <div className="flex justify-between items-end mb-6 pb-2 border-b border-[#8b7d6b]/10">
                  <h3 className="font-display text-sm text-[#2c1e11] font-black uppercase tracking-[0.3em]">DOSTLAR & RAKİPLER</h3>
                  <button onClick={() => setActiveModal('INVITE')} className="text-[10px] font-bold text-[#8b6508] hover:underline uppercase tracking-wider">+ MUHAFIZ EKLE</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.friends.map(friend => (
                    <div key={friend.id} className="bg-white p-4 rounded-lg shadow-sm border border-stone-100 flex items-center justify-between group hover:border-[#8b7d6b]/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${friend.status === 'ONLINE' ? 'bg-green-500' : 'bg-stone-300'}`}></div>
                        <div>
                          <h4 className="font-display text-xs font-black text-[#2c1e11] tracking-wider">{friend.name}</h4>
                          <span className="text-[9px] font-bold text-stone-400 uppercase">SEVİYE {friend.level}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => sendDuelInvite(user, friend.id)} className="w-8 h-8 rounded-full bg-[#f0f0eb] flex items-center justify-center text-xs hover:bg-[#8b6508] hover:text-white transition-colors" title="Düello Daveti">⚔️</button>
                        {/* Delete friend logic could go here */}
                      </div>
                    </div>
                  ))}
                  {user.friends.length === 0 && (
                    <div className="col-span-full py-8 text-center text-stone-400 text-xs italic bg-[#f9f9f9] rounded-lg border border-dashed border-stone-200">
                      Listeniz boş. Yeni muhafızlar ekleyerek gücünüzü artırın.
                    </div>
                  )}
                </div>
              </section>

            </div>
          </div> {/* End Grid */}

          <footer className="mt-16 pt-10 border-t-2 border-[#8b7d6b]/20 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] text-stone-500 uppercase tracking-[0.4em] font-extrabold italic text-center md:text-left">Tarih, onu mühürleyenlerin elinde şekillenir.</p>
            <button
              onClick={() => setActiveModal('DELETE_CONFIRM')}
              className="w-full md:w-auto px-8 py-3 border-2 border-red-800/30 text-red-800 font-display text-[10px] tracking-[0.3em] uppercase hover:bg-red-800 hover:text-white transition-all font-black"
            >
              ARŞİVİ SIFIRLA VE SİL
            </button>
          </footer>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={activeModal === 'DELETE_CONFIRM'}
        onClose={() => setActiveModal('NONE')}
        title="ARŞİV SİLİNECEK"
        actions={
          <>
            <Button variant="ghost" onClick={() => setActiveModal('NONE')}>İPTAL</Button>
            <Button variant="danger" onClick={onDeleteProfile}>KALICI OLARAK SİL</Button>
          </>
        }
      >
        <p className="text-stone-700">Tüm ilerlemeniz, puanlarınız ve anahtarlarınız kalıcı olarak silinecek. Bu işlem geri alınamaz. Onaylıyor musunuz?</p>
      </Modal>

      <Modal
        isOpen={activeModal === 'INVITE'}
        onClose={() => setActiveModal('NONE')}
        title="MUHAFIZ ARA VE DAVET ET"
        actions={<Button variant="ghost" onClick={() => setActiveModal('NONE')}>KAPAT</Button>}
      >
        <div className="space-y-4">
          <p className="text-stone-600 text-sm">Düello yapmak veya dost eklemek istediğiniz muhafızın adını arayın.</p>
          <div className="flex gap-2">
            <Input
              placeholder="Muhafız Adı..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button onClick={handleSearch} disabled={isSearching}>ARA</Button>
          </div>

          <div className="max-h-32 overflow-y-auto space-y-2 mt-2 border border-slate-100 rounded p-2 bg-slate-50/50">
            {searchResults.length === 0 && !isSearching && <p className="text-[10px] text-stone-400 text-center py-2">Henüz sonuç yok.</p>}
            {searchResults.map(resUser => (
              <div key={resUser.id} className="flex items-center justify-between bg-white p-2 rounded border border-slate-100">
                <div>
                  <span className="font-bold text-stone-700 block text-[10px]">{resUser.username}</span>
                  <span className="text-[9px] text-stone-400 font-bold">LVL {resUser.level}</span>
                </div>
                <Button size="sm" onClick={() => handleSendInvite(resUser)}>DAVET</Button>
              </div>
            ))}
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-200"></div></div>
            <div className="relative flex justify-center text-[10px]"><span className="px-3 bg-white text-stone-400 font-bold uppercase tracking-widest leading-none">veya doğrudan davet</span></div>
          </div>

          <div className="space-y-3 bg-[#8b7d6b]/5 p-4 rounded-sm border border-[#8b7d6b]/20">
            <p className="text-[10px] text-[#8b7d6b] font-black uppercase tracking-wider">📜 TAM KULLANICI ADI İLE DAVET</p>
            <div className="flex gap-2">
              <Input
                placeholder="Örn: Tarihçi1071"
                value={inviteUsername}
                onChange={(e) => setInviteUsername(e.target.value)}
              />
              <Button color="secondary" onClick={handleDirectInvite} disabled={isInvitingDirectly}>
                {isInvitingDirectly ? "GÖNDERİLİYOR..." : "DÜELLOYA DAVET ET"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'CREATE_GUILD'}
        onClose={() => setActiveModal('NONE')}
        title="YENİ LONCA KUR"
        actions={
          <>
            <Button variant="ghost" onClick={() => setActiveModal('NONE')}>VAZGEÇ</Button>
            <Button onClick={handleCreateGuild} disabled={isGuildLoading || !newGuildName.trim()}>
              {isGuildLoading ? "KURULUYOR..." : "LONCAYI KUR (TAKIM OLUŞTUR)"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-stone-600 text-xs">Takım ruhunu yaşatacak bir isim ve muhafızları peşinden sürükleyecek bir vizyon belirle.</p>
          <Input
            label="LONCA ADI"
            placeholder="Örn: Kadim Muhafızlar"
            value={newGuildName}
            onChange={(e) => setNewGuildName(e.target.value)}
          />
          <Input
            label="VİZYON / AÇIKLAMA"
            placeholder="Örn: Tarihin mühürlerini koruyan asil birlik."
            value={newGuildDesc}
            onChange={(e) => setNewGuildDesc(e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'FIND_GUILD'}
        onClose={() => setActiveModal('NONE')}
        title="LONCA KEŞFET"
        actions={<Button variant="ghost" onClick={() => setActiveModal('NONE')}>KAPAT</Button>}
      >
        <div className="space-y-4">
          <p className="text-stone-600 text-xs">Kudretli bir birliğe katılarak tarih yolculuğunda takımınla birlikte yüksel.</p>
          <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-100 rounded p-2">
            {availableGuilds.length === 0 && !isGuildLoading && <p className="text-center text-xs text-stone-400 py-4">Aktif lonca bulunamadı.</p>}
            {availableGuilds.map(g => (
              <div key={g.id} className="bg-slate-50 p-3 rounded flex justify-between items-center border border-slate-100">
                <div>
                  <span className="font-bold text-stone-800 text-xs block">{g.name}</span>
                  <span className="text-[10px] text-stone-500">{g.members.length} Muhafız | {g.totalScore} Puan</span>
                </div>
                <Button size="sm" onClick={() => handleJoinGuildAction(g.id)} disabled={isGuildLoading}>KATIL</Button>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* INVENTORY MODAL */}
      <Modal
        isOpen={activeModal === 'INVENTORY'}
        onClose={() => setActiveModal('NONE')}
        title="MÜHÜR KOLEKSİYONU"
        actions={<Button variant="ghost" onClick={() => setActiveModal('NONE')}>KAPAT</Button>}
      >
        <div className="grid grid-cols-4 gap-4 p-2">
          {user.unlockedKeys.length === 0 ? (
            <p className="col-span-4 text-center text-stone-500 italic text-xs py-4">Henüz hiç mühür toplamadınız.</p>
          ) : (
            user.unlockedKeys.map((keyId, idx) => (
              <div
                key={idx}
                onClick={() => { setSelectedKeyId(keyId); setActiveModal('KEY_DETAIL'); }}
                className="aspect-square bg-[#8b7d6b]/10 rounded border border-[#8b7d6b]/30 flex items-center justify-center cursor-pointer hover:bg-[#8b7d6b]/20 hover:scale-105 transition-all"
              >
                <span className="text-2xl drop-shadow-md">🗝️</span>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* KEY DETAIL MODAL */}
      <Modal
        isOpen={activeModal === 'KEY_DETAIL'}
        onClose={() => setActiveModal('INVENTORY')} // Back to Inventory
        title="MÜHÜR DETAYI"
        actions={<Button variant="ghost" onClick={() => setActiveModal('INVENTORY')}>GERİ DÖN</Button>}
      >
        <div className="flex flex-col items-center justify-center py-8">
          {/* Rotating Key Animation */}
          <div className="w-32 h-32 relative animate-float-key mb-8">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border-4 border-amber-600 brass-texture shadow-2xl" />
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-4 h-20 brass-texture shadow-2xl" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-6 brass-texture shadow-2xl rounded-sm" />
          </div>

          <h3 className="font-display text-[#8b7d6b] text-lg font-black tracking-widest uppercase mb-2">KAZANILAN YER</h3>
          <div className="px-6 py-2 bg-[#8b7d6b]/10 rounded-full border border-[#8b7d6b]/30">
            <p className="text-stone-700 font-bold text-xs uppercase typing-demo">
              {selectedKeyId ? getKeySource(selectedKeyId) : "..."}
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ProfileDashboard;
