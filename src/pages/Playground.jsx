import { Link } from 'react-router-dom';
import ProjectReel from '../components/ProjectReel.jsx';
import SimStage from '../components/SimStage.jsx';
import Arrow from '../components/Arrow.jsx';
import { sims } from '../playground/index.js';

const Slide = ({ s }) => (
  <>
    <div className="stage"><SimStage sim={s} /></div>
    <div className="info">
      <div className="info-head"><h2>{s.title}</h2><span className="info-meta">{s.meta}</span></div>
      <p>{s.description}</p>
      <div className="stack">{s.stack.map((t) => <span key={t} className="chip">{t}</span>)}</div>
      <Link to={`/playground/${s.id}/read`} className="marker read-more">Read more <Arrow /></Link>
    </div>
  </>
);

export default function Playground() {
  return <ProjectReel base="/playground" rootLabel="Concept playground" items={sims} renderSlide={(s) => <Slide s={s} />} />;
}
