
import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_CATEGORIES, INITIAL_ERAS } from './constants';
import { syncUserProfileToCloud, listenForInvites, respondToInvite, createDuelSession, updateDuelScore, updateDuelMove, listenToDuelSession, finishDuelSession, fetchAllGuilds, fetchAllUsersFromCloud, updateGuildScore, fetchGameDataFromCloud } from './services/firebase';
import { GameState, QuestStatus, RiddleNode, GameMode, TeamProgress, UserProfile, Invite, DuelSession, Category } from './types';
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
import UserLogin from './components/UserLogin';
import KeyUnlockSequence from './components/KeyUnlockSequence';
import useSecurity from './components/SecurityManager';



type AppView = 'LANDING' | 'CREATE_PROFILE' | 'AUTH' | 'PROFILE' | 'ARCHIVE' | 'GAME' | 'ADMIN_LOGIN' | 'ADMIN_PANEL';

const App: React.FC = () => {
  useSecurity(); // Activate Security
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedNode, setSelectedNode] = useState<RiddleNode | null>(null);
  const [isARActive, setIsARActive] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [duelSession, setDuelSession] = useState<DuelSession | null>(null);

  // Animation State
  const [pendingRewardNode, setPendingRewardNode] = useState<RiddleNode | null>(null);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);

  // Unified Navigation State
  const [view, setView] = useState<AppView>('LANDING');

  // Animation & Transition State
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);

  // Auto-scroll to highlighted node
  useEffect(() => {
    if (highlightedNodeId) {
      setTimeout(() => {
        const element = document.getElementById(`node-${highlightedNodeId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500); // Delay slightly to allow rendering
    }
  }, [highlightedNodeId, view, gameState?.activePeriodId]);

  // --- Auto-Logout Implementation ---
  useEffect(() => {
    // Only set timer if user is logged in or admin is authenticated
    if (!gameState?.user && !isAdminAuthenticated) return;

    const TIMEOUT_DURATION = 5 * 60 * 1000; // 5 Minutes
    let logoutTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(logoutTimer);
      logoutTimer = setTimeout(() => {
        // Perform Logout
        clearDatabase(); // Ensure stored session is wiped
        setIsAdminAuthenticated(false);
        setGameState(null);
        setView('LANDING');
        alert("🔒 Güvenlik sebebiyle 5 dakika hareketsiz kaldığınız için oturum kapatıldı.");
      }, TIMEOUT_DURATION);
    };

    // Initial Start
    resetTimer();

    // Event Listeners
    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    return () => {
      clearTimeout(logoutTimer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [gameState?.user, isAdminAuthenticated]);
  // ----------------------------------

  // --- Admin Persistence ---
  useEffect(() => {
    const adminAuth = sessionStorage.getItem('admin_auth');
    if (adminAuth === 'true') {
      setIsAdminAuthenticated(true);
      // Determine view based on URL or default to ADMIN_PANEL if previously there
      // For now, if admin auth exists, we assume they want back in, but maybe check URL?
      // Simpler: Just set authenticated, let them click "Admin" or if they were in panel...
      // The user specially asked: "yenilime yapınca da hangi sayfadaysak orada kalsın"
      const lastView = sessionStorage.getItem('last_view') as AppView;
      if (lastView) setView(lastView);
    }
  }, []);

  useEffect(() => {
    if (view) sessionStorage.setItem('last_view', view);
  }, [view]);

  // Initial Data Load (Guilds & Categories)
  useEffect(() => {
    const initData = async () => {
      // Load Guilds
      try {
        const guilds = await fetchAllGuilds();
        setGameState(prev => prev ? { ...prev, availableGuilds: guilds } : {
          user: null,
          mode: 'CLASSIC',
          categories: INITIAL_CATEGORIES,
          eras: [], // Initial empty Eras
          activePeriodId: null,
          activeEraId: null,
          activeTopicId: null,
          activeSubTopicId: null,
          activeCategoryId: null,
          activeTeamIndex: 0,
          teams: [],
          availableGuilds: guilds,
          activeDuelId: null,
          activeWager: 0
        });
      } catch (e) {
        console.error("Guild fetch error:", e);
      }
    };
    initData();
  }, []); // Run once on mount


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

    setGameState((prev: GameState | null) => {
      if (!prev) return null;
      return {
        ...prev,
        mode: 'DUEL',
        teams: [team1, team2],
        activeTeamIndex: 0,
        activeCategoryId: null,
        activeDuelId: duelId,
        activeWager: wager
      };
    });
    setInvites([]);
    setView('GAME'); // Switch to game view? Or Archive to pick category? 
    // Usually start with Archive to pick category if not set activeCategoryId
    // But logic below suggests activeCategoryId is null so we need to pick.
    setView('ARCHIVE');
    alert(`⚔️ ${invite.fromName} ile düello başladı! İddia: ${wager} XP. Başarılar!`);
  };

  const handleRejectInvite = async (invite: Invite) => {
    await respondToInvite(invite.id, 'REJECTED');
    setInvites((prev: Invite[]) => prev.filter((i: Invite) => i.id !== invite.id));
  };

  // Refresh Guilds Helper
  const refreshGuilds = useCallback(async () => {
    try {
      const guilds = await fetchAllGuilds();
      setGameState(prev => prev ? { ...prev, availableGuilds: guilds } : null);
    } catch (error) {
      console.error("Failed to refresh guilds:", error);
    }
  }, []);

  // Real-time Duel Sync
  useEffect(() => {
    if (gameState?.activeDuelId) {
      const unsubscribe = listenToDuelSession(gameState.activeDuelId, (session) => {
        setDuelSession(session);

        // Sync teams in GameState if session changed
        setGameState((prev: GameState | null) => {
          if (!prev || !prev.user) return prev;

          const updatedTeams = [...prev.teams];
          const p1TeamIdx = prev.teams.findIndex((t: TeamProgress) => t.name === session.player1.name);
          const p2TeamIdx = prev.teams.findIndex((t: TeamProgress) => t.name === session.player2.name);

          if (p1TeamIdx > -1) updatedTeams[p1TeamIdx].score = session.player1.score;
          if (p2TeamIdx > -1) updatedTeams[p2TeamIdx].score = session.player2.score;

          // Check for Completion
          const totalNodes = prev.categories.find((c: Category) => c.id === prev.activeCategoryId)?.nodes.length || 0;
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
            if (prev.activeDuelId) {
              finishDuelSession(prev.activeDuelId);
            }

            // Update user XP
            const updatedUser = { ...prev.user, xp: Math.max(0, prev.user.xp + xpChange) };

            return {
              ...prev,
              user: updatedUser,
              mode: 'SOLO',
              activeDuelId: null,
              activeWager: null,
              gameStarted: false,
              setupComplete: true,
              isArchiveOpen: false
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
      const cloudGameData = await fetchGameDataFromCloud();

      setGameState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          availableGuilds: allGuilds,
          allUsers: allUsers,
          categories: cloudGameData && cloudGameData.length > 0 ? cloudGameData : prev.categories
        };
      });
    };

    if (gameState?.user?.id) {
      syncGlobalData();
    }
  }, [gameState?.user?.id, gameState?.user?.guildId]);

  // Başlangıç: Veritabanından yükle
  useEffect(() => {
    const init = async () => {
      try {
        const saved = await loadGameState();
        if (saved) {
          // Verify user exists
          if (saved.user) {
            setGameState({
              ...saved,
              setupComplete: true,
              gameStarted: false
            });
            setView('LANDING'); // Start at Landing
          } else {
            setView('LANDING');
          }
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


  // Admin Auto-Login Logic: Removed as per user request to remove simulation/test code.
  // Real admins must log in via the AdminLogin component which validates against Firebase.


  const handleSetupComplete = (mode: GameMode, names: string[], pin: string) => {
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
      achievements: ['İLK_ADIM'],
      pin: pin // Set the PIN
    };

    setGameState({
      user: newUser,
      categories: currentCategories,
      eras: INITIAL_ERAS,
      activeCategoryId: null,
      activePeriodId: null,
      activeEraId: null,
      activeTopicId: null,
      activeSubTopicId: null,
      activeDuelId: null,
      activeWager: null,
      mode: mode as GameMode,
      teams: teams,
      activeTeamIndex: 0,
      setupComplete: true,
      gameStarted: false,
      isArchiveOpen: false,
      availableGuilds: []
    });

    // Auto open archive for new user to start playing
    setView('ARCHIVE');
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
        periods: [],
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
        activePeriodId: null, // Reset Period on new Category selection
        activeEraId: foundEra?.id || null,
        activeTopicId: foundTopic?.id || null,
        activeSubTopicId: subTopicId,
        gameStarted: true
      });
      setView('GAME');
    } else {
      // Fallback
      setGameState(prev => prev ? ({ ...prev, activeCategoryId: subTopicId, gameStarted: true }) : null);
      setView('GAME');
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

    // 1. Trigger Animation Phase
    if (selectedNode) {
      setPendingRewardNode(selectedNode);
      setShowUnlockAnimation(true);
      setIsARActive(false); // Close AR, open Animation Overlay
    }
  }, [selectedNode, gameState, duelSession]);

  const finalizeRewardCollection = useCallback(() => {
    if (!pendingRewardNode || !gameState || !gameState.activeCategoryId) {
      setShowUnlockAnimation(false);
      setPendingRewardNode(null);
      return;
    }

    const rewardNode = pendingRewardNode;

    setGameState(prev => {
      if (!prev || !prev.activeCategoryId || !prev.user) return prev;

      const teamIdx = prev.activeTeamIndex;
      const updatedTeams = [...prev.teams];
      const team = updatedTeams[teamIdx];

      const categoryIdx = prev.categories.findIndex(c => c.id === prev.activeCategoryId);
      if (categoryIdx === -1) return prev;

      const category = prev.categories[categoryIdx];
      const nodeIndex = category.nodes.findIndex(n => n.id === rewardNode.id);

      // Avoid double collection if already unlocked (safety check)
      if (team.unlockedKeys.includes(rewardNode.rewardKeyId)) return prev;

      team.unlockedKeys = [...team.unlockedKeys, rewardNode.rewardKeyId];
      team.currentStage += 1;
      const pointsEarned = 150;
      team.score += pointsEarned;

      const updatedUser = { ...prev.user };
      updatedUser.xp += 250;
      updatedUser.unlockedKeys = [...updatedUser.unlockedKeys, rewardNode.rewardKeyId];
      if (updatedUser.xp >= updatedUser.level * 1000) {
        updatedUser.level += 1;
        updatedUser.xp = 0;
      }

      const updatedCategories = [...prev.categories];

      // --- FIX: Progression Logic for Periods ---
      // Determine if we are updating a Period's nodes or Category's nodes
      const activePeriodId = prev.activePeriodId;
      if (activePeriodId) {
        // We are in a Period
        const periodIdx = category.periods.findIndex(p => p.id === activePeriodId);
        if (periodIdx > -1) {
          const updatedPeriods = [...category.periods];
          const period = updatedPeriods[periodIdx];
          const periodNodes = [...period.nodes];

          const pNodeIndex = periodNodes.findIndex(n => n.id === rewardNode.id);
          if (pNodeIndex > -1) {
            periodNodes[pNodeIndex].status = QuestStatus.COMPLETED;

            // Unlock next node in Period
            const nextPIdx = periodNodes.findIndex((n, i) => i > pNodeIndex && n.status === QuestStatus.LOCKED);
            if (nextPIdx > -1) {
              periodNodes[nextPIdx].status = QuestStatus.AVAILABLE;
              setHighlightedNodeId(periodNodes[nextPIdx].id);
            }

            updatedPeriods[periodIdx] = { ...period, nodes: periodNodes };
            updatedCategories[categoryIdx] = { ...category, periods: updatedPeriods };
          }
        }
      } else {
        // We are in a flat Category (no periods)
        // Original logic...
        const updatedNodes = [...category.nodes];
        updatedNodes[nodeIndex].status = QuestStatus.COMPLETED;

        const nextIdx = updatedNodes.findIndex((n, i) => i > nodeIndex && n.status === QuestStatus.LOCKED);
        if (nextIdx > -1) {
          updatedNodes[nextIdx].status = QuestStatus.AVAILABLE;
          setHighlightedNodeId(updatedNodes[nextIdx].id);
        }
        updatedCategories[categoryIdx] = { ...category, nodes: updatedNodes };
      }
      const nextTeamIdx = prev.mode === 'DUEL' ? (teamIdx + 1) % prev.teams.length : teamIdx;

      // Sync to Cloud if Duel
      if (prev.mode === 'DUEL' && prev.activeDuelId && duelSession) {
        const isPlayer1 = duelSession.player1.id === prev.user.id;
        const playerField = isPlayer1 ? 'player1' : 'player2';
        const opponentId = isPlayer1 ? duelSession.player2.id : duelSession.player1.id;

        updateDuelMove(prev.activeDuelId, prev.user.id, rewardNode.id, pointsEarned, opponentId);
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

    setShowUnlockAnimation(false);
    setPendingRewardNode(null);
    setSelectedNode(null);

  }, [pendingRewardNode, gameState, duelSession]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#dcdcd7]">
        <div className="text-[#8b7d6b] font-display animate-pulse tracking-[0.5em] text-2xl font-black uppercase">Kadim Arşivler Açılıyor...</div>
      </div>
    );
  }

  // --- RENDERING VIEWS ---

  // 1. ADMIN PANEL VIEW
  if (view === 'ADMIN_PANEL' && isAdminAuthenticated && gameState) {
    return (
      <AdminPanel
        gameState={gameState}
        setGameState={setGameState}
        onClose={() => setView('LANDING')}
      />
    );
  }

  // 2. PROFILE VIEW
  if (view === 'PROFILE' && gameState?.user) {
    return (
      <ProfileDashboard
        user={gameState.user}
        guild={gameState.availableGuilds?.find(g => g.id === gameState.user?.guildId) || null}
        categories={gameState.categories} // Pass categories for key lookup
        onDeleteProfile={() => { clearDatabase(); window.location.reload(); }}
        onBack={() => setView('LANDING')}
        onAdminAccess={() => { }}
        onUpdateUser={(updatedUser) => setGameState(gameState ? { ...gameState, user: updatedUser } : null)}
        onRefreshGuilds={refreshGuilds}
      />
    );
  }

  // 3. ARCHIVE (CATEGORY SELECTOR) VIEW
  if (view === 'ARCHIVE' && gameState) {
    return (
      <CategorySelector
        eras={gameState.eras || INITIAL_ERAS}
        onSelect={handleCategorySelect}
        onBack={() => setView('LANDING')}
      />
    );
  }

  // 4. GAME VIEW
  if (view === 'GAME' && gameState) {
    const activeCategory = gameState.categories.find(c => c.id === gameState.activeCategoryId);
    const activePeriod = activeCategory?.periods?.find(p => p.id === gameState.activePeriodId);

    // Determine Mode: Period Selection vs Node Map
    const showPeriodSelector = !gameState.activePeriodId && (activeCategory?.periods || []).length > 0;

    const nodesToRender = activePeriod ? activePeriod.nodes : (activeCategory?.nodes || []);

    // Helper to go back
    const handleGameBack = () => {
      if (gameState.activePeriodId) {
        // Go back to Period Selection
        setGameState({ ...gameState, activePeriodId: null });
      } else {
        // Go back to Archive
        setView('ARCHIVE');
      }
    };

    return (
      <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-[#dcdcd7]">
        <header className="relative z-20 text-center mb-10 flex justify-between items-center pt-4 px-6 md:px-12">
          <button
            onClick={handleGameBack}
            className="px-6 py-2 border-2 border-[#8b7d6b] text-[#8b7d6b] text-[10px] tracking-[0.3em] font-black rounded-sm uppercase bg-white/40 hover:bg-white/60"
          >
            {gameState.activePeriodId ? '← DÖNEMLER' : '← ARŞİV'}
          </button>
          <h1 className="font-display text-2xl tracking-[0.2em] text-[#8b7d6b] font-black flex flex-col items-center">
            <span>{activeCategory?.name.toUpperCase()}</span>
            {activePeriod && <span className="text-xs mt-1 text-stone-500 tracking-[0.3em]">{activePeriod.name}</span>}
          </h1>
          <div className="w-24" />
        </header>

        <main className="flex-grow p-6 max-w-screen-xl mx-auto w-full">
          {showPeriodSelector ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8">
              <div className="col-span-full text-center mb-8">
                <h2 className="font-serif-vintage italic text-2xl text-stone-600">Bir Zaman Dilimi Seçin...</h2>
              </div>
              {activeCategory?.periods.map(period => (
                <button
                  key={period.id}
                  onClick={() => setGameState({ ...gameState, activePeriodId: period.id })}
                  className="group relative h-48 bg-[#f0f0eb] border-2 border-[#8b7d6b]/30 hover:border-[#8b7d6b] transition-all duration-500 flex flex-col items-center justify-center p-6 text-center shadow-sm hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-30" />
                  <div className="relative z-10">
                    <h3 className="font-display text-xl font-black text-[#8b7d6b] group-hover:text-black transition-colors uppercase tracking-widest mb-2">{period.name}</h3>
                    <div className="w-12 h-1 bg-[#8b7d6b] mx-auto opacity-50 group-hover:w-24 transition-all duration-500" />
                    <p className="mt-4 text-[10px] font-bold text-stone-500 uppercase tracking-[0.2em]">{period.nodes.length} GİZEM</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <>
              <Stats
                teams={gameState.teams}
                activeTeamIndex={gameState.activeTeamIndex}
                totalNodes={nodesToRender.length}
                isMyTurn={gameState.mode === 'DUEL' ? (duelSession?.currentTurnUserId === gameState.user?.id) : true}
              />
              <div className="grid grid-cols-2 gap-x-12 gap-y-24 my-12 justify-items-center">
                {nodesToRender.map(node => (
                  <div key={node.id} id={`node-${node.id}`} className="contents">
                    <VisualBox node={node} isActive={selectedNode?.id === node.id} onClick={setSelectedNode} />
                  </div>
                ))}
                {nodesToRender.length === 0 && (
                  <div className="col-span-2 py-20 text-center font-serif-vintage italic text-stone-400">
                    Bu dönemde henüz keşfedilecek bir sır yok...
                  </div>
                )}
              </div>
            </>
          )}
        </main>

        {/* Modal Logic for Game */}
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
                  setSelectedNode(null); // Close modal first
                  setIsARActive(true);
                }}
              />
            </div>
          </div>
        )}
        {isARActive && selectedNode && (
          <ARView rewardId={selectedNode.rewardKeyId} onCollect={handleCollectReward} />
        )}

        {/* Key Unlock Animation Overlay */}
        {showUnlockAnimation && (
          <KeyUnlockSequence
            onComplete={finalizeRewardCollection}
            nodeTitle={pendingRewardNode?.title}
          />
        )}
      </div>
    );
  }

  // 5. LANDING / AUTH / CREATE PROFILE
  const handleAdminReturn = () => {
    // If we're already logged in as a legitimate user, just go to landing
    if (gameState?.user) {
      setView('LANDING');
      return;
    }

    // Otherwise, create a temporary "Supervisor" Admin User for testing/playing
    const adminUser: UserProfile = {
      id: 'admin-supervisor',
      username: 'MÜZE MÜDÜRÜ',
      level: 100,
      xp: 999999,
      unlockedKeys: [],
      friends: [],
      guildId: 'admin-guild',
      achievements: ['YONETICI_GUCU'],
      pin: '000000'
    };

    const teams: TeamProgress[] = [{
      name: adminUser.username, currentStage: 0, unlockedKeys: [], score: 999999
    }];

    setGameState({
      user: adminUser,
      categories: gameState?.categories || INITIAL_CATEGORIES,
      eras: gameState?.eras || INITIAL_ERAS,
      activeCategoryId: null,
      activePeriodId: null,
      activeEraId: null,
      activeTopicId: null,
      activeSubTopicId: null,
      activeDuelId: null,
      activeWager: null,
      mode: 'SOLO',
      teams: teams,
      activeTeamIndex: 0,
      setupComplete: true,
      gameStarted: false,
      isArchiveOpen: false,
      availableGuilds: []
    });

    // User requested "not profile page", so we send them to Landing logged in state 
    // or Archive if they prefer. Landing is safer as it shows the dashboard.
    setView('LANDING');
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-[#dcdcd7]">
      <InviteManager invites={invites} onAccept={handleAcceptInvite} onReject={handleRejectInvite} />

      <div className="flex-grow flex flex-col p-6 max-w-screen-sm mx-auto w-full relative z-10">

        {/* Hidden Admin Trigger */}
        <div className="flex flex-col items-center py-12 space-y-12">
          <div className="text-center select-none cursor-pointer" onClick={(e) => {
            if (e.detail === 3) setView('ADMIN_LOGIN');
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
                    onClick={() => setView('ARCHIVE')}
                    className="w-full py-6 bg-[#8b7d6b] text-white font-display text-sm tracking-[0.4em] font-black shadow-xl hover:bg-black transition-all hover:scale-105"
                  >
                    🏺 ARŞİVE GİR
                  </button>

                  <button
                    onClick={() => setView('PROFILE')}
                    className="w-full py-5 border-2 border-[#8b7d6b] text-[#8b7d6b] font-display text-sm tracking-[0.4em] font-black hover:bg-[#8b7d6b] hover:text-white transition-all"
                  >
                    👤 PROFİLİM
                  </button>

                  {isAdminAuthenticated && (
                    <button
                      onClick={() => setView('ADMIN_PANEL')}
                      className="w-full py-3 bg-red-900/10 text-red-900 font-display text-[10px] tracking-[0.4em] font-black uppercase hover:bg-red-900 hover:text-white transition-all"
                    >
                      ⚡ YÖNETİCİ PANELİ
                    </button>
                  )}

                  <button
                    onClick={() => {
                      clearDatabase();
                      setIsAdminAuthenticated(false);
                      setGameState(null);
                      setView('LANDING');
                    }}
                    className="w-full py-3 text-stone-400 font-display text-[9px] tracking-[0.5em] font-black uppercase hover:text-red-800 transition-colors"
                  >
                    [ ÇIKIŞ YAP / SIFIRLA ]
                  </button>
                </>
              ) : (
                // Guest / Not Logged In Options
                <>
                  <div className="text-center font-serif-vintage italic text-stone-600 mb-2">
                    Muhafız, önce ismini kadim kitaba yazdırmalısın...
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
            <UserLogin onSuccess={(user) => {
              // Reconstruct basic game state for the logged-in user
              const teams: TeamProgress[] = [{
                name: user.username, currentStage: 0, unlockedKeys: [], score: 0
              }];

              setGameState({
                user: user,
                categories: INITIAL_CATEGORIES,
                eras: INITIAL_ERAS,
                activeCategoryId: null,
                activePeriodId: null,
                activeEraId: null,
                activeTopicId: null,
                activeSubTopicId: null,
                activeDuelId: null,
                activeWager: null,
                mode: 'SOLO',
                teams: teams,
                activeTeamIndex: 0,
                setupComplete: true,
                gameStarted: false,
                isArchiveOpen: false,
                availableGuilds: []
              });
              setView('LANDING');
            }} onCancel={() => setView('LANDING')} />
          ) : view === 'ADMIN_LOGIN' ? (
            <AdminLogin onSuccess={() => { setIsAdminAuthenticated(true); setView('ADMIN_PANEL'); }} onCancel={() => setView('LANDING')} />
          ) : view === 'ADMIN_PANEL' ? (
            <AdminPanel
              gameState={gameState}
              setGameState={setGameState}
              onClose={handleAdminReturn}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default App;
