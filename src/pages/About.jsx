import { Link, useNavigate } from 'react-router-dom';
import { lifeUpdates, formatDate } from '../data/lifeUpdates.js';
import Crumbs from '../components/Crumbs.jsx';
import Media from '../components/Media.jsx';
import Highlight from '../components/Highlight.jsx';
import Underline from '../components/Underline.jsx';
import Arrow from '../components/Arrow.jsx';

export default function About() {
  const latest = lifeUpdates[0]; // always the most recent
  const navigate = useNavigate();

  return (
    <>
      <div className="page-crumbs desktop-only-bar"><Crumbs trail={[{ label: 'About' }]} /></div>
      <div className="about">
        <div className="bio-container">
          <p className="bio">
            I’m a <Highlight color="blue">developer</Highlight> and{' '}
            <Highlight color="purple">designer</Highlight> by day, working across{' '}
            <Underline color="yellow" variant="default">web design</Underline>,{' '}
            <Underline color="green" variant="default">mobile app design</Underline>, and{' '}
            <Underline color="teal" variant="default">development</Underline>. My work focuses on{' '}
            <Highlight color="rose">interfaces</Highlight>,{' '}
            <Highlight color="amber">microinteractions</Highlight>,{' '}
            <Highlight color="cyan">shaders</Highlight>, and the little details that make digital products stand out.
          </p>

          <p className="bio bio-secondary" style={{ marginTop: '32px' }}>
            A <Underline color="purple" variant="default">philosopher</Underline> by night, running{' '}
            <Highlight color="cyan">Arch Linux</Highlight> and using{' '}
            <Highlight color="green">Neovim</Highlight> for pretty much everything, including{' '}
            <Underline color="blue" variant="long">mobile app development</Underline>. Of course, this makes me{' '}
            <Highlight color="yellow">cooler than you</Highlight> 🫵
          </p>
        </div>

        {latest && (
          <section className="life" aria-label="Latest life update">
            <div className="life-label">
              <span>Life update</span>
              <span>{formatDate(latest.date)}</span>
            </div>
            <article className="life-card">
              <div
                className="life-text-wrap"
                onClick={() => navigate(`/life/${latest.id}`)}
                role="button"
                tabIndex={0}
                style={{ cursor: 'pointer' }}
                title="View in Life updates"
              >
                <p className="life-text">{latest.text}</p>
              </div>
              <div
                className="life-media"
                style={{
                  '--media-ratio': latest.media?.aspectRatio || (latest.media?.width && latest.media?.height ? `${latest.media.width} / ${latest.media.height}` : '16 / 9'),
                  '--media-w': latest.media?.width || (latest.media?.type === 'youtube' ? 16 : 16),
                  '--media-h': latest.media?.height || (latest.media?.type === 'youtube' ? 9 : 9),
                }}
              >
                <Media media={latest.media} />
              </div>
            </article>
            <Link to="/life" className="marker life-more">
              <span>See all life updates</span>
              <Arrow dir="up-right" size={13} />
            </Link>
          </section>
        )}
      </div>
    </>
  );
}
