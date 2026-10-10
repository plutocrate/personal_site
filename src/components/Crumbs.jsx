import { Link } from 'react-router-dom';
import { useToast } from '../hooks/useToast.jsx';

// trail: [{ label, to? }]; the last item is the current page.
export default function Crumbs({ trail }) {
  const { showToast } = useToast();

  const handleCrumbClick = (e, label) => {
    // Only show toast if the text is genuinely truncated (scrollWidth > clientWidth)
    const el = e.currentTarget;
    const isTruncated = el && el.scrollWidth > el.clientWidth;
    if (isTruncated && showToast) {
      showToast(label);
    }
  };

  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      {trail.map((t, i) => (
        <span key={i} className="crumbs-item">
          {i > 0 && <i className="sep">/</i>}
          {t.to && i < trail.length - 1 ? (
            <Link to={t.to} title={t.label}>{t.label}</Link>
          ) : (
            <b
              aria-current="page"
              title={t.label}
              onClick={(e) => handleCrumbClick(e, t.label)}
            >
              {t.label}
            </b>
          )}
        </span>
      ))}
    </nav>
  );
}
