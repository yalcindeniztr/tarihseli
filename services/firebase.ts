import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { Category, UserProfile } from '../types';

// NOTE: Replace these with your actual Firebase project configuration
// You can find these in your Firebase Console -> Project Settings
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
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
  console.warn("Firebase config missing or invalid. Using local fallback.");
}

// Fallback in-memory DB for development if keys aren't set
let CLOUD_DATABASE = {
  categories: [] as Category[],
  users: [] as UserProfile[]
};

export const syncCategoriesToCloud = async (categories: Category[]): Promise<boolean> => {
  if (!db) return true;
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

export const fetchAllUsersFromCloud = async (): Promise<UserProfile[]> => {
  if (!db) return CLOUD_DATABASE.users;
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
  if (!db) {
    CLOUD_DATABASE.users = CLOUD_DATABASE.users.filter(u => u.id !== userId);
    return true;
  }
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
    await signInWithPopup(auth, provider);
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
  if (!db) {
    const idx = CLOUD_DATABASE.users.findIndex(u => u.id === user.id);
    if (idx > -1) CLOUD_DATABASE.users[idx] = { ...user };
    else CLOUD_DATABASE.users.push({ ...user });
    return;
  }
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
  if (!db) return true;
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
