import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react';
import { useState, useSyncExternalStore, type MouseEvent } from 'react';
import { profile, sections } from '../content';
import { useActiveSection, useBodyScrollLock, useDismiss, useLocalTime, useScrolled } from '../hooks';
import { elementCenter, scrollToId } from '../lib/dom';
import { pad } from '../lib/format';
import { EASE, EASE_SWEEP } from '../lib/motion';
import { toggleTheme } from '../theme';
import { CloseIcon, MenuIcon, MoonIcon, SearchIcon, SunIcon } from './Icons';

const SECTION_IDS = sections.map((s) => s.id);

const noopSubscribe = () => () => {};
// Server renders ⌘; after hydration non-Apple platforms switch to Ctrl.
const clientModKey = () => (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? '⌘' : 'Ctrl');

interface NavProps {
  onOpenPalette: () => void;
}

export function Nav({ onOpenPalette }: NavProps) {
  const scrolled = useScrolled();
  const active = useActiveSection(SECTION_IDS);
  const time = useLocalTime(profile.timeZone);
  const [menuOpen, setMenuOpen] = useState(false);
  const modKey = useSyncExternalStore(noopSubscribe, clientModKey, () => '⌘');
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });

  useBodyScrollLock(menuOpen);
  useDismiss(menuOpen, () => setMenuOpen(false));

  // Body scroll is locked while the menu is open: close it first, then scroll.
  const goFromMenu = (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    window.setTimeout(() => {
      scrollToId(id);
      history.replaceState(null, '', `#${id}`);
    }, 50);
  };

  return (
    <>
      <motion.div className="progress" style={{ scaleX: progress }} aria-hidden="true" />
      <header className={scrolled ? 'nav nav--scrolled' : 'nav'}>
        <div className="container nav__inner">
          <a href="#top" className="nav__brand" aria-label={`${profile.name} — back to top`}>
            <span className="nav__mark" aria-hidden="true">
              D<em>R</em>
            </span>
            <span className="nav__who">
              <span className="nav__name">{profile.name}</span>
              <span className="nav__clock mono">
                {profile.city} {time ?? '--:--'}
              </span>
            </span>
          </a>

          <nav aria-label="Primary" className="nav__links">
            {sections.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={active === s.id ? 'is-active' : undefined}
                aria-current={active === s.id ? 'true' : undefined}
              >
                <span className="nav__no mono">{pad(i + 1)}</span>
                {s.label}
              </a>
            ))}
          </nav>

          <div className="nav__tools">
            <button type="button" className="kbd-btn mono" onClick={onOpenPalette} aria-label="Open command menu">
              <SearchIcon width={14} height={14} />
              <span className="kbd-btn__keys">
                <kbd>{modKey}</kbd>
                <kbd>K</kbd>
              </span>
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={(e) => toggleTheme(elementCenter(e.currentTarget))}
              aria-label="Toggle light or dark theme"
            >
              <SunIcon className="theme-icon theme-icon--sun" />
              <MoonIcon className="theme-icon theme-icon--moon" />
            </button>
            <button
              type="button"
              className="icon-btn nav__toggle"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-menu"
            className="mobile-menu"
            aria-label="Mobile"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.45, ease: EASE_SWEEP }}
          >
            <ol>
              {sections.map((s, i) => (
                <motion.li
                  key={s.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05, duration: 0.4, ease: EASE }}
                >
                  <a href={`#${s.id}`} onClick={goFromMenu(s.id)}>
                    <span className="mono">{pad(i + 1)}</span>
                    {s.label}
                  </a>
                </motion.li>
              ))}
            </ol>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
