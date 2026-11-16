import { useEffect, useState } from 'react';
import { prefersReducedMotion, useSeen } from '../../hooks';

interface Snippet {
  file: string;
  lang: 'sol' | 'rs';
  note: string;
  code: string;
}

// Same withdrawal, both VMs: checks → effects → interaction, so state is final before value moves.
const SNIPPETS: Snippet[] = [
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

const KEYWORDS: Record<Snippet['lang'], Set<string>> = {
  sol: new Set(['function', 'external', 'returns', 'uint256', 'bool', 'require', 'emit', 'return', 'msg', 'value']),
  rs: new Set(['pub', 'fn', 'let', 'mut', 'u64', 'Ok', 'Result', 'Context']),
};

type Kind = 'kw' | 'str' | 'com' | 'num' | 'fn' | 'mac' | 'type' | 'plain';

const TOKEN = /(\/\/[^\n]*)|("(?:[^"\\]|\\.)*"?)|(\b\d+\b)|([A-Za-z_][A-Za-z0-9_]*!?)|(\s+)|([^\sA-Za-z0-9_"]+)/g;

/** Tiny highlighter: good enough for two hand-written snippets, not a parser. */
function highlight(code: string, lang: Snippet['lang']): { text: string; kind: Kind }[] {
  const out: { text: string; kind: Kind }[] = [];
  for (const m of code.matchAll(TOKEN)) {
    const [text, com, str, num, word] = m;
    let kind: Kind = 'plain';
    if (com) kind = 'com';
    else if (str) kind = 'str';
    else if (num) kind = 'num';
    else if (word) {
      const next = code[(m.index ?? 0) + text.length];
      if (word.endsWith('!')) kind = 'mac';
      else if (KEYWORDS[lang].has(word)) kind = 'kw';
      else if (/^[A-Z]/.test(word)) kind = 'type';
      else if (next === '(') kind = 'fn';
    }
    out.push({ text, kind });
  }
  return out;
}

const CHARS_PER_TICK = 3;
const TICK_MS = 50;
const HOLD_MS = 4200;

export function CodeViz() {
  const [ref, seen] = useSeen<HTMLDivElement>(0.4);
  const [tab, setTab] = useState(0);
  const [typed, setTyped] = useState(Infinity);

  useEffect(() => {
    if (!seen || prefersReducedMotion()) return;
    let current = 0;
    let n = 0;
    let timer: number;
    const tick = () => {
      const len = SNIPPETS[current]?.code.length ?? 0;
      if (n < len) {
        n += CHARS_PER_TICK;
        setTyped(n);
        timer = window.setTimeout(tick, TICK_MS);
      } else {
        timer = window.setTimeout(() => {
          current = (current + 1) % SNIPPETS.length;
          n = 0;
          setTab(current);
          setTyped(0);
          tick();
        }, HOLD_MS);
      }
    };
    // Start from an empty editor (state begins at 'fully typed' for SSR and no-JS).
    timer = window.setTimeout(() => {
      setTyped(0);
      tick();
    }, 200);
    return () => window.clearTimeout(timer);
  }, [seen]);

  const snippet = SNIPPETS[tab % SNIPPETS.length] as Snippet;
  const visible = snippet.code.slice(0, typed);
  const done = typed >= snippet.code.length;

  return (
    <div ref={ref} className="viz viz--code" role="img" aria-label="Animation: the same safe withdraw function typed in Solidity and in Rust for Solana.">
      <div className="code__tabs mono">
        {SNIPPETS.map((s, i) => (
          <span key={s.file} className={`code__tab ${i === tab ? 'is-active' : ''}`}>
            {s.file}
          </span>
        ))}
      </div>
      <pre className="code__body mono">
        <code>
          {highlight(visible, snippet.lang).map((tok, i) => (
            <span key={i} className={`tok-${tok.kind}`}>
              {tok.text}
            </span>
          ))}
          {!done && <span className="code__caret" />}
        </code>
      </pre>
      <div className={`viz__foot mono ${done ? 'is-ok' : ''}`}>
        <span>{snippet.note}</span>
        <span>{done ? 'forge test ✓  ·  anchor test ✓' : 'typing…'}</span>
      </div>
    </div>
  );
}
