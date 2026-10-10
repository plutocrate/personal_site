import { NavLink, useLocation } from 'react-router-dom';
import { vibrate } from '../utils/haptics.js';

export default function NavItem({ to, label, end, count, isHighlighted }) {
  const { pathname } = useLocation();
  const active = end ? pathname === to : pathname.startsWith(to);
  return (
    <NavLink
      to={to}
      end={end}
      className={`nav-item${active ? ' is-active' : ''}${isHighlighted ? ' is-highlighted' : ''}`}
      onClick={() => vibrate(10)}
    >
      <span className="nav-label-wrap">
        <span className="nav-label-text">{label}</span>
        {count != null && <sup className="nav-count">{count}</sup>}
      </span>
      {active && <span className="nav-here"><i /><em>you are here</em></span>}
    </NavLink>
  );
}
