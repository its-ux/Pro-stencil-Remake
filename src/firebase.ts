import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  onAuthStateChanged, 
  User, 
  initializeAuth, 
  inMemoryPersistence, 
  browserLocalPersistence, 
  browserPopupRedirectResolver,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  deleteDoc,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  updateDoc,
  where,
  addDoc
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export let auth: any;
try {
  // Use in-memory persistence in iframes to prevent IndexedDB/Cookie errors
  let isIframe = false;
  try {
    isIframe = window.self !== window.top;
  } catch (e) {
    isIframe = true;
  }
  
  if (isIframe) {
    auth = initializeAuth(app, { 
      persistence: inMemoryPersistence,
      popupRedirectResolver: browserPopupRedirectResolver
    });
  } else {
    auth = getAuth(app); // defaults to best available
  }
} catch (e) {
  // Fallback if anything goes wrong during init (like strict privacy blocking localStorage)
  console.warn("Auth initialization failed, trying memory fallback:", e);
  try {
    auth = initializeAuth(app, { 
      persistence: inMemoryPersistence,
      popupRedirectResolver: browserPopupRedirectResolver
    });
  } catch (e2) {
    console.error("Critical Auth Init Error", e2);
    // Even memory auth failed, keep auth as undefined to not crash the whole module
  }
}
// Last Config Refresh: 2026-04-20
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

// Auth Helpers
export const loginWithGoogle = async () => {
  if (!auth) {
    throw new Error("Authentication failed to initialize (cookies/storage completely blocked). Please click 'Open in new tab' to use the app.");
  }
  
  try {
    let result: any = null;
    let user: User | null = null;
    
    // Try popup sign in first, with graceful fallbacks
    try {
      result = await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
    } catch (popupErr: any) {
      if (popupErr.code === 'auth/unauthorized-domain' || popupErr.message?.includes('unauthorized-domain')) {
        throw popupErr;
      }
      try {
        result = await signInWithPopup(auth, googleProvider);
      } catch (popupErr2: any) {
        if (popupErr2.code === 'auth/popup-blocked' || popupErr2.code === 'auth/cancelled-popup-request') {
          // Fallback to redirect if popup is blocked
          await signInWithRedirect(auth, googleProvider, browserPopupRedirectResolver);
          return null;
        }
        throw popupErr2;
      }
    }
    user = result?.user;

    if (!user) {
      throw new Error("Anmeldung abgebrochen oder kein Benutzer zurückgegeben.");
    }
    
    // Log login
    logEvent('Login', 'Auth', { 
      email: user.email || 'anonymous', 
      method: 'Google',
      displayName: user.displayName || 'User' 
    });

    // Sync user to Firestore safely checking if they already exist first
    const userDocRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userDocRef);
    
    if (!userSnap.exists()) {
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'Künstler',
        photoURL: user.photoURL || '',
        role: 'user',
        status: 'active',
        quota: 15, // Default quota
        stencilCount: 0,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
    } else {
      await updateDoc(userDocRef, {
        displayName: user.displayName || user.email?.split('@')[0] || 'Künstler',
        photoURL: user.photoURL || '',
        lastLogin: serverTimestamp()
      });
    }
    
    return user;
  } catch (error: any) {
    const ignoredErrors = ['auth/cancelled-popup-request', 'auth/popup-closed-by-user'];
    if (!ignoredErrors.includes(error.code)) {
      console.error("Login error:", error);
      logEvent('Login Failed', 'Error', { error: error.message });
    }
    throw error;
  }
};

export const loginWithEmail = async (email: string, pass: string) => {
  if (!auth) throw new Error("Auth not initialized");
  const credential = await signInWithEmailAndPassword(auth, email, pass);
  const user = credential.user;
  
  const userDocRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userDocRef);
  if (!userSnap.exists()) {
    await setDoc(userDocRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || email.split('@')[0],
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      status: 'active',
      quota: 15,
      stencilCount: 0
    });
  } else {
    await updateDoc(userDocRef, { lastLogin: serverTimestamp() });
  }
  logEvent('Login', 'Auth', { email: user.email, method: 'Email' });
  return user;
};

export const registerWithEmail = async (email: string, pass: string, name: string) => {
  if (!auth) throw new Error("Auth not initialized");
  const credential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = credential.user;
  if (name) {
    await updateProfile(user, { displayName: name });
  }
  const userDocRef = doc(db, 'users', user.uid);
  await setDoc(userDocRef, {
    uid: user.uid,
    email: user.email,
    displayName: name || email.split('@')[0],
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
    status: 'active',
    quota: 15,
    stencilCount: 0
  });
  logEvent('Register', 'Auth', { email: user.email, method: 'Email' });
  return user;
};

export const loginAsGuest = async (displayName: string = 'Artist Guest') => {
  if (!auth) throw new Error("Auth not initialized");
  let user: User | null = null;

  try {
    const credential = await signInAnonymously(auth);
    user = credential.user;
  } catch (anonErr: any) {
    console.warn("Anonymous sign-in failed, falling back to instant guest credential:", anonErr);
    // Fallback: register instant guest email/password user
    const guestUid = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const guestEmail = `${guestUid}@prostencils.art`;
    const guestPass = `GuestPass_${Date.now()}!`;
    const credential = await createUserWithEmailAndPassword(auth, guestEmail, guestPass);
    user = credential.user;
  }

  if (user) {
    const userDocRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) {
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email || `guest-${user.uid.slice(0, 6)}@prostencils.art`,
        displayName: displayName,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        status: 'active',
        quota: 15,
        stencilCount: 0,
        isGuest: true
      });
    } else {
      await updateDoc(userDocRef, { lastLogin: serverTimestamp() });
    }
    logEvent('Guest Login', 'Auth', { uid: user.uid });
    return user;
  }
  throw new Error("Guest login failed");
};

export const createManualUser = async (email: string, displayName: string, role: string = 'user') => {
  try {
    const newUid = `manual-${Date.now()}`;
    await setDoc(doc(db, 'users', newUid), {
      uid: newUid,
      email,
      displayName,
      role,
      lastLogin: null,
      createdAt: serverTimestamp(),
      status: 'active',
      quota: 15,
      stencilCount: 0,
      isManual: true
    });
    logEvent('Manual User Created', 'Admin', { email, role });
    return newUid;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'users/manual');
  }
};

export const logEvent = async (event: string, category: string, metadata: any = {}) => {
  try {
    // Attempt to get client IP for logs
    let ip = 'unknown';
    // Use a very fast timeout for ipify to not block too long
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    try {
      const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
      const data = await res.json();
      ip = data.ip;
    } catch (e) { /* ignore ip fetch errors */ }
    finally { clearTimeout(timeoutId); }

    // Sanitize metadata to remove undefined/circular values
    let sanitizedMetadata = {};
    try {
      sanitizedMetadata = JSON.parse(JSON.stringify(metadata, (_, v) => (v === undefined || typeof v === 'function') ? null : v));
    } catch (e) {
      sanitizedMetadata = { error: "Metadata too complex or circular" };
    }

    await addDoc(collection(db, 'logs'), {
      event,
      category,
      metadata: sanitizedMetadata,
      ip,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
      timestamp: serverTimestamp(),
      user: auth?.currentUser?.email || 'anonymous',
      userId: auth?.currentUser?.uid || 'anonymous'
    });
  } catch (err) {
    // Fail silently in prod but log to console for debugging
    console.error("Critical: Failed to log event:", err);
  }
};

export const getAllLogs = async () => {
  try {
    const q = query(collection(db, 'logs'), orderBy('timestamp', 'desc'), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Error fetching logs:", err);
    return [];
  }
};

export const sendMessageToAdmin = async (message: string) => {
  try {
    if (!auth?.currentUser) throw new Error("Must be logged in to send messages");
    
    await setDoc(doc(collection(db, 'messages')), {
      userId: auth.currentUser.uid,
      userEmail: auth.currentUser.email,
      userName: auth.currentUser.displayName,
      message,
      createdAt: serverTimestamp(),
      read: false
    });
    logEvent('Message Sent', 'UserAction', { messageCount: message.length });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'messages');
  }
};

export const getAdminMessages = async () => {
  try {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Error fetching messages:", err);
    return [];
  }
};

export const deleteAdminMessage = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'messages', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `messages/${id}`);
  }
};

export const logout = () => {
  if (!auth) return Promise.resolve();
  logEvent('Logout', 'Auth', { email: auth?.currentUser?.email });
  return auth.signOut();
};

export const checkIfAdmin = async (uid: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return data.role === 'admin' || 
             auth?.currentUser?.email === "kenny.goossens@gmail.com" || 
             auth?.currentUser?.email === "kenny.acinked@gmail.com";
    }
    return auth?.currentUser?.email === "kenny.goossens@gmail.com" || 
           auth?.currentUser?.email === "kenny.acinked@gmail.com";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

export const getStats = async () => {
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    const totalUsers = usersSnap.size;
    
    let totalStencils = 0;
    for (const userDoc of usersSnap.docs) {
      const stencilsSnap = await getDocs(collection(db, 'users', userDoc.id, 'stencils'));
      totalStencils += stencilsSnap.size;
    }
    
    return { totalUsers, totalStencils };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { totalUsers: 0, totalStencils: 0 };
  }
};

export const getAllUsers = async () => {
  try {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
};

export const updateUser = async (uid: string, data: any) => {
  try {
    await updateDoc(doc(db, 'users', uid), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
  }
};

export const deleteUser = async (uid: string) => {
  try {
    // Attempt to delete any user stencils subcollection documents
    try {
      const stencilsSnap = await getDocs(collection(db, 'users', uid, 'stencils'));
      const deletePromises = stencilsSnap.docs.map(sDoc => deleteDoc(sDoc.ref));
      await Promise.all(deletePromises);
    } catch (e) {
      console.warn("Could not delete user stencils subcollection:", e);
    }
    await deleteDoc(doc(db, 'users', uid));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${uid}`);
    throw error;
  }
};

export const getAllStencils = async () => {
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    const allStencils: any[] = [];
    
    for (const userDoc of usersSnap.docs) {
      const stencilsSnap = await getDocs(collection(db, 'users', userDoc.id, 'stencils'));
      stencilsSnap.forEach(sDoc => {
        allStencils.push({
          id: sDoc.id,
          userId: userDoc.id,
          userEmail: userDoc.data().email,
          ...sDoc.data()
        });
      });
    }
    
    return allStencils.sort((a, b) => (b.date || 0) - (a.date || 0));
  } catch (error) {
    console.error("Error fetching all stencils:", error);
    return [];
  }
};

export const deleteUserStencil = async (userId: string, stencilId: string) => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'stencils', stencilId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/stencils/${stencilId}`);
  }
};

// Firestore Helpers
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
