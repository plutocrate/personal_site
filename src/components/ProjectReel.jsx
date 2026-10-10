import { AnimatePresence, motion } from 'framer-motion';
import { useReel, slideVariants, slideTransition } from '../hooks/useReel.js';
import TopicRail from './TopicRail.jsx';
import Crumbs from './Crumbs.jsx';

// Shell for playground and case studies: breadcrumb, draggable slide, topic rail. Each item has its own URL.
export default function ProjectReel({ base, rootLabel, items, renderSlide }) {
  const { index, dir, dragProps } = useReel(items, base);
  const item = items[index];

  return (
    <div className="reel project">
      {/* Desktop classic navigation bar: breadcrumbs at left, counter at right */}
      <div className="reel-bar desktop-only-bar">
        <Crumbs trail={[{ label: rootLabel, to: base }, { label: item.title }]} />
        <span>{index + 1} / {items.length}</span>
      </div>

      <div className="project-body">
        <div className="project-main">
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.div key={item.id} className="project-slide" custom={dir} variants={slideVariants}
              initial="enter" animate="center" exit="exit" transition={slideTransition} {...dragProps}>
              {renderSlide(item)}
            </motion.div>
          </AnimatePresence>
        </div>
        <TopicRail items={items} index={index} base={base} />
      </div>
    </div>
  );
}
