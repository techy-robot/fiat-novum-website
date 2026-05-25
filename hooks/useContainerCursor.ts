"use client";

import React from "react";
import { CursorState } from "@/lib/starGame";

/**
 * Track pointer coordinates relative to a container
 * This hook is for any container that wants the local cursor position to drive
 * effects or entrance/exit state.
 */
export function useContainerCursor() {
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
