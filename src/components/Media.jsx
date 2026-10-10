import YouTube from './YouTube.jsx';

// media: { type: 'youtube', id } | { type: 'iframe', src, width, height, aspectRatio } | { type: 'image', src }
export default function Media({ media }) {
  if (!media) return null;

  if (media.type === 'youtube') return <YouTube id={media.id} />;

  if (media.type === 'iframe') {
    // Determine intrinsic aspect ratio from specified width/height or custom aspectRatio
    const ratio = media.aspectRatio || (media.width && media.height ? `${media.width} / ${media.height}` : '16 / 9');

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
          }}
        />
      </div>
    );
  }

  return <img className="media-img" src={media.src} alt="" draggable={false} />;
}
