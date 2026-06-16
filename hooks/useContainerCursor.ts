"use client";

import React from "react";
import { CursorState } from "@/lib/starGame";

/**
 * Track pointer coordinates relative to a container, adjusting dynamically for window scroll.
 * Attaches to a container to drive local cursor effects and entrance/exit states.
 */
export function useContainerCursor() {
  const [cursor, setCursor] = React.useState<CursorState>({ x: 0, y: 0, inside: false });
  
  // Keep a mutable ref to the container element and last screen coordinates
  // to recalculate positions during scroll events without re-binding listeners.
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const lastClientCoords = React.useRef<{ clientX: number; clientY: number }>({ clientX: 0, clientY: 0 });

  const updateCoordinates = React.useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    setCursor({
      x: clientX - rect.left,
      y: clientY - rect.top,
      inside: true,
    });
  }, []);

  const onPointerMove = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    // Dynamically capture the element reference if not already set
    if (!containerRef.current) {
      containerRef.current = event.currentTarget;
    }
    
    lastClientCoords.current = { clientX: event.clientX, clientY: event.clientY };
    updateCoordinates(event.clientX, event.clientY);
  }, [updateCoordinates]);

  const onPointerLeave = React.useCallback(() => {
    containerRef.current = null;
    setCursor((prev) => ({ ...prev, inside: false }));
  }, []);

  // Listen to window scroll events to recalculate the element's bounding rect
  // when the page moves underneath a stationary cursor.
  React.useEffect(() => {
    const handleScroll = () => {
      if (cursor.inside && containerRef.current) {
        updateCoordinates(lastClientCoords.current.clientX, lastClientCoords.current.clientY);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [cursor.inside, updateCoordinates]);

  return { cursor, onPointerMove, onPointerLeave } as const;
}