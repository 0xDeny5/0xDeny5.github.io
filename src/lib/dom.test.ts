import { afterEach, describe, expect, it, vi } from 'vitest';
import { setMediaMatches } from '../test/setup';
import { copyText, elementCenter, isTypingTarget, prefersReducedMotion, shouldOpenAbove } from './dom';

describe('shouldOpenAbove', () => {
  const VIEWPORT = 900;
  const MENU = 230;

  it('opens below when the popup fits under the anchor', () => {
    expect(shouldOpenAbove({ top: 300, bottom: 360 }, VIEWPORT, MENU)).toBe(false);
  });

  it('opens above when the anchor sits near the bottom of the viewport', () => {
    expect(shouldOpenAbove({ top: 750, bottom: 810 }, VIEWPORT, MENU)).toBe(true);
  });

  it('opens above when the anchor is scrolled past the bottom edge', () => {
    expect(shouldOpenAbove({ top: 9647, bottom: 9707 }, VIEWPORT, MENU)).toBe(true);
  });

  it('stays below when neither side fits but there is more room below', () => {
    expect(shouldOpenAbove({ top: 40, bottom: 100 }, 300, MENU)).toBe(false);
  });
});

describe('isTypingTarget', () => {
  it('is true for text fields and editable content', () => {
    const editable = document.createElement('div');
    editable.contentEditable = 'true';
    // jsdom doesn't derive isContentEditable from the attribute.
    Object.defineProperty(editable, 'isContentEditable', { value: true });

    expect(isTypingTarget(document.createElement('input'))).toBe(true);
    expect(isTypingTarget(document.createElement('textarea'))).toBe(true);
    expect(isTypingTarget(document.createElement('select'))).toBe(true);
    expect(isTypingTarget(editable)).toBe(true);
  });

  it('is false for everything else', () => {
    expect(isTypingTarget(document.createElement('button'))).toBe(false);
    expect(isTypingTarget(document.body)).toBe(false);
    expect(isTypingTarget(null)).toBe(false);
    expect(isTypingTarget(window)).toBe(false);
  });
});

describe('elementCenter', () => {
  it('returns the centre of the bounding box', () => {
    const el = document.createElement('button');
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({ left: 100, top: 20, width: 40, height: 30 } as DOMRect);
    expect(elementCenter(el)).toEqual({ x: 120, y: 35 });
  });
});

describe('prefersReducedMotion', () => {
  it('follows the media query', () => {
    expect(prefersReducedMotion()).toBe(false);
    setMediaMatches((q) => q === '(prefers-reduced-motion: reduce)');
    expect(prefersReducedMotion()).toBe(true);
  });
});

describe('copyText', () => {
  const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
  const setClipboard = (value: unknown) => Object.defineProperty(navigator, 'clipboard', { value, configurable: true });

  afterEach(() => {
    if (original) Object.defineProperty(navigator, 'clipboard', original);
    else Reflect.deleteProperty(navigator, 'clipboard');
  });

  it('resolves true once the text is written', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });
    await expect(copyText('hi@example.com')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('hi@example.com');
  });

  it('resolves false when permission is denied', async () => {
    setClipboard({ writeText: vi.fn().mockRejectedValue(new DOMException('denied', 'NotAllowedError')) });
    await expect(copyText('x')).resolves.toBe(false);
  });

  it('resolves false when the Clipboard API is missing', async () => {
    setClipboard(undefined);
    await expect(copyText('x')).resolves.toBe(false);
  });
});
