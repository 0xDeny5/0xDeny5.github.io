import { useLoop, useSeen } from '../../hooks';

interface Posting {
  account: string;
  debit?: number;
  credit?: number;
}

interface Entry {
  memo: string;
  postings: [Posting, Posting];
}

// Three journal entries; every one balances on its own, so the books always balance.
const ENTRIES: Entry[] = [
  {
    memo: 'Card top-up',
    postings: [
      { account: 'Bank · settlement', debit: 250 },
      { account: 'Customer · balance', credit: 250 },
    ],
  },
  {
    memo: 'FX fee',
    postings: [
      { account: 'Customer · balance', debit: 1.5 },
      { account: 'Revenue · fees', credit: 1.5 },
    ],
  },
  {
    memo: 'SEPA payout',
    postings: [
      { account: 'Customer · balance', debit: 100 },
      { account: 'Bank · settlement', credit: 100 },
    ],
  },
];

const eur = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Double-entry journal filling up; the totals row proves debits always equal credits. */
export function LedgerViz() {
  const [ref, seen] = useSeen<HTMLDivElement>(0.4);
  // Steps: 0..3 = entries shown, 4 = reconciled.
  const step = useLoop(ENTRIES.length + 2, seen, 1700, 4500);
  const shown = Math.min(step, ENTRIES.length);
  const visible = ENTRIES.slice(0, shown).flatMap((e) => e.postings);
  const debit = visible.reduce((s, p) => s + (p.debit ?? 0), 0);
  const credit = visible.reduce((s, p) => s + (p.credit ?? 0), 0);
  const reconciled = step === ENTRIES.length + 1;

  return (
    <div ref={ref} className="viz viz--ledger" role="img" aria-label="Animation: double-entry journal where every entry balances and the day ends reconciled.">
      <div className="viz__head mono">
        <span>general ledger · EUR</span>
        <span>double-entry</span>
      </div>
      <div className="ledgerviz mono">
        <div className="ledgerviz__row ledgerviz__row--head">
          <span>Account</span>
          <span>Debit</span>
          <span>Credit</span>
        </div>
        {ENTRIES.map((e, i) => (
          <div key={e.memo} className={`ledgerviz__entry ${i < shown ? 'is-shown' : ''}`}>
            <p className="ledgerviz__memo">
              #{String(i + 1).padStart(4, '0')} · {e.memo}
            </p>
            {e.postings.map((p) => (
              <div key={p.account + (p.debit ?? p.credit)} className="ledgerviz__row">
                <span>{p.account}</span>
                <span>{p.debit ? eur(p.debit) : ''}</span>
                <span>{p.credit ? eur(p.credit) : ''}</span>
              </div>
            ))}
          </div>
        ))}
        <div className="ledgerviz__row ledgerviz__row--total">
          <span>Σ</span>
          <span>{eur(debit)}</span>
          <span>{eur(credit)}</span>
        </div>
      </div>
      <div className={`viz__foot mono ${reconciled ? 'is-ok' : ''}`}>
        <span>{debit === credit ? 'debits = credits ✓' : 'unbalanced'}</span>
        <span>{reconciled ? 'EOD reconciled with bank statement ✓' : 'posting…'}</span>
      </div>
    </div>
  );
}
