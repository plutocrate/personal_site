import { useEffect, useRef } from 'react';
import { useToast } from '../hooks/useToast.jsx';

export default function BalatroToastOnLoad() {
  const { showToast } = useToast();
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    // Graceful initial welcoming toast
    const timer = setTimeout(() => {
      showToast('play balatro');
    }, 2000);

    return () => clearTimeout(timer);
  }, [showToast]);

  return null;
}
