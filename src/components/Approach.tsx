import { motion, useMotionValueEvent, useScroll, useSpring } from 'motion/react';
import { useRef, useState } from 'react';
import { approach } from '../content';
import { useMediaQuery } from '../hooks';
import { pad } from '../lib/format';
import { Section } from './Section';

/** Index of the last step the drawn line has reached at scroll progress `p` (0…1); -1 before the first. */
export function reachedStep(p: number, steps: number): number {
  // A small lead so a step lights up as the line touches it, not once it has fully passed.
  return Math.min(steps - 1, Math.floor(p * (steps - 1) + 0.02));
}

/**
 * How I work, as a pipeline. The connecting line draws itself with scroll progress and each
 * step lights up as the line reaches it.
 */
export function Approach() {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start 80%', 'end 45%'] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });
  const [reached, setReached] = useState(-1);
  const wide = useMediaQuery('(min-width: 960px)');

  useMotionValueEvent(progress, 'change', (p) => setReached(reachedStep(p, approach.length)));

  return (
    <Section
      id="approach"
      title={
        <>
          How I build systems that <em>hold money</em>.
        </>
      }
      aside={
        <p className="small">
          Shift-left by default: quality and security are designed in from the first commit, not inspected in before release.
        </p>
      }
    >
      <div className="approach" ref={trackRef}>
        <span className="approach__track" aria-hidden="true">
          <motion.span className="approach__line" style={wide ? { scaleX: progress } : { scaleY: progress }} />
        </span>
        <ol className="approach__steps">
          {approach.map((step, i) => (
            <li key={step.title} className={i <= reached ? 'approach__step is-reached' : 'approach__step'}>
              <span className="approach__node" aria-hidden="true" />
              <span className="approach__no mono">{pad(i + 1)}</span>
              <h3 className="approach__title">{step.title}</h3>
              <p className="approach__body">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
