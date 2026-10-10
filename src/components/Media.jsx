import YouTube from './YouTube.jsx';

// media: { type: 'youtube', id } or { type: 'image', src }
export default function Media({ media }) {
  if (media.type === 'youtube') return <YouTube id={media.id} />;
  return <img className="media-img" src={media.src} alt="" draggable={false} />;
}
