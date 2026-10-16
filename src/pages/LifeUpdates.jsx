import { useState, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { lifeUpdates, formatDate } from '../data/lifeUpdates.js';
import { useReel, slideVariants, slideTransition } from '../hooks/useReel.js';
import { getMediaDims, saveMediaDims } from '../utils/mediaDims.js';
import Media from '../components/Media.jsx';
import Crumbs from '../components/Crumbs.jsx';

const ReelSlide = forwardRef(function ReelSlide({ item, dir, dragProps }, ref) {
  const [dims, setDims] = useState(() => getMediaDims(item.media));

  const handleSizeKnown = (w, h) => {
    if (!w || !h) return;
    saveMediaDims(item.media, w, h);
    setDims((prev) => {
      if (prev && prev.w === w && prev.h === h) return prev;
      return { w, h, ratio: `${w} / ${h}` };
    });
  };

  const currentDims = dims || getMediaDims(item.media);

  return (
    <motion.div
      ref={ref}
      key={item.id}
      className="reel-slide"
      custom={dir}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={slideTransition}
      {...dragProps}
    >
      {/* Date placed on top of media */}
      <div className="reel-date">{formatDate(item.date)}</div>
      <div
        className="reel-media"
        style={{
          '--media-ratio': currentDims.ratio,
          '--media-w': currentDims.w,
          '--media-h': currentDims.h,
        }}
      >
        <Media media={item.media} onSizeKnown={handleSizeKnown} />
      </div>
      <div className="reel-text">{item.text}</div>
    </motion.div>
  );
});

export default function LifeUpdates() {
  const { index, dir, dragProps } = useReel(lifeUpdates, '/life');
  const item = lifeUpdates[index];

  return (
    <div className="reel">
      {/* Desktop classic navigation bar: breadcrumbs at left, counter at right */}
      <div className="reel-bar desktop-only-bar">
        <Crumbs trail={[{ label: 'About', to: '/' }, { label: 'Life updates' }]} />
        <span>{index + 1} / {lifeUpdates.length}</span>
      </div>

      <AnimatePresence initial={false} custom={dir} mode="popLayout">
        <ReelSlide key={item.id} item={item} dir={dir} dragProps={dragProps} />
      </AnimatePresence>

      <div className="reel-dots" aria-label="Updates">
        {lifeUpdates.map((u, i) => (
          <Link
            key={u.id}
            to={`/life/${u.id}`}
            className={i === index ? 'on' : ''}
            aria-label={`Update ${i + 1}`}
          />
        ))}
      </div>
      {index === lifeUpdates.length - 1 && <div className="reel-end">You're all caught up</div>}
    </div>
  );
}
