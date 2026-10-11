import { Link } from 'react-router-dom';
import Arrow from './Arrow.jsx';
import { nav, profile } from '../data/content.js';

export default function Footer() {
  return (
    <footer className="site-footer" role="contentinfo" aria-label="Site Footer & Archive Directory">
      <div className="site-footer-inner">
        {/* Top Minimal Directory Grid */}
        <div className="site-footer-grid">
          {/* Column 1: Sitemap Navigation */}
          <div className="site-footer-col">
            <span className="site-footer-label">Sitemap</span>
            <ul className="site-footer-list">
              {nav.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="site-footer-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Interactive Labs */}
          <div className="site-footer-col">
            <span className="site-footer-label">Interactive</span>
            <ul className="site-footer-list">
              <li>
                <Link to="/flappy-square" className="site-footer-link">
                  Flappy Square <span>(Mini-Game)</span>
                </Link>
              </li>
              <li>
                <Link to="/playground/utah-teapot-raylib" className="site-footer-link">
                  Utah Teapot <span>(3D WASM)</span>
                </Link>
              </li>
              <li>
                <Link to="/playground/game-of-life" className="site-footer-link">
                  Game of Life <span>(Cellular)</span>
                </Link>
              </li>
              <li>
                <Link to="/playground/gravity-well" className="site-footer-link">
                  Gravity Well <span>(Physics)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Archives & Past Portfolios */}
          <div className="site-footer-col">
            <span className="site-footer-label">Archives</span>
            <ul className="site-footer-list">
              <li>
                <a
                  href="https://plutocrate.github.io/3dportfolio/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-footer-link external-link"
                >
                  <span>3D Portfolio</span>
                  <Arrow dir="up-right" size={11} />
                </a>
              </li>
              <li>
                <a
                  href="https://plutocrate.github.io/portfolio/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-footer-link external-link"
                >
                  <span>Portfolio (v1)</span>
                  <Arrow dir="up-right" size={11} />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/plutocrate"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-footer-link external-link"
                >
                  <span>GitHub Profile</span>
                  <Arrow dir="up-right" size={11} />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Canonical Meta & Host info */}
          <div className="site-footer-col site-footer-brand-col">
            <span className="site-footer-label">Canonical</span>
            <p className="site-footer-host-text">
              Hosted at <a href="https://prathamis.cool" className="site-footer-canonical-link">prathamis.cool</a>
            </p>
            <p className="site-footer-bio-blurb">
              Digital craft, interactive physics, and systems design by Pratham Purohit.
            </p>
          </div>
        </div>

        {/* Bottom Minimal Baseline */}
        <div className="site-footer-bottom">
          <div className="site-footer-copy">
            © {profile.year} {profile.name} · All rights reserved
          </div>
          <div className="site-footer-domain">
            <span className="pulse-indicator" aria-hidden="true" />
            <span>prathamis.cool</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
