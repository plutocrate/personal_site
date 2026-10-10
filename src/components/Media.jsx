import YouTube from './YouTube.jsx';

// media: { type: 'youtube', id } | { type: 'video', src } | { type: 'iframe', src, width, height, aspectRatio } | { type: 'image', src }
export default function Media({ media }) {
  if (!media) return null;

  if (media.type === 'youtube') return <YouTube id={media.id} />;

  if (media.type === 'video') {
    return (
      <div
        className="responsive-video-wrap"
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 'inherit',
          background: 'var(--surface-2)',
        }}
      >
        <video
          src={media.src}
          poster={media.poster}
          controls
          playsInline
          preload="metadata"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            borderRadius: 'inherit',
          }}
        />
      </div>
    );
  }

  if (media.type === 'iframe') {
    return (
      <div
        className="responsive-iframe-wrap"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 'inherit',
          background: 'transparent',
        }}
      >
        <iframe
          src={media.src}
          title={media.title || 'Embedded content'}
          frameBorder="0"
          scrolling="no"
          loading="lazy"
          allowFullScreen
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
            borderRadius: 'inherit',
            pointerEvents: 'auto',
          }}
        />
      </div>
    );
  }

  return <img className="media-img" src={media.src} alt="" draggable={false} />;
}
