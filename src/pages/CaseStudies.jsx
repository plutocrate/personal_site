import { Link } from 'react-router-dom';
import ProjectReel from '../components/ProjectReel.jsx';
import CaseBlocks from '../components/CaseBlocks.jsx';
import Arrow from '../components/Arrow.jsx';
import { caseStudies } from '../data/content.js';

// Header image, then text and images until the space runs out, then a highlighted "Read more".
const Slide = ({ c }) => (
  <>
    <div className="case-hero" style={{ '--hue': c.hue }}><span>{c.title}</span></div>
    <div className="info">
      <div className="info-head">
        <h2>{c.title}</h2>
        <i className={`dot ${c.status}`} title={c.status} />
        <span className="info-meta">{c.meta}</span>
      </div>
      <div className="stack">{c.stack.map((t) => <span key={t} className="chip">{t}</span>)}</div>
    </div>
    <div className="preview"><CaseBlocks blocks={c.blocks} hue={c.hue} /></div>
    <Link to={`/case-studies/${c.id}/read`} className="marker read-more">Read more <Arrow /></Link>
  </>
);

export default function CaseStudies() {
  return <ProjectReel base="/case-studies" rootLabel="Case studies" items={caseStudies} renderSlide={(c) => <Slide c={c} />} />;
}
