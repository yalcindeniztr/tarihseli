
import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_CATEGORIES, INITIAL_ERAS } from './constants';
import { syncUserProfileToCloud, listenForInvites, respondToInvite, createDuelSession, updateDuelScore, updateDuelMove, listenToDuelSession, finishDuelSession, fetchGuildDetails, fetchAllGuilds, fetchAllUsersFromCloud, updateGuildScore } from './services/firebase';
import { GameState, QuestStatus, RiddleNode, GameMode, TeamProgress, UserProfile, Invite, DuelSession } from './types';
import { loadGameState, saveGameState, clearDatabase } from './services/db';
import MysteryBox from './components/MysteryBox';
import Stats from './components/Stats';
import VisualBox from './components/VisualBox';
import ARView from './components/ARView';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/Admin/AdminLogin';
import ModeSelector from './components/ModeSelector';
import CategorySelector from './components/CategorySelector';
import ProfileDashboard from './components/ProfileDashboard';
import InviteManager from './components/Duel/InviteManager';

import TermsModal from './components/TermsModal';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedNode, setSelectedNode] = useState<RiddleNode | null>(null);
  const [isARActive, setIsARActive] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showTerms, setShowTerms] = useState(false);
  const [view, setView] = useState<'LANDING' | 'CREATE_PROFILE' | 'AUTH'>('LANDING');
  const [invites, setInvites] = useState<Invite[]>([]);
  const [duelSession, setDuelSession] = useState<DuelSession | null>(null);

  // --- Admin Persistence ---
  useEffect(() => {
    const savedAdminOpen = sessionStorage.getItem('ADMIN_OPEN') === 'true';
    const savedAdminAuth = sessionStorage.getItem('ADMIN_AUTH') === 'true';
    if (savedAdminOpen) setIsAdminOpen(true);
    if (savedAdminAuth) setIsAdminAuthenticated(true);
  }, []);

  useEffect(() => {
    sessionStorage.setItem('ADMIN_OPEN', isAdminOpen.toString());
    sessionStorage.setItem('ADMIN_AUTH', isAdminAuthenticated.toString());
  }, [isAdminOpen, isAdminAuthenticated]);
  // --------------------------

  // Check Terms Acceptance on Mount
  useEffect(() => {
    const accepted = localStorage.getItem('TERMS_ACCEPTED_V1');
    if (!accepted) {
      setShowTerms(true);
    }
  }, []);

  // Listen for Invites
  useEffect(() => {
    if (gameState?.user?.id) {
      const unsubscribe = listenForInvites(gameState.user.id, (incoming) => {
        setInvites(incoming);
      });
      return () => unsubscribe();
    }
  }, [gameState?.user?.id]);

  const handleAcceptInvite = async (invite: Invite, wager: number) => {
    await respondToInvite(invite.id, 'ACCEPTED');

    // Create Duel Session in Cloud
    const defaultCategoryId = 'sub-huns';
    const duelId = await createDuelSession(invite, defaultCategoryId);

    if (!gameState) return;

    // Reset game for Duel
    // Team 1 = Opponent (From Invite), Team 2 = Me
    const team1: TeamProgress = { name: invite.fromName, currentStage: 0, unlockedKeys: [], score: 0 };
    const team2: TeamProgress = { name: gameState.user!.username, currentStage: 0, unlockedKeys: [], score: 0 };

    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        mode: 'DUEL',
        teams: [team1, team2],
        activeTeamIndex: 0,
        gameStarted: false,
        activeCategoryId: null,
        activeDuelId: duelId,
        activeWager: wager
      };
    });
    setInvites([]);
    alert(`⚔️ ${invite.fromName} ile düello başladı! İddia: ${wager} XP. Başarılar!`);
  };

  const handleRejectInvite = async (invite: Invite) => {
    await respondToInvite(invite.id, 'REJECTED');
    setInvites(prev => prev.filter(i => i.id !== invite.id));
  };

  // Real-time Duel Sync
  useEffect(() => {
    if (gameState?.activeDuelId) {
      const unsubscribe = listenToDuelSession(gameState.activeDuelId, (session) => {
        setDuelSession(session);

        // Sync teams in GameState if session changed
        setGameState(prev => {
          if (!prev || !prev.user) return prev;

          const isPlayer1 = session.player1.id === prev.user.id;
          const updatedTeams = [...prev.teams];

          // Index 0 is always the "other" team in display if we follow the accepting logic, 
          // let's be more robust: find team by name/id
          // For simplicity, let's update players by ID matching
          const p1TeamIdx = prev.teams.findIndex(t => t.name === session.player1.name);
          const p2TeamIdx = prev.teams.findIndex(t => t.name === session.player2.name);

          if (p1TeamIdx > -1) updatedTeams[p1TeamIdx].score = session.player1.score;
          if (p2TeamIdx > -1) updatedTeams[p2TeamIdx].score = session.player2.score;

          // Check for Completion
          const totalNodes = prev.categories.find(c => c.id === prev.activeCategoryId)?.nodes.length || 0;
          if (totalNodes > 0 && session.moves.length >= totalNodes && session.status === 'ACTIVE') {
            const isMePlayer1 = session.player1.id === prev.user.id;
            const myScore = isMePlayer1 ? session.player1.score : session.player2.score;
            const opScore = isMePlayer1 ? session.player2.score : session.player1.score;
            const wager = prev.activeWager || 100;

            let xpChange = 0;
            let resultMsg = "";

            if (myScore > opScore) {
              xpChange = wager;
              resultMsg = `🏆 TEBRİKLER! Düelloyu kazandınız. +${wager} XP kazandınız!`;
            } else if (myScore < opScore) {
              xpChange = -wager;
              resultMsg = `💔 KAYBETTİNİZ! Düelloyu rakip kazandı. -${wager} XP kaybettiniz.`;
            } else {
              resultMsg = "🤝 BERABERE! XP değişimi olmadı.";
            }

            alert(resultMsg);
            finishDuelSession(prev.activeDuelId);

            // Update user XP
            const updatedUser = { ...prev.user, xp: Math.max(0, prev.user.xp + xpChange) };

            return {
              ...prev,
              user: updatedUser,
              mode: 'SINGLE',
              activeDuelId: null,
              activeWager: null,
              gameStarted: false,
              setupComplete: true,
              isArchiveOpen: true
            };
          }

          // Determine whose turn it is in Team Index
          const activeTeamName = session.currentTurnUserId === session.player1.id ? session.player1.name : session.player2.name;
          const nextActiveIdx = updatedTeams.findIndex(t => t.name === activeTeamName);

          return {
            ...prev,
            teams: updatedTeams,
            activeTeamIndex: nextActiveIdx > -1 ? nextActiveIdx : prev.activeTeamIndex
          };
        });
      });
      return () => unsubscribe();
    }
  }, [gameState?.activeDuelId]);

  // Activity Timestamp Logic
  useEffect(() => {
    if (gameState?.user) {
      const now = Date.now();
      if (!gameState.user.lastActiveAt || now - gameState.user.lastActiveAt > 60000) {
        setGameState(prev => {
          if (!prev?.user) return prev;
          return {
            ...prev,
            user: { ...prev.user, lastActiveAt: now }
          };
        });
      }
    }
  }, [gameState?.user?.id]);

  // Guild & Global Data Sync
  useEffect(() => {
    const syncGlobalData = async () => {
      if (!gameState?.user) return;

      const allGuilds = await fetchAllGuilds();
      const allUsers = await fetchAllUsersFromCloud();

      let myGuild = null;
      if (gameState.user.guildId) {
        myGuild = await fetchGuildDetails(gameState.user.guildId);
      }

      setGameState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          availableGuilds: allGuilds,
          allUsers: allUsers,
          // Update nested guild if we want or just let Profile handle it? 
          // Let's keep it in availableGuilds and let UI filter.
        };
      });
    };

    if (gameState?.user?.id) {
      syncGlobalData();
    }
  }, [gameState?.user?.id, gameState?.user?.guildId]);

  const handleTermsAccept = () => {
    localStorage.setItem('TERMS_ACCEPTED_V1', 'true');
    setShowTerms(false);
  };

  // Başlangıç: Veritabanından yükle
  useEffect(() => {
    const init = async () => {
      try {
        const saved = await loadGameState();
        if (saved) {
          // Always start on Landing Page, even if state was saved during a game
          setGameState({
            ...saved,
            setupComplete: true, // We have a user
            isArchiveOpen: false, // But archive list is closed
            gameStarted: false
          });
        }
      } catch (e) {
        console.error("Veritabanı Hatası:", e);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // State değişimlerini kaydet ve senkronize et
  useEffect(() => {
    if (gameState) {
      saveGameState(gameState);
      if (gameState.user) {
        syncUserProfileToCloud(gameState.user);
      }
    }
  }, [gameState]);

  // Admin Auto-Login Logic
  useEffect(() => {
    if (isAdminAuthenticated && (gameState?.user?.id !== 'admin-superuser')) {
      // Auto-create Admin User context
      const adminUser: UserProfile = {
        id: 'admin-superuser',
        username: 'Yönetici (Admin)',
        level: 99,
        xp: 99999,
        unlockedKeys: [],
        friends: [],
        guildId: null,
        achievements: ['GAME_MASTER']
      };

      const currentCategories = gameState?.categories || INITIAL_CATEGORIES;
      const team: TeamProgress = { name: 'Admin Team', currentStage: 0, unlockedKeys: [], score: 0 };

      setGameState({
        user: adminUser,
        categories: currentCategories,
        activeCategoryId: null,
        mode: 'SINGLE',
        teams: [team],
        activeTeamIndex: 0,
        setupComplete: true,
        isArchiveOpen: false,
        gameStarted: false,
        availableGuilds: []
      });
    }
  }, [isAdminAuthenticated, gameState]);

  const handleSetupComplete = (mode: GameMode, names: string[]) => {
    const currentCategories = gameState?.categories && gameState.categories.length > 0
      ? gameState.categories
      : INITIAL_CATEGORIES;

    const teams: TeamProgress[] = names.map(name => ({
      name, currentStage: 0, unlockedKeys: [], score: 0
    }));

    const newUser: UserProfile = {
      id: `muhafiz-${Date.now()}`,
      username: names[0] || 'Adsız Muhafız',
      level: 1,
      xp: 0,
      unlockedKeys: [],
      friends: [],
      guildId: null,
      achievements: ['İLK_ADIM']
    };

    setGameState({
      user: newUser,
      categories: currentCategories,
      eras: INITIAL_ERAS,
      activeCategoryId: null,
      activeEraId: null,
      activeTopicId: null,
      activeSubTopicId: null,
      activeDuelId: null,
      activeWager: null,
      mode,
      teams,
      activeTeamIndex: 0,
      setupComplete: true,
      isArchiveOpen: true, // Auto-open for new users
      gameStarted: false,
      availableGuilds: []
    });
  };

  const handleCategorySelect = (subTopicId: string) => {
    // Find the subtopic in eras
    let foundSubTopic = null;
    let foundEra = null;
    let foundTopic = null;

    // Search in current eras state or initial
    const erasToSearch = gameState?.eras || INITIAL_ERAS;

    for (const era of erasToSearch) {
      for (const topic of era.topics) {
        const sub = topic.subTopics.find(s => s.id === subTopicId);
        if (sub) {
          foundSubTopic = sub;
          foundEra = era;
          foundTopic = topic;
          break;
        }
      }
      if (foundSubTopic) break;
    }

    if (foundSubTopic && gameState) {
      // Adapt SubTopic to Category for compatibility
      const legacyCategory = {
        id: foundSubTopic.id,
        name: foundSubTopic.name,
        description: foundTopic?.name || '',
        nodes: foundSubTopic.nodes
      };

      // Ensure this category is available in state for the game loop
      const updatedCategories = [...gameState.categories];
      if (!updatedCategories.find(c => c.id === legacyCategory.id)) {
        updatedCategories.push(legacyCategory);
      }

      setGameState({
        ...gameState,
        categories: updatedCategories,
        eras: erasToSearch,
        activeCategoryId: subTopicId,
        activeEraId: foundEra?.id || null,
        activeTopicId: foundTopic?.id || null,
        activeSubTopicId: subTopicId,
        gameStarted: true
      });
    } else {
      // Fallback for flat categories if needed
      setGameState(prev => prev ? ({ ...prev, activeCategoryId: subTopicId, gameStarted: true }) : null);
    }
  };

  const handleCollectReward = useCallback(() => {
    if (!selectedNode || !gameState || !gameState.activeCategoryId) return;

    // Turn control for Duel
    if (gameState.mode === 'DUEL' && gameState.activeDuelId && duelSession) {
      if (duelSession.currentTurnUserId !== gameState.user?.id) {
        alert("Sıra sizde değil! Rakibinizin hamlesini bekleyin.");
        return;
      }
    }

    setGameState(prev => {
      if (!prev || !prev.activeCategoryId || !prev.user) return prev;

      const teamIdx = prev.activeTeamIndex;
      const updatedTeams = [...prev.teams];
      const team = updatedTeams[teamIdx];

      const categoryIdx = prev.categories.findIndex(c => c.id === prev.activeCategoryId);
      if (categoryIdx === -1) return prev;

      const category = prev.categories[categoryIdx];
      const nodeIndex = category.nodes.findIndex(n => n.id === selectedNode.id);

      team.unlockedKeys = [...team.unlockedKeys, selectedNode.rewardKeyId];
      team.currentStage += 1;
      const pointsEarned = 150;
      team.score += pointsEarned;

      const updatedUser = { ...prev.user };
      updatedUser.xp += 250;
      updatedUser.unlockedKeys = [...updatedUser.unlockedKeys, selectedNode.rewardKeyId];
      if (updatedUser.xp >= updatedUser.level * 1000) {
        updatedUser.level += 1;
        updatedUser.xp = 0;
      }

      const updatedCategories = [...prev.categories];
      const updatedNodes = [...category.nodes];
      updatedNodes[nodeIndex].status = QuestStatus.COMPLETED;

      const nextIdx = updatedNodes.findIndex((n, i) => i > nodeIndex && n.status === QuestStatus.LOCKED);
      if (nextIdx > -1) {
        updatedNodes[nextIdx].status = QuestStatus.AVAILABLE;
      }

      updatedCategories[categoryIdx] = { ...category, nodes: updatedNodes };
      const nextTeamIdx = prev.mode === 'DUEL' ? (teamIdx + 1) % prev.teams.length : teamIdx;

      // Sync to Cloud if Duel
      if (prev.mode === 'DUEL' && prev.activeDuelId && duelSession) {
        const isPlayer1 = duelSession.player1.id === prev.user.id;
        const playerField = isPlayer1 ? 'player1' : 'player2';
        const opponentId = isPlayer1 ? duelSession.player2.id : duelSession.player1.id;

        updateDuelMove(prev.activeDuelId, prev.user.id, selectedNode.id, pointsEarned, opponentId);
        updateDuelScore(prev.activeDuelId, playerField, pointsEarned);
      }

      // Competitive Lonca Contribution (20% share)
      if (updatedUser.guildId) {
        const guildPoints = Math.floor(pointsEarned * 0.2);
        updateGuildScore(updatedUser.guildId, guildPoints);
      }

      return {
        ...prev,
        user: updatedUser,
        categories: updatedCategories,
        teams: updatedTeams,
        activeTeamIndex: nextTeamIdx
      };
    });

    setIsARActive(false);
    setSelectedNode(null);
  }, [selectedNode, gameState, duelSession]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#dcdcd7]">
        <div className="text-[#8b7d6b] font-display animate-pulse tracking-[0.5em] text-2xl font-black uppercase">Kadim Arşivler Açılıyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-[#dcdcd7]">
      <TermsModal isOpen={showTerms} onAccept={handleTermsAccept} />
      <InviteManager invites={invites} onAccept={handleAcceptInvite} onReject={handleRejectInvite} />

      <div className="flex-grow flex flex-col p-6 max-w-screen-sm mx-auto w-full relative z-10">

        {/* Landing / Home / Auth Screens */}
        {(!gameState?.gameStarted) ? (
          <div className="flex flex-col items-center py-12 space-y-12">
            <div className="text-center select-none cursor-pointer" onClick={(e) => {
              if (e.detail === 3) setIsAdminOpen(true);
            }}>
              <h1 className="font-display text-5xl text-[#8b7d6b] font-black tracking-widest drop-shadow-md">KADİM ARŞİV</h1>
              <p className="text-stone-500 font-bold uppercase text-[12px] tracking-[0.6em] mt-3">Müze Muhafızları Toplanıyor</p>
            </div>

            {view === 'LANDING' ? (
              <div className="flex flex-col gap-6 w-full max-w-sm animate-in fade-in slide-in-from-bottom-8 duration-700">

                {gameState?.user ? (
                  // Logged In Options
                  <>
                    <div className="bg-[#8b7d6b]/10 p-6 rounded-sm border border-[#8b7d6b]/30 text-center mb-4">
                      <span className="text-4xl block mb-2">💂</span>
                      <span className="text-[#8b7d6b] font-display text-lg font-black uppercase tracking-widest">{gameState.user.username}</span>
                      <p className="text-[10px] text-stone-500 uppercase font-bold mt-1">Hoş Geldin, Muhafız</p>
                    </div>

                    <button
                      onClick={() => setGameState(prev => prev ? ({ ...prev, gameStarted: false, isArchiveOpen: true }) : null)}
                      className="w-full py-6 bg-[#8b7d6b] text-white font-display text-sm tracking-[0.4em] font-black shadow-xl hover:bg-black transition-all hover:scale-105"
                    >
                      🏺 ARŞİVE GİR
                    </button>

                    <button
                      onClick={() => setIsProfileOpen(true)}
                      className="w-full py-5 border-2 border-[#8b7d6b] text-[#8b7d6b] font-display text-sm tracking-[0.4em] font-black hover:bg-[#8b7d6b] hover:text-white transition-all"
                    >
                      👤 PROFİLİM
                    </button>

                    <button
                      onClick={() => { setGameState(null); setView('LANDING'); }}
                      className="w-full py-3 text-stone-400 font-display text-[9px] tracking-[0.5em] font-black uppercase hover:text-red-800 transition-colors"
                    >
                      [ ÇIKIŞ YAP / SIFIRLA ]
                    </button>
                  </>
                ) : (
                  // Guest / Not Logged In Options
                  <>
                    <div className="text-center font-serif-vintage italic text-stone-600 mb-2">
                      "Muhafız, önce ismini kadim kitaba yazdırmalısın..."
                    </div>

                    <button
                      onClick={() => setView('CREATE_PROFILE')}
                      className="w-full py-6 bg-[#8b7d6b] text-white font-display text-sm tracking-[0.4em] font-black shadow-xl hover:bg-black transition-all hover:scale-105 border-b-4 border-[#5f5448]"
                    >
                      🏰 PROFİL OLUŞTUR
                    </button>

                    <button
                      onClick={() => setView('AUTH')}
                      className="w-full py-6 border-2 border-[#8b7d6b] text-[#8b7d6b] font-display text-sm tracking-[0.4em] font-black hover:bg-[#8b7d6b] hover:text-white transition-all bg-white/40"
                    >
                      📜 PROFİL GİRİŞİ
                    </button>
                  </>
                )}
              </div>
            ) : view === 'CREATE_PROFILE' ? (
              <ModeSelector onComplete={handleSetupComplete} onBack={() => setView('LANDING')} />
            ) : view === 'AUTH' ? (
              <AdminLogin onSuccess={() => { setIsAdminAuthenticated(true); setView('LANDING'); }} onCancel={() => setView('LANDING')} />
            ) : null}

            {/* Category Selector Overlaid when active and user exists */}
            {gameState?.isArchiveOpen && !gameState.gameStarted && (
              <CategorySelector
                eras={gameState.eras || INITIAL_ERAS}
                onSelect={handleCategorySelect}
                onBack={() => setGameState(prev => prev ? ({ ...prev, isArchiveOpen: false }) : null)}
              />
            )}
          </div>
        ) : (
          <>
            {/* Oyun Ekranı */}
            <header className="relative z-20 text-center mb-10 flex justify-between items-center pt-4">
              <button
                onClick={() => setGameState(p => p ? ({ ...p, gameStarted: false }) : p)}
                className="px-6 py-2 border-2 border-[#8b7d6b] text-[#8b7d6b] text-[10px] tracking-[0.3em] font-black rounded-sm uppercase bg-white/40 hover:bg-white/60"
              >
                ← ARŞİV
              </button>
              <h1 className="font-display text-2xl tracking-[0.2em] text-[#8b7d6b] font-black">
                {gameState.categories.find(c => c.id === gameState.activeCategoryId)?.name.toUpperCase()}
              </h1>
              <div className="w-24" />
            </header>

            <main className="flex-grow">
              <Stats
                teams={gameState.teams}
                activeTeamIndex={gameState.activeTeamIndex}
                totalNodes={gameState.categories.find(c => c.id === gameState.activeCategoryId)?.nodes.length || 0}
                isMyTurn={gameState.mode === 'DUEL' ? (duelSession?.currentTurnUserId === gameState.user?.id) : true}
              />
              <div className="grid grid-cols-2 gap-x-12 gap-y-24 my-12 justify-items-center">
                {gameState.categories.find(c => c.id === gameState.activeCategoryId)?.nodes.map(node => (
                  <VisualBox key={node.id} node={node} isActive={selectedNode?.id === node.id} onClick={setSelectedNode} />
                ))}
              </div>
            </main>
          </>
        )}
      </div>

      {/* Overlays */}
      {selectedNode && (
        <div className="fixed inset-0 z-[100] bg-[#dcdcd7]/80 backdrop-blur-md flex items-center justify-center p-4 md:p-12 overflow-y-auto">
          <div className="w-full md:w-[75vw] lg:w-[70vw] max-w-5xl relative my-auto animate-in zoom-in duration-500">
            <button
              onClick={() => setSelectedNode(null)}
              className="absolute -top-12 md:-top-16 right-0 text-[#8b7d6b] font-display text-xs tracking-widest uppercase font-bold hover:text-black transition-colors"
            >
              KAPAT [×]
            </button>
            <MysteryBox
              node={selectedNode}
              onSuccess={() => {
                setSelectedNode(null); // Close modal first to reveal AR/Progress
                setIsARActive(true);
              }}
            />
          </div>
        </div>
      )}

      {isProfileOpen && gameState?.user && (
        <ProfileDashboard
          user={gameState.user}
          guild={gameState.availableGuilds?.find(g => g.id === gameState.user?.guildId) || null}
          onDeleteProfile={() => { clearDatabase(); window.location.reload(); }}
          onBack={() => setIsProfileOpen(false)}
        />
      )}

      {isARActive && selectedNode && (
        <ARView rewardId={selectedNode.rewardKeyId} onCollect={handleCollectReward} />
      )}

      {isAdminOpen && !isAdminAuthenticated && (
        <AdminLogin onSuccess={() => setIsAdminAuthenticated(true)} onCancel={() => setIsAdminOpen(false)} />
      )}

      {isAdminOpen && isAdminAuthenticated && (
        <AdminPanel
          gameState={gameState}
          setGameState={setGameState}
          onClose={() => setIsAdminOpen(false)} // Keep authentication active
        />
      )}
    </div>
  );
};

export default App;
