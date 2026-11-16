import { useLoop, useSeen } from '../../hooks';
import { formatAmount, pad } from '../../lib/format';
import { cx } from '../../lib/style';
import { VizFrame } from './VizFrame';

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

// Steps: 0 = empty journal, 1..3 = entries posted, 4 = reconciled (held).
const RECONCILED_STEP = ENTRIES.length + 1;

const sum = (postings: Posting[], side: 'debit' | 'credit') => postings.reduce((total, p) => total + (p[side] ?? 0), 0);

/** Double-entry journal filling up; the totals row proves debits always equal credits. */
export function LedgerViz() {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const step = useLoop(RECONCILED_STEP + 1, seen, 1700, 4500);
  const shown = Math.min(step, ENTRIES.length);
  const posted = ENTRIES.slice(0, shown).flatMap((e) => e.postings);
  const debit = sum(posted, 'debit');
  const credit = sum(posted, 'credit');
  const reconciled = step === RECONCILED_STEP;

  return (
    <VizFrame
      ref={ref}
      variant="ledger"
      label="Animation: double-entry journal where every entry balances and the day ends reconciled."
      head={['general ledger · EUR', 'double-entry']}
      foot={{
        ok: reconciled,
        start: debit === credit ? 'debits = credits ✓' : 'unbalanced',
        end: reconciled ? 'EOD reconciled with bank statement ✓' : 'posting…',
      }}
    >
      <div className="ledgerviz mono">
        <div className="ledgerviz__row ledgerviz__row--head">
          <span>Account</span>
          <span>Debit</span>
          <span>Credit</span>
        </div>
        {ENTRIES.map((entry, i) => (
          <div key={entry.memo} className={cx('ledgerviz__entry', i < shown && 'is-shown')}>
            <p className="ledgerviz__memo">
              #{pad(i + 1, 4)} · {entry.memo}
            </p>
            {entry.postings.map((p) => (
              <div key={p.account} className="ledgerviz__row">
                <span>{p.account}</span>
                <span>{p.debit ? formatAmount(p.debit) : ''}</span>
                <span>{p.credit ? formatAmount(p.credit) : ''}</span>
              </div>
            ))}
          </div>
        ))}
        <div className="ledgerviz__row ledgerviz__row--total">
          <span>Σ</span>
          <span>{formatAmount(debit)}</span>
          <span>{formatAmount(credit)}</span>
        </div>
      </div>
    </VizFrame>
  );
}
