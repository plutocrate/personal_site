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

  // Determine initial button visual mode:
  // If user previously visited/interacted, start directly with 'hamburger'.
  // Otherwise, start with 'menu' text.
  const [hasVisited, setHasVisited] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [buttonMode, setButtonMode] = useState(() => (hasVisited ? 'hamburger' : 'menu'));

  // Mark as visited and store in localStorage
  const markVisited = () => {
    if (!hasVisited) {
      setHasVisited(true);
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
      } catch {}
    }
  };

  // Loop/Timer effect:
  // For first-time visitors:
  // - Starts with 'menu'
  // - After 10 seconds switches to 'hamburger'
  // - Gently cycles every few seconds between 'menu' and 'hamburger' in a loop
  // For returning visitors:
  // - Remains fixed on 'hamburger'
  useEffect(() => {
    if (hasVisited) {
      setButtonMode('hamburger');
      return;
    }

    let intervalId;
    // Switch from initial 'menu' to 'hamburger' after 10 seconds
    const initialTimer = setTimeout(() => {
      setButtonMode('hamburger');

      // Then continue looping subtly every 6 seconds
      intervalId = setInterval(() => {
        setButtonMode((prev) => (prev === 'menu' ? 'hamburger' : 'menu'));
      }, 6000);
    }, 10000);

    return () => {
      clearTimeout(initialTimer);
      if (intervalId) clearInterval(intervalId);
    };
  }, [hasVisited]);

  // Handle tapping the toggle button
  const handleToggle = () => {
    vibrate(12);
    markVisited();
    setButtonMode('hamburger');
    onOpenChange(!open);
  };

  // Auto-close menu when navigating
  useEffect(() => {
    if (open) {
      onOpenChange(false);
    }
  }, [location.pathname]);

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
          {/* Animated Knob Slider inside Pill */}
          <motion.div
            className="mobile-bottom-knob"
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 36 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                // Close 'X' icon when sheet is open
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
                // 'menu' text state with subtle font tracking
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
                // Hamburger icon state
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
            {/* Tapping anywhere on the surrounding buffer space closes the menu */}
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

            {/* Bezier bottom-up growth container with surrounding buffer margin */}
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
              {/* WebGL Gemini AI Procedural Fluid Shader Canvas */}
              <MobileGeminiShader active={open} />

              {/* Glassmorphic frosted tint layer over the shader */}
              <div className="mobile-sheet-frost" />

              {/* High-legibility interactive navigation content */}
              <div className="mobile-sheet-content">
                {/* Header row with Logo & Close Pill */}
                <div className="mobile-sheet-head">
                  <div className="mobile-sheet-logo">
                    <Logo sidebarOpen={true} />
                  </div>
                  <button
                    type="button"
                    className="mobile-sheet-close-btn"
                    onClick={() => {
                      vibrate(10);
                      onOpenChange(false);
                    }}
                    aria-label="Close menu"
                  >
                    <span>esc</span>
                  </button>
                </div>

                {/* Quote Box snippet */}
                <div className="mobile-sheet-quote-wrap">
                  <QuoteBox />
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

                {/* Bottom Footer Details */}
                <div className="mobile-sheet-footer">
                  <small className="mobile-sheet-copyright">
                    ©{profile.name} <span>{profile.year}</span>
                  </small>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
