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
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const away = (e) => {
      if (!ref.current?.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, []);

  const toggleOpen = () => {
    vibrate(10);
    setIsOpen((prev) => !prev);
  };

  return (
    <div
      className="contact"
      ref={ref}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        className={`nav-item${isOpen ? ' is-active' : ''}`}
        onClick={toggleOpen}
        aria-expanded={isOpen}
      >
        <span>Contact{count != null && <sup className="nav-count">{count}</sup>}</span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
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
