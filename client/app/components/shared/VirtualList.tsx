"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

//Limit the spacer height to 15 million pixels to avoid browser issues
const MAX_SPACER_HEIGHT = 15_000_000;

type VirtualListProps<T> = {
  items: T[];
  itemHeight: number;
  height: number;
  overscan?: number;
  renderItem: (
    item: T,
    index: number,
    style: React.CSSProperties,
  ) => React.ReactNode;
  className?: string;
};

export function VirtualList<T>({
  items,
  itemHeight,
  height,
  overscan = 10,
  renderItem,
  className,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);

  const naturalHeight = items.length * itemHeight;
  const spacerHeight = Math.min(naturalHeight, MAX_SPACER_HEIGHT);

  // Map the *scroll range* end-to-end, not just the height.
  // This guarantees max scrollTop always corresponds to the very last row.
  // scrollScale = 1 when no compression is needed (short lists).
  const maxScrollTop = Math.max(spacerHeight - height, 1);
  const maxActualScroll = Math.max(naturalHeight - height, 1);
  const scrollScale = maxScrollTop / maxActualScroll;

  // The item that should appear at the very top of the viewport.
  const topItem = Math.floor(scrollTop / scrollScale / itemHeight);

  // Render `overscan` rows above it (clamped so we never go below index 0).
  const startIndex = Math.max(topItem - overscan, 0);

  let renderedCount = Math.floor(height / itemHeight) + 2 * overscan;
  renderedCount = Math.min(renderedCount, items.length - startIndex);

  // Offset between startIndex and topItem — equals `overscan` everywhere except
  // the very top of the list where startIndex has been clamped to 0.
  const itemsAboveViewport = topItem - startIndex;

  // translateY positions the rendered block so topItem lands exactly at
  // scrollTop. When itemsAboveViewport < overscan (near the list top), this
  // produces a negative value — that is intentional and correct. CSS transform
  // can be negative; those rows sit above the spacer origin and are simply
  // clipped by the scroll container. Using Math.max(0, ...) here was the bug:
  // it shifted items away from their correct position whenever scrollTop
  // dropped below (overscan × itemHeight) in the compressed spacer.
  const translateY = scrollTop - itemsAboveViewport * itemHeight;

  return (
    <div
      style={{ height }}
      // overscroll-contain prevents the macOS elastic rubber-band from briefly
      // pushing scrollTop beyond maxScrollTop, which would cause the rendered
      // block to shrink and flash empty space (jitter).
      className={cn("overflow-auto overscroll-contain", className)}
      onScroll={(e) =>
        // Belt-and-suspenders: clamp in case the browser ignores the CSS hint.
        setScrollTop(Math.min(e.currentTarget.scrollTop, maxScrollTop))
      }
    >
      <div style={{ height: spacerHeight }}>
        <div style={{ transform: `translateY(${translateY}px)` }}>
          {items
            .slice(startIndex, startIndex + renderedCount)
            .map((item, i) =>
              renderItem(item, startIndex + i, { height: itemHeight }),
            )}
        </div>
      </div>
    </div>
  );
}
