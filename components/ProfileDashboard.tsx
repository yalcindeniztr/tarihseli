import React, { useState } from 'react';
import { UserProfile, Friend, Guild } from '../types';
import { Modal, Button, Input } from './Admin/MaterialUI';
import { fetchAllUsersFromCloud, sendDuelInvite, getMuhafizByUsername, createNewGuild, joinGuild, leaveGuild, fetchAllGuilds } from '../services/firebase';
import GuildLeaderboard from './GuildLeaderboard';

interface ProfileDashboardProps {
  user: UserProfile;
  guild: Guild | null;
  onDeleteProfile: () => void;
  onBack: () => void;
  onAdminAccess?: () => void;
}

const ProfileDashboard: React.FC<ProfileDashboardProps> = ({ user, guild, onDeleteProfile, onBack, onAdminAccess }) => {
  const [activeModal, setActiveModal] = useState<'NONE' | 'DELETE_CONFIRM' | 'JOIN_GUILD' | 'INVITE' | 'CREATE_GUILD' | 'FIND_GUILD'>('NONE');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [isInvitingDirectly, setIsInvitingDirectly] = useState(false);

  // Guild States
  const [newGuildName, setNewGuildName] = useState('');
  const [newGuildDesc, setNewGuildDesc] = useState('');
  const [availableGuilds, setAvailableGuilds] = useState<Guild[]>([]);
  const [isGuildLoading, setIsGuildLoading] = useState(false);

  const handleJoinGuildAction = async (guildId: string) => {
    setIsGuildLoading(true);
    const success = await joinGuild(user.id, guildId);
    if (success) {
      alert("Loncaya başarıyla katıldınız!");
      window.location.reload(); // Refresh to sync App.tsx state
    } else {
      alert("Loncaya katılamadı.");
    }
    setIsGuildLoading(false);
    setActiveModal('NONE');
  };

  const handleCreateGuild = async () => {
    if (!newGuildName.trim()) return;
    setIsGuildLoading(true);
    const guildId = await createNewGuild(user.id, user.username, newGuildName.trim(), newGuildDesc.trim());
    if (guildId) {
      alert("Loncayı kurdunuz! Sancağınız daim olsun.");
      window.location.reload();
    } else {
      alert("Lonca kurulurken hata oluştu.");
    }
    setIsGuildLoading(false);
    setActiveModal('NONE');
  };

  const handleLeaveGuildAction = async () => {
    if (!user.guildId) return;
    if (!confirm("Loncadan ayrılmak istediğinize emin misiniz? Puan katkınız loncada kalacaktır.")) return;

    setIsGuildLoading(true);
    const success = await leaveGuild(user.id, user.guildId);
    if (success) {
      alert("Loncadan ayrıldınız.");
      window.location.reload();
    } else {
      alert("Ayrılma işlemi başarısız.");
    }
    setIsGuildLoading(false);
  };

  const handleOpenFindGuild = async () => {
    setIsGuildLoading(true);
    const gs = await fetchAllGuilds();
    setAvailableGuilds(gs);
    setIsGuildLoading(false);
    setActiveModal('FIND_GUILD');
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const allUsers = await fetchAllUsersFromCloud();
    const filtered = allUsers.filter(u =>
      u.id !== user.id &&
      u.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filtered);
    setIsSearching(false);
  };

  const handleSendInvite = async (targetUser: UserProfile) => {
    if (targetUser.id === user.id) {
      alert("Kendinize meydan okuyamazsınız!");
      return;
    }
    const inviteId = await sendDuelInvite(user, targetUser.id);
    if (inviteId) {
      alert(`${targetUser.username} adlı muhafıza düello daveti gönderildi!`);
      setActiveModal('NONE');
    } else {
      alert("Davet gönderilemedi. Bir hata oluştu.");
    }
  };

  const handleDirectInvite = async () => {
    if (!inviteUsername.trim()) return;
    if (inviteUsername.toLowerCase() === user.username.toLowerCase()) {
      alert("Kendinize meydan okuyamazsınız!");
      return;
    }

    setIsInvitingDirectly(true);
    const targetUser = await getMuhafizByUsername(inviteUsername.trim());

    if (targetUser) {
      await handleSendInvite(targetUser);
    } else {
      alert("Bu isimde bir muhafız bulunamadı. Lütfen tam adı doğru girdiğinizden emin olun.");
    }
    setIsInvitingDirectly(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-[150] bg-[#dcdcd7]/98 overflow-y-auto animate-in fade-in duration-300">
        <div className="min-h-full flex flex-col items-center py-10 px-4 md:px-10">
          <div className="w-full max-w-4xl parchment-bg gold-border relative rounded-sm p-6 md:p-12 flex flex-col shadow-2xl animate-in zoom-in duration-500 my-auto">
            {/* ... corners ... */}
            <div className="ornate-corner corner-tl"></div>
            <div className="ornate-corner corner-tr"></div>
            <div className="ornate-corner corner-bl"></div>
            <div className="ornate-corner corner-br"></div>

            <header className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6 pt-4">
              <div className="flex-grow">
                <h1 className="font-display text-3xl md:text-5xl text-[#8b7d6b] tracking-[0.2em] uppercase font-black leading-tight">MUHAFIZ ARŞİVİ</h1>
                <p className="text-stone-600 text-[10px] md:text-[12px] uppercase tracking-[0.6em] font-extrabold mt-2">KİMLİK NO: {user.id.split('-')[1]}</p>
              </div>
              <button onClick={onBack} className="w-full md:w-auto text-[#8b7d6b] hover:text-black font-display text-sm tracking-widest uppercase font-black border-2 border-[#8b7d6b]/30 px-6 py-2 rounded-sm hover:bg-[#8b7d6b]/10 transition-all">KAPAT [×]</button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 flex-grow">
              {/* Sol Kolon: Ana İstatistikler */}
              <div className="space-y-10 flex flex-col items-center md:items-stretch">
                <div className="relative group cursor-help w-fit mx-auto" onClick={onAdminAccess}>
                  <div className="w-32 h-32 md:w-40 md:h-40 brass-texture rounded-full flex items-center justify-center border-4 border-[#8b7d6b] shadow-2xl relative overflow-hidden">
                    <span className="text-6xl md:text-7xl">💂</span>
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#8b7d6b] text-[#dcdcd7] px-6 py-1.5 rounded-full font-display text-[10px] tracking-widest font-black shadow-xl">
                    SEVİYE {user.level}
                  </div>
                </div>

                <div className="text-center">
                  <h2 className="font-display text-2xl text-stone-900 font-black tracking-widest">{user.username.toUpperCase()}</h2>
                  <p className="text-[#8b7d6b] font-serif-vintage italic text-lg mt-1 font-bold">Kadim Tarih Muhafızı</p>
                </div>

                <div className="space-y-5 pt-6 border-t-2 border-[#8b7d6b]/20 w-full">
                  <div className="flex justify-between items-center text-[10px] font-black text-stone-700 uppercase tracking-widest">
                    <span>GELİŞİM (XP)</span>
                    <span>{user.xp} / {user.level * 1000}</span>
                  </div>
                  <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-[#8b7d6b] shadow-[0_0_15px_rgba(139,125,107,0.5)]" style={{ width: `${(user.xp / (user.level * 1000)) * 100}%` }}></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="bg-white/60 p-4 rounded border border-[#8b7d6b]/20 text-center shadow-sm">
                    <span className="block text-2xl mb-1">🗝️</span>
                    <span className="block text-[#8b7d6b] font-display text-xl font-black">{user.unlockedKeys.length}</span>
                    <span className="text-[8px] text-stone-500 uppercase font-black tracking-tighter">Mühür</span>
                  </div>
                  <div className="bg-white/60 p-4 rounded border border-[#8b7d6b]/20 text-center shadow-sm">
                    <span className="block text-2xl mb-1">🤝</span>
                    <span className="block text-[#8b7d6b] font-display text-xl font-black">{user.friends.length}</span>
                    <span className="text-[8px] text-stone-500 uppercase font-black tracking-tighter">Dost</span>
                  </div>
                </div>
              </div>

              {/* Orta Kolon: Sosyal Hub & Lonca */}
              <div className="md:col-span-2 space-y-12">
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
            </div>

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
    </>
  );
};

export default ProfileDashboard;
