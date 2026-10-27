import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import Logo from './Logo.jsx';
import QuoteBox from './QuoteBox.jsx';
import NavItem from './NavItem.jsx';
import ContactItem from './ContactItem.jsx';
import MiniNav from './MiniNav.jsx';
import BalatroNavButton from './BalatroNavButton.jsx';
import { nav, caseStudies, journal, contacts, profile } from '../data/content.js';
import { lifeUpdates } from '../data/lifeUpdates.js';
import { sims } from '../playground/index.js';
import { vibrate } from '../utils/haptics.js';

const spring = { type: 'spring', stiffness: 260, damping: 30 };
const OPEN_DESKTOP = 360, CLOSED_DESKTOP = 84, THRESHOLD = 60;

export default function Sidebar({ open, onOpenChange }) {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 860);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 860);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getTargetW = (isOpen, mobile) => {
    if (mobile) {
      return isOpen ? Math.round(window.innerWidth * 0.8) : 0;
    }
    return isOpen ? OPEN_DESKTOP : CLOSED_DESKTOP;
  };

  const w = useMotionValue(getTargetW(open, isMobile));

  useEffect(() => {
    const unsub = w.on('change', (val) => {
      if (typeof document !== 'undefined') {
        document.documentElement.style.setProperty('--sidebar-w', `${Math.round(val)}px`);
      }
    });
    return unsub;
  }, [w]);
  const base = useRef(0);
  const dragging = useRef(false);

  // Auto-close sidebar on mobile upon navigation
  useEffect(() => {
    if (isMobile && open) {
      onOpenChange(false);
    }
  }, [location.pathname]);

  // Follow the open/closed state
  useEffect(() => {
    const target = getTargetW(open, isMobile);
    if (!dragging.current) animate(w, target, spring);
  }, [open, isMobile, w]);

  // Hold and drag the sidebar sideways
  const onPanStart = () => {
    base.current = w.get();
  };

  const onPan = (_, info) => {
    if (!dragging.current) {
      if (Math.abs(info.offset.x) > 6 && Math.abs(info.offset.x) > Math.abs(info.offset.y)) dragging.current = true;
      else return;
    }
    const maxW = isMobile ? Math.round(window.innerWidth * 0.8) : OPEN_DESKTOP;
    const minW = isMobile ? 0 : CLOSED_DESKTOP;
    w.set(Math.min(maxW, Math.max(minW, base.current + info.offset.x)));
  };

  const onPanEnd = (_, info) => {
    if (!dragging.current) return;
    dragging.current = false;
    const moved = w.get() - base.current;
    let next = open;
    if (open && (moved < -THRESHOLD || info.velocity.x < -400)) next = false;
    if (!open && (moved > THRESHOLD || info.velocity.x > 400)) next = true;
    const target = getTargetW(next, isMobile);
    animate(w, target, spring);
    if (next !== open) onOpenChange(next);
  };

  const getCount = (to) => {
    if (to === '/life') return lifeUpdates.length || undefined;
    if (to === '/playground') return sims.length || undefined;
    if (to === '/case-studies') return caseStudies.length || undefined;
    if (to === '/journal') return journal.length || undefined;
    return undefined;
  };

  return (
    <>
      {/* Mobile Backdrop Blur Overlay */}
      <AnimatePresence>
        {open && isMobile && (
          <motion.div
            className="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`sidebar${open ? ' is-expanded' : ''}${isMobile ? ' is-mobile-sidebar' : ''}`}
        style={{ width: w, touchAction: 'pan-y' }}
        onPanStart={onPanStart}
        onPan={onPan}
        onPanEnd={onPanEnd}
      >
        <div className="sidebar-inner">
          <div className="sidebar-head">
            <button
              className={`pill${open ? ' open' : ''}`}
              onClick={() => {
                vibrate(10);
                onOpenChange(!open);
              }}
              aria-pressed={open}
              aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
              data-annotation="Toggle sidebar  ["
            >
              <motion.span layout className="knob" transition={spring}>
                <span className="knob-nav-icon" aria-hidden="true">
                  <span className="knob-line" />
                  <span className="knob-line" />
                  <span className="knob-line" />
                </span>
              </motion.span>
            </button>
          </div>

          <div className="sidebar-top">
            <Logo sidebarOpen={open} />
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  className="quote-wrap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                  transition={{ delay: 0.08 }}
                >
                  <QuoteBox />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence initial={false} mode="wait">
            {open ? (
              <motion.nav
                key="full-nav"
                className="nav"
                aria-label="Primary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.08 } }}
                transition={{ delay: 0.08 }}
              >
                {nav.map((n) => (
                  <NavItem key={n.to} {...n} count={getCount(n.to)} />
                ))}
                <div className="nav-balatro-item">
                  <BalatroNavButton onNavigate={() => isMobile && onOpenChange(false)} />
                </div>
                <ContactItem count={contacts.length} />
              </motion.nav>
            ) : (
              !isMobile && (
                <motion.div
                  key="mini-nav"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.08 } }}
                  transition={{ delay: 0.08 }}
                >
                  <MiniNav getCount={getCount} />
                </motion.div>
              )
            )}
          </AnimatePresence>

          <div className="sidebar-bottom">
            <AnimatePresence initial={false}>
              {open && (
                <motion.small
                  className="copyright"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  ©{profile.name} <span>{profile.year}</span>
                </motion.small>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
