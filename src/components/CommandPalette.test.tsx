import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CommandPalette } from './CommandPalette';

const input = () => screen.getByRole('combobox');
const selected = () => screen.getAllByRole('option').find((o) => o.getAttribute('aria-selected') === 'true');

describe('CommandPalette', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('renders nothing while closed', () => {
    render(<CommandPalette open={false} onClose={() => {}} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens focused on the search, with the first command selected, and locks page scroll', () => {
    render(<CommandPalette open onClose={() => {}} />);
    expect(document.activeElement).toBe(input());
    expect(selected()?.textContent).toContain('Home');
    expect(input().getAttribute('aria-activedescendant')).toBe(selected()?.id);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('filters as you type and says when nothing matches', () => {
    render(<CommandPalette open onClose={() => {}} />);
    fireEvent.change(input(), { target: { value: 'telegram' } });
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Telegram@OxDeny5']);

    fireEvent.change(input(), { target: { value: 'zzz' } });
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(screen.getByText(/No matches/)).toBeTruthy();
  });

  it('moves the selection with the arrow keys and wraps around', () => {
    render(<CommandPalette open onClose={() => {}} />);
    const options = screen.getAllByRole('option');
    fireEvent.keyDown(input(), { key: 'ArrowDown' });
    expect(selected()).toBe(options[1]);
    fireEvent.keyDown(input(), { key: 'ArrowUp' });
    fireEvent.keyDown(input(), { key: 'ArrowUp' });
    expect(selected()).toBe(options.at(-1));
  });

  it('runs the selected command on Enter after closing', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    const onClose = vi.fn();
    render(<CommandPalette open onClose={onClose} />);

    fireEvent.change(input(), { target: { value: 'github' } });
    fireEvent.keyDown(input(), { key: 'Enter' });

    expect(onClose).toHaveBeenCalledOnce();
    expect(open).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(open).toHaveBeenCalledWith('https://github.com/0xDeny5', '_blank', 'noopener,noreferrer');
  });

  it('closes on Escape and on a click on the backdrop', () => {
    const onClose = vi.fn();
    render(<CommandPalette open onClose={onClose} />);
    fireEvent.keyDown(input(), { key: 'Escape' });
    fireEvent.mouseDown(screen.getByRole('dialog').parentElement as HTMLElement);
    fireEvent.mouseDown(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('keeps focus inside on Tab', () => {
    render(<CommandPalette open onClose={() => {}} />);
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    input().dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });
});
