"use client";

import { useMemo, useState } from "react";
import { MAX_SPACER_HEIGHT } from "./VirtualList";

type IndexedVirtualListProps = {
  itemCount: number;
  itemHeight: number;
  height: number;
  overscan?: number;
  className?: string;
  renderItem: (index: number, style: React.CSSProperties) => React.ReactNode;
};

export default function IndexedVirtualList({
  itemCount,
  itemHeight,
  height,
  overscan = 5,
  className,
  renderItem,
}: IndexedVirtualListProps) {
  const [scrollTop, setScrollTop] = useState(0);

  const naturalHeight = itemCount * itemHeight;
  const spacerHeight = Math.min(naturalHeight, MAX_SPACER_HEIGHT);

  const maxScrollTop = Math.max(spacerHeight - height, 1);
  const maxActualScroll = Math.max(naturalHeight - height, 1);
  const scrollScale = maxScrollTop / maxActualScroll;

  const topItem = Math.floor(scrollTop / scrollScale / itemHeight);
  const startIndex = Math.max(topItem - overscan, 0);

  const visibleCount = Math.ceil(height / itemHeight) + overscan * 2;
  const endIndex = Math.min(itemCount, startIndex + visibleCount);

  const itemsAboveViewport = topItem - startIndex;
  const translateY = scrollTop - itemsAboveViewport * itemHeight;

  const visibleIndexes = useMemo(() => {
    const count = endIndex - startIndex;
    return Array.from({ length: count }, (_, i) => startIndex + i);
  }, [startIndex, endIndex]);

  return (
    <div
      className={className}
      style={{ height, overflowY: "auto" }}
      onScroll={(e) =>
        setScrollTop(Math.min(e.currentTarget.scrollTop, maxScrollTop))
      }
    >
      <div style={{ height: spacerHeight }}>
        <div style={{ transform: `translateY(${translateY}px)` }}>
          {visibleIndexes.map((index) => (
            <div key={index} style={{ height: itemHeight }}>
              {renderItem(index, { height: itemHeight })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
