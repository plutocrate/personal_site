import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuote } from '../hooks/useQuote.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { vibrate } from '../utils/haptics.js';
import { cycleTheme } from '../utils/theme.js';

// Star particle colors for the magic spell burst
const STAR_COLORS = ['#fbbf24', '#38bdf8', '#a855f7', '#34d399', '#f43f5e', '#60a5fa', '#fef08a'];

// 4-point sparkle star SVG icon
function SparkleStar({ size = 16, color = '#fbbf24' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  );
}

// 5-point magic star SVG icon
function MiniStar({ size = 12, color = '#38bdf8' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.784 1.399 8.169-7.333-3.856-7.333 3.856 1.399-8.169-5.934-5.784 8.2-1.192zm0 5.702l-2.223 4.503-4.969.722 3.596 3.505-.849 4.95 4.445-2.337 4.445 2.337-.849-4.95 3.596-3.505-4.969-.722z" />
    </svg>
  );
}

export default function Logo({ sidebarOpen = false }) {
  const { quote, next } = useQuote();
  const { showToast } = useToast();
  const [particles, setParticles] = useState([]);
  const [isCasting, setIsCasting] = useState(false);
  const [showAnnotation, setShowAnnotation] = useState(true);
  const particleIdRef = useRef(0);

  const triggerMagicSpell = (e) => {
    e.preventDefault();
    setShowAnnotation(false);
    vibrate([20, 25, 20]);
    // 1. Fetch new quote & dynamically transition theme color
    if (next) {
      const freshQuote = next();
      // If navbar is closed, pop up quote as toast!
      if (!sidebarOpen && showToast) {
        const q = freshQuote || quote;
        if (q) showToast(q.text, q.author);
      }
    } else if (!sidebarOpen && showToast && quote) {
      showToast(quote.text, quote.author);
    }
    cycleTheme();

    // 2. Trigger logo microinteraction shake & glow
    setIsCasting(true);
    setTimeout(() => setIsCasting(false), 600);

    // 3. Generate 10-14 bursting and dropping star particles
    const newParticles = [];
    const count = 12;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const velocity = 28 + Math.random() * 45;
      const isFourPoint = Math.random() > 0.4;
      const size = 10 + Math.random() * 12;
      const color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];

      newParticles.push({
        id: ++particleIdRef.current,
        x: Math.cos(angle) * velocity,
        y: Math.sin(angle) * velocity - 10, // Initial burst upwards
        dropY: 60 + Math.random() * 70,    // Falls down like a spell
        rotation: Math.random() * 360,
        color,
        size,
        isFourPoint,
        duration: 0.8 + Math.random() * 0.4,
      });
    }

    setParticles((prev) => [...prev, ...newParticles]);

    // Cleanup particles after animation completes
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
    }, 1400);
  };

  return (
    <div className="logo-box-wrapper">
      <motion.button
        type="button"
        className={`logo-box ${isCasting ? 'casting-spell' : ''}`}
        onClick={triggerMagicSpell}
        onMouseEnter={() => setShowAnnotation(true)}
        onMouseLeave={() => setShowAnnotation(true)}
        aria-label="New quote & magic spell"
        data-annotation={showAnnotation && !isCasting ? "Tap for a fresh quote & magic ✨" : undefined}
        whileTap={{ scale: 0.92 }}
        animate={
          isCasting
            ? {
                scale: [1, 1.2, 0.95, 1.08, 1],
                rotate: [0, -12, 12, -8, 8, 0],
                borderColor: ['var(--line)', '#38bdf8', '#fbbf24', '#0071e3', 'var(--line)'],
                color: ['var(--ink)', '#0071e3', '#fbbf24', 'var(--ink)'],
              }
            : {}
        }
        transition={{ duration: 0.55, ease: 'easeInOut' }}
      >
        <svg width="22" height="39" viewBox="0 0 30 53" fill="none" aria-hidden="true">
          <path
            fill="currentColor"
            d="M30 23.26V21.9919C23.3753 21.4292 22.9874 18.3284 22.9874 18.3284H21.6679V14.9055H29.612V13.6374C22.9874 13.0731 16.5263 8.11906 16.5263 8.11906H15.9267V0.928294C15.9266 0.416896 15.513 0 14.9999 0C14.4869 0 14.0733 0.416896 14.0733 0.928294V8.11885H13.4737C13.4737 8.11885 7.01253 13.0729 0.38796 13.6372V14.9053H8.33207V18.3282H7.01264C7.01264 18.3282 6.62468 21.429 0 21.9917V23.2598H8.33207V26.6811H7.01264C7.01264 26.6811 6.62468 29.7819 0 30.3462V31.6143H8.33207V35.0357H7.01264C7.01264 35.0357 6.62468 38.1379 0 38.6991V39.9689H8.33207V43.3902H7.01264C7.01264 43.3902 6.62468 46.4909 0 47.0553V48.3219H8.33207V52.5353H21.6679V48.3219H30V47.0553C23.3753 46.4909 22.9874 43.3902 22.9874 43.3902H21.6679V39.9689H30V38.6991C23.3753 38.1379 22.9874 35.0357 22.9874 35.0357H21.6679V31.6143H30V30.3463C23.3753 29.782 22.9874 26.6812 22.9874 26.6812H21.6679V23.2599H30V23.26ZM13.0167 50.0102H11.375V48.3685H13.0167V50.0102ZM13.0167 41.8529H11.375V40.2111H13.0167V41.8529ZM13.0167 33.6955H11.375V32.0538H13.0167V33.6955ZM13.0167 25.5382H11.375V23.8965H13.0167V25.5382ZM13.0167 17.3809H11.375V15.7391H13.0167V17.3809ZM18.6249 50.0102H16.9832V48.3685H18.6249V50.0102ZM18.6249 41.8529H16.9832V40.2111H18.6249V41.8529ZM18.6249 33.6955H16.9832V32.0538H18.6249V33.6955ZM18.6249 25.5382H16.9832V23.8965H18.6249V25.5382ZM18.6249 17.3809H16.9832V15.7391H18.6249V17.3809Z"
          />
        </svg>
      </motion.button>

      {/* Magic Spell Falling Stars Container */}
      <div className="spell-particles-container" aria-hidden="true">
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="star-particle"
              initial={{
                opacity: 1,
                scale: 0.2,
                x: 0,
                y: 0,
                rotate: 0,
              }}
              animate={{
                opacity: [1, 1, 0.9, 0],
                scale: [0.2, 1.2, 1, 0.4],
                x: [0, p.x, p.x * 1.3],
                y: [0, p.y, p.y + p.dropY],
                rotate: [0, p.rotation, p.rotation + 180],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: p.duration,
                times: [0, 0.3, 0.7, 1],
                ease: 'easeOut',
              }}
            >
              {p.isFourPoint ? (
                <SparkleStar size={p.size} color={p.color} />
              ) : (
                <MiniStar size={p.size} color={p.color} />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
