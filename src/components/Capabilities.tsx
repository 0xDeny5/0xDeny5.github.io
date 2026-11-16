import { AnimatePresence, motion } from 'motion/react';
import type { CSSProperties, ReactNode } from 'react';
import { capabilities, industries, type Capability, type VisualId } from '../content';
import { useActiveSection, useMediaQuery, useScramble } from '../hooks';
import { SectionHead } from './SectionHead';
import { CodeViz } from './visuals/CodeViz';
import { CustodyViz } from './visuals/CustodyViz';
import { LedgerViz } from './visuals/LedgerViz';
import { PaymentFlow } from './visuals/PaymentFlow';
import { SwapViz } from './visuals/SwapViz';
import { ThroughputViz } from './visuals/ThroughputViz';

const VISUALS: Record<VisualId, () => ReactNode> = {
  ledger: () => <LedgerViz />,
  payment: () => <PaymentFlow />,
  custody: () => <CustodyViz />,
  swap: () => <SwapViz />,
  contracts: () => <CodeViz />,
  throughput: () => <ThroughputViz />,
};

const IDS = capabilities.map((c) => `cap-${c.id}`);
const DIGIT_SCRAMBLE = { duration: 1100, glyphs: '0123456789', only: /\d/ };
const EASE = [0.2, 0.7, 0.2, 1] as const;

/** Proof figure whose digits roll like a split-flap board before settling. */
function Proof({ proof }: { proof: Capability['proof'] }) {
  const [ref, text] = useScramble<HTMLParagraphElement>(proof.figure, DIGIT_SCRAMBLE);
  return (
    <div className="cap__proof">
      <p ref={ref} className="cap__figure">
        <span className="sr-only">{proof.figure}</span>
        <span aria-hidden="true">{text}</span>
      </p>
      <p className="cap__proof-label">{proof.label}</p>
    </div>
  );
}

function CapabilityBlock({ cap, index, inlineVisual }: { cap: Capability; index: number; inlineVisual: boolean }) {
  return (
    <article id={`cap-${cap.id}`} className="cap" aria-labelledby={`cap-${cap.id}-title`}>
      <div className="cap__copy" data-reveal>
        <p className="cap__index mono">
          {String(index + 1).padStart(2, '0')} <span>/ {String(capabilities.length).padStart(2, '0')}</span>
        </p>
        <h3 id={`cap-${cap.id}-title`} className="cap__title">
          {cap.title}
        </h3>
        <p className="cap__pitch">{cap.pitch}</p>
        <ul className="cap__includes">
          {cap.includes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <Proof proof={cap.proof} />
      </div>
      {inlineVisual && (
        <div className="cap__visual-inline" data-reveal="clip">
          {VISUALS[cap.visual]()}
        </div>
      )}
    </article>
  );
}

/**
 * What I build. Desktop: capabilities scroll on the left while a sticky panel on the right swaps
 * to the matching live visual. Mobile: each capability carries its own visual inline.
 */
export function Capabilities() {
  const wide = useMediaQuery('(min-width: 1024px)');
  const activeId = useActiveSection(IDS, '-45% 0px -50% 0px') ?? IDS[0];
  const activeIndex = Math.max(0, IDS.indexOf(activeId ?? ''));
  const active = capabilities[activeIndex];

  return (
    <section id="capabilities" className="section" aria-labelledby="capabilities-title">
      <div className="container">
        <SectionHead index="01" label="Capabilities" id="capabilities-title" aside={<p className="small">Each one backed by systems running in production today.</p>}>
          What I can <em>build for you</em>.
        </SectionHead>

        <div className="industries" data-reveal>
          <span className="industries__label mono">Built for</span>
          <ul>
            {industries.map((name, i) => (
              <li key={name} style={{ '--i': i } as CSSProperties}>
                {name}
              </li>
            ))}
          </ul>
        </div>

        <div className={`caps ${wide ? 'caps--wide' : ''}`}>
          <div className="caps__list">
            {capabilities.map((cap, i) => (
              <CapabilityBlock key={cap.id} cap={cap} index={i} inlineVisual={!wide} />
            ))}
          </div>

          {wide && active && (
            <aside className="caps__stage" aria-label="Live illustration of the capability in view">
              <div className="caps__progress" aria-hidden="true">
                {capabilities.map((c, i) => (
                  <span key={c.id} className={i <= activeIndex ? 'is-on' : ''} />
                ))}
              </div>
              <div className="caps__stage-head mono">
                <span>{String(activeIndex + 1).padStart(2, '0')}</span>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={active.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: EASE }}
                  >
                    {active.title}
                  </motion.span>
                </AnimatePresence>
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active.visual}
                  className="caps__visual"
                  initial={{ opacity: 0, y: 24, scale: 0.98, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -16, scale: 0.98, filter: 'blur(6px)' }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  {VISUALS[active.visual]()}
                </motion.div>
              </AnimatePresence>
            </aside>
          )}
        </div>
      </div>
    </section>
  );
}
