import { FlappySquare } from './FlappySquare.jsx';

export default function EmptyState({ category }) {
  return (
    <div
      className="empty-state-wrap"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px 40px',
        textAlign: 'center',
        minHeight: '70vh',
        width: '100%',
      }}
    >
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <h1
          style={{
            fontSize: 'clamp(28px, 4.5vw, 40px)',
            fontWeight: '600',
            letterSpacing: '-0.03em',
            color: 'var(--ink)',
            margin: '0 0 10px',
            fontFamily: 'var(--font)',
          }}
        >
          nothing here....YET
        </h1>
        <p
          style={{
            fontSize: '15px',
            color: 'var(--ink-3)',
            margin: '0 auto',
            lineHeight: 1.5,
          }}
        >
          {category ? `${category} will live here soon.` : 'Content is being crafted.'} In the meantime, play Flappy Square:
        </p>
      </div>

      <FlappySquare />
    </div>
  );
}
