import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, deleteDoc, addDoc, updateDoc, onSnapshot, query, where, arrayUnion, increment, arrayRemove, deleteField } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { GameState, QuestStatus, RiddleNode, GameMode, TeamProgress, UserProfile, Invite, DuelSession, Guild, Category } from '../types';

// NOTE: Replace these with your actual Firebase project configuration
// You can find these in your Firebase Console -> Project Settings
const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID
};


// Initialize Firebase only if config is present (prevents crash on first run)
export let app: any;
export let db: any;
export let auth: any;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
  auth = getAuth(app);
} catch (e) {
  console.warn("Firebase config missing or invalid.");
}

export const syncCategoriesToCloud = async (categories: Category[]): Promise<boolean> => {
  if (!db) return false;
  try {
    // Save entire categories array as a single document for simplicity in this game model
    // In a larger app, you'd save each category independently
    await setDoc(doc(db, "system", "gameData"), { categories });
    return true;
  } catch (e) {
    console.error("Firebase Sync Error:", e);
    return false;
  }
};

export const fetchGameDataFromCloud = async (): Promise<Category[] | null> => {
  if (!db) return null;
  try {
    const docRef = doc(db, "system", "gameData");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().categories as Category[];
    }
    return null;
  } catch (e) {
    console.error("Fetch Game Data Error:", e);
    return null;
  }
};

export const fetchAllUsersFromCloud = async (): Promise<UserProfile[]> => {
  if (!db) return [];
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data() as UserProfile);
    });
    return users;
  } catch (e) {
    console.error("Firebase Fetch Error:", e);
    return [];
  }
};

export const deleteUserFromCloud = async (userId: string): Promise<boolean> => {
  if (!db) return false;
  try {
    await deleteDoc(doc(db, "users", userId));
    return true;
  } catch (e) {
    console.error("Firebase Delete Error:", e);
    return false;
  }
};



export const loginWithGoogle = async (): Promise<boolean> => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const email = result.user.email;

    // Admin Email Restriction
    const adminEmail = (import.meta as any).env.VITE_ADMIN_EMAIL;
    if (email !== adminEmail) {
      await auth.signOut();
      alert("YALNIZCA YETKİLİ ADMİN GİRİŞ YAPABİLİR!");
      return false;
    }
    return true;
  } catch (error) {
    console.error("Login Failed:", error);
    return false;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout Failed:", error);
  }
};

export const syncUserProfileToCloud = async (user: UserProfile): Promise<void> => {
  if (!db) return;
  try {
    await setDoc(doc(db, "users", user.id), user, { merge: true });
  } catch (e) {
    console.error("Firebase User Sync Error:", e);
  }
};

export interface SystemSettings {
  autoSync: boolean;
  maintenanceMode: boolean;
}

export const saveSystemSettings = async (settings: SystemSettings): Promise<boolean> => {
  if (!db) return false;
  try {
    await setDoc(doc(db, "system", "settings"), settings);
    return true;
  } catch (e) {
    console.error("Save Settings Error:", e);
    return false;
  }
};

export const fetchSystemSettings = async (): Promise<SystemSettings | null> => {
  if (!db) return null;
  try {
    const docRef = doc(db, "system", "settings");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as SystemSettings;
    }
    return null;
  } catch (e) {
    console.error("Fetch Settings Error:", e);
    return null;
  }
};

export const deleteInactiveUsers = async (): Promise<number> => {
  if (!db) return 0;
  try {
    const snapshot = await getDocs(collection(db, "users"));
    let deletedCount = 0;
    const deletePromises: any[] = [];

    snapshot.forEach((docSnap) => {
      const userData = docSnap.data() as UserProfile;
      if (!userData.username.includes("Admin") && !userData.username.includes("Yönetici") && userData.level < 2) {
        deletePromises.push(deleteDoc(doc(db, "users", docSnap.id)));
        deletedCount++;
      }
    });

    await Promise.all(deletePromises);
    return deletedCount;
  } catch (e) {
    console.error("Cleanup Error:", e);
    return 0;
  }
};

// --- DUEL INVITE SYSTEM ---
// --- DUEL INVITE SYSTEM ---

export const sendDuelInvite = async (fromUser: UserProfile, toUserId: string): Promise<string | null> => {
  if (!db) return null;
  try {
    const invite: Omit<Invite, 'id'> = {
      fromId: fromUser.id,
      fromName: fromUser.username,
      toId: toUserId,
      status: 'PENDING',
      timestamp: Date.now()
    };
    const docRef = await addDoc(collection(db, "invites"), invite);
    return docRef.id;
  } catch (e) {
    console.error("Invite Error:", e);
    return null;
  }
};

export const listenForInvites = (userId: string, callback: (invites: Invite[]) => void) => {
  if (!db) return () => { };

  const q = query(
    collection(db, "invites"),
    where("toId", "==", userId),
    where("status", "==", "PENDING")
  );

  return onSnapshot(q, (snapshot) => {
    const invites: Invite[] = [];
    snapshot.forEach((doc) => {
      invites.push({ id: doc.id, ...doc.data() } as Invite);
    });
    callback(invites);
  });
};

export const respondToInvite = async (inviteId: string, status: 'ACCEPTED' | 'REJECTED'): Promise<void> => {
  if (!db) return;
  try {
    await updateDoc(doc(db, "invites", inviteId), { status });
  } catch (e) {
    console.error("Respond Error:", e);
  }
};

export const createDuelSession = async (invite: Invite, categoryId: string): Promise<string | null> => {
  if (!db) return null;
  try {
    const duel: DuelSession = {
      id: '', // Will be set by doc id
      player1: { id: invite.fromId, name: invite.fromName, score: 0 },
      player2: { id: invite.toId, name: 'Rakip', score: 0 }, // Name should be fetched ideally
      currentTurnUserId: invite.fromId, // Sender starts? Or random? Let's say sender.
      category: categoryId,
      wagerAmount: 100, // Default wager for now
      status: 'ACTIVE',
      createdAt: Date.now(),
      lastMoveAt: Date.now(),
      moves: []
    };
    // Use invite ID as duel ID for simplicity or auto-gen
    const docRef = await addDoc(collection(db, "duels"), duel);
    await updateDoc(docRef, { id: docRef.id }); // update id field
    return docRef.id;
  } catch (e) {
    console.error("Create Duel Error:", e);
    return null;
  }
};

export const listenToDuelSession = (duelId: string, callback: (session: DuelSession) => void) => {
  if (!db) return () => { };
  return onSnapshot(doc(db, "duels", duelId), (doc) => {
    if (doc.exists()) {
      callback(doc.data() as DuelSession);
    }
  });
};

export const updateDuelMove = async (duelId: string, userId: string, nodeId: string, points: number, nextTurnUserId: string) => {
  if (!db) return;
  try {
    const duelRef = doc(db, "duels", duelId);
    // We need to fetch current state to update score safely (transaction would be better but keep simple for now)
    // Actually Firestore `increment` is best for score.
    // For array union: arrayUnion

    // Dynamic key for score update: player1.score or player2.score? 
    // We need to know which player 'userId' is. 
    // For MVPr, we read then write.
    // But to be generic, let's just push move and let client calc score? 
    // No, client needs sync. 

    // Let's assume we update the specific player field manually in the client before calling this? 
    // No, backend logic should reside here or be simple.

    await updateDoc(duelRef, {
      moves: arrayUnion({ userId, nodeId, timestamp: Date.now() }),
      currentTurnUserId: nextTurnUserId,
      lastMoveAt: Date.now()
      // Score update is complex without knowing player1 vs player2 here. 
      // We will handle score update in a separate call or assume UI passes it?
      // Let's keep it simple: UI calculates new scores and passes them? 
      // Better: updateDuelMove accepts specific field updates.
    });
  } catch (e) {
    console.error("Update Move Error:", e);
  }
};

// Update Score Helper
export const updateDuelScore = async (duelId: string, playerField: 'player1' | 'player2', points: number) => {
  if (!db) return;
  const duelRef = doc(db, "duels", duelId);
  await updateDoc(duelRef, {
    [`${playerField}.score`]: increment(points)
  });
};
export const finishDuelSession = async (duelId: string) => {
  if (!db) return;
  const duelRef = doc(db, "duels", duelId);
  await updateDoc(duelRef, {
    status: 'FINISHED',
    lastMoveAt: Date.now()
  });
};

export const getMuhafizByUsername = async (username: string): Promise<UserProfile | null> => {
  if (!db) return null;
  try {
    const q = query(collection(db, "users"), where("username", "==", username));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as UserProfile;
    }
    return null;
  } catch (e) {
    console.error("Find Muhafiz Error:", e);
    return null;
  }
};

// --- GUILD (LONCA) SYSTEM ---

export const createNewGuild = async (userId: string, username: string, name: string, description: string): Promise<string | null> => {
  if (!db) return null;
  try {
    const guildData: Omit<Guild, 'id'> = {
      name,
      leaderId: userId,
      leaderName: username,
      members: [userId],
      totalScore: 0,
      createdAt: Date.now(),
      description,
      rules: "Saygı ve birlik her şeyden önce gelir.",
      privacy: 'OPEN'
    };

    const docRef = await addDoc(collection(db, "guilds"), guildData);
    const guildId = docRef.id;
    await updateDoc(docRef, { id: guildId });


    // Update User's Guild ID. Use setDoc with merge to ensure it works even if doc is missing/laggy
    await setDoc(doc(db, "users", userId), { guildId: guildId }, { merge: true });

    return guildId;
  } catch (e) {
    console.error("Create Guild Error:", e);
    return null;
  }
};

export const retrieveUserByPin = async (username: string, pin: string): Promise<UserProfile | null> => {
  if (!db) return null;
  try {
    const q = query(collection(db, "users"), where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    // Find user with matching PIN (client-side filter for simplicity if multiple usernames, though username should be unique-ish)
    const userDoc = querySnapshot.docs.find(d => {
      const data = d.data();
      return data.pin === pin;
    });

    if (userDoc) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (e) {
    console.error("Retrieve User Error:", e);
    return null;
  }
};


export const joinGuild = async (userId: string, guildId: string): Promise<boolean> => {
  if (!db) return false;
  try {
    const guildRef = doc(db, "guilds", guildId);
    await updateDoc(guildRef, {
      members: arrayUnion(userId)
    });

    // Update User
    await updateDoc(doc(db, "users", userId), { guildId: guildId });
    return true;
  } catch (e) {
    console.error("Join Guild Error:", e);
    return false;
  }
};

export const leaveGuild = async (userId: string, guildId: string): Promise<boolean> => {
  if (!db) return false;
  try {
    const guildRef = doc(db, "guilds", guildId);
    const guildSnap = await getDoc(guildRef);
    if (!guildSnap.exists()) return false;

    const members = guildSnap.data().members as string[];
    const updatedMembers = members.filter(id => id !== userId);

    await updateDoc(guildRef, { members: updatedMembers });
    await updateDoc(doc(db, "users", userId), { guildId: null });

    return true;
  } catch (e) {
    console.error("Leave Guild Error:", e);
    return false;
  }
};

export const fetchAllGuilds = async (): Promise<Guild[]> => {
  if (!db) return [];
  try {
    const q = query(collection(db, "guilds"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Guild);
  } catch (e) {
    console.error("Fetch Guilds Error:", e);
    return [];
  }
};

export const fetchGuildDetails = async (guildId: string): Promise<Guild | null> => {
  if (!db) return null;
  try {
    const docSnap = await getDoc(doc(db, "guilds", guildId));
    if (docSnap.exists()) return docSnap.data() as Guild;
    return null;
  } catch (e) {
    console.error("Fetch Guild Details Error:", e);
    return null;
  }
};

export const updateGuildScore = async (guildId: string, points: number) => {
  if (!db) return;
  try {
    const guildRef = doc(db, "guilds", guildId);
    await updateDoc(guildRef, {
      totalScore: increment(points)
    });
  } catch (e) {
    console.error("Update Guild Score Error:", e);
  }
};

export const updateGuildSettings = async (guildId: string, settings: { description?: string, rules?: string, privacy?: 'OPEN' | 'CLOSED' }) => {
  if (!db) return;
  try {
    const guildRef = doc(db, "guilds", guildId);
    await updateDoc(guildRef, settings);
  } catch (e) {
    console.error("Update Guild Settings Error:", e);
    throw e;
  }
};

export const kickMember = async (guildId: string, memberId: string) => {
  if (!db) return;
  try {
    const guildRef = doc(db, "guilds", guildId);
    await updateDoc(guildRef, {
      members: arrayRemove(memberId)
    });

    const userRef = doc(db, "users", memberId);
    await updateDoc(userRef, {
      guildId: deleteField()
    });
  } catch (e) {
    console.error("Kick Member Error:", e);
    throw e;
  }
};


export interface GlobalStats {
  totalUsers: number;
  totalGuilds: number;
  totalDuels: number;
  activeUsersLast24h: number; // Placeholder for now or calculated if poss
}

export const fetchGlobalStats = async (): Promise<GlobalStats> => {
  if (!db) return { totalUsers: 0, totalGuilds: 0, totalDuels: 0, activeUsersLast24h: 0 };
  try {
    const userColl = collection(db, "users");
    const guildColl = collection(db, "guilds");
    const duelColl = collection(db, "duels");

    const [userSnap, guildSnap, duelSnap] = await Promise.all([
      getDocs(userColl), // For small user base, getDocs is fine. For large, use getCountFromServer
      getDocs(query(guildColl)),
      getDocs(query(duelColl))
    ]);

    // Simple calculation for MVP
    return {
      totalUsers: userSnap.size,
      totalGuilds: guildSnap.size,
      totalDuels: duelSnap.size,
      activeUsersLast24h: 0 // Not tracked yet
    };
  } catch (e) {
    console.error("Fetch Stats Error:", e);
    return { totalUsers: 0, totalGuilds: 0, totalDuels: 0, activeUsersLast24h: 0 };
  }
};
