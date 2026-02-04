
export enum QuestStatus {
  LOCKED = 'LOCKED',
  AVAILABLE = 'AVAILABLE',
  COMPLETED = 'COMPLETED'
}

export interface RiddleNode {
  id: string;
  title: string;
  historyQuestion: string;
  correctYear: number;
  mathLogic: string; 
  mathResult: number; 
  locationHint: string;
  mapImageUrl: string; 
  targetZone: { x: number, y: number, radius: number }; 
  rewardKeyId: string;
  status: QuestStatus;
  order: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  nodes: RiddleNode[];
}

export interface Friend {
  id: string;
  name: string;
  level: number;
  status: 'ONLINE' | 'OFFLINE';
}

export interface Guild {
  id: string;
  name: string;
  members: string[]; 
  totalScore: number;
}

export interface UserProfile {
  id: string;
  username: string;
  level: number;
  xp: number;
  unlockedKeys: string[];
  friends: Friend[];
  guildId: string | null;
  achievements: string[];
  lastActive?: number;
}

export type GameMode = 'SOLO' | 'DUEL';

export interface TeamProgress {
  name: string;
  currentStage: number;
  unlockedKeys: string[];
  score: number;
}

export interface GameState {
  user: UserProfile | null;
  categories: Category[];
  activeCategoryId: string | null;
  mode: GameMode;
  teams: TeamProgress[];
  activeTeamIndex: number;
  setupComplete: boolean;
  gameStarted: boolean;
  availableGuilds: Guild[];
  allUsers?: UserProfile[]; // Admin için tüm kullanıcılar
  lastDeployed?: number;
}
