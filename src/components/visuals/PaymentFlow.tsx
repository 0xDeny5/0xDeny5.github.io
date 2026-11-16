import { useLoop, useSeen } from '../../hooks';
import { cx } from '../../lib/style';
import { VizFrame } from './VizFrame';

const STATES = ['initiated', 'authorised', 'captured', 'settled', 'reconciled'] as const;

interface LogLine {
  /** State index at which the line appears. */
  at: number;
  text: string;
  duplicate?: boolean;
}

// Event log revealed alongside the state machine; the duplicate webhook is the point.
const LOG: LogLine[] = [
  { at: 0, text: 'POST /payments  idem-key 7f3a…c1' },
  { at: 1, text: 'psp.webhook  payment.authorised' },
  { at: 2, text: 'psp.webhook  payment.captured' },
  { at: 2, text: 'psp.webhook  payment.captured  ↺ duplicate — ignored', duplicate: true },
  { at: 3, text: 'ledger  double-entry posted · Δ 0.00' },
  { at: 4, text: 'recon  EOD statement matched ✓' },
];

/** A payment walking its state machine while the event log proves a duplicate webhook changes nothing. */
export function PaymentFlow() {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const step = useLoop(STATES.length, seen, 1600, 4500);

  return (
    <VizFrame
      ref={ref}
      variant="payment"
      label="Animation: a payment moves through initiated, authorised, captured, settled and reconciled; a duplicate webhook is ignored."
      head={['payment state machine', 'exactly-once effects']}
    >
      <ol className="pay__states">
        {STATES.map((state, i) => (
          <li key={state} className={cx('pay__state', i < step && 'is-done', i === step && 'is-current')}>
            <span className="pay__dot" />
            <span className="mono">{state}</span>
          </li>
        ))}
      </ol>
      <ol className="pay__log mono">
        {LOG.map((line) => (
          <li key={line.text} className={cx(line.at <= step && 'is-shown', line.duplicate && 'is-dup')}>
            {line.text}
          </li>
        ))}
      </ol>
    </VizFrame>
  );
}
