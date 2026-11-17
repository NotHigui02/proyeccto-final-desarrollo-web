import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebounce } from '../src/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('retrasa la actualización del valor', () => {
    const { result, rerender } = renderHook(({ valor }) => useDebounce(valor, 300), {
      initialProps: { valor: 'a' },
    });

    expect(result.current).toBe('a');
    rerender({ valor: 'b' });
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('b');
  });
});
