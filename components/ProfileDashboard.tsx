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
}

// Basic User Summary for Search Results
interface UserSummary {
  id: string;
  username: string;
  level: number;
}

const ProfileDashboard: React.FC<ProfileDashboardProps> = ({ user, guild, categories, onDeleteProfile, onBack, onAdminAccess }) => {
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
      window.location.reload(); // Refresh to update user guild status
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
      window.location.reload();
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
      window.location.reload();
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

  return (
    <>
      <div className="fixed inset-0 z-[150] bg-[#dcdcd7]/98 overflow-y-auto animate-in fade-in duration-300">
        <div className="max-w-4xl mx-auto p-6 md:p-12 relative">
          <button
            onClick={onBack}
            className="absolute top-6 left-6 text-[#8b7d6b] font-display text-xs tracking-widest hover:text-black uppercase font-black"
          >
            ← GERİ DÖN
          </button>

          {/* Admin Access Hidden Trigger */}
          <div className="absolute top-6 right-6 w-8 h-8 cursor-pointer opacity-10 hover:opacity-100 transition-opacity" onClick={onAdminAccess}>
            <span className="text-2xl">⚡</span>
          </div>

          <header className="text-center mb-16 pt-8">
            <div className="w-24 h-24 bg-[#8b7d6b] rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl border-4 border-[#dcdcd7] outline outline-1 outline-[#8b7d6b]">
              <span className="text-4xl text-[#dcdcd7]">💂</span>
            </div>
            <h2 className="text-3xl font-display text-stone-800 tracking-[0.2em] font-black uppercase mb-2">{user.username}</h2>
            <div className="flex justify-center gap-4 text-[10px] tracking-[0.2em] font-black uppercase text-[#8b7d6b]">
              <span>SEVİYE {user.level}</span>
              <span>•</span>
              <span>{user.xp} XP / {user.level * 1000}</span>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

            {/* Sol Kolon: İstatistikler */}
            <div className="space-y-8">
              <div className="bg-white/60 p-8 rounded-sm border border-[#8b7d6b]/20 shadow-sm relative overflow-hidden group hover:border-[#8b7d6b]/40 transition-colors">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#8b7d6b]/10 -mr-8 -mt-8 rounded-full"></div>
                <h3 className="font-display text-sm text-[#8b7d6b] uppercase tracking-[0.4em] mb-6 font-black border-b border-[#8b7d6b]/20 pb-3">KİŞİSEL KAYITLAR</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => setActiveModal('INVENTORY')}
                    className="bg-white/60 p-4 rounded border border-[#8b7d6b]/20 text-center shadow-sm cursor-pointer hover:bg-[#8b7d6b]/10 transition-colors group"
                  >
                    <span className="block text-2xl mb-1 group-hover:scale-110 transition-transform">🗝️</span>
                    <span className="block text-[#8b7d6b] font-display text-xl font-black">{user.unlockedKeys.length}</span>
                    <span className="text-[8px] text-stone-500 uppercase font-black tracking-tighter group-hover:text-[#8b7d6b]">Mühür Koleksiyonu</span>
                  </div>
                  <div className="bg-white/60 p-4 rounded border border-[#8b7d6b]/20 text-center shadow-sm">
                    <span className="block text-2xl mb-1">🤝</span>
                    <span className="block text-[#8b7d6b] font-display text-xl font-black">{user.friends.length}</span>
                    <span className="text-[8px] text-stone-500 uppercase font-black tracking-tighter">Dost</span>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-[10px] font-black uppercase text-stone-400 mb-2 tracking-widest">BAŞARIMLAR</h4>
                  <div className="flex gap-2 flex-wrap">
                    {user.achievements.map((ach, idx) => (
                      <span key={idx} className="px-2 py-1 bg-amber-100 text-amber-800 text-[9px] font-bold rounded border border-amber-200 uppercase tracking-wide">{ach.replace('_', ' ')}</span>
                    ))}
                    {user.achievements.length === 0 && <span className="text-[9px] text-stone-400 italic">Henüz başarım kilidi açılmadı.</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Orta Kolon: Sosyal Hub & Lonca */}
            <div className="md:col-span-1 space-y-12">
              <div className="bg-[#8b7d6b]/5 p-6 md:p-8 rounded border border-[#8b7d6b]/30 shadow-inner">
                <h3 className="font-display text-sm text-[#8b7d6b] uppercase tracking-[0.4em] mb-6 font-black border-b border-[#8b7d6b]/20 pb-3">MUHAFIZ BİRLİĞİ (LONCA)</h3>
                {guild ? (
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <span className="text-2xl font-display text-stone-800 tracking-[0.2em] font-black">{guild.name.toUpperCase()}</span>
                      <p className="text-[10px] text-stone-500 uppercase font-extrabold mt-2">{guild.members.length} AKTİF MUHAFIZ | {guild.totalScore} TOPLAM KUDRET</p>
                      <p className="text-[9px] text-stone-400 italic mt-1">"{guild.description}"</p>
                    </div>
                    <button
                      onClick={handleLeaveGuildAction}
                      className="text-[10px] text-red-800 border-2 border-red-800/30 px-5 py-2 hover:bg-red-800 hover:text-white transition-all uppercase font-black"
                    >
                      AYRIL
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-stone-600 font-serif-vintage italic mb-6 text-lg">Henüz bir birliğe dahil olmadınız, muhafız.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={handleOpenFindGuild}
                        className="px-10 py-3 bg-[#8b7d6b] text-[#dcdcd7] font-display text-[10px] tracking-[0.3em] uppercase hover:bg-black transition-all font-black shadow-lg"
                      >
                        LONCA BUL
                      </button>
                      <button
                        onClick={() => setActiveModal('CREATE_GUILD')}
                        className="px-10 py-3 border-2 border-[#8b7d6b] text-[#8b7d6b] font-display text-[10px] tracking-[0.3em] uppercase hover:bg-[#8b7d6b] hover:text-[#dcdcd7] transition-all font-black"
                      >
                        YENİ LONCA KUR
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <GuildLeaderboard guilds={availableGuilds.length > 0 ? availableGuilds : []} />

              <div>
                <h3 className="font-display text-sm text-[#8b7d6b] uppercase tracking-[0.4em] mb-6 font-black border-b border-[#8b7d6b]/20 pb-3">DOSTLAR VE RAKİPLER</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {user.friends.map(friend => (
                    <div key={friend.id} className="flex items-center gap-5 bg-white/70 p-4 rounded border border-[#8b7d6b]/10 hover:border-[#8b7d6b]/40 transition-all shadow-sm">
                      <div className={`w-3 h-3 rounded-full ${friend.status === 'ONLINE' ? 'bg-green-600 shadow-[0_0_10px_green]' : 'bg-stone-300'}`}></div>
                      <div className="flex-grow">
                        <span className="text-stone-800 font-display text-[11px] tracking-widest font-black">{friend.name.toUpperCase()}</span>
                        <p className="text-[9px] text-stone-500 uppercase font-bold mt-1">SEVİYE {friend.level}</p>
                      </div>
                      <button className="text-stone-300 hover:text-red-600 text-lg transition-colors font-bold">×</button>
                    </div>
                  ))}
                  <button
                    onClick={() => setActiveModal('INVITE')}
                    className="border-3 border-dashed border-[#8b7d6b]/20 p-4 rounded flex items-center justify-center text-stone-400 hover:border-[#8b7d6b]/50 hover:text-[#8b7d6b] transition-all text-[10px] font-black uppercase tracking-widest"
                  >
                    + YENİ DÜELLO / DOST ARA
                  </button>
                </div>
              </div>
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
