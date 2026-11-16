import { capabilities, capabilityAnchor, channels, links, profile, sections, type SectionId } from './content';
import { copyText, scrollToId } from './lib/dom';
import { toggleTheme } from './theme';

export type CommandGroup = 'Navigate' | 'Actions' | 'Elsewhere';

export interface Command {
  id: string;
  group: CommandGroup;
  label: string;
  hint?: string;
  run: () => void;
}

const navigate = (id: string, label: string): Command => ({ id, group: 'Navigate', label, run: () => scrollToId(id) });

/** Deep links listed right after their section. */
const SUBSECTIONS: Partial<Record<SectionId, Command[]>> = {
  capabilities: capabilities.map((cap) => navigate(capabilityAnchor(cap.id), cap.title)),
};

/** Everything the command palette can do, grouped and in display order. */
export const COMMANDS: readonly Command[] = [
  navigate('top', 'Home'),
  ...sections.flatMap((s) => [navigate(s.id, s.blurb ? `${s.label} — ${s.blurb}` : s.label), ...(SUBSECTIONS[s.id] ?? [])]),
  {
    id: 'copy-email',
    group: 'Actions',
    label: 'Copy email address',
    hint: profile.email,
    run: () => void copyText(profile.email),
  },
  { id: 'email', group: 'Actions', label: 'Write an email', run: () => window.location.assign(links.email) },
  { id: 'theme', group: 'Actions', label: 'Toggle light / dark theme', hint: 'T', run: () => toggleTheme() },
  ...channels.map(
    (c): Command => ({
      id: c.id,
      group: 'Elsewhere',
      label: c.label,
      hint: c.handle,
      run: () => window.open(c.href, '_blank', 'noopener,noreferrer'),
    }),
  ),
];

/** Case-insensitive substring match on label, group and hint. An empty query returns everything. */
export function filterCommands(commands: readonly Command[], query: string): readonly Command[] {
  const q = query.trim().toLowerCase();
  if (!q) return commands;
  return commands.filter((c) => `${c.label} ${c.group} ${c.hint ?? ''}`.toLowerCase().includes(q));
}
