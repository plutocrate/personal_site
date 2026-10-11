import { FlappySquare } from '../components/FlappySquare.jsx';
import Crumbs from '../components/Crumbs.jsx';

export default function FlappySquarePage() {
  return (
    <div className="flappy-standalone-page">
      <div className="page-crumbs desktop-only-bar">
        <Crumbs trail={[{ label: 'About', to: '/' }, { label: 'Flappy Square' }]} />
      </div>

      <div className="flappy-standalone-container">
        <div className="flappy-standalone-header">
          <h1 className="flappy-standalone-title">Flappy Square</h1>
          <p className="flappy-standalone-sub">
            A minimalist geometry arcade experiment. Tap, click, or hit <kbd>Space</kbd> to flap through procedural pillars.
          </p>
        </div>

        <div className="flappy-standalone-game-wrap">
          <FlappySquare />
        </div>
      </div>
    </div>
  );
}
