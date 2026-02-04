
import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_CATEGORIES } from './constants';
import { GameState, QuestStatus, RiddleNode, GameMode, TeamProgress, UserProfile } from './types';
import { loadGameState, saveGameState, clearDatabase } from './services/db';
import { syncUserProfileToCloud } from './services/firebase';
import MysteryBox from './components/MysteryBox';
import Stats from './components/Stats';
import VisualBox from './components/VisualBox';
import ARView from './components/ARView';
import AdminPanel from './components/AdminPanel';
import PasswordGate from './components/Admin/PasswordGate';
import ModeSelector from './components/ModeSelector';
import CategorySelector from './components/CategorySelector';
import ProfileDashboard from './components/ProfileDashboard';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedNode, setSelectedNode] = useState<RiddleNode | null>(null);
  const [isARActive, setIsARActive] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Başlangıç: Veritabanından yükle
  useEffect(() => {
    const init = async () => {
      try {
        const saved = await loadGameState();
        if (saved) {
          setGameState(saved);
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
      friends: [
        { id: 'f1', name: 'Alp Er Tunga', level: 99, status: 'OFFLINE' },
        { id: 'f2', name: 'Asena', level: 12, status: 'ONLINE' }
      ],
      guildId: null,
      achievements: ['İLK_ADIM']
    };

    setGameState({
      user: newUser,
      categories: currentCategories,
      activeCategoryId: null,
      mode,
      teams,
      activeTeamIndex: 0,
      setupComplete: true,
      gameStarted: false,
      availableGuilds: [
        { id: 'g1', name: 'Gök Börüleri', members: [], totalScore: 15000 },
        { id: 'g2', name: 'Anadolu Erenleri', members: [], totalScore: 8200 }
      ]
    });
  };

  const handleCategorySelect = (catId: string) => {
    setGameState(prev => prev ? ({ ...prev, activeCategoryId: catId, gameStarted: true }) : null);
  };

  const handleCollectReward = useCallback(() => {
    if (!selectedNode || !gameState || !gameState.activeCategoryId) return;

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
      team.score += 150;

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
  }, [selectedNode, gameState]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#dcdcd7]">
        <div className="text-[#8b7d6b] font-display animate-pulse tracking-[0.5em] text-2xl font-black uppercase">Kadim Arşivler Açılıyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">

      {/* Profil Erişimi */}
      {gameState?.user && (
        <div className="fixed top-8 left-8 z-[200]">
          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex flex-col items-center group transition-transform hover:scale-110"
          >
            <div className="w-16 h-16 rounded-full brass-texture flex items-center justify-center text-black shadow-2xl overflow-hidden border-2 border-[#8b7d6b] group-hover:rotate-12 transition-transform">
              <span className="text-3xl">💂</span>
            </div>
            <div className="bg-[#8b7d6b] text-white px-3 py-1 rounded text-[9px] font-extrabold mt-2 tracking-tighter shadow-lg uppercase">
              {gameState.user.username}
            </div>
          </button>
        </div>
      )}

      {/* Gizli Admin Erişimi (Header'daki Başlığa 3 Tık) */}

      <div className="flex-grow flex flex-col p-6 max-w-screen-sm mx-auto w-full relative z-10">

        {(!gameState?.setupComplete || !gameState?.user) ? (
          <div className="flex flex-col items-center py-12 space-y-12">
            <div className="text-center select-none cursor-pointer" onClick={(e) => {
              if (e.detail === 3) setIsAdminOpen(true);
            }}>
              <h1 className="font-display text-4xl text-[#8b7d6b] font-black tracking-widest drop-shadow-md">KADİM ARŞİV</h1>
              <p className="text-stone-500 font-bold uppercase text-[10px] tracking-[0.6em] mt-3">Müze Muhafızları Toplanıyor</p>
            </div>

            {!gameState?.user && (
              <div className="text-center font-serif-vintage italic text-stone-600 mb-4 animate-pulse">
                "Muhafız, önce ismini kadim kitaba yazdırmalısın..."
              </div>
            )}

            <ModeSelector onComplete={handleSetupComplete} />
          </div>
        ) : (!gameState.gameStarted) ? (
          <CategorySelector
            categories={gameState.categories}
            onSelect={handleCategorySelect}
            onBack={() => setGameState(null)}
          />
        ) : (
          <>
            {/* Oyun Ekranı header vb aynı kalacak */}
            <header className="relative z-20 text-center mb-10 flex justify-between items-center pt-4">
              <button onClick={() => setGameState(p => p ? ({ ...p, gameStarted: false }) : p)} className="px-6 py-2 border-2 border-[#8b7d6b] text-[#8b7d6b] text-[10px] tracking-[0.3em] font-black rounded-sm uppercase bg-white/40 hover:bg-white/60">← ARŞİV</button>
              <h1 className="font-display text-2xl tracking-[0.2em] text-[#8b7d6b] font-black">{gameState.categories.find(c => c.id === gameState.activeCategoryId)?.name.toUpperCase()}</h1>
              <div className="w-24" />
            </header>

            <main className="flex-grow">
              <Stats teams={gameState.teams} activeTeamIndex={gameState.activeTeamIndex} totalNodes={gameState.categories.find(c => c.id === gameState.activeCategoryId)?.nodes.length || 0} />
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
        <div className="fixed inset-0 z-[100] bg-[#dcdcd7]/80 backdrop-blur-md flex items-center justify-center p-6 overflow-y-auto">
          <div className="w-full max-w-md relative my-auto">
            <button onClick={() => setSelectedNode(null)} className="absolute -top-16 right-0 text-[#8b7d6b] font-display text-xs tracking-widest uppercase font-bold">KAPAT [×]</button>
            <MysteryBox node={selectedNode} onSuccess={() => setIsARActive(true)} />
          </div>
        </div>
      )}

      {isProfileOpen && gameState?.user && (
        <ProfileDashboard
          user={gameState.user}
          guild={null}
          onDeleteProfile={() => { clearDatabase(); window.location.reload(); }}
          onBack={() => setIsProfileOpen(false)}
        />
      )}

      {isARActive && selectedNode && (
        <ARView rewardId={selectedNode.rewardKeyId} onCollect={handleCollectReward} />
      )}

      {isAdminOpen && !isAdminAuthenticated && (
        <PasswordGate onSuccess={() => setIsAdminAuthenticated(true)} onCancel={() => setIsAdminOpen(false)} />
      )}

      {isAdminOpen && isAdminAuthenticated && (
        <AdminPanel
          gameState={gameState}
          setGameState={setGameState}
          onClose={() => { setIsAdminOpen(false); setIsAdminAuthenticated(false); }}
        />
      )}
    </div>
  );
};

export default App;
