import { useLoop, useSeen } from '../../hooks';

interface Route {
  venue: string;
  kind: string;
  out: number;
  best?: boolean;
}

// Illustrative quotes for 25 SOL → USDC; the split route wins by routing around price impact.
const ROUTES: Route[] = [
  { venue: 'Raydium', kind: 'CLMM', out: 4176.9 },
  { venue: 'Meteora', kind: 'DLMM', out: 4180.12 },
  { venue: 'Orca', kind: 'Whirlpool', out: 4171.55 },
  { venue: 'Split · Meteora 60% + Raydium 40%', kind: 'best route', out: 4182.31, best: true },
];

const STAGES = ['simulate', 'sign', 'send via Jito', 'confirmed'] as const;

// Step timeline: 0 = idle, 1..4 = quotes arrive, 5 = best picked, 6..9 = execution stages.
const PICK_STEP = ROUTES.length + 1;
const TOTAL_STEPS = PICK_STEP + STAGES.length + 1;

const usdc = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** A swap being routed: quotes from several DEXs, the best split route chosen, then executed MEV-safe. */
export function SwapViz() {
  const [ref, seen] = useSeen<HTMLDivElement>(0.4);
  const step = useLoop(TOTAL_STEPS, seen, 1050, 4500);

  const quoted = Math.min(step, ROUTES.length);
  const picked = step >= PICK_STEP;
  const stageDone = Math.max(0, step - PICK_STEP);
  const best = ROUTES.find((r) => r.best);
  const shownOut = picked && best ? best.out : Math.max(0, ...ROUTES.slice(0, quoted).map((r) => r.out));
  const confirmed = stageDone >= STAGES.length;

  return (
    <div ref={ref} className="viz viz--swap" role="img" aria-label="Animation: a 25 SOL to USDC swap gets quotes from several DEXs, picks a split route for the best price and executes it with MEV protection.">
      <div className="viz__head mono">
        <span>swap router · solana</span>
        <span>best execution</span>
      </div>

      <div className="swap__pair">
        <div>
          <span className="swap__label mono">You pay</span>
          <span className="swap__amount">25 SOL</span>
        </div>
        <span className="swap__arrow" aria-hidden="true">
          →
        </span>
        <div className="swap__receive">
          <span className="swap__label mono">You receive</span>
          <span className="swap__amount">{shownOut ? `≈ ${usdc(shownOut)}` : '—'} USDC</span>
        </div>
      </div>

      <ul className="swap__routes">
        {ROUTES.map((r, i) => {
          const isQuoted = i < quoted;
          return (
            <li key={r.venue} className={`swap__route ${isQuoted ? 'is-quoted' : ''} ${picked && r.best ? 'is-best' : ''} ${picked && !r.best ? 'is-dim' : ''}`}>
              <span className="swap__venue">{r.venue}</span>
              <span className="swap__kind mono">{r.kind}</span>
              <span className="swap__out mono">{isQuoted ? usdc(r.out) : 'quoting…'}</span>
            </li>
          );
        })}
      </ul>

      <ol className="swap__stages mono">
        {STAGES.map((s, i) => (
          <li key={s} className={i < stageDone ? 'is-done' : ''}>
            {i < stageDone ? '✓' : '·'} {s}
          </li>
        ))}
      </ol>

      <div className={`viz__foot mono ${confirmed ? 'is-ok' : ''}`}>
        <span>{confirmed ? 'filled · +2.19 USDC vs best single DEX' : 'routing…'}</span>
        <span>MEV-protected</span>
      </div>
    </div>
  );
}
