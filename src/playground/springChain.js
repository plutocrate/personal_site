import { mount } from './util.js';

// Interactive Spring Chain: Connected point masses responding to spring elasticity and pointer pull.
export const startSpringChain = (canvas) => mount(canvas, (s) => {
  const NUM_NODES = 18;
  const nodes = [];
  let initialized = false;

  const init = (w, h) => {
    nodes.length = 0;
    const startX = w * 0.16;
    const endX = w * 0.84;
    const baseY = h * 0.45;
    for (let i = 0; i < NUM_NODES; i++) {
      const t = i / (NUM_NODES - 1);
      nodes.push({
        x: startX + t * (endX - startX),
        y: baseY + Math.sin(t * Math.PI) * 25,
        vx: 0,
        vy: 0,
        pinned: i === 0 || i === NUM_NODES - 1,
        mass: 1.0,
      });
    }
  };

  let dragNodeIndex = -1;

  return (dt) => {
    const { ctx, w, h } = s;
    if (!initialized || nodes.length === 0) {
      init(w, h);
      initialized = true;
    }

    // Pointer interaction: drag closest node
    if (s.mx != null && s.my != null) {
      if (dragNodeIndex === -1) {
        let minDist = 50;
        nodes.forEach((node, idx) => {
          if (node.pinned) return;
          const d = Math.hypot(node.x - s.mx, node.y - s.my);
          if (d < minDist) {
            minDist = d;
            dragNodeIndex = idx;
          }
        });
      }
      if (dragNodeIndex !== -1) {
        const n = nodes[dragNodeIndex];
        n.x += (s.mx - n.x) * 0.35;
        n.y += (s.my - n.y) * 0.35;
        n.vx = 0;
        n.vy = 0;
      }
    } else {
      dragNodeIndex = -1;
    }

    const restLen = (w * 0.68) / (NUM_NODES - 1);
    const k = 0.22;
    const damping = 0.94;
    const gravity = 0.16;

    for (let i = 0; i < nodes.length - 1; i++) {
      const n1 = nodes[i];
      const n2 = nodes[i + 1];
      const dx = n2.x - n1.x;
      const dy = n2.y - n1.y;
      const dist = Math.hypot(dx, dy) || 0.001;
      const diff = dist - restLen;
      const force = diff * k;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      if (!n1.pinned && i !== dragNodeIndex) {
        n1.vx += (fx / n1.mass) * dt;
        n1.vy += (fy / n1.mass) * dt;
      }
      if (!n2.pinned && i + 1 !== dragNodeIndex) {
        n2.vx -= (fx / n2.mass) * dt;
        n2.vy -= (fy / n2.mass) * dt;
      }
    }

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (n.pinned || i === dragNodeIndex) continue;
      n.vy += gravity * dt;
      n.vx *= Math.pow(damping, dt);
      n.vy *= Math.pow(damping, dt);
      n.x += n.vx * dt;
      n.y += n.vy * dt;
    }

    ctx.clearRect(0, 0, w, h);

    // Draw chain spine
    ctx.beginPath();
    ctx.strokeStyle = s.dark ? 'rgba(255, 255, 255, 0.42)' : 'rgba(29, 29, 31, 0.42)';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(nodes[0].x, nodes[0].y);
    for (let i = 1; i < nodes.length; i++) {
      const xc = (nodes[i].x + nodes[i - 1].x) / 2;
      const yc = (nodes[i].y + nodes[i - 1].y) / 2;
      ctx.quadraticCurveTo(nodes[i - 1].x, nodes[i - 1].y, xc, yc);
    }
    ctx.lineTo(nodes[nodes.length - 1].x, nodes[nodes.length - 1].y);
    ctx.stroke();

    // Draw masses / nodes
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const isAnchor = n.pinned;
      const isDragged = i === dragNodeIndex;
      ctx.beginPath();
      ctx.arc(n.x, n.y, isAnchor ? 5.5 : isDragged ? 7 : 4.5, 0, Math.PI * 2);
      ctx.fillStyle = isAnchor
        ? (s.dark ? '#ffffff' : '#1d1d1f')
        : isDragged
        ? '#0071e3'
        : (s.dark ? 'rgba(255,255,255,0.85)' : 'rgba(29,29,31,0.85)');
      ctx.fill();
    }
  };
});
