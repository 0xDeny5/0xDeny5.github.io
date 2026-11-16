import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { profile } from '../content';
import { Contact } from './Contact';

const emailButton = () => screen.getByRole('button', { name: profile.email });

describe('Contact email menu', () => {
  it('opens with web mail options that compose to the address', () => {
    render(<Contact />);
    fireEvent.click(emailButton());

    expect(emailButton().getAttribute('aria-expanded')).toBe('true');
    const gmail = screen.getByRole('menuitem', { name: /gmail/i });
    expect(gmail.getAttribute('href')).toContain(`to=${encodeURIComponent(profile.email)}`);
    expect(gmail.getAttribute('target')).toBe('_blank');
    expect(screen.getByRole('menuitem', { name: /mail app/i }).getAttribute('href')).toBe(`mailto:${profile.email}`);
  });

  it('opens below the address when there is room', () => {
    render(<Contact />);
    vi.spyOn(emailButton(), 'getBoundingClientRect').mockReturnValue({ top: 200, bottom: 260 } as DOMRect);
    fireEvent.click(emailButton());
    expect(screen.getByRole('menu').classList.contains('compose--above')).toBe(false);
  });

  it('opens above the address near the bottom of the screen', () => {
    render(<Contact />);
    vi.spyOn(emailButton(), 'getBoundingClientRect').mockReturnValue({ top: window.innerHeight - 90, bottom: window.innerHeight - 30 } as DOMRect);
    fireEvent.click(emailButton());
    expect(screen.getByRole('menu').classList.contains('compose--above')).toBe(true);
  });

  it('closes on Escape and returns focus to the address', async () => {
    render(<Contact />);
    fireEvent.click(emailButton());
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(emailButton().getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(emailButton());
  });

  it('closes on a press outside', () => {
    render(<Contact />);
    fireEvent.click(emailButton());
    fireEvent.pointerDown(document.body);
    expect(emailButton().getAttribute('aria-expanded')).toBe('false');
  });

  it('copies the address and confirms it', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    render(<Contact />);

    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Copy email address' })));

    expect(writeText).toHaveBeenCalledWith(profile.email);
    expect(screen.getByText('Copied to clipboard')).toBeTruthy();
    Reflect.deleteProperty(navigator, 'clipboard');
  });
});
