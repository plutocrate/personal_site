import { useState, useEffect, useRef } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { nav, caseStudies, journal, contacts, profile } from '../data/content.js';
import { lifeUpdates } from '../data/lifeUpdates.js';
import { sims } from '../playground/index.js';
import ContactItem from './ContactItem.jsx';
import Logo from './Logo.jsx';
import QuoteBox from './QuoteBox.jsx';
import MobileGeminiShader from './MobileGeminiShader.jsx';
import { vibrate } from '../utils/haptics.js';

const STORAGE_KEY = 'pratham_mobile_menu_visited';

// Custom fluid cubic-bezier curve resembling Barba.js bottom-sheet expansion
const barbaEase = [0.16, 1, 0.3, 1];

export default function MobileBottomMenu({ open, onOpenChange }) {
  const location = useLocation();

  const [hasVisited, setHasVisited] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [buttonMode, setButtonMode] = useState(() => (hasVisited ? 'hamburger' : 'menu'));

  // Mobile Shake Detection State:
  // When shaking, isShaking becomes true, opacity of content fades to 0,
  // 20-color prism cloud takes over vigorously.
  const [shakeIntensity, setShakeIntensity] = useState(0); // 0 (idle) to 1 (full shake)
  const lastShakeTimeRef = useRef(0);
  const shakeTimeoutRef = useRef(null);

  const markVisited = () => {
    if (!hasVisited) {
      setHasVisited(true);
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
      } catch {}
    }
  };

  useEffect(() => {
    if (hasVisited) {
      setButtonMode('hamburger');
      return;
    }

    let intervalId;
    const initialTimer = setTimeout(() => {
      setButtonMode('hamburger');
      intervalId = setInterval(() => {
        setButtonMode((prev) => (prev === 'menu' ? 'hamburger' : 'menu'));
      }, 6000);
    }, 10000);

    return () => {
      clearTimeout(initialTimer);
      if (intervalId) clearInterval(intervalId);
    };
  }, [hasVisited]);

  const handleToggle = () => {
    vibrate(12);
    markVisited();
    setButtonMode('hamburger');
    onOpenChange(!open);
  };

  useEffect(() => {
    if (open) {
      onOpenChange(false);
    }
  }, [location.pathname]);

  // Accelerometer DeviceMotion listener to detect mobile shake
  useEffect(() => {
    if (!open) {
      setShakeIntensity(0);
      return;
    }

    let lastX = null, lastY = null, lastZ = null;
    let lastUpdate = 0;

    const handleMotion = (e) => {
      const current = performance.now();
      if (current - lastUpdate < 60) return; // sample rate ~16Hz
      lastUpdate = current;

      const acc = e.accelerationIncludingGravity || e.acceleration;
      if (!acc) return;

      const x = acc.x || 0;
      const y = acc.y || 0;
      const z = acc.z || 0;

      if (lastX !== null && lastY !== null && lastZ !== null) {
        const deltaX = Math.abs(x - lastX);
        const deltaY = Math.abs(y - lastY);
        const deltaZ = Math.abs(z - lastZ);
        const totalDelta = deltaX + deltaY + deltaZ;

        // Threshold for vigorous shake
        if (totalDelta > 16.5) {
          lastShakeTimeRef.current = current;
          setShakeIntensity(1);

          if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
          // When shake stops, within 2 seconds it smoothly returns to normal and fuses back
          shakeTimeoutRef.current = setTimeout(() => {
            setShakeIntensity(0);
          }, 2000);
        }
      }

      lastX = x;
      lastY = y;
      lastZ = z;
    };

    window.addEventListener('devicemotion', handleMotion, { passive: true });

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    };
  }, [open]);

  const getCount = (to) => {
    if (to === '/life') return lifeUpdates.length || undefined;
    if (to === '/playground') return sims.length || undefined;
    if (to === '/case-studies') return caseStudies.length || undefined;
    if (to === '/journal') return journal.length || undefined;
    return undefined;
  };

  return (
    <>
      {/* Fixed Bottom Floating Trigger Slider on Phone */}
      <div className="mobile-bottom-bar-wrap" aria-label="Mobile Navigation Dock">
        <button
          type="button"
          className={`mobile-bottom-pill${open ? ' is-open' : ''}`}
          onClick={handleToggle}
          aria-expanded={open}
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          title={open ? 'Close' : 'Menu'}
        >
          <motion.div
            className="mobile-bottom-knob"
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 36 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                <motion.span
                  key="close-icon"
                  className="mobile-pill-icon"
                  initial={{ opacity: 0, rotate: -45, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 45, scale: 0.7 }}
                  transition={{ duration: 0.16 }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <line x1="2" y1="2" x2="10" y2="10" />
                    <line x1="10" y1="2" x2="2" y2="10" />
                  </svg>
                </motion.span>
              ) : buttonMode === 'menu' ? (
                <motion.span
                  key="menu-text"
                  className="mobile-pill-text"
                  initial={{ opacity: 0, y: 3, filter: 'blur(2px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -3, filter: 'blur(2px)' }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
                  menu
                </motion.span>
              ) : (
                <motion.span
                  key="burger-icon"
                  className="mobile-pill-burger"
                  initial={{ opacity: 0, scale: 0.75, filter: 'blur(2px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.75, filter: 'blur(2px)' }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="mobile-burger-line" />
                  <span className="mobile-burger-line" />
                  <span className="mobile-burger-line" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </button>
      </div>

      {/* Expanded Bezier Mobile Sheet with Buffer Spaces & Gemini Shader Glassmorphism */}
      <AnimatePresence>
        {open && (
          <div className="mobile-sheet-overlay-root">
            <motion.div
              className="mobile-sheet-buffer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: barbaEase }}
              onClick={() => {
                vibrate(8);
                onOpenChange(false);
              }}
              aria-hidden="true"
            />

            <motion.div
              className="mobile-sheet-container"
              initial={{
                opacity: 0,
                y: '100%',
                scale: 0.94,
                borderRadius: '36px',
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                borderRadius: '28px',
              }}
              exit={{
                opacity: 0,
                y: '100%',
                scale: 0.92,
                borderRadius: '36px',
              }}
              transition={{
                duration: 0.42,
                ease: barbaEase,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* WebGL Gemini AI Procedural Fluid Shader Canvas with Shake Reaction */}
              <MobileGeminiShader active={open} shakeIntensity={shakeIntensity} />

              {/* Glassmorphic frosted tint layer over the shader */}
              <div className="mobile-sheet-frost" />

              {/* High-legibility interactive navigation content: fades out when shaken */}
              <motion.div
                className="mobile-sheet-content"
                animate={{
                  opacity: shakeIntensity > 0.05 ? 0 : 1,
                  filter: shakeIntensity > 0.05 ? 'blur(6px)' : 'blur(0px)',
                  scale: shakeIntensity > 0.05 ? 0.98 : 1,
                }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Header row with Logo and QuoteBox side-by-side (esc button removed, content pushed up) */}
                <div className="mobile-sheet-head">
                  <div className="mobile-sheet-logo">
                    <Logo sidebarOpen={true} />
                  </div>
                  <div className="mobile-sheet-quote-wrap">
                    <QuoteBox />
                  </div>
                </div>

                {/* Primary Site Navigation Links */}
                <nav className="mobile-sheet-nav" aria-label="Mobile Navigation Links">
                  {nav.map((n) => {
                    const active = n.end ? location.pathname === n.to : location.pathname.startsWith(n.to);
                    const count = getCount(n.to);
                    return (
                      <NavLink
                        key={n.to}
                        to={n.to}
                        end={n.end}
                        className={`mobile-sheet-link${active ? ' is-active' : ''}${n.isHighlighted ? ' is-highlighted' : ''}`}
                        onClick={() => {
                          vibrate(10);
                          onOpenChange(false);
                        }}
                      >
                        <span className="mobile-sheet-link-label">
                          {n.label}
                          {count != null && <sup className="mobile-sheet-count">{count}</sup>}
                        </span>
                        {active && (
                          <span className="mobile-sheet-here">
                            <span className="mobile-sheet-here-dot" />
                            <em>active</em>
                          </span>
                        )}
                      </NavLink>
                    );
                  })}

                  {/* Contact section accordion */}
                  <div className="mobile-sheet-contact-wrap">
                    <ContactItem count={contacts.length} />
                  </div>
                </nav>

                {/* Bottom Footer Details with 'shake your phone' hint */}
                <div className="mobile-sheet-footer">
                  <span
                    className="mobile-sheet-shake-hint"
                    onClick={() => {
                      vibrate(20);
                      setShakeIntensity(1);
                      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
                      shakeTimeoutRef.current = setTimeout(() => {
                        setShakeIntensity(0);
                      }, 2000);
                    }}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="5" y="2" width="14" height="20" rx="3" ry="3" />
                      <line x1="12" y1="18" x2="12.01" y2="18" />
                    </svg>
                    shake your phone
                  </span>
                  <small className="mobile-sheet-copyright">
                    ©{profile.name} <span>{profile.year}</span>
                  </small>
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
