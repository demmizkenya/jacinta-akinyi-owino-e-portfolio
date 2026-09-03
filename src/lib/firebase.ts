import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

export interface FirebaseDiagnostics {
  isConfigured: boolean;
  isInitialized: boolean;
  projectId: string | null;
  authDomain: string | null;
  storageBucket: string | null;
  missingVars: string[];
  initError: string | null;
}

// Retrieve environment variables with safe fallbacks (supporting both VITE_ and standard names)
const getEnv = (key: string): string => {
  try {
    const metaEnv = (import.meta as any)?.env;
    if (metaEnv) {
      const val = metaEnv[key] || metaEnv[`VITE_${key}`];
      if (val) return String(val);
    }
  } catch {}

  try {
    if (typeof process !== 'undefined' && process.env) {
      const val = process.env[key] || process.env[`VITE_${key}`];
      if (val) return String(val);
    }
  } catch {}

  return '';
};

export const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY') || getEnv('FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN') || getEnv('FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID') || getEnv('FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET') || getEnv('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') || getEnv('FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID') || getEnv('FIREBASE_APP_ID'),
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;
let initError: string | null = null;

// Determine missing variables
export const getMissingFirebaseVars = (): string[] => {
  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ];
  return required.filter((key) => {
    const val = getEnv(key);
    return !val || val.trim() === '';
  });
};

// Safe initialization
export const initializeFirebaseApp = (): {
  app: FirebaseApp | null;
  db: Firestore | null;
  storage: FirebaseStorage | null;
  auth: Auth | null;
  error: string | null;
} => {
  if (app && db) {
    return { app, db, storage, auth, error: null };
  }

  const missing = getMissingFirebaseVars();
  if (missing.length > 0) {
    initError = `Firebase environment variables missing: ${missing.join(', ')}. Set these in your Vercel Project Settings > Environment Variables.`;
    console.info('[Firebase Config Notice]:', initError);
    return { app: null, db: null, storage: null, auth: null, error: initError };
  }

  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    db = getFirestore(app);
    auth = getAuth(app);
    try {
      storage = getStorage(app);
    } catch (storageErr) {
      console.warn('[Firebase Storage Notice]: Storage init deferred:', storageErr);
    }
    initError = null;
    console.log('[Firebase]: Initialized successfully with projectId:', firebaseConfig.projectId);
    return { app, db, storage, auth, error: null };
  } catch (err: any) {
    initError = err?.message || String(err);
    console.error('[Firebase Initialization Error]:', err);
    return { app: null, db: null, storage: null, auth: null, error: initError };
  }
};

// Diagnostics helper
export const getFirebaseDiagnostics = (): FirebaseDiagnostics => {
  const missingVars = getMissingFirebaseVars();
  const isConfigured = missingVars.length === 0;

  let isInitialized = false;
  try {
    const { app: initializedApp } = initializeFirebaseApp();
    isInitialized = !!initializedApp;
  } catch {
    isInitialized = false;
  }

  return {
    isConfigured,
    isInitialized,
    projectId: firebaseConfig.projectId || null,
    authDomain: firebaseConfig.authDomain || null,
    storageBucket: firebaseConfig.storageBucket || null,
    missingVars,
    initError,
  };
};

// Firestore Test Connectivity
export const testFirestoreConnection = async (): Promise<{ success: boolean; message: string; details?: any }> => {
  const diagnostics = getFirebaseDiagnostics();
  if (!diagnostics.isConfigured) {
    return {
      success: false,
      message: `Firebase is not fully configured. Missing: ${diagnostics.missingVars.join(', ')}`,
      details: diagnostics,
    };
  }

  try {
    const { db: firestore } = initializeFirebaseApp();
    if (!firestore) {
      throw new Error(initError || 'Firestore instance could not be created');
    }

    // Ping Firestore configuration document
    const docRef = doc(firestore, 'portfolio', 'data');
    const snap = await getDoc(docRef);

    return {
      success: true,
      message: snap.exists()
        ? 'Firestore connection active! Portfolio document found.'
        : 'Firestore connected successfully! (Document "portfolio/data" ready to be initialized).',
      details: { docExists: snap.exists() },
    };
  } catch (err: any) {
    console.error('[Firestore Connection Test Error]:', err);
    const code = err?.code || 'UNKNOWN';
    const message = err?.message || String(err);
    return {
      success: false,
      message: `Firestore Error [${code}]: ${message}`,
      details: err,
    };
  }
};

/**
 * Persist portfolio data directly to Firestore document 'portfolio/data'
 */
export const syncPortfolioToFirestore = async (portfolioData: any): Promise<boolean> => {
  try {
    const { db: firestore } = initializeFirebaseApp();
    if (!firestore) return false;
    const docRef = doc(firestore, 'portfolio', 'data');
    await setDoc(docRef, {
      ...portfolioData,
      _lastUpdated: new Date().toISOString(),
    }, { merge: true });
    console.log('[Firestore]: Portfolio state permanently synchronized to cloud Firestore.');
    return true;
  } catch (err: any) {
    console.warn('[Firestore Sync Warning]: Could not write to Firestore:', err?.message || err);
    return false;
  }
};

/**
 * Fetch portfolio data directly from Firestore
 */
export const fetchPortfolioFromFirestore = async (): Promise<any | null> => {
  try {
    const { db: firestore } = initializeFirebaseApp();
    if (!firestore) return null;
    const docRef = doc(firestore, 'portfolio', 'data');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    console.warn('[Firestore Fetch Warning]:', err);
    return null;
  }
};

/**
 * Subscribe in real-time to Firestore updates for live synchronization across all visitors
 */
export const subscribePortfolioFromFirestore = (onUpdate: (data: any) => void): (() => void) => {
  try {
    const { db: firestore } = initializeFirebaseApp();
    if (!firestore) return () => {};
    const docRef = doc(firestore, 'portfolio', 'data');
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          console.log('[Firestore Realtime Sync]: Received live update from Firestore');
          onUpdate(snapshot.data());
        }
      },
      (error) => {
        console.warn('[Firestore Realtime Error]:', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('[Firestore Subscription Warning]:', err);
    return () => {};
  }
};

/**
 * Persist media library catalog directly to Firestore document 'portfolio/media'
 */
export const syncMediaToFirestore = async (mediaItems: any[]): Promise<boolean> => {
  try {
    const { db: firestore } = initializeFirebaseApp();
    if (!firestore) return false;
    const docRef = doc(firestore, 'portfolio', 'media');
    await setDoc(docRef, {
      items: mediaItems,
      totalCount: mediaItems.length,
      _lastUpdated: new Date().toISOString(),
    }, { merge: true });
    console.log('[Firestore]: Media catalog permanently synchronized to cloud Firestore.');
    return true;
  } catch (err: any) {
    console.warn('[Firestore Media Sync Warning]:', err?.message || err);
    return false;
  }
};

/**
 * Fetch media catalog from Firestore
 */
export const fetchMediaFromFirestore = async (): Promise<any[] | null> => {
  try {
    const { db: firestore } = initializeFirebaseApp();
    if (!firestore) return null;
    const docRef = doc(firestore, 'portfolio', 'media');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data()?.items || [];
    }
    return null;
  } catch (err) {
    console.warn('[Firestore Media Fetch Warning]:', err);
    return null;
  }
};

export { app, db, auth, storage };
