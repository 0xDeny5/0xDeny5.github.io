import { useEffect, useState } from 'react';
import { useSeen } from '../../hooks';
import { prefersReducedMotion } from '../../lib/dom';
import { highlight, type Lang } from '../../lib/highlight';
import { VizFrame } from './VizFrame';

interface Snippet {
  file: string;
  lang: Lang;
  note: string;
  code: string;
}

// Same withdrawal, both VMs: checks → effects → interaction, so state is final before value moves.
const SNIPPETS: readonly [Snippet, ...Snippet[]] = [
  {
    file: 'Vault.sol',
    lang: 'sol',
    note: 'checks → effects → interactions · nonReentrant',
    code: `function withdraw(uint256 amount) external nonReentrant {
    uint256 bal = balances[msg.sender];
    require(bal >= amount, "insufficient");
    balances[msg.sender] = bal - amount; // effects first
    (bool ok, ) = msg.sender.call{value: amount}("");
    require(ok, "transfer failed");
    emit Withdrawn(msg.sender, amount);
}`,
  },
  {
    file: 'vault.rs',
    lang: 'rs',
    note: 'Anchor · PDA-owned ledger · checked math',
    code: `pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    let ledger = &mut ctx.accounts.ledger;
    require!(ledger.credited >= amount, VaultError::Insufficient);
    ledger.credited -= amount; // overflow-checks = true
    pay_from_pool(&ctx, amount)?;
    emit!(Withdrawn { owner: ctx.accounts.owner.key(), amount });
    Ok(())
}`,
  },
];

const CHARS_PER_TICK = 3;
const TICK_MS = 50;
const HOLD_MS = 4200;
const START_DELAY_MS = 200;

/** An editor typing the same safe withdraw function in Solidity, then in Rust, on a loop. */
export function CodeViz() {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const [tab, setTab] = useState(0);
  // Starts fully typed, so the server render and no-JS visitors see the whole snippet.
  const [typed, setTyped] = useState(Infinity);

  useEffect(() => {
    if (!seen || prefersReducedMotion()) return;
    let current = 0;
    let chars = 0;
    let timer: number;

    const tick = () => {
      if (chars < (SNIPPETS[current]?.code.length ?? 0)) {
        chars += CHARS_PER_TICK;
        setTyped(chars);
        timer = window.setTimeout(tick, TICK_MS);
        return;
      }
      timer = window.setTimeout(() => {
        current = (current + 1) % SNIPPETS.length;
        chars = 0;
        setTab(current);
        setTyped(0);
        tick();
      }, HOLD_MS);
    };

    // Clear the editor and start typing (inside a timer: no synchronous setState in the effect).
    timer = window.setTimeout(() => {
      setTyped(0);
      tick();
    }, START_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [seen]);

  const snippet = SNIPPETS[tab] ?? SNIPPETS[0];
  const done = typed >= snippet.code.length;

  return (
    <VizFrame
      ref={ref}
      variant="code"
      label="Animation: the same safe withdraw function typed in Solidity and in Rust for Solana."
      foot={{ ok: done, start: snippet.note, end: done ? 'forge test ✓  ·  anchor test ✓' : 'typing…' }}
    >
      <div className="code__tabs mono">
        {SNIPPETS.map((s, i) => (
          <span key={s.file} className={i === tab ? 'code__tab is-active' : 'code__tab'}>
            {s.file}
          </span>
        ))}
      </div>
      <pre className="code__body mono">
        <code>
          {highlight(snippet.code.slice(0, typed), snippet.lang).map((token, i) => (
            <span key={i} className={`tok-${token.kind}`}>
              {token.text}
            </span>
          ))}
          {!done && <span className="code__caret" />}
        </code>
      </pre>
    </VizFrame>
  );
}
