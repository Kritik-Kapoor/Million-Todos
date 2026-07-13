import { useCallback, useEffect, useRef } from "react";

export function useThrottledFlush<T>(
  onFlush: (items: T[]) => void,
  intervalMs = 200,
) {
  const bufferRef = useRef<T[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onFlushRef = useRef(onFlush);
  useEffect(() => {
    onFlushRef.current = onFlush;
  }, [onFlush]);

  const scheduleFlush = useCallback(() => {
    if (timerRef.current !== null) return;
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      const items = bufferRef.current;
      if (items.length === 0) return;
      bufferRef.current = [];
      onFlushRef.current(items);
    }, intervalMs);
  }, [intervalMs]);

  const push = useCallback(
    (items: T[]) => {
      if (items.length === 0) return;
      bufferRef.current.push(...items);
      scheduleFlush();
    },
    [scheduleFlush],
  );

  const flush = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const items = bufferRef.current;
    if (items.length === 0) return;
    bufferRef.current = [];
    onFlushRef.current(items);
  }, []);

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    bufferRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clear();
    };
  }, [clear]);

  return { push, flush, clear };
}
