import { useEffect, useState } from 'react';
import { prefersReducedMotion, useSeen } from '../../hooks';

const STATES = ['initiated', 'authorised', 'captured', 'settled', 'reconciled'] as const;

interface LogLine {
  at: number;
  text: string;
  kind?: 'dup';
}

// Event log revealed alongside the state machine; the duplicate webhook is the point.
const LOG: LogLine[] = [
  { at: 0, text: 'POST /payments  idem-key 7f3a…c1' },
  { at: 1, text: 'psp.webhook  payment.authorised' },
  { at: 2, text: 'psp.webhook  payment.captured' },
  { at: 2, text: 'psp.webhook  payment.captured  ↺ duplicate — ignored', kind: 'dup' },
  { at: 3, text: 'ledger  double-entry posted · Δ 0.00' },
  { at: 4, text: 'recon  EOD statement matched ✓' },
];

export function PaymentFlow() {
  const [ref, seen] = useSeen<HTMLDivElement>(0.4);
  const [step, setStep] = useState(STATES.length - 1);

  useEffect(() => {
    if (!seen || prefersReducedMotion()) return;
    let i = -1;
    let timer: number;
    const tick = () => {
      i = (i + 1) % STATES.length;
      setStep(i);
      timer = window.setTimeout(tick, i === STATES.length - 1 ? 4500 : 1600);
    };
    tick();
    return () => window.clearTimeout(timer);
  }, [seen]);

  return (
    <div ref={ref} className="viz viz--payment" role="img" aria-label="Animation: a payment moves through initiated, authorised, captured, settled and reconciled; a duplicate webhook is ignored.">
      <div className="viz__head mono">
        <span>payment state machine</span>
        <span>exactly-once effects</span>
      </div>
      <ol className="pay__states">
        {STATES.map((s, i) => (
          <li key={s} className={`pay__state ${i < step ? 'is-done' : ''} ${i === step ? 'is-current' : ''}`}>
            <span className="pay__dot" />
            <span className="mono">{s}</span>
          </li>
        ))}
      </ol>
      <ol className="pay__log mono">
        {LOG.map((l) => (
          <li key={l.text} className={`${l.at <= step ? 'is-shown' : ''} ${l.kind === 'dup' ? 'is-dup' : ''}`}>
            {l.text}
          </li>
        ))}
      </ol>
    </div>
  );
}
