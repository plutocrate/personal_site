import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { contacts } from '../data/content.js';
import Arrow from './Arrow.jsx';
import { vibrate } from '../utils/haptics.js';

/**
 * ContactItem Component
 * Hover previews the links. Tapping "Contact" pins them open.
 * Shows superscript count like other navigation items.
 */
export default function ContactItem({ count }) {
  const [pinned, setPinned] = useState(false);
  const [hovering, setHovering] = useState(false);
  const ref = useRef(null);

  // Close pinned links if clicked/tapped outside
  useEffect(() => {
    const away = (e) => {
      if (!ref.current?.contains(e.target)) {
        setPinned(false);
        setHovering(false);
      }
    };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, []);

  const handleClick = (e) => {
    e.preventDefault();
    vibrate(10);
    // If already pinned, unpin and fold
    // If not pinned, pin it so it stays open
    setPinned((prev) => {
      if (prev) {
        // Tapping again folds it
        setHovering(false);
        return false;
      }
      return true;
    });
  };

  const open = pinned || hovering;

  return (
    <div
      className="contact"
      ref={ref}
      onPointerEnter={(e) => {
        // Only peek on true mouse devices
        if (e.pointerType === 'mouse') {
          setHovering(true);
        }
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'mouse') {
          setHovering(false);
        }
      }}
    >
      <button
        type="button"
        className={`nav-item${open ? ' is-active' : ''}`}
        onClick={handleClick}
        aria-expanded={open}
      >
        <span>Contact{count != null && <sup className="nav-count">{count}</sup>}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="nav-sub"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
          >
            {contacts.map((c) => (
              <a key={c.label} href={c.href} target="_blank" rel="noreferrer">
                {c.label}
                <Arrow />
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
