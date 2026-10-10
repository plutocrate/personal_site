import TruncatedLifeText from '../components/TruncatedLifeText.jsx';
import Highlight from '../components/Highlight.jsx';
import Underline from '../components/Underline.jsx';
import Arrow from '../components/Arrow.jsx';

/* ==========================================================================
   LIFE UPDATES CMS / DATA STORE
   --------------------------------------------------------------------------
   Add, update, or remove life updates in this file.
   The site automatically sorts items by timestamp (date + time) so the newest
   post always appears first.

   MEDIA TYPES SUPPORTED:
   1. Pinterest / External Embeds:
      { type: 'iframe', src: 'https://assets.pinterest.com/ext/embed.html?id=688487861830813898' }

   2. YouTube Video:
      { type: 'youtube', id: '<youtube-video-id>' }
      Example: For https://www.youtube.com/watch?v=-oq0Kr40f2M, the id is '-oq0Kr40f2M'

   3. Local or Remote Image:
      { type: 'image', src: '/life/aug-07-2024.jpg' }
      Place image files inside the `/public/life/` folder.

   FORMATTING IN TEXT:
   - <a href="..." target="_blank" rel="noreferrer" className="text-link">Name<Arrow /></a>
   - <Highlight color="yellow|green|blue|orange|rose|purple">text</Highlight>
   - <Underline color="blue|green|orange|rose|purple|teal" variant="default|developer|designer|linux|long">text</Underline>
   ========================================================================== */

export const lifeUpdates = [
  {
    id: 'instagram-reel-meme',
    date: '2026-10-10',
    time: '22:50:00', // Today's newest update
    media: {
      type: 'iframe',
      src: 'https://www.instagram.com/reel/DeRrs6SO4bH/embed/',
      width: 400,
      height: 520,
      aspectRatio: '400 / 520',
      title: 'Instagram Reel - memesprcaf',
    },
    text: (
      <TruncatedLifeText
        isLong={true}
        text={
          <>
            Testing everything, now{' '}
            <Highlight color="yellow">time for reels</Highlight>! Checking the{' '}
            <Underline color="blue" variant="default">media sizing</Underline>, aspect ratios, and the{' '}
            <Underline color="rose" variant="designer">more button toast</Underline> notification
          </>
        }
        fullTextPlain="Testing everything, now time for reels! Checking the dynamic media sizing, aspect ratios, responsive scaling, and the more button toast notification. Everything is running smooth!"
      />
    ),
  },
  {
    id: 'threads-ticket-hologram',
    date: '2026-10-10',
    time: '22:30:00', // Today's newest update
    media: {
      type: 'iframe',
      src: 'https://codepen.io/simeydotme/embed/QWJqRvB?default-tab=result',
      width: 600,
      height: 380,
      aspectRatio: '600 / 380',
      title: 'Threads ticket with Hologram Effect',
    },
    text: (
      <>
        Check out this insane CodePen experiment:{' '}
        <a
          href="https://codepen.io/simeydotme/pen/QWJqRvB"
          target="_blank"
          rel="noreferrer"
          className="text-link"
        >
          Threads ticket with Hologram Effect<Arrow />
        </a>{' '}
        by <Highlight color="purple">Simey</Highlight>. The{' '}
        <Underline color="blue" variant="default">3D tilting</Underline>,{' '}
        <Underline color="teal" variant="developer">holographic foil sheen</Underline>, and{' '}
        <Underline color="rose" variant="designer">lighting reflections</Underline> made purely with CSS and SVG filters are stunning!
      </>
    ),
  },
  {
    id: 'bhalo-lage',
    date: '2026-10-10',
    time: '21:55:00', // Newer post (appears at top / featured on About)
    media: {
      type: 'youtube',
      id: '-oq0Kr40f2M',
    },
    text: (
      <>
        I would like to recommend you a song today. It’s{' '}
        <Highlight color="yellow">“Bhalo lage”</Highlight> a{' '}
        <Underline color="blue" variant="default">bengali</Underline> song by the 70’s band{' '}
        <Highlight color="green">Mohineer Ghoraguli</Highlight>. It was the{' '}
        <Underline color="orange" variant="long">India’s first rock band</Underline>, actually the first ever Indian music band!
      </>
    ),
  },
  {
    id: 'disco-elysium',
    date: '2026-10-10',
    time: '12:00:00', // Earlier post (appears below the music recommendation)
    media: {
      type: 'iframe',
      src: 'https://assets.pinterest.com/ext/embed.html?id=688487861830813898',
      width: 600,
      height: 700,
      aspectRatio: '600 / 700',
      title: 'Disco Elysium Art',
    },
    text: (
      <>
        I would like to recommend you a game today. It’s{' '}
        <a
          href="https://store.steampowered.com/app/632470/Disco_Elysium__The_Final_Cut/"
          target="_blank"
          rel="noreferrer"
          className="text-link"
        >
          Disco Elysium<Arrow />
        </a>
        , an RPG where you play as a detective who has absolutely no business being a detective. It’s{' '}
        <Highlight color="yellow">fucking hilarious</Highlight>, weird,{' '}
        <Highlight color="rose">depressing</Highlight>, and surprisingly{' '}
        <Underline color="blue" variant="default">philosophical</Underline>. I love this game.
      </>
    ),
  },


  /* ==========================================================================
     TEMPLATE FOR NEW UPDATE (Copy & paste to add another):
     --------------------------------------------------------------------------
     {
       id: 'my-new-update-slug',
       date: '2026-10-10',
       time: '14:30:00',
       media: {
         type: 'iframe', // 'iframe' | 'youtube' | 'image'
         src: 'https://...', // for iframe or image
       },
       text: (
         <>
           Your update copy here with optional <Highlight color="blue">highlights</Highlight>
           and <Underline color="purple">underlines</Underline>.
         </>
       ),
     },
     ========================================================================== */
].sort((a, b) => {
  const timeA = a.time || '00:00:00';
  const timeB = b.time || '00:00:00';
  return new Date(`${b.date}T${timeB}`) - new Date(`${a.date}T${timeA}`);
});

/**
 * Helper to format ISO dates into clean readable strings (e.g., 'Oct 10, 2026')
 */
export const formatDate = (iso) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
