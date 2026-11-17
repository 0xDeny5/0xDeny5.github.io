import { useLoop, useSeen } from '../../hooks';
import { formatAmount } from '../../lib/format';
import { cx } from '../../lib/style';
import { VizFrame } from './VizFrame';

const OPENING_BALANCE = 100;
const AMOUNT = 80;

export type RequestStatus = 'idle' | 'in-flight' | 'waiting' | 'debited' | 'rejected';

export interface RaceState {
  balance: number;
  a: RequestStatus;
  b: RequestStatus;
  /** Which request currently holds the row lock. */
  lockedBy: 'A' | 'B' | null;
  /** Result of the guarded UPDATE, once it has run. */
  guard: string | null;
  done: boolean;
  caption: string;
}

// Timeline: idle → both in flight → A wins the lock and debits → B re-checks and is rejected → summary (held).
const TIMELINE: readonly RaceState[] = [
  {
    balance: OPENING_BALANCE,
    a: 'idle',
    b: 'idle',
    lockedBy: null,
    guard: null,
    done: false,
    caption: 'The balance is €100. Two €80 withdrawals are about to arrive in the same millisecond.',
  },
  {
    balance: OPENING_BALANCE,
    a: 'in-flight',
    b: 'in-flight',
    lockedBy: null,
    guard: null,
    done: false,
    caption: 'Both requests hit the account at once. There is only enough money for one of them.',
  },
  {
    balance: OPENING_BALANCE - AMOUNT,
    a: 'debited',
    b: 'waiting',
    lockedBy: 'A',
    guard: 'A → 1 row updated ✓',
    done: false,
    caption: 'Request A locks the row and takes €80. Request B has to wait for its turn.',
  },
  {
    balance: OPENING_BALANCE - AMOUNT,
    a: 'debited',
    b: 'rejected',
    lockedBy: 'B',
    guard: 'B → 0 rows updated ✗',
    done: false,
    caption: 'B re-checks the fresh balance: €20 is not enough, so it is rejected instead of overdrawing.',
  },
  {
    balance: OPENING_BALANCE - AMOUNT,
    a: 'debited',
    b: 'rejected',
    lockedBy: null,
    guard: 'B → 0 rows updated ✗',
    done: true,
    caption: 'One withdrawal wins, the other is refused. Without the guard both would pass and the balance would hit −€60.',
  },
];

export const RACE_STEPS = TIMELINE.length;

export function raceAt(step: number): RaceState {
  return TIMELINE[Math.min(Math.max(step, 0), RACE_STEPS - 1)] ?? (TIMELINE[0] as RaceState);
}

const STATUS_TEXT: Record<RequestStatus, string> = {
  idle: 'ready',
  'in-flight': 'in flight…',
  waiting: 'waiting for lock…',
  debited: '✓ debited',
  rejected: '✗ insufficient funds',
};

function Request({ name, status }: { name: 'A' | 'B'; status: RequestStatus }) {
  return (
    <>
      <div className={cx('race__req', status === 'debited' && 'is-ok', status === 'rejected' && 'is-bad')}>
        <span className="race__label mono">Withdrawal {name}</span>
        <span className="race__amount">−{formatAmount(AMOUNT)}</span>
        <span className="race__status mono">{STATUS_TEXT[status]}</span>
      </div>
      <span className={cx('race__lane', status === 'in-flight' && 'is-sending')} aria-hidden="true">
        <span className="race__dot" />
      </span>
    </>
  );
}

/** A race condition handled correctly: two concurrent withdrawals, one balance, never an overdraft. */
export function LedgerViz() {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const step = useLoop(RACE_STEPS, seen, 1900, 5200);
  const { balance, a, b, lockedBy, guard, done, caption } = raceAt(step);

  return (
    <VizFrame
      ref={ref}
      variant="ledger"
      label="Animation: an account holds €100 and two €80 withdrawals arrive at the same time; the first locks the account and is debited, the second re-checks the balance and is rejected, so the balance never goes negative."
      head={['account · EUR', 'concurrent withdrawals']}
      foot={{
        ok: done,
        start: `balance ${formatAmount(balance)} · never below 0 ✓`,
        end: done ? '1 debited · 1 rejected' : 'processing…',
      }}
    >
      <div className="race">
        <Request name="A" status={a} />
        <Request name="B" status={b} />
        <div className={cx('race__account', lockedBy && 'is-locked')}>
          <span className="race__label mono">Account balance</span>
          <span key={balance} className="race__balance">
            €{formatAmount(balance)}
          </span>
          <span className="race__lock mono">{lockedBy ? `row locked by ${lockedBy}` : 'unlocked'}</span>
        </div>
      </div>

      <p className="race__guard mono">
        <span>
          UPDATE accounts SET balance = balance − 80 <b>WHERE balance &gt;= 80</b>
        </span>
        <span className={cx('race__result', guard?.includes('✓') && 'is-ok', guard?.includes('✗') && 'is-bad')}>{guard ?? '—'}</span>
      </p>

      <p className="viz__caption">{caption}</p>
    </VizFrame>
  );
}
