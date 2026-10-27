import { useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import BalatroLogo from './BalatroLogo.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { vibrate } from '../utils/haptics.js';

export default function BalatroNavButton({ compact = false, onNavigate = null, className = '' }) {
  const { pathname } = useLocation();
  const { showToast } = useToast();
  const isActive = pathname === '/balatro';
  const lastHoverToastRef = useRef(0);

  const handleClick = (e) => {
    vibrate(14);
    showToast('play balatro');
    if (onNavigate) {
      onNavigate();
    }
  };

  const handleMouseEnter = () => {
    const now = Date.now();
    if (now - lastHoverToastRef.current > 6000) {
      lastHoverToastRef.current = now;
      showToast('play balatro');
    }
  };

  if (compact) {
    return (
      <NavLink
        to="/balatro"
        className={`balatro-nav-btn balatro-nav-btn-compact${isActive ? ' is-active' : ''} ${className}`}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        title="Play Balatro"
        aria-label="Play Balatro game"
        data-annotation="Play Balatro"
      >
        <div className="balatro-sheen" aria-hidden="true" />
        <div className="balatro-btn-glow" aria-hidden="true" />
        <BalatroLogo size={20} />
      </NavLink>
    );
  }

  return (
    <NavLink
      to="/balatro"
      className={`balatro-nav-btn balatro-nav-btn-full${isActive ? ' is-active' : ''} ${className}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      title="Play Balatro in your browser"
      aria-label="Play Balatro web port"
    >
      <div className="balatro-sheen" aria-hidden="true" />
      <div className="balatro-btn-glow" aria-hidden="true" />

      <div className="balatro-btn-left">
        <div className="balatro-logo-wrap">
          <BalatroLogo size={24} />
        </div>
        <div className="balatro-label-wrap">
          <span className="balatro-label-title">Balatro</span>
          <span className="balatro-label-sub">Deckbuilder</span>
        </div>
      </div>

      <div className="balatro-btn-right">
        <span className="balatro-badge-play">
          <span className="balatro-badge-dot" />
          PLAY
        </span>
      </div>
    </NavLink>
  );
}
