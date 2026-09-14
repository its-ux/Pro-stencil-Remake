
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { StencilStyle } from '../../types';

export const useSiteConfig = () => {
  const [siteConfig, setSiteConfig] = useState<any>(null);
  const [customStencilStyles, setCustomStencilStyles] = useState<StencilStyle[] | null>(null);

  useEffect(() => {
    // Real-time listener for site content
    const unsubscribe = onSnapshot(doc(db, 'site', 'content'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSiteConfig(data);
        setCustomStencilStyles(data.stencilStyles || []);
      }
    }, (err) => {
      console.error("Failed to sync site config", err);
    });
    
    return () => unsubscribe();
  }, []);

  return { siteConfig, customStencilStyles };
};
