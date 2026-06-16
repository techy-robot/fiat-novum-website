"use client";

import React from "react";

export type ElementSize = {
  width: number;
  height: number;
};

/**
 * Track the rendered size of an element using ResizeObserver.
 * The hook starts at zero and updates once the element mounts and resizes.
 */
export function useElementSize<T extends HTMLElement>(ref: React.RefObject<T | null>) {
  const [size, setSize] = React.useState<ElementSize>({ width: 0, height: 0 });

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };

    updateSize();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, [ref]);

  return size;
}