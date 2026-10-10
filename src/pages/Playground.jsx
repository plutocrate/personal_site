import { Link } from 'react-router-dom';
import ProjectReel from '../components/ProjectReel.jsx';
import SimStage from '../components/SimStage.jsx';
import Arrow from '../components/Arrow.jsx';
import { sims } from '../playground/index.js';

const Slide = ({ s }) => (
  <>
    <div className="stage"><SimStage sim={s} /></div>
    <div className="info">
      <div className="info-head">
        <h2>
          <Link to={`/playground/${s.id}/read`} className="title-link">
            <span>{s.title}</span>
            <Arrow dir="up-right" size={13} />
          </Link>
        </h2>
        {s.meta && <span className="info-meta">{s.meta}</span>}
      </div>
      <p>{s.description}</p>
      <div className="stack">{s.stack.map((t) => <span key={t} className="chip">{t}</span>)}</div>
      <Link to={`/playground/${s.id}/read`} className="marker read-more">Read more <Arrow /></Link>
    </div>
  </>
);

export default function Playground() {
  return <ProjectReel base="/playground" rootLabel="Concept playground" items={sims} renderSlide={(s) => <Slide s={s} />} />;
}
