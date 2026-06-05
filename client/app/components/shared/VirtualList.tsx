"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/react/sortable";

// Limit the spacer height to 15 million pixels to avoid browser issues
const MAX_SPACER_HEIGHT = 15_000_000;

// ─── SortableItemWrapper ────────────────────────────────────────────────────
// Thin wrapper that calls useSortable with the item's *real* array index.
// renderItem is responsible for attaching the drag handle ref itself — we
// expose dragHandleRef via the render prop so callers can wire it up.

// The exact type dnd-kit returns for handleRef — a callback ref, not a RefObject.
export type DragHandleRef = (element: Element | null) => void;

type SortableItemWrapperProps<T> = {
  id: string | number;
  index: number;
  item: T;
  style: React.CSSProperties;
  renderItem: (
    item: T,
    index: number,
    style: React.CSSProperties,
    dragHandleRef: DragHandleRef,
    isDragging: boolean,
  ) => React.ReactNode;
};

function SortableItemWrapper<T>({
  id,
  index,
  item,
  style,
  renderItem,
}: SortableItemWrapperProps<T>) {
  const [element, setElement] = useState<Element | null>(null);
  const { isDragging, handleRef } = useSortable({ id, index, element });

  return (
    <div ref={setElement as React.RefCallback<HTMLDivElement>}>
      {renderItem(item, index, style, handleRef, isDragging)}
    </div>
  );
}

type VirtualListProps<T> = {
  items: T[];
  itemHeight: number;
  height: number;
  overscan?: number;
  className?: string;

  renderItem: (
    item: T,
    index: number,
    style: React.CSSProperties,
    // Only populated when isDraggableList=true; undefined otherwise
    dragHandleRef?: DragHandleRef,
    isDragging?: boolean,
  ) => React.ReactNode;

  isDraggableList?: boolean;
  /**
   * Required when isDraggableList=true.
   * A function that returns a stable unique id for each item.
   * Used by dnd-kit to track items across re-renders & scroll.
   */
  getItemId?: (item: T, index: number) => string | number;
  /**
   * The id of the item currently being dragged (from the parent's
   * onDragStart handler). Pass null / undefined when nothing is dragging.
   * VirtualList uses this to pin the active item inside the render window
   * so it isn't unmounted mid-drag.
   */
  activeId?: string | number | null;
};

export function VirtualList<T>({
  items,
  itemHeight,
  height,
  overscan = 10,
  renderItem,
  className,
  isDraggableList = false,
  getItemId,
  activeId,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);

  const naturalHeight = items.length * itemHeight;
  const spacerHeight = Math.min(naturalHeight, MAX_SPACER_HEIGHT);

  const maxScrollTop = Math.max(spacerHeight - height, 1);
  const maxActualScroll = Math.max(naturalHeight - height, 1);
  const scrollScale = maxScrollTop / maxActualScroll;

  const topItem = Math.floor(scrollTop / scrollScale / itemHeight);
  const startIndex = Math.max(topItem - overscan, 0);

  let renderedCount = Math.floor(height / itemHeight) + 2 * overscan;
  renderedCount = Math.min(renderedCount, items.length - startIndex);

  const itemsAboveViewport = topItem - startIndex;
  const translateY = scrollTop - itemsAboveViewport * itemHeight;

  // ── Pin the active drag item inside the rendered slice ───────────────────
  // If the dragged item has scrolled outside [startIndex, startIndex+renderedCount)
  // we extend the slice to include it, so dnd-kit never loses the DOM node.
  let effectiveStart = startIndex;
  let effectiveCount = renderedCount;

  if (isDraggableList && activeId != null && getItemId) {
    const activeIndex = items.findIndex(
      (item, i) => getItemId(item, i) === activeId,
    );
    if (activeIndex !== -1) {
      if (activeIndex < effectiveStart) {
        const extra = effectiveStart - activeIndex;
        effectiveStart = activeIndex;
        effectiveCount += extra;
      } else if (activeIndex >= effectiveStart + effectiveCount) {
        effectiveCount = activeIndex - effectiveStart + 1;
      }
    }
  }

  const slicedItems = items.slice(
    effectiveStart,
    effectiveStart + effectiveCount,
  );

  return (
    <div
      style={{ height }}
      className={cn("overflow-auto overscroll-contain", className)}
      onScroll={(e) =>
        setScrollTop(Math.min(e.currentTarget.scrollTop, maxScrollTop))
      }
    >
      <div style={{ height: spacerHeight }}>
        <div style={{ transform: `translateY(${translateY}px)` }}>
          {slicedItems.map((item, i) => {
            const realIndex = effectiveStart + i;
            const itemStyle: React.CSSProperties = { height: itemHeight };

            if (isDraggableList && getItemId) {
              const id = getItemId(item, realIndex);
              return (
                <SortableItemWrapper
                  key={id}
                  id={id}
                  index={realIndex}
                  item={item}
                  style={itemStyle}
                  renderItem={renderItem}
                />
              );
            }

            return renderItem(item, realIndex, itemStyle);
          })}
        </div>
      </div>
    </div>
  );
}
