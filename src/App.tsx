import { MotionConfig } from 'motion/react';
import { useEffect, useState } from 'react';
import { Approach } from './components/Approach';
import { Capabilities } from './components/Capabilities';
import { CommandPalette } from './components/CommandPalette';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { Guarantees } from './components/Guarantees';
import { Hero } from './components/Hero';
import { Nav } from './components/Nav';
import { Ticker } from './components/Ticker';
import { Toolbox } from './components/Toolbox';
import { useRevealOnScroll } from './hooks';
import { toggleTheme } from './theme';

function isTyping(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
}

export function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  useRevealOnScroll();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      } else if (!isTyping(e.target) && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (e.key === '/') {
          e.preventDefault();
          setPaletteOpen(true);
        } else if (e.key.toLowerCase() === 't') {
          toggleTheme();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Nav onOpenPalette={() => setPaletteOpen(true)} />
      <main id="main">
        <Hero />
        <Ticker />
        <Capabilities />
        <Guarantees />
        <Approach />
        <Toolbox />
        <Contact />
      </main>
      <Footer />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </MotionConfig>
  );
}
