import { useEffect, useRef } from 'react';
import { useToast } from '../hooks/useToast.jsx';

const TOAST_KEY = 'pratham_balatro_menu_intro_toast';

export default function BalatroToastOnLoad() {
  const { showToast } = useToast();
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;

    try {
      if (sessionStorage.getItem(TOAST_KEY) === 'true') {
        return;
      }
    } catch {}

    firedRef.current = true;

    // Show once gracefully after initial load
    const timer = setTimeout(() => {
      showToast('You can play Balatro directly in your browser by going into the menu');
      try {
        sessionStorage.setItem(TOAST_KEY, 'true');
      } catch {}
    }, 2200);

    return () => clearTimeout(timer);
  }, [showToast]);

  return null;
}
