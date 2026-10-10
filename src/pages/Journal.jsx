import { Link } from 'react-router-dom';
import ProjectReel from '../components/ProjectReel.jsx';
import CaseBlocks from '../components/CaseBlocks.jsx';
import Arrow from '../components/Arrow.jsx';
import AmbientRays from '../components/AmbientRays.jsx';
import Crumbs from '../components/Crumbs.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { journal } from '../data/content.js';

// Header banner with dynamic mild downward color rays, essay blocks, and read more
const Slide = ({ j }) => (
  <>
    <div className="case-hero journal-hero" style={{ '--hue': j.hue || 200 }}>
      <AmbientRays seed={j.id} />
      <span>{j.title}</span>
    </div>
    <div className="info">
      <div className="info-head">
        <h2>
          <Link to={`/journal/${j.id}/read`} className="title-link">
            <span>{j.title}</span>
            <Arrow dir="up-right" size={13} />
          </Link>
        </h2>
        <span className="info-meta">{j.meta || j.date}</span>
      </div>
      {j.stack && (
        <div className="stack">
          {j.stack.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
    <div className="preview">
      <CaseBlocks blocks={j.blocks} hue={j.hue || 200} />
    </div>
    <Link to={`/journal/${j.id}/read`} className="marker read-more">
      Read article <Arrow />
    </Link>
  </>
);

export default function Journal() {
  if (!journal || journal.length === 0) {
    return (
      <>
        <div className="page-crumbs desktop-only-bar">
          <Crumbs trail={[{ label: 'Journal' }]} />
        </div>
        <EmptyState category="Journal" />
      </>
    );
  }

  return (
    <ProjectReel
      base="/journal"
      rootLabel="Journal"
      items={journal}
      renderSlide={(j) => <Slide j={j} />}
    />
  );
}
