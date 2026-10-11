import { AnimatePresence, motion } from 'framer-motion';
import { useQuote } from '../hooks/useQuote.jsx';
import { useToast } from '../hooks/useToast.jsx';

/**
 * QuoteBox Component
 * Displays the quote of the day in the sidebar.
 * Layout is flex-spaced so the author name is pinned at the bottom always.
 * On mobile, tapping the truncated quote displays a smooth top toast showing the full quote.
 */
export default function QuoteBox() {
  const { quote } = useQuote();
  const { showToast } = useToast();

  const textRef = useRef(null);

  const handleQuoteClick = () => {
    // Only truncated text gets toast
    const el = textRef.current;
    if (el && showToast) {
      const isTruncated = el.scrollHeight > el.clientHeight + 1;
      if (isTruncated) {
        showToast(quote.text, quote.author);
      }
    }
  };

  return (
    <div
      className="quote-box is-clickable-quote"
      aria-live="polite"
      onClick={handleQuoteClick}
      title="Tap to read full quote"
      data-annotation="Tap logo for a fresh quote"
      data-annotation-pos="bottom"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={quote.text}
          className="quote-inner"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <p className="quote-text" ref={textRef}>
            “{quote.text}”
          </p>
          <p className="quote-author">{quote.author}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
