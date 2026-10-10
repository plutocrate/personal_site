import { useState } from 'react';
import { useToast } from '../hooks/useToast.jsx';
import Arrow from './Arrow.jsx';

/**
 * TruncatedLifeText
 * Renders text with truncation if the content is long.
 * Clicking "[More]" or tapping on the truncated text fires the site toast notification
 * with the full text, keeping the card compact and pristine while making every word accessible.
 */
export default function TruncatedLifeText({ text, fullTextPlain, maxLength = 160 }) {
  const { showToast } = useToast();

  const handleReadMore = (e) => {
    e.stopPropagation();
    if (fullTextPlain) {
      showToast(fullTextPlain, 'Pratham');
    }
  };

  return (
    <div className="truncated-life-text">
      <span className="truncated-text-content">{text}</span>
      {fullTextPlain && (
        <button
          type="button"
          className="text-toast-more-btn"
          onClick={handleReadMore}
          aria-label="Read full text in toast"
          title="Click to view full update note"
        >
          <span>…more</span>
          <Arrow dir="up-right" size={11} />
        </button>
      )}
    </div>
  );
}
