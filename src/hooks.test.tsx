import { act, renderHook } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useBodyScrollLock, useDismiss, useLocalTime, useLoop, useMediaQuery } from './hooks';
import { setMediaMatches } from './test/setup';

describe('useLoop', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('starts on the last step, so static renders show the finished state', () => {
    const { result } = renderHook(() => useLoop(4, false, 100, 500));
    expect(result.current).toBe(3);
    act(() => vi.advanceTimersByTime(5_000));
    expect(result.current).toBe(3);
  });

  it('steps through, holds on the last step, then loops', () => {
    const { result } = renderHook(() => useLoop(3, true, 100, 500));
    expect(result.current).toBe(0);
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe(1);
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe(2);
    act(() => vi.advanceTimersByTime(499));
    expect(result.current).toBe(2);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(0);
  });

  it('stays still for reduced motion', () => {
    setMediaMatches((q) => q.includes('reduce'));
    const { result } = renderHook(() => useLoop(3, true, 100, 500));
    act(() => vi.advanceTimersByTime(1_000));
    expect(result.current).toBe(2);
  });

  it('stops ticking on unmount', () => {
    const { unmount } = renderHook(() => useLoop(3, true, 100, 500));
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('useBodyScrollLock', () => {
  it('locks page scroll while active', () => {
    const { rerender } = renderHook(({ active }) => useBodyScrollLock(active), { initialProps: { active: false } });
    expect(document.body.style.overflow).toBe('');
    rerender({ active: true });
    expect(document.body.style.overflow).toBe('hidden');
    rerender({ active: false });
    expect(document.body.style.overflow).toBe('');
  });

  it('keeps the page locked until the last overlay closes', () => {
    const menu = renderHook(() => useBodyScrollLock(true));
    const palette = renderHook(() => useBodyScrollLock(true));
    menu.unmount();
    expect(document.body.style.overflow).toBe('hidden');
    palette.unmount();
    expect(document.body.style.overflow).toBe('');
  });
});

describe('useDismiss', () => {
  const pointerDown = (target: EventTarget) => target.dispatchEvent(new Event('pointerdown', { bubbles: true }));

  it('reports Escape while active', () => {
    const onDismiss = vi.fn();
    renderHook(() => useDismiss(true, onDismiss));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledWith('escape');
  });

  it('reports presses outside the element, not inside it', () => {
    const inside = document.createElement('div');
    const outside = document.createElement('div');
    document.body.append(inside, outside);
    const ref = createRef<HTMLElement>();
    ref.current = inside;
    const onDismiss = vi.fn();
    renderHook(() => useDismiss(true, onDismiss, ref));

    pointerDown(inside);
    expect(onDismiss).not.toHaveBeenCalled();
    pointerDown(outside);
    expect(onDismiss).toHaveBeenCalledWith('outside');

    inside.remove();
    outside.remove();
  });

  it('ignores outside presses when no element is given', () => {
    const onDismiss = vi.fn();
    renderHook(() => useDismiss(true, onDismiss));
    pointerDown(document.body);
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('does nothing while inactive', () => {
    const onDismiss = vi.fn();
    renderHook(() => useDismiss(false, onDismiss));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('always calls the latest handler', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(({ handler }) => useDismiss(true, handler), { initialProps: { handler: first } });
    rerender({ handler: second });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
  });
});

describe('useLocalTime', () => {
  afterEach(() => vi.useRealTimers());

  it('shows the time in the given zone and keeps it current', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-01T09:05:00Z'));
    const { result } = renderHook(() => useLocalTime('Europe/Vilnius'));
    expect(result.current).toBe('12:05'); // UTC+3 in summer

    act(() => vi.advanceTimersByTime(60_000));
    expect(result.current).toBe('12:06');
  });
});

describe('useMediaQuery', () => {
  it('returns the current match', () => {
    setMediaMatches((q) => q === '(min-width: 1024px)');
    expect(renderHook(() => useMediaQuery('(min-width: 1024px)')).result.current).toBe(true);
    expect(renderHook(() => useMediaQuery('(min-width: 2000px)')).result.current).toBe(false);
  });
});
