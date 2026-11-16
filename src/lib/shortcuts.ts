import { isTypingTarget } from './dom';

export type Shortcut = 'toggle-palette' | 'open-palette' | 'toggle-theme';

type KeyInput = Pick<KeyboardEvent, 'key' | 'metaKey' | 'ctrlKey' | 'altKey' | 'target'>;

/**
 * Global keyboard shortcuts: ⌘/Ctrl+K toggles the command palette anywhere; `/` opens it and `t`
 * toggles the theme, but only when no modifier is held and the user isn't typing in a field.
 */
export function resolveShortcut(e: KeyInput): Shortcut | null {
  const mod = e.metaKey || e.ctrlKey;
  const key = e.key.toLowerCase();
  if (mod && key === 'k') return 'toggle-palette';
  if (mod || e.altKey || isTypingTarget(e.target)) return null;
  if (key === '/') return 'open-palette';
  if (key === 't') return 'toggle-theme';
  return null;
}
