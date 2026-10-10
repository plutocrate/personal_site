import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Crumbs from './Crumbs.jsx';
import { vibrate } from '../utils/haptics.js';

/**
 * ReelBar Component
 * Positioned at the top middle of reels.
 * Features an interactive number pill that opens an Apple-style floating widget sheet
 * with rapid topic/item navigation, panning, and a custom mini scrubber rail.
 */
export default function ReelBar({ trail, index, items, base }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  const toggleOpen = () => {
    vibrate(14);
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (item) => {
    vibrate(10);
    setIsOpen(false);
    navigate(`${base}/${item.id}`);
  };

  // Close when tapping outside
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [isOpen]);

  return (
    <div className="reel-bar-centered" ref={containerRef}>
      <div className="reel-bar-inner">
        <Crumbs trail={trail} />
        <button
          type="button"
          className={`reel-counter-pill${isOpen ? ' is-active' : ''}`}
          onClick={toggleOpen}
          aria-expanded={isOpen}
          aria-label="Open topic navigator"
          title="Jump to topic"
        >
          <span className="counter-num-text">{index + 1} / {items.length}</span>
          <svg
            className={`counter-chevron${isOpen ? ' rotate' : ''}`}
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
      </div>

      {/* Floating Apple-Style Widget Topic Navigator (No background blur) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="topic-widget-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            onPointerDown={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            onWheel={(e) => e.stopPropagation()}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="topic-widget-sheet"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
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
              <span className="topic-widget-count">{items.length} topics</span>
            </div>
            <div className="topic-widget-body" onWheel={(e) => e.stopPropagation()}>
              <div
                className="topic-widget-list"
                ref={listRef}
                onWheel={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
              >
                {items.map((it, i) => {
                  const isActive = i === index;
                  const label = it.title || it.text || `Item ${i + 1}`;
                  return (
                    <button
                      key={it.id}
                      type="button"
                      className={`topic-widget-item${isActive ? ' on' : ''}`}
                      onClick={() => handleSelect(it)}
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
    </div>
  );
}
