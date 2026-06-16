"use client";

import React from "react";
import type { CursorState } from "@/lib/starGame";

let cursorState: CursorState = { x: 0, y: 0, inside: false };
const listeners = new Set<() => void>();
let listenersAttached = false;

function emit() {
  for (const listener of Array.from(listeners)) {
    listener();
  }
}

function updateCursor(nextCursor: CursorState) {
  if (
    cursorState.x === nextCursor.x &&
    cursorState.y === nextCursor.y &&
    cursorState.inside === nextCursor.inside
  ) {
    return;
  }

  cursorState = nextCursor;
  emit();
}

function clearCursor() {
  updateCursor({ ...cursorState, inside: false });
}

function ensureListeners() {
  if (listenersAttached || typeof window === "undefined") {
    return;
  }

  const handlePointerMove = (event: PointerEvent) => {
    updateCursor({ x: event.clientX, y: event.clientY, inside: true });
  };

  const handlePointerDown = (event: PointerEvent) => {
    updateCursor({ x: event.clientX, y: event.clientY, inside: true });
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState !== "visible") {
      clearCursor();
    }
  };

  const handlePointerOut = (event: MouseEvent) => {
    if (!event.relatedTarget) {
      clearCursor();
    }
  };

  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  window.addEventListener("pointerdown", handlePointerDown, { passive: true });
  window.addEventListener("blur", clearCursor);
  window.addEventListener("mouseout", handlePointerOut);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  listenersAttached = true;
}

function subscribe(listener: () => void) {
  ensureListeners();
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

/**
 * Track the pointer across the viewport so things can react even when they are
 * not rendered inside the surface itself.
 *
 * This hook is generic enough to use anywhere we need the current cursor,
 * even though the star game is the first consumer.
 */
export function useGlobalCursor() {
  const [cursor, setCursor] = React.useState(() => cursorState);

  React.useEffect(() => {
    return subscribe(() => setCursor(cursorState));
  }, []);

  return cursor;
}
