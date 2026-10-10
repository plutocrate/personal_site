import { NavLink, useLocation } from 'react-router-dom';
import { nav, contacts } from '../data/content.js';
import { vibrate } from '../utils/haptics.js';

// Compact initials requested by user:
// About -> Abt
// Concept Playground -> cpg
// Case Studies -> cs
// Essays -> esy
// Life updates -> lfud
// Contact -> cnt
// LinkedIn -> li
// GitHub -> gh
// Email -> eml

const shortLabels = {
  '/': 'ABT',
  '/playground': 'CPG',
  '/case-studies': 'CS',
  '/journal': 'ESY',
  '/life': 'LFUD',
};

const contactShortLabels = {
  LinkedIn: 'LI',
  GitHub: 'GH',
  Mail: 'EML',
};

export default function MiniNav({ getCount }) {
  const { pathname } = useLocation();

  return (
    <nav className="mini-nav" aria-label="Mini Navigation">
      <div className="mini-nav-section">
        {nav.map((item) => {
          const active = item.end ? pathname === item.to : pathname.startsWith(item.to);
          const short = shortLabels[item.to] || item.label.slice(0, 3).toLowerCase();
          const count = getCount ? getCount(item.to) : null;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={`mini-nav-item${active ? ' is-active' : ''}`}
              onClick={() => vibrate(8)}
              data-annotation={item.label}
              aria-label={item.label}
            >
              <span className="mini-nav-tag">{short}</span>
              {count != null && <sup className="mini-nav-count">{count}</sup>}
            </NavLink>
          );
        })}
      </div>

      <div className="mini-nav-divider" />

      {/* Mini Contacts: cnt label + direct links (li, gh, eml) */}
      <div className="mini-nav-contacts">
        <span className="mini-nav-contact-title" data-annotation="Contacts" aria-label="Contacts">
          CNT
        </span>
        <div className="mini-nav-contact-links">
          {contacts.map((c) => {
            const short = contactShortLabels[c.label] || c.label.slice(0, 2).toLowerCase();
            return (
              <a
                key={c.label}
                href={c.href}
                target="_blank"
                rel="noreferrer"
                className="mini-contact-link"
                data-annotation={c.label}
                aria-label={c.label}
              >
                {short}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
