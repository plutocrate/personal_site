import { createContext, useContext, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { vibrate } from '../utils/haptics.js';

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const activeRef = useRef(false);

  const showToast = useCallback((msg, author = '') => {
    // Only works on phone / mobile screens
    if (typeof window !== 'undefined' && window.innerWidth > 860) return;

    // Toast spamming is not allowed: wait until previous toast is completely gone
    if (activeRef.current) return;

    activeRef.current = true;
    vibrate(12);
    setToast({ msg, author });

    // Calculate reading time based on word count:
    // Average silent reading speed: ~250-280 words per minute (~4.5 words/sec or ~220ms/word)
    // Snappy buffer (450ms), clamped between 1.4s and 4.0s
    const textToCount = `${msg} ${author}`.trim();
    const wordCount = textToCount.split(/\s+/).filter(Boolean).length;
    const readingTimeMs = Math.round((wordCount / 4.5) * 1000);
    const bufferTimeMs = 450;
    const totalDuration = Math.min(Math.max(readingTimeMs + bufferTimeMs, 1400), 4000);

    setTimeout(() => {
      setToast(null);
    }, totalDuration);
  }, []);

  const handleExitComplete = () => {
    activeRef.current = false;
  };

  return (
    <ToastCtx.Provider value={{ showToast }}>
      {children}
      <AnimatePresence onExitComplete={handleExitComplete}>
        {toast && (
          <motion.div
            className="site-toast"
            initial={{ opacity: 0, y: -48, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -48, scale: 0.94 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={() => setToast(null)}
            role="status"
            aria-live="polite"
          >
            <div className="site-toast-glow" />
            <div className="site-toast-content">
              {toast.author && <span className="site-toast-icon">“</span>}
              <div className="site-toast-body">
                <p className="site-toast-text">{toast.msg}</p>
                {toast.author && <p className="site-toast-author">— {toast.author}</p>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
