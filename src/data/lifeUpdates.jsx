import Highlight from '../components/Highlight.jsx';
import Underline from '../components/Underline.jsx';

/* ==========================================================================
   LIFE UPDATES CMS / DATA STORE
   --------------------------------------------------------------------------
   Add, update, or remove life updates in this file.
   The site automatically sorts items so the newest date always appears first.

   MEDIA TYPES SUPPORTED:
   1. YouTube Video:
      { type: 'youtube', id: '<youtube-video-id>' }
      Example: For https://www.youtube.com/watch?v=-oq0Kr40f2M, the id is '-oq0Kr40f2M'

   2. Local or Remote Image:
      { type: 'image', src: '/life/aug-07-2024.jpg' }
      Place image files inside the `/public/life/` folder.

   FORMATTING IN TEXT:
   You can use both plain text AND rich formatted JSX components:
   - <Highlight color="yellow|green|blue|orange|rose|purple">text</Highlight>
   - <Underline color="blue|green|orange|rose|purple|teal" variant="default|developer|designer|linux|long">text</Underline>
   ========================================================================== */

export const lifeUpdates = [
  {
    id: 'bhalo-lage',
    date: '2024-08-07', // YYYY-MM-DD format
    media: {
      type: 'youtube',
      id: '-oq0Kr40f2M',
    },
    // Formatted with lighter pastel highlights and organic contrasting underlines
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

  /* ==========================================================================
     TEMPLATE FOR NEW UPDATE (Copy & paste to add another):
     --------------------------------------------------------------------------
     {
       id: 'my-new-update-slug',
       date: '2024-09-15',
       media: {
         type: 'image', // or 'youtube'
         src: '/life/your-photo.jpg', // or id: 'videoId'
       },
       text: (
         <>
           Your update copy here with optional <Highlight color="blue">highlights</Highlight>
           and <Underline color="purple">underlines</Underline>.
         </>
       ),
     },
     ========================================================================== */
].sort((a, b) => new Date(b.date) - new Date(a.date));

/**
 * Helper to format ISO dates into clean readable strings (e.g., 'Aug 07, 2024')
 */
export const formatDate = (iso) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
