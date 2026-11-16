import { motion, useMotionValueEvent, useScroll, useSpring } from 'motion/react';
import { useRef, useState } from 'react';
import { approach } from '../content';
import { useMediaQuery } from '../hooks';
import { SectionHead } from './SectionHead';

/**
 * How I work, as a pipeline. The connecting line draws itself with scroll progress and each
 * step lights up as the line reaches it.
 */
export function Approach() {
  const trackRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start 80%', 'end 45%'] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });
  const [reached, setReached] = useState(-1);
  const wide = useMediaQuery('(min-width: 960px)');

  useMotionValueEvent(progress, 'change', (p) => {
    const next = Math.floor(p * (approach.length - 1) + 0.02);
    setReached((prev) => (prev === next ? prev : next));
  });

  return (
    <section id="approach" className="section" aria-labelledby="approach-title">
      <div className="container">
        <SectionHead
          index="03"
          label="Approach"
          id="approach-title"
          aside={
            <p className="small">
              Shift-left by default: quality and security are designed in from the first commit, not inspected in before
              release.
            </p>
          }
        >
          How I build systems that <em>hold money</em>.
        </SectionHead>

        <ol className="approach" ref={trackRef}>
          <span className="approach__track" aria-hidden="true">
            <motion.span className="approach__line" style={wide ? { scaleX: progress } : { scaleY: progress }} />
          </span>
          {approach.map((step, i) => (
            <li key={step.title} className={`approach__step ${i <= reached ? 'is-reached' : ''}`}>
              <span className="approach__node" aria-hidden="true" />
              <span className="approach__no mono">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="approach__title">{step.title}</h3>
              <p className="approach__body">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
