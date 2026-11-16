import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { profile } from '../content';
import { useMagnetic } from '../hooks';
import { cssVars } from '../lib/style';
import { HexField } from './HexField';
import { ArrowRightIcon } from './Icons';

const LINES = [
  ['I', 'build', 'the', 'backends'],
  ['that', 'move', 'money.'],
];
const ACCENT = new Set(['move', 'money.']);
const HEADLINE_TEXT = LINES.flat().join(' ');

// Each word rises out of its own mask, staggered by its position in the whole headline.
let wordIndex = 0;
const HEADLINE = LINES.map((line) => line.map((text) => ({ text, accent: ACCENT.has(text), index: wordIndex++ })));

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

        <h1 id="hero-title" className="hero__title" aria-label={HEADLINE_TEXT}>
          {HEADLINE.map((line) => (
            <span key={line[0]?.index} className="hero__line" aria-hidden="true">
              {line.map((word) => (
                <span key={word.index} className="word">
                  <span className={word.accent ? 'word__inner is-accent' : 'word__inner'} style={cssVars({ '--i': word.index })}>
                    {word.text}
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
            <p>{profile.current}</p>
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
