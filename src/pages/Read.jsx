import { useParams } from 'react-router-dom';
import Crumbs from '../components/Crumbs.jsx';
import CaseBlocks from '../components/CaseBlocks.jsx';
import SimStage from '../components/SimStage.jsx';
import AmbientRays from '../components/AmbientRays.jsx';
import { caseStudies, journal } from '../data/content.js';
import { sims } from '../playground/index.js';

const kinds = {
  playground: { base: '/playground', root: 'Concept playground', items: sims },
  caseStudies: { base: '/case-studies', root: 'Case studies', items: caseStudies },
  journal: { base: '/journal', root: 'Essays', items: journal },
};

// Full write-up behind a "Read more" link (concept playground, case studies, and journal).
export default function Read({ kind }) {
  const { id } = useParams();
  const { base, root, items } = kinds[kind];
  const item = items.find((x) => x.id === id) || items[0];

  if (!item) {
    return (
      <article className="article">
        <div className="page-crumbs desktop-only-bar">
          <Crumbs trail={[{ label: root, to: base }]} />
        </div>
        <p style={{ padding: '60px 0', textAlign: 'center', color: 'var(--ink-3)' }}>
          Item not found.
        </p>
      </article>
    );
  }

  return (
    <article className="article">
      <div className="page-crumbs desktop-only-bar">
        <Crumbs trail={[{ label: root, to: base }, { label: item.title, to: `${base}/${item.id}` }, { label: 'Read' }]} />
      </div>
      {kind === 'playground' ? (
        <div className="stage hero read-sim"><SimStage sim={item} /></div>
      ) : (
        <div className={`case-hero tall ${kind === 'journal' ? 'journal-hero' : ''}`} style={{ '--hue': item.hue || 200 }}>
          {kind === 'journal' && <AmbientRays seed={item.id} />}
          <span>{item.title}</span>
        </div>
      )}
      <div className="info-head" style={{ marginTop: 28 }}>
        <h1 className="h1" style={{ margin: 0 }}>{item.title}</h1>
        {item.status && <i className={`dot ${item.status}`} title={item.status} />}
        <span className="info-meta">{item.meta || item.date}</span>
      </div>
      {item.stack && (
        <div className="stack" style={{ margin: '14px 0 28px' }}>
          {item.stack.map((t) => <span key={t} className="chip">{t}</span>)}
        </div>
      )}
      <div className="article-body">
        <CaseBlocks blocks={item.blocks} hue={item.hue || 200} />
      </div>
    </article>
  );
}
