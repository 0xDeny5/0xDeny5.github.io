import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { links, profile } from '../content';
import { toggleTheme } from '../theme';
import { SearchIcon } from './Icons';

interface Command {
  id: string;
  group: 'Navigate' | 'Actions' | 'Elsewhere';
  label: string;
  hint?: string;
  run: () => void;
}

const go = (id: string) => () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
const open = (href: string) => () => window.open(href, '_blank', 'noopener,noreferrer');

const COMMANDS: Command[] = [
  { id: 'top', group: 'Navigate', label: 'Home', run: go('top') },
  { id: 'capabilities', group: 'Navigate', label: 'Capabilities — what I build', run: go('capabilities') },
  { id: 'cap-banking', group: 'Navigate', label: 'Core banking & FinTech', run: go('cap-banking') },
  { id: 'cap-payments', group: 'Navigate', label: 'Payment integrations', run: go('cap-payments') },
  { id: 'cap-custody', group: 'Navigate', label: 'Custody & key management', run: go('cap-custody') },
  { id: 'cap-chains', group: 'Navigate', label: 'Blockchain & DeFi', run: go('cap-chains') },
  { id: 'cap-contracts', group: 'Navigate', label: 'Smart contracts (Solidity / Rust)', run: go('cap-contracts') },
  { id: 'cap-highload', group: 'Navigate', label: 'High-load systems', run: go('cap-highload') },
  { id: 'guarantees', group: 'Navigate', label: 'Guarantees — idempotency, ACID, sagas', run: go('guarantees') },
  { id: 'approach', group: 'Navigate', label: 'Approach', run: go('approach') },
  { id: 'toolbox', group: 'Navigate', label: 'Toolbox', run: go('toolbox') },
  { id: 'contact', group: 'Navigate', label: 'Contact', run: go('contact') },
  {
    id: 'copy-email',
    group: 'Actions',
    label: 'Copy email address',
    hint: profile.email,
    run: () => void navigator.clipboard?.writeText(profile.email),
  },
  { id: 'email', group: 'Actions', label: 'Write an email', run: () => (window.location.href = links.email) },
  { id: 'theme', group: 'Actions', label: 'Toggle light / dark theme', hint: 'T', run: () => toggleTheme() },
  { id: 'github', group: 'Elsewhere', label: 'GitHub', hint: '0xDeny5', run: open(links.github) },
  { id: 'linkedin', group: 'Elsewhere', label: 'LinkedIn', run: open(links.linkedin) },
  { id: 'telegram', group: 'Elsewhere', label: 'Telegram', hint: '@OxDeny5', run: open(links.telegram) },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

/** Mounted only while open, so query and selection start fresh every time. */
function PaletteBody({ onClose }: Pick<Props, 'onClose'>) {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? COMMANDS.filter((c) => `${c.label} ${c.group} ${c.hint ?? ''}`.toLowerCase().includes(q)) : COMMANDS;
  }, [query]);

  useEffect(() => {
    // The input autofocuses on mount; remember what had focus so closing restores it.
    const returnFocus = document.activeElement !== inputRef.current ? (document.activeElement as HTMLElement | null) : null;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      returnFocus?.focus();
    };
  }, []);

  // Keep the keyboard-selected option visible in the scrollable list.
  useEffect(() => {
    document.getElementById(`cmd-${results[index]?.id ?? ''}`)?.scrollIntoView({ block: 'nearest' });
  }, [index, results]);

  const run = (cmd: Command | undefined) => {
    if (!cmd) return;
    onClose();
    // Let the dialog close (and body scroll unlock) before scrolling or navigating.
    window.setTimeout(cmd.run, 60);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const n = Math.max(results.length, 1);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndex((i) => (i + 1) % n);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndex((i) => (i - 1 + n) % n);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(results[index]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'Tab') {
      e.preventDefault(); // keep focus inside the dialog
    }
  };

  return (
    <motion.div
      className="palette"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="palette__box"
        role="dialog"
        aria-modal="true"
        aria-label="Command menu"
        initial={{ opacity: 0, y: -12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.18, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <div className="palette__search">
          <SearchIcon width={18} height={18} />
          <input
            ref={inputRef}
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Jump to a section, copy email, open GitHub…"
            aria-label="Search commands"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={results[index] ? `cmd-${results[index].id}` : undefined}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd>esc</kbd>
        </div>
        <ul id="palette-list" className="palette__list" role="listbox">
          {results.length === 0 && <li className="palette__empty mono">No matches. Try “email” or “work”.</li>}
          {results.map((c, i) => (
            <li key={c.id} role="presentation">
              {(i === 0 || results[i - 1]?.group !== c.group) && <p className="palette__group mono">{c.group}</p>}
              <div
                id={`cmd-${c.id}`}
                role="option"
                aria-selected={i === index}
                className="palette__item"
                onMouseMove={() => setIndex(i)}
                onClick={() => run(c)}
              >
                <span>{c.label}</span>
                {c.hint && <span className="palette__hint mono">{c.hint}</span>}
              </div>
            </li>
          ))}
        </ul>
        <div className="palette__foot mono">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> navigate
          </span>
          <span>
            <kbd>↵</kbd> select
          </span>
          <span>
            <kbd>T</kbd> theme
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function CommandPalette({ open: isOpen, onClose }: Props) {
  return <AnimatePresence>{isOpen && <PaletteBody onClose={onClose} />}</AnimatePresence>;
}
