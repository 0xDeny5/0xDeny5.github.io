import { useLoop, useSeen } from '../../hooks';
import { formatAmount } from '../../lib/format';
import { cx } from '../../lib/style';
import { VizFrame } from './VizFrame';

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

const BEST = ROUTES.find((r) => r.best);
const STAGES = ['simulate', 'sign', 'send via Jito', 'confirmed'] as const;

// Step timeline: 0 = idle, 1..4 = quotes arrive, 5 = best picked, 6..9 = execution stages.
const PICK_STEP = ROUTES.length + 1;
const TOTAL_STEPS = PICK_STEP + STAGES.length + 1;

/** A swap being routed: quotes from several DEXs, the best split route chosen, then executed MEV-safe. */
export function SwapViz() {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const step = useLoop(TOTAL_STEPS, seen, 1050, 4500);

  const quoted = Math.min(step, ROUTES.length);
  const picked = step >= PICK_STEP;
  const stagesDone = Math.max(0, step - PICK_STEP);
  const confirmed = stagesDone >= STAGES.length;
  const shownOut = picked && BEST ? BEST.out : Math.max(0, ...ROUTES.slice(0, quoted).map((r) => r.out));

  return (
    <VizFrame
      ref={ref}
      variant="swap"
      label="Animation: a 25 SOL to USDC swap gets quotes from several DEXs, picks a split route for the best price and executes it with MEV protection."
      head={['swap router · solana', 'best execution']}
      foot={{ ok: confirmed, start: confirmed ? 'filled · +2.19 USDC vs best single DEX' : 'routing…', end: 'MEV-protected' }}
    >
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
          <span className="swap__amount">{shownOut ? `≈ ${formatAmount(shownOut)}` : '—'} USDC</span>
        </div>
      </div>

      <ul className="swap__routes">
        {ROUTES.map((route, i) => {
          const isQuoted = i < quoted;
          return (
            <li
              key={route.venue}
              className={cx('swap__route', isQuoted && 'is-quoted', picked && (route.best ? 'is-best' : 'is-dim'))}
            >
              <span className="swap__venue">{route.venue}</span>
              <span className="swap__kind mono">{route.kind}</span>
              <span className="swap__out mono">{isQuoted ? formatAmount(route.out) : 'quoting…'}</span>
            </li>
          );
        })}
      </ul>

      <ol className="swap__stages mono">
        {STAGES.map((stage, i) => (
          <li key={stage} className={i < stagesDone ? 'is-done' : undefined}>
            {i < stagesDone ? '✓' : '·'} {stage}
          </li>
        ))}
      </ol>
    </VizFrame>
  );
}
