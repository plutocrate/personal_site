/**
 * Prefetch & Network Cache Utility
 *
 * Provides speculative network warm-up for external embed hosts (DNS prefetch,
 * preconnect, resource prefetching) and an in-memory DOM frame stash so that
 * when navigating between pages or reel slides, external embeds (YouTube, Pinterest,
 * CodePen, Instagram) do not re-fetch from scratch or flicker.
 */

const warmedOrigins = new Set();
const prefetchedUrls = new Set();

/**
 * Speculatively warms up DNS and TLS handshakes for external hosts.
 * Can be called globally or for specific origins.
 */
export function preconnectOrigin(url) {
  if (typeof document === 'undefined') return;
  try {
    const origin = new URL(url, window.location.href).origin;
    if (warmedOrigins.has(origin)) return;
    warmedOrigins.add(origin);

    // DNS prefetch
    const dnsLink = document.createElement('link');
    dnsLink.rel = 'dns-prefetch';
    dnsLink.href = origin;
    document.head.appendChild(dnsLink);

    // Preconnect TLS
    const preconnLink = document.createElement('link');
    preconnLink.rel = 'preconnect';
    preconnLink.href = origin;
    preconnLink.crossOrigin = 'anonymous';
    document.head.appendChild(preconnLink);
  } catch {
    // Ignore invalid URLs
  }
}

/**
 * Prefetches an external URL or resource in the background using <link rel="prefetch">
 * or low-priority background fetch where permissible.
 */
export function prefetchUrl(url) {
  if (typeof document === 'undefined' || !url || prefetchedUrls.has(url)) return;
  prefetchedUrls.add(url);

  preconnectOrigin(url);

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  link.as = 'document';
  document.head.appendChild(link);
}

/**
 * Global known embed origin warm-up list
 */
export function warmExternalEmbeds() {
  const commonOrigins = [
    'https://www.youtube.com',
    'https://www.youtube-nocookie.com',
    'https://i.ytimg.com',
    'https://assets.pinterest.com',
    'https://i.pinimg.com',
    'https://codepen.io',
    'https://cdpn.io',
    'https://www.instagram.com',
    'https://static.cdninstagram.com',
  ];

  commonOrigins.forEach(preconnectOrigin);
}
