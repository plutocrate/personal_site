import { NavLink, useLocation } from 'react-router-dom';
import BalatroLogo from './BalatroLogo.jsx';
import { vibrate } from '../utils/haptics.js';

export default function BalatroNavButton({ compact = false, onNavigate = null, className = '' }) {
  const { pathname } = useLocation();
  const isActive = pathname === '/balatro';

  const handleClick = () => {
    vibrate(14);

    // On phone: trigger fullscreen & lock landscape on user tap
    if (typeof window !== 'undefined' && window.innerWidth <= 860) {
      try {
        const docEl = document.documentElement;
        if (docEl.requestFullscreen && !document.fullscreenElement) {
          docEl.requestFullscreen().then(() => {
            if (screen.orientation && screen.orientation.lock) {
              screen.orientation.lock('landscape').catch(() => {});
            }
          }).catch(() => {});
        }
      } catch (_) {}
    }

    if (onNavigate) {
      onNavigate();
    }
  };

  if (compact) {
    return (
      <NavLink
        to="/balatro"
        className={`balatro-nav-btn balatro-nav-btn-compact${isActive ? ' is-active' : ''} ${className}`}
        onClick={handleClick}
        title="Play Balatro"
        aria-label="Play Balatro game"
        data-annotation="Play Balatro"
      >
        <div className="balatro-sheen" aria-hidden="true" />
        <div className="balatro-btn-glow" aria-hidden="true" />
        <img
          src="/balatro-title-logo.png"
          alt="Balatro"
          className="balatro-nav-logo-img-compact"
        />
      </NavLink>
    );
  }

  return (
    <NavLink
      to="/balatro"
      className={`balatro-nav-btn balatro-nav-btn-full${isActive ? ' is-active' : ''} ${className}`}
      onClick={handleClick}
      title="Play Balatro in your browser"
      aria-label="Play Balatro web port"
    >
      <div className="balatro-sheen" aria-hidden="true" />
      <div className="balatro-btn-glow" aria-hidden="true" />

      <div className="balatro-btn-left">
        <img
          src="/balatro-title-logo.png"
          alt="Balatro"
          className="balatro-nav-logo-img"
        />
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
