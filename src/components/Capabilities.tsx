import { AnimatePresence, motion } from 'motion/react';
import type { ComponentType } from 'react';
import { capabilities, capabilityAnchor, industries, type Capability, type VisualId } from '../content';
import { useActiveSection, useMediaQuery, useScramble } from '../hooks';
import { pad } from '../lib/format';
import { EASE } from '../lib/motion';
import { cssVars } from '../lib/style';
import { Section } from './Section';
import { CodeViz } from './visuals/CodeViz';
import { CustodyViz } from './visuals/CustodyViz';
import { LedgerViz } from './visuals/LedgerViz';
import { PaymentFlow } from './visuals/PaymentFlow';
import { SwapViz } from './visuals/SwapViz';
import { ThroughputViz } from './visuals/ThroughputViz';

const VISUALS: Record<VisualId, ComponentType> = {
  ledger: LedgerViz,
  payment: PaymentFlow,
  custody: CustodyViz,
  swap: SwapViz,
  contracts: CodeViz,
  throughput: ThroughputViz,
};

const ANCHORS = capabilities.map((c) => capabilityAnchor(c.id));
const TOTAL = pad(capabilities.length);
const DIGIT_SCRAMBLE = { duration: 1100, glyphs: '0123456789', only: /\d/ };

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

interface CapabilityBlockProps {
  cap: Capability;
  index: number;
  /** Narrow screens have no sticky stage, so each block carries its own visual. */
  inlineVisual: boolean;
}

function CapabilityBlock({ cap, index, inlineVisual }: CapabilityBlockProps) {
  const anchor = capabilityAnchor(cap.id);
  const Visual = VISUALS[cap.visual];
  return (
    <article id={anchor} className="cap" aria-labelledby={`${anchor}-title`}>
      <div className="cap__copy" data-reveal>
        <p className="cap__index mono">
          {pad(index + 1)} <span>/ {TOTAL}</span>
        </p>
        <h3 id={`${anchor}-title`} className="cap__title">
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
          <Visual />
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
  const activeAnchor = useActiveSection(ANCHORS, '-45% 0px -50% 0px');
  const activeIndex = Math.max(0, activeAnchor ? ANCHORS.indexOf(activeAnchor) : 0);
  const active = capabilities[activeIndex];
  const ActiveVisual = active && VISUALS[active.visual];

  return (
    <Section
      id="capabilities"
      title={
        <>
          What I can <em>build for you</em>.
        </>
      }
      aside={<p className="small">Each one backed by systems running in production today.</p>}
    >
      <div className="industries" data-reveal>
        <span className="industries__label mono">Built for</span>
        <ul>
          {industries.map((name, i) => (
            <li key={name} style={cssVars({ '--i': i })}>
              {name}
            </li>
          ))}
        </ul>
      </div>

      <div className={wide ? 'caps caps--wide' : 'caps'}>
        <div className="caps__list">
          {capabilities.map((cap, i) => (
            <CapabilityBlock key={cap.id} cap={cap} index={i} inlineVisual={!wide} />
          ))}
        </div>

        {wide && active && ActiveVisual && (
          <aside className="caps__stage" aria-label="Live illustration of the capability in view">
            <div className="caps__progress" aria-hidden="true">
              {capabilities.map((c, i) => (
                <span key={c.id} className={i <= activeIndex ? 'is-on' : undefined} />
              ))}
            </div>
            <div className="caps__stage-head mono">
              <span>{pad(activeIndex + 1)}</span>
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
                <ActiveVisual />
              </motion.div>
            </AnimatePresence>
          </aside>
        )}
      </div>
    </Section>
  );
}
