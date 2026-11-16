import type { CSSProperties } from 'react';
import { guarantees } from '../content';
import { trackPointer } from '../hooks';
import { SectionHead } from './SectionHead';

/**
 * The correctness toolkit for money code. Cards stagger in; inside each, the example lines
 * appear one after another like output in a console.
 */
export function Guarantees() {
  return (
    <section id="guarantees" className="section" aria-labelledby="guarantees-title">
      <div className="container">
        <SectionHead
          index="02"
          label="Guarantees"
          id="guarantees-title"
          aside={<p className="small">The non-negotiables behind every system above. Boring on purpose.</p>}
        >
          Money code that never <em>double-spends</em>.
        </SectionHead>

        <ul className="guarantees">
          {guarantees.map((g, i) => (
            <li
              key={g.term}
              className="guarantee spotlight"
              data-reveal
              style={{ '--i': i % 3 } as CSSProperties}
              onPointerMove={trackPointer}
            >
              <p className="guarantee__no mono">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="guarantee__term">{g.term}</h3>
              <p className="guarantee__body">{g.body}</p>
              <pre className="guarantee__example mono" aria-label={`Example: ${g.term}`}>
                {g.example.map((line, l) => (
                  <span
                    key={line.text}
                    className={`guarantee__line ${line.tone ? `is-${line.tone}` : ''}`}
                    style={{ '--l': l } as CSSProperties}
                  >
                    {line.text}
                  </span>
                ))}
              </pre>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
