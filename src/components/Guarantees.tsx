import { guarantees } from '../content';
import { trackPointer } from '../lib/dom';
import { pad } from '../lib/format';
import { cssVars, cx } from '../lib/style';
import { Section } from './Section';

/**
 * The correctness toolkit for money code. Cards stagger in; inside each, the example lines
 * appear one after another like output in a console.
 */
export function Guarantees() {
  return (
    <Section
      id="guarantees"
      title={
        <>
          Money code that never <em>double-spends</em>.
        </>
      }
      aside={<p className="small">The non-negotiables behind every system above. Boring on purpose.</p>}
    >
      <ul className="guarantees">
        {guarantees.map((g, i) => (
          <li key={g.term} className="guarantee spotlight" data-reveal style={cssVars({ '--i': i % 3 })} onPointerMove={trackPointer}>
            <p className="guarantee__no mono">{pad(i + 1)}</p>
            <h3 className="guarantee__term">{g.term}</h3>
            <p className="guarantee__body">{g.body}</p>
            <pre className="guarantee__example mono" aria-label={`Example: ${g.term}`}>
              {g.example.map((line, l) => (
                <span key={line.text} className={cx('guarantee__line', line.tone && `is-${line.tone}`)} style={cssVars({ '--l': l })}>
                  {line.text}
                </span>
              ))}
            </pre>
          </li>
        ))}
      </ul>
    </Section>
  );
}
