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
            Pratham is a <Highlight color="blue">developer</Highlight> and{' '}
            <Highlight color="purple">designer</Highlight> specializing in{' '}
            <Highlight color="yellow">web development</Highlight>,{' '}
            <Highlight color="green">mobile app development</Highlight>, and{' '}
            <Highlight color="rose">UI/UX design</Highlight>. He enjoys turning ideas into polished, functional products, combining{' '}
            <Underline color="orange" variant="default">usability</Underline>,{' '}
            <Underline color="rose" variant="long">visual design</Underline>, and{' '}
            <Underline color="teal" variant="default">engineering</Underline> to create meaningful digital experiences.
          </p>

          <p className="bio bio-secondary" style={{ marginTop: '32px' }}>
            Beyond work, he enjoys ricing Arch Linux with Hyprland, playing the guitar, and exploring game development.
          </p>
        </div>

        {latest && (
          <section className="life" aria-label="Latest life update">
            <div className="life-label">
              <span>Life update</span>
              <span>{formatDate(latest.date)}</span>
            </div>
            <article className="life-card" onClick={() => navigate(`/life/${latest.id}`)}>
              <p className="life-text">{latest.text}</p>
              <div className="life-media"><Media media={latest.media} /></div>
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
