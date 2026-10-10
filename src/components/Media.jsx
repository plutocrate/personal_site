import YouTube from './YouTube.jsx';

// media: { type: 'youtube', id } | { type: 'iframe', src } | { type: 'image', src }
export default function Media({ media }) {
  if (media.type === 'youtube') return <YouTube id={media.id} />;
  if (media.type === 'iframe') {
    return (
      <iframe
        src={media.src}
        title={media.title || 'Embedded content'}
        height="100%"
        width="100%"
        frameBorder="0"
        scrolling="no"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
        }}
      />
    );
  }
  return <img className="media-img" src={media.src} alt="" draggable={false} />;
}
