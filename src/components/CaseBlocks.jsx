// Case study & playground body: text, headings, code, and image blocks.
export default function CaseBlocks({ blocks, hue }) {
  return blocks.map((b, i) => {
    if (b.type === 'heading') {
      return (
        <h3 key={i} className="block-heading" style={{ fontSize: '20px', fontWeight: 600, color: 'var(--ink)', margin: '24px 0 6px', letterSpacing: '-0.02em' }}>
          {b.text}
        </h3>
      );
    }
    if (b.type === 'code') {
      return (
        <div key={i} className="block-code-wrap" style={{ margin: '14px 0', borderRadius: '12px', background: 'var(--surface-2)', border: '1px solid var(--line)', padding: '16px 20px', overflowX: 'auto' }}>
          {b.lang && <div style={{ fontSize: '11px', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontWeight: 600 }}>{b.lang}</div>}
          <pre style={{ margin: 0, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '13.5px', lineHeight: 1.6, color: 'var(--ink)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            <code>{b.code}</code>
          </pre>
        </div>
      );
    }
    if (b.type === 'text') {
      return <p key={i} className="block-text">{b.text}</p>;
    }
    if (b.src) {
      return <img key={i} className="block-img" src={b.src} alt="" />;
    }
    return <div key={i} className="block-img" style={{ '--hue': hue }} />;
  });
}
