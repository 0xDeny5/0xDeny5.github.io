import { describe, expect, it, vi } from 'vitest';
import { COMMANDS, filterCommands } from './commands';
import { capabilities, capabilityAnchor, channels, profile, sections } from './content';

const byId = (id: string) => {
  const cmd = COMMANDS.find((c) => c.id === id);
  if (!cmd) throw new Error(`no command "${id}"`);
  return cmd;
};

describe('COMMANDS', () => {
  it('have unique ids (they become DOM ids in the palette)', () => {
    const ids = COMMANDS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('navigate to every section and every capability', () => {
    const targets = COMMANDS.filter((c) => c.group === 'Navigate').map((c) => c.id);
    expect(targets).toEqual(expect.arrayContaining(['top', ...sections.map((s) => s.id), ...capabilities.map((c) => capabilityAnchor(c.id))]));
  });

  it('are grouped contiguously, so each group heading is shown once', () => {
    const groups = COMMANDS.map((c) => c.group).filter((g, i, all) => g !== all[i - 1]);
    expect(groups).toEqual(['Navigate', 'Actions', 'Elsewhere']);
  });

  it('list each capability right after the Capabilities section', () => {
    const start = COMMANDS.findIndex((c) => c.id === 'capabilities');
    expect(COMMANDS.slice(start + 1, start + 1 + capabilities.length).map((c) => c.id)).toEqual(
      capabilities.map((c) => capabilityAnchor(c.id)),
    );
  });

  it('scroll to the target section', () => {
    const target = document.createElement('section');
    target.id = 'guarantees';
    document.body.append(target);
    const scroll = vi.spyOn(target, 'scrollIntoView');

    byId('guarantees').run();

    expect(scroll).toHaveBeenCalledWith({ behavior: 'smooth' });
    target.remove();
  });

  it('open every channel in a new tab without an opener', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    for (const channel of channels) byId(channel.id).run();
    expect(open.mock.calls).toEqual(channels.map((c) => [c.href, '_blank', 'noopener,noreferrer']));
  });

  it('copy the email address', () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    byId('copy-email').run();
    expect(writeText).toHaveBeenCalledWith(profile.email);
    Reflect.deleteProperty(navigator, 'clipboard');
  });

  it('toggle the theme', () => {
    document.documentElement.dataset.theme = 'light';
    byId('theme').run();
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});

describe('filterCommands', () => {
  it('returns everything for an empty or blank query', () => {
    expect(filterCommands(COMMANDS, '')).toBe(COMMANDS);
    expect(filterCommands(COMMANDS, '   ')).toBe(COMMANDS);
  });

  it('matches labels case-insensitively', () => {
    expect(filterCommands(COMMANDS, 'CUSTODY').map((c) => c.id)).toEqual([capabilityAnchor('custody')]);
  });

  it('matches hints and group names', () => {
    expect(filterCommands(COMMANDS, '@OxDeny5').map((c) => c.id)).toEqual(['telegram']);
    expect(filterCommands(COMMANDS, 'elsewhere').map((c) => c.id)).toEqual(channels.map((c) => c.id));
  });

  it('matches section blurbs', () => {
    expect(filterCommands(COMMANDS, 'idempotency').map((c) => c.id)).toEqual(['guarantees']);
  });

  it('returns nothing when no command matches', () => {
    expect(filterCommands(COMMANDS, 'zzz')).toEqual([]);
  });
});
