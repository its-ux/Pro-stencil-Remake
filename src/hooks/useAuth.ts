
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User, getRedirectResult, browserPopupRedirectResolver } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, loginWithGoogle, loginWithEmail, registerWithEmail, loginAsGuest, logout, db, checkIfAdmin } from '../firebase';
import { Language } from '../../types';

export const useAuth = (currentView: string, setCurrentView: (view: any) => void, setShowTutorial: (show: boolean) => void) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState<'active' | 'inactive'>('active');
  const [userQuota, setUserQuota] = useState(15);
  const [stencilCount, setStencilCount] = useState(0);

  useEffect(() => {
    let unsubscribeUser: () => void = () => {};

    // Safety fallback: Ensure app never hangs indefinitely on loading spinner
    const safetyTimeout = setTimeout(() => {
      setIsAuthLoading(false);
    }, 3000);

    if (!auth) {
      clearTimeout(safetyTimeout);
      setIsAuthLoading(false);
      return;
    }

    // Check for redirect result on load asynchronously
    getRedirectResult(auth, browserPopupRedirectResolver)
      .then(async (result) => {
        if (result && result.user) {
          const user = result.user;
          setUser(user);
          setCurrentView('stencil');
          try {
            const userDocRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userDocRef);
            if (!userSnap.exists()) {
              await setDoc(userDocRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                role: 'user',
                status: 'active',
                quota: 15,
                stencilCount: 0,
                createdAt: new Date().toISOString()
              });
            }
          } catch (e) {
            console.warn("Failed to sync redirect user doc:", e);
          }
        }
      })
      .catch((error) => {
        console.error("Redirect login error:", error);
      });

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setUser(currentUser);
        if (currentUser) {
          // Always forward logged-in user from home/landing to stencil generator
          setCurrentView((prevView: string) => (prevView === 'home' ? 'stencil' : prevView));

          try {
            const adminStatus = await checkIfAdmin(currentUser.uid);
            setIsAdmin(adminStatus);
          } catch (e) {
            console.warn("Failed admin check:", e);
          }
          
          try {
            const hasSeenTutorial = !!localStorage.getItem(`tutorial_seen_${currentUser.uid}`);
            if (!hasSeenTutorial) {
              setShowTutorial(true);
            }
          } catch (e) {
            console.warn("localStorage blocked:", e);
          }
          
          // Real-time user status, quota and count
          unsubscribeUser = onSnapshot(doc(db, 'users', currentUser.uid), async (docSnap) => {
            clearTimeout(safetyTimeout);
            if (docSnap.exists()) {
              const data = docSnap.data();
              setUserStatus(data.status || 'active');
              setUserQuota(data.quota || 15);
              setStencilCount(data.stencilCount || 0);
            } else {
              // Self-heal: Create user document if missing
              try {
                await setDoc(doc(db, 'users', currentUser.uid), {
                  uid: currentUser.uid,
                  email: currentUser.email || '',
                  displayName: currentUser.displayName || '',
                  photoURL: currentUser.photoURL || '',
                  status: 'active',
                  quota: 15,
                  stencilCount: 0,
                  role: 'user'
                });
              } catch (err) {
                console.error("Failed to self-heal missing user document:", err);
              }
            }
            setIsAuthLoading(false);
          }, (err) => {
            console.error("User doc sync failed", err);
            clearTimeout(safetyTimeout);
            setIsAuthLoading(false);
          });
        } else {
          setIsAdmin(false);
          clearTimeout(safetyTimeout);
          setIsAuthLoading(false);
        }
      } catch (err) {
        console.error("Error in onAuthStateChanged handler:", err);
        clearTimeout(safetyTimeout);
        setIsAuthLoading(false);
      }
    });

    return () => {
      clearTimeout(safetyTimeout);
      unsubscribeAuth();
      unsubscribeUser();
    };
  }, []); // Run once on mount

  const handleLogin = async () => {
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      await loginWithGoogle();
      setCurrentView('stencil');
    } catch (error: any) {
      const ignoredErrors = ['auth/cancelled-popup-request', 'auth/popup-closed-by-user'];
      if (ignoredErrors.includes(error.code)) {
        return;
      }
      
      let errorMsg = error.message || String(error);
      
      if (error.code === 'auth/cookie-check-failed' || errorMsg.toLowerCase().includes('cookie') || errorMsg.toLowerCase().includes('indexed database') || errorMsg.toLowerCase().includes('storage')) {
        errorMsg = "Browsersicherheits-Einstellungen blockieren Cookies im Vorschau-Fenster. Bitte nutzen Sie die E-Mail-Anmeldung oder den 1-Klick Gast-Zugang!";
        console.warn(errorMsg);
      } else if (error.code === 'auth/unauthorized-domain' || errorMsg.toLowerCase().includes('unauthorized-domain') || errorMsg.toLowerCase().includes('not authorized to run this operation')) {
        errorMsg = `Google Login ist für '${window.location.hostname}' noch nicht in Firebase freigeschaltet. Nutzen Sie jetzt den Instant Gast-Zugang oder E-Mail & Passwort!`;
        console.error(errorMsg);
      } else if (error.code === 'auth/popup-blocked' || errorMsg.toLowerCase().includes('popup')) {
        errorMsg = "Das Pop-up-Fenster wurde vom Browser blockiert. Erlauben Sie Pop-ups oder melden Sie sich direkt per E-Mail / Gastzugang an!";
      } else {
        console.error("Login failed", error);
      }
      setLoginError(errorMsg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEmailLogin = async (email: string, pass: string) => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      await loginWithEmail(email, pass);
      setCurrentView('stencil');
    } catch (error: any) {
      console.error("Email login error:", error);
      let msg = error.message || "Login failed";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        msg = "Falsche E-Mail-Adresse oder Passwort.";
      }
      setLoginError(msg);
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEmailRegister = async (email: string, pass: string, name: string) => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      await registerWithEmail(email, pass, name);
      setCurrentView('stencil');
    } catch (error: any) {
      console.error("Email register error:", error);
      let msg = error.message || "Registration failed";
      if (error.code === 'auth/email-already-in-use') {
        msg = "Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an.";
      } else if (error.code === 'auth/weak-password') {
        msg = "Das Passwort muss mindestens 6 Zeichen lang sein.";
      }
      setLoginError(msg);
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGuestLogin = async (displayName?: string) => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      await loginAsGuest(displayName);
      setCurrentView('stencil');
    } catch (error: any) {
      console.error("Guest login error:", error);
      setLoginError(error.message || "Gast-Anmeldung fehlgeschlagen");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async (onLogoutSuccess: () => void) => {
    try {
      await logout();
      onLogoutSuccess();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return {
    user,
    isAdmin,
    isAuthLoading,
    isLoggingIn,
    loginError,
    setLoginError,
    userStatus,
    userQuota,
    stencilCount,
    setStencilCount,
    handleLogin,
    handleEmailLogin,
    handleEmailRegister,
    handleGuestLogin,
    handleLogout
  };
};
