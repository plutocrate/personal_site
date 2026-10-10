import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Crumbs from './Crumbs.jsx';
import { vibrate } from '../utils/haptics.js';
import { sims } from '../playground/index.js';
import { caseStudies, journal } from '../data/content.js';
import { lifeUpdates } from '../data/lifeUpdates.js';

const spring = { type: 'spring', stiffness: 500, damping: 35 };

/**
 * MobileTopBar
 * Unified sticky mobile header bar containing:
 * - Slider toggle pill on the left (opens/closes mobile navigation drawer)
 * - Current page title / breadcrumbs in the middle
 * - Optional interactive topic counter pill on the right (for reels)
 * Stays stuck to the top across all pages so content cleanly starts below.
 */
export default function MobileTopBar({ open, onOpenChange }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const [widgetOpen, setWidgetOpen] = useState(false);
  const widgetRef = useRef(null);

  // Close topic widget sheet when tapping outside
  useEffect(() => {
    if (!widgetOpen) return;
    const onPointerDown = (e) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target)) {
        setWidgetOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [widgetOpen]);

  // Close topic widget sheet on route change
  useEffect(() => {
    setWidgetOpen(false);
  }, [pathname]);

  // Determine current breadcrumbs trail and reel info from the URL
  let trail = [{ label: 'About' }];
  let reelInfo = null;

  if (pathname.startsWith('/life')) {
    const parts = pathname.split('/').filter(Boolean);
    const id = parts[1];
    const index = Math.max(0, lifeUpdates.findIndex((x) => x.id === id));
    trail = [{ label: 'About', to: '/' }, { label: 'Life updates' }];
    reelInfo = {
      index,
      items: lifeUpdates,
      base: '/life',
    };
  } else if (pathname.startsWith('/playground')) {
    const parts = pathname.split('/').filter(Boolean);
    const isRead = parts[2] === 'read';
    const id = parts[1];
    const item = sims.find((x) => x.id === id) || sims[0];
    const index = Math.max(0, sims.findIndex((x) => x.id === item?.id));

    if (isRead) {
      trail = [
        { label: 'Concept playground', to: '/playground' },
        { label: item?.title || 'Sim', to: `/playground/${item?.id || id}` },
        { label: 'Read' },
      ];
    } else {
      trail = [
        { label: 'Concept playground', to: '/playground' },
        { label: item?.title || 'Sim' },
      ];
      reelInfo = {
        index,
        items: sims,
        base: '/playground',
      };
    }
  } else if (pathname.startsWith('/case-studies')) {
    const parts = pathname.split('/').filter(Boolean);
    const isRead = parts[2] === 'read';
    const id = parts[1];
    const item = caseStudies.find((x) => x.id === id) || caseStudies[0];
    const index = Math.max(0, caseStudies.findIndex((x) => x.id === item?.id));

    if (isRead) {
      trail = [
        { label: 'Case studies', to: '/case-studies' },
        { label: item?.title || 'Study', to: `/case-studies/${item?.id || id}` },
        { label: 'Read' },
      ];
    } else {
      trail = [
        { label: 'Case studies', to: '/case-studies' },
        { label: item?.title || 'Study' },
      ];
      reelInfo = {
        index,
        items: caseStudies,
        base: '/case-studies',
      };
    }
  } else if (pathname.startsWith('/journal')) {
    const parts = pathname.split('/').filter(Boolean);
    const isRead = parts[2] === 'read';
    const id = parts[1];
    const item = journal.find((x) => x.id === id) || journal[0];
    const index = Math.max(0, journal.findIndex((x) => x.id === item?.id));

    if (isRead) {
      trail = [
        { label: 'Journal', to: '/journal' },
        { label: item?.title || 'Entry', to: `/journal/${item?.id || id}` },
        { label: 'Read' },
      ];
    } else {
      trail = [
        { label: 'Journal', to: '/journal' },
        { label: item?.title || 'Entry' },
      ];
      reelInfo = {
        index,
        items: journal,
        base: '/journal',
      };
    }
  }

  const toggleWidget = () => {
    vibrate(14);
    setWidgetOpen((prev) => !prev);
  };

  const handleSelectReelItem = (item) => {
    vibrate(10);
    setWidgetOpen(false);
    if (reelInfo) {
      navigate(`${reelInfo.base}/${item.id}`);
    }
  };

  return (
    <header className="mobile-topbar" ref={widgetRef}>
      <div className="mobile-topbar-inner">
        {/* Navigation Drawer Slider Pill on the left */}
        <button
          type="button"
          className={`pill topbar-nav-pill${open ? ' open' : ''}`}
          onClick={() => {
            vibrate(10);
            onOpenChange(!open);
          }}
          aria-pressed={open}
          aria-label={open ? 'Close navigation drawer' : 'Open navigation drawer'}
          title={open ? 'Close menu' : 'Open menu'}
        >
          <motion.span layout className="knob" transition={spring}>
            <span className="knob-nav-icon" aria-hidden="true">
              <span className="knob-line" />
              <span className="knob-line" />
              <span className="knob-line" />
            </span>
          </motion.span>
        </button>

        {/* Navigation Breadcrumbs / Title */}
        <div className="mobile-topbar-nav">
          <Crumbs trail={trail} />
        </div>

        {/* Optional Reel Counter Pill on the right */}
        {reelInfo && (
          <button
            type="button"
            className={`reel-counter-pill${widgetOpen ? ' is-active' : ''}`}
            onClick={toggleWidget}
            aria-expanded={widgetOpen}
            aria-label="Open topic navigator"
            title="Jump to topic"
          >
            <span className="counter-num-text">
              {reelInfo.index + 1} / {reelInfo.items.length}
            </span>
            <svg
              className={`counter-chevron${widgetOpen ? ' rotate' : ''}`}
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 1L5 5L9 1"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Transparent Click-Outside Overlay to prevent background panning while menu is open */}
      <AnimatePresence>
        {widgetOpen && reelInfo && (
          <motion.div
            className="topic-widget-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setWidgetOpen(false)}
            onPointerDown={(e) => {
              e.stopPropagation();
              setWidgetOpen(false);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              setWidgetOpen(false);
            }}
            onWheel={(e) => e.stopPropagation()}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Floating Apple-Style Widget Topic Navigator with its own isolated scroll */}
      <AnimatePresence>
        {widgetOpen && reelInfo && (
          <motion.div
            className="topic-widget-sheet"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
            onWheel={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerMove={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
          >
            <div className="topic-widget-header">
              <span>Quick Navigation</span>
              <span className="topic-widget-count">{reelInfo.items.length} topics</span>
            </div>
            <div className="topic-widget-body" onWheel={(e) => e.stopPropagation()}>
              <div
                className="topic-widget-list"
                onWheel={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
              >
                {reelInfo.items.map((it, i) => {
                  const isActive = i === reelInfo.index;
                  const label = it.title || it.text || `Item ${i + 1}`;
                  return (
                    <button
                      key={it.id}
                      type="button"
                      className={`topic-widget-item${isActive ? ' on' : ''}`}
                      onClick={() => handleSelectReelItem(it)}
                    >
                      <span className="topic-num">{i + 1}</span>
                      <span className="topic-name">
                        {typeof label === 'string' ? label : (it.title || `Update ${i + 1}`)}
                      </span>
                      {isActive && <i className="topic-active-dot" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
