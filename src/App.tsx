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
import { resolveShortcut } from './lib/shortcuts';
import { toggleTheme } from './theme';

export function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  useRevealOnScroll();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (resolveShortcut(e)) {
        case 'toggle-palette':
          e.preventDefault();
          setPaletteOpen((open) => !open);
          break;
        case 'open-palette':
          e.preventDefault();
          setPaletteOpen(true);
          break;
        case 'toggle-theme':
          toggleTheme();
          break;
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
