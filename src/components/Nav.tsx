import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { profile } from '../content';
import { useActiveSection, useLocalTime, useScrolled } from '../hooks';
import { toggleTheme } from '../theme';
import { CloseIcon, MenuIcon, MoonIcon, SearchIcon, SunIcon } from './Icons';

const NAV_ITEMS = [
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'guarantees', label: 'Guarantees' },
  { id: 'approach', label: 'Approach' },
  { id: 'toolbox', label: 'Toolbox' },
  { id: 'contact', label: 'Contact' },
] as const;

const SECTION_IDS = NAV_ITEMS.map((i) => i.id);

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

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      <motion.div className="progress" style={{ scaleX: progress }} aria-hidden="true" />
      <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
        <div className="container nav__inner">
          <a href="#top" className="nav__brand" aria-label={`${profile.name} — back to top`}>
            <span className="nav__mark" aria-hidden="true">
              D<em>R</em>
            </span>
            <span className="nav__who">
              <span className="nav__name">{profile.name}</span>
              <span className="nav__clock mono">
                <span className="nav__city">Vilnius </span>
                {time ?? '--:--'}
              </span>
            </span>
          </a>

          <nav aria-label="Primary" className="nav__links">
            {NAV_ITEMS.map((item, i) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={active === item.id ? 'is-active' : undefined}
                aria-current={active === item.id ? 'true' : undefined}
              >
                <span className="nav__no mono">{String(i + 1).padStart(2, '0')}</span>
                {item.label}
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
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                toggleTheme({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
              }}
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
              onClick={() => setMenuOpen((v) => !v)}
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
            transition={{ duration: 0.45, ease: [0.7, 0, 0.2, 1] }}
          >
            <ol>
              {NAV_ITEMS.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05, duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
                >
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => {
                      // Body scroll is locked while the menu is open: close first, then scroll.
                      e.preventDefault();
                      setMenuOpen(false);
                      window.setTimeout(() => {
                        document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                        history.replaceState(null, '', `#${item.id}`);
                      }, 50);
                    }}
                  >
                    <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                    {item.label}
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
