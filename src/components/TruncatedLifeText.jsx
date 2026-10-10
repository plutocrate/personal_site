import { useToast } from '../hooks/useToast.jsx';
import Arrow from './Arrow.jsx';
import Underline from './Underline.jsx';

/**
 * TruncatedLifeText
 * Only truncates when text exceeds the threshold.
 * Displays inline "more... ↗" with an underline and arrow.
 * Clicking it fires the site toast notification with the full text.
 */
export default function TruncatedLifeText({ text, fullTextPlain, isLong = false }) {
  const { showToast } = useToast();

  const handleReadMore = (e) => {
    e.stopPropagation();
    if (fullTextPlain) {
      showToast(fullTextPlain, 'Pratham');
    }
  };

  if (!isLong || !fullTextPlain) {
    return <span className="life-text-content">{text}</span>;
  }

  return (
    <span className="life-text-content">
      {text}{' '}
      <span
        className="text-link text-toast-more-inline"
        onClick={handleReadMore}
        role="button"
        tabIndex={0}
        title="View full note"
      >
        <Underline color="blue" variant="default">more...</Underline>
        <Arrow dir="up-right" size={12} />
      </span>
    </span>
  );
}
