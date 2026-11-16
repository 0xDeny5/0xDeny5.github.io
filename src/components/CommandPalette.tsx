import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { COMMANDS, filterCommands, type Command } from '../commands';
import { useBodyScrollLock } from '../hooks';
import { EASE } from '../lib/motion';
import { SearchIcon } from './Icons';

/** Delay before running a command, so the dialog closes (and page scroll unlocks) first. */
const RUN_DELAY_MS = 60;

const optionId = (cmd: Command) => `cmd-${cmd.id}`;

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  return <AnimatePresence>{open && <PaletteDialog onClose={onClose} />}</AnimatePresence>;
}

/** Mounted only while open, so query and selection start fresh every time. */
function PaletteDialog({ onClose }: Pick<CommandPaletteProps, 'onClose'>) {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => filterCommands(COMMANDS, query), [query]);
  const selected = results[index];

  useBodyScrollLock(true);

  // The input autofocuses on mount; remember what had focus before, so closing restores it.
  useEffect(() => {
    const previous = document.activeElement;
    const returnFocus = previous instanceof HTMLElement && previous !== inputRef.current ? previous : null;
    return () => returnFocus?.focus();
  }, []);

  // Keep the keyboard-selected option visible in the scrollable list.
  useEffect(() => {
    if (selected) document.getElementById(optionId(selected))?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  const run = (cmd: Command | undefined) => {
    if (!cmd) return;
    onClose();
    window.setTimeout(cmd.run, RUN_DELAY_MS);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const count = Math.max(results.length, 1);
    switch (e.key) {
      case 'ArrowDown':
        setIndex((i) => (i + 1) % count);
        break;
      case 'ArrowUp':
        setIndex((i) => (i - 1 + count) % count);
        break;
      case 'Enter':
        run(selected);
        break;
      case 'Escape':
        onClose();
        break;
      case 'Tab':
        break; // keep focus inside the dialog
      default:
        return;
    }
    e.preventDefault();
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
        transition={{ duration: 0.18, ease: EASE }}
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
            aria-activedescendant={selected ? optionId(selected) : undefined}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd>esc</kbd>
        </div>
        <ul id="palette-list" className="palette__list" role="listbox">
          {results.length === 0 && <li className="palette__empty mono">No matches. Try “email” or “custody”.</li>}
          {results.map((cmd, i) => (
            <li key={cmd.id} role="presentation">
              {results[i - 1]?.group !== cmd.group && <p className="palette__group mono">{cmd.group}</p>}
              <div
                id={optionId(cmd)}
                role="option"
                aria-selected={i === index}
                className="palette__item"
                onMouseMove={() => setIndex(i)}
                onClick={() => run(cmd)}
              >
                <span>{cmd.label}</span>
                {cmd.hint && <span className="palette__hint mono">{cmd.hint}</span>}
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
