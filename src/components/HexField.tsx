import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../hooks';

const HEX = '0123456789abcdef';
const CELL_W = 15;
const CELL_H = 22;
const RADIUS = 170;
const BASE_ALPHA = 0.08;
const FONT = '500 12px "Geist Mono Variable", ui-monospace, monospace';

const randomHex = () => HEX[(Math.random() * 16) | 0] ?? '0';

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * A field of hex digits, like a block explorer's raw view. Digits near the pointer light up in the
 * accent colour and re-roll; without a mouse, a slow "probe" wanders the field.
 * Cold digits live on a cached offscreen layer, so each frame only repaints the warm cells.
 */
export function HexField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const base = document.createElement('canvas');
    const bctx = base.getContext('2d');
    if (!canvas || !ctx || !bctx) return;

    const reduced = prefersReducedMotion();
    let width = 0;
    let height = 0;
    let dpr = 1;
    let cols = 0;
    let rows = 0;
    let chars: string[] = [];
    let heat = new Float32Array(0);
    let ink = '';
    let accent = '';
    let raf = 0;
    let running = false;
    let last = 0;
    const pointer = { x: 0, y: 0, at: -Infinity };

    const cellX = (c: number) => c * CELL_W + 3;
    const cellY = (r: number) => r * CELL_H + CELL_H / 2;

    const paintBaseCell = (i: number) => {
      const c = i % cols;
      const r = (i / cols) | 0;
      bctx.clearRect(c * CELL_W, r * CELL_H, CELL_W, CELL_H);
      bctx.fillText(chars[i] ?? '0', cellX(c), cellY(r));
    };

    const paintBase = () => {
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bctx.clearRect(0, 0, width, height);
      bctx.font = FONT;
      bctx.textBaseline = 'middle';
      bctx.fillStyle = ink;
      bctx.globalAlpha = BASE_ALPHA;
      for (let i = 0; i < chars.length; i++) paintBaseCell(i);
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      ({ width, height } = canvas.getBoundingClientRect());
      for (const cv of [canvas, base]) {
        cv.width = Math.round(width * dpr);
        cv.height = Math.round(height * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / CELL_W);
      rows = Math.ceil(height / CELL_H);
      chars = Array.from({ length: cols * rows }, randomHex);
      heat = new Float32Array(cols * rows);
      paintBase();
    };

    const draw = (t: number) => {
      // Zero-sized before layout (or inside a hidden container): nothing to paint, and drawImage would throw.
      if (base.width === 0 || base.height === 0) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(base, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduced) return;

      ctx.font = FONT;
      ctx.textBaseline = 'middle';

      // Follow the mouse; after 2.5 s of stillness (or on touch) a Lissajous probe takes over.
      const idle = t - pointer.at > 2500;
      const px = idle ? width * (0.62 + 0.28 * Math.sin(t / 3100)) : pointer.x;
      const py = idle ? height * (0.5 + 0.32 * Math.sin(t / 2300 + 1.3)) : pointer.y;

      const c0 = Math.max(0, Math.floor((px - RADIUS * 2) / CELL_W));
      const c1 = Math.min(cols - 1, Math.ceil((px + RADIUS * 2) / CELL_W));
      const r0 = Math.max(0, Math.floor((py - RADIUS * 2) / CELL_H));
      const r1 = Math.min(rows - 1, Math.ceil((py + RADIUS * 2) / CELL_H));

      for (let i = 0; i < heat.length; i++) {
        const c = i % cols;
        const r = (i / cols) | 0;
        const inBox = c >= c0 && c <= c1 && r >= r0 && r <= r1;
        let h = (heat[i] ?? 0) * 0.93;
        if (inBox) {
          const near = Math.max(0, 1 - Math.hypot(cellX(c) - px, cellY(r) - py) / RADIUS);
          h = Math.max(h, near);
          if (near > 0.15 && Math.random() < near * 0.22) {
            chars[i] = randomHex();
            paintBaseCell(i);
          }
        }
        heat[i] = h < 0.02 ? 0 : h;
        if (h < 0.02) continue;

        ctx.clearRect(c * CELL_W, r * CELL_H, CELL_W, CELL_H);
        const hot = h > 0.35;
        ctx.fillStyle = hot ? accent : ink;
        ctx.globalAlpha = hot ? Math.min(1, 0.25 + h * 0.85) : BASE_ALPHA + h * 0.4;
        ctx.fillText(chars[i] ?? '0', cellX(c), cellY(r));
      }
      ctx.globalAlpha = 1;
    };

    const loop = (t: number) => {
      if (!running) return;
      if (t - last > 33) {
        draw(t);
        last = t;
      }
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduced) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.at = performance.now();
    };

    const readColors = () => {
      ink = cssVar('--ink');
      accent = cssVar('--accent');
    };

    readColors();
    resize();
    draw(0);

    const ro = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => (entry?.isIntersecting ? start() : stop()));
    io.observe(canvas);

    const themeObserver = new MutationObserver(() => {
      readColors();
      paintBase();
      draw(performance.now());
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // Repaint once web fonts are in, so the field uses Geist Mono instead of the fallback.
    void document.fonts?.ready.then(() => {
      paintBase();
      draw(performance.now());
    });

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pointermove', onPointer, { passive: true });

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      themeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointer);
    };
  }, []);

  return <canvas ref={canvasRef} className="hexfield" aria-hidden="true" />;
}
