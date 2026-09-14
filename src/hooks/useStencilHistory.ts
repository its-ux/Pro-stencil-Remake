
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, getDoc, setDoc, writeBatch, deleteDoc, increment } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { StencilHistoryItem } from '../../types';
import { compressImage } from '../../services/geminiService';
import { User } from 'firebase/auth';

export const useStencilHistory = (user: User | null) => {
  const [history, setHistory] = useState<StencilHistoryItem[]>([]);
  const [currentQuotaUsed, setCurrentQuotaUsed] = useState(0);

  useEffect(() => {
    if (!user) {
      setHistory([]);
      setCurrentQuotaUsed(0);
      return;
    }

    const stencilsRef = collection(db, 'users', user.uid, 'stencils');
    const q = query(stencilsRef, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCurrentQuotaUsed(snapshot.size);
      const items = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as StencilHistoryItem[];
      setHistory(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/stencils`);
    });

    return () => unsubscribe();
  }, [user]);

  const saveToHistory = async (newItem: StencilHistoryItem) => {
    if (!user) return;
    try {
      // Ensure user document exists before updating stencilCount
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      const batch = writeBatch(db);
      
      // Automatic History Management: Max 3 items as per user request
      if (history.length >= 3) {
        const oldest = history[history.length - 1];
        batch.delete(doc(db, 'users', user.uid, 'stencils', oldest.id));
      }

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          status: 'active',
          quota: 15,
          stencilCount: 1,
          role: 'user'
        });
      } else {
        batch.update(userRef, {
          stencilCount: increment(1)
        });
      }

      // Compress images
      const [compressedOriginal, compressedStencil] = await Promise.all([
        compressImage(newItem.originalImage, 800, 0.6, 'image/jpeg'),
        compressImage(newItem.stencilImage, 1024, 0.6, 'image/jpeg')
      ]);

      const stencilRef = doc(db, 'users', user.uid, 'stencils', newItem.id);
      batch.set(stencilRef, {
        userId: user.uid,
        originalImage: compressedOriginal,
        stencilImage: compressedStencil,
        styleName: newItem.styleName,
        date: newItem.date,
        id: newItem.id,
        insights: newItem.insights || null,
        dimensions: newItem.dimensions || null
      });

      await batch.commit();
    } catch (e) {
      console.error("Failed to save to history:", e);
      handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/stencils`);
    }
  };

  const deleteHistoryItem = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'stencils', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/stencils/${id}`);
    }
  };

  return {
    history,
    currentQuotaUsed,
    saveToHistory,
    deleteHistoryItem
  };
};
