
export enum QuestStatus {
  LOCKED = 'LOCKED',
  AVAILABLE = 'AVAILABLE',
  COMPLETED = 'COMPLETED'
}

export interface Invite {
  id: string;
  fromId: string;
  fromName: string;
  toId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  timestamp: number;
}

export interface DuelSession {
  id: string;
  player1: { id: string; name: string; score: number };
  player2: { id: string; name: string; score: number };
  currentTurnUserId: string;
  category: string; // The selected subtopic ID for this duel
  wagerAmount: number; // XP to win/lose
  status: 'ACTIVE' | 'COMPLETED';
  winnerId?: string;
  createdAt: number;
  lastMoveAt: number;
  moves: { userId: string; nodeId: string; timestamp: number }[];
}


export type QuestionType = 'YEAR' | 'TEXT' | 'MULTIPLE_CHOICE';
export type UnlockType = 'MATH' | 'TEXT' | 'MULTIPLE_CHOICE';

export interface RiddleNode {
  id: string;
  title: string;
  order: number;
  status: QuestStatus;

  // Question Part
  questionType?: QuestionType; // Defaults to 'YEAR' if undefined
  historyQuestion: string;
  mediaUrl?: string; // YouTube or Image URL
  options?: string[]; // For Multiple Choice
  correctAnswer?: string; // Unified answer field. If questionType is YEAR, this can store the stringified year or we use correctYear.
  correctYear: number; // Keep for backward compatibility

  // Unlock Part
  unlockType?: UnlockType; // Defaults to 'MATH' if undefined
  mathLogic: string; // Question text for unlock
  unlockOptions?: string[];
  unlockAnswer?: string; // Unified unlock answer
  mathResult: number; // Keep for backward compatibility

  // Visuals
  mapImageUrl: string;
  targetZone: { x: number, y: number, radius: number };
  locationHint: string;
  rewardKeyId: string;
}


export interface SubTopic {
  id: string;
  name: string;
  nodes: RiddleNode[]; // Questions/Nodes
}

export interface MainTopic {
  id: string;
  name: string;
  description: string; // e.g. "Anadolu Medeniyetleri"
  subTopics: SubTopic[];
  imageUrl?: string;
  order: number;
}

export interface Era {
  id: string;
  name: string;
  description: string; // e.g. "İLK ÇAĞ"
  topics: MainTopic[];
  imageUrl?: string;
  order: number;
}

// Deprecated: Old Category interface for backward compatibility if needed, 
// but we will primarily use Era -> Topic -> SubTopic
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
  leaderId: string;
  leaderName: string;
  members: string[]; // User IDs
  totalScore: number;
  createdAt: number;
  description: string;
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
  pin?: string; // 6-char secure PIN
  lastActiveAt?: number;
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
  categories: Category[]; // Keep for legacy support if needed initially
  eras: Era[]; // New structure
  activeCategoryId: string | null; // Keep for legacy
  activeEraId: string | null;
  activeTopicId: string | null;
  activeSubTopicId: string | null;
  activeDuelId: string | null;
  activeWager: number | null;
  mode: GameMode;
  teams: TeamProgress[];
  activeTeamIndex: number;
  setupComplete: boolean;
  isArchiveOpen: boolean;
  gameStarted: boolean;
  availableGuilds: Guild[];
  allUsers?: UserProfile[];
  lastDeployed?: number;
}
