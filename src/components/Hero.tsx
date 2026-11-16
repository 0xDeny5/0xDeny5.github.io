import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef, type CSSProperties } from 'react';
import { profile } from '../content';
import { useMagnetic } from '../hooks';
import { ArrowRightIcon } from './Icons';
import { HexField } from './HexField';

// Each word rises out of its own mask; `accent` words take the signal colour.
const HEADLINE: { w: string; accent?: boolean }[][] = [
  [{ w: 'I' }, { w: 'build' }, { w: 'the' }, { w: 'backends' }],
  [{ w: 'that' }, { w: 'move', accent: true }, { w: 'money.', accent: true }],
];

export function Hero() {
  const cta = useMagnetic<HTMLAnchorElement>(0.3);
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  // As the hero scrolls away its content drifts slower than the page and fades: a gentle depth cue.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 140]);
  // Fade starts at 25%: motion runs opacity on a native ViewTimeline whose range sits slightly
  // ahead of the JS one, and starting at 0 left the hero ~13% faded while at rest.
  const opacity = useTransform(scrollYProgress, [0.25, 0.9], [1, 0]);
  let wordIndex = 0;

  return (
    <section ref={sectionRef} className="hero" id="top" aria-labelledby="hero-title">
      <HexField />

      <motion.div className="container hero__inner" style={reduceMotion ? undefined : { y, opacity }}>
        <ul className="hero__meta mono">
          <li>{profile.role}</li>
          <li>{profile.location} — remote</li>
          <li className="hero__status">
            <span className="dot" aria-hidden="true" /> {profile.availability}
          </li>
        </ul>

        <h1 id="hero-title" className="hero__title" aria-label="I build the backends that move money.">
          {HEADLINE.map((line, li) => (
            <span key={li} className="hero__line" aria-hidden="true">
              {line.map(({ w, accent }) => (
                <span key={w} className="word">
                  <span className={`word__inner ${accent ? 'is-accent' : ''}`} style={{ '--i': wordIndex++ } as CSSProperties}>
                    {w}
                  </span>
                </span>
              ))}
            </span>
          ))}
        </h1>

        <div className="hero__grid">
          <p className="hero__lede">{profile.lede}</p>

          <div className="hero__now">
            <p className="label mono">Currently</p>
            <p>
              {profile.current}
            </p>
          </div>

          <div className="hero__actions">
            <a ref={cta} className="btn btn--accent" href="#contact">
              <span>Start a conversation</span>
              <ArrowRightIcon width={18} height={18} />
            </a>
          </div>
        </div>
      </motion.div>

      <a className="hero__scroll mono" href="#capabilities" aria-label="Scroll to capabilities">
        <span>Scroll</span>
        <span className="hero__scroll-line" aria-hidden="true" />
      </a>
    </section>
  );
}
