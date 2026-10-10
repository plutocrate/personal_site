// Case study body: text and image blocks. An image block without `src` shows a tinted placeholder.
export default function CaseBlocks({ blocks, hue }) {
  return blocks.map((b, i) =>
    b.type === 'text' ? (
      <p key={i} className="block-text">{b.text}</p>
    ) : b.src ? (
      <img key={i} className="block-img" src={b.src} alt="" />
    ) : (
      <div key={i} className="block-img" style={{ '--hue': hue }} />
    )
  );
}
