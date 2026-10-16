import { lifeUpdates } from '../data/lifeUpdates.js';

// Global cache: key (src or yt id) -> { w, h, ratio }
export const mediaCache = new Map([
  ['/life/pushups_progression.jpeg', { w: 899, h: 1600, ratio: '899 / 1600' }],
  ['/life/aug-07-2024.jpg', { w: 768, h: 432, ratio: '768 / 432' }],
  ['/life/terebinag.mp4', { w: 634, h: 356, ratio: '634 / 356' }],
]);

export function getMediaKey(media) {
  if (!media) return null;
  if (media.src) return media.src;
  if (media.type === 'youtube' && media.id) return `yt-${media.id}`;
  return null;
}

export function getMediaDims(media) {
  if (!media) return { w: 16, h: 9, ratio: '16 / 9' };

  // Explicit in data (like embeds/iframes or if provided)
  if (media.width && media.height) {
    return {
      w: media.width,
      h: media.height,
      ratio: media.aspectRatio || `${media.width} / ${media.height}`,
    };
  }

  // YouTube standard 16:9
  if (media.type === 'youtube') {
    return { w: 16, h: 9, ratio: '16 / 9' };
  }

  // Check cache
  const key = getMediaKey(media);
  if (key && mediaCache.has(key)) {
    return mediaCache.get(key);
  }

  // Fallback default
  return { w: 16, h: 9, ratio: '16 / 9' };
}

export function saveMediaDims(media, w, h) {
  const key = getMediaKey(media);
  if (key && w && h) {
    mediaCache.set(key, { w, h, ratio: `${w} / ${h}` });
  }
}

// Speculatively detect natural image dimensions in the background
if (typeof window !== 'undefined') {
  setTimeout(() => {
    try {
      lifeUpdates.forEach((u) => {
        if (u.media?.type === 'image' && u.media?.src && !mediaCache.has(u.media.src)) {
          const img = new Image();
          img.src = u.media.src;
          if (img.complete && img.naturalWidth) {
            saveMediaDims(u.media, img.naturalWidth, img.naturalHeight);
          } else {
            img.onload = () => {
              saveMediaDims(u.media, img.naturalWidth, img.naturalHeight);
            };
          }
        }
      });
    } catch (_) {}
  }, 0);
}
