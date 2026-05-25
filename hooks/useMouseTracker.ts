"use client";

import React from "react";
import { CursorState } from "@/lib/starGame";

/**
 * Track pointer coordinates relative to a glow surface.
 * This sits in `hooks/` with the other reusable star-game hooks because it
 * captures interactive state, while `lib/starGame.tsx` keeps the pure helpers.
 */
export function useMouseTracker() {
  const [cursor, setCursor] = React.useState<CursorState>({ x: 0, y: 0, inside: false });

  const onPointerMove = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    // Convert viewport coordinates into surface-local coordinates.
    const rect = event.currentTarget.getBoundingClientRect();

    setCursor({ x: event.clientX - rect.left, y: event.clientY - rect.top, inside: true });
  }, []);

  const onPointerLeave = React.useCallback(() => {
    setCursor((prev) => ({ ...prev, inside: false }));
  }, []);

  return { cursor, onPointerMove, onPointerLeave } as const;
}
