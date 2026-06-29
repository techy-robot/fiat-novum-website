"use client";

import { useSyncExternalStore } from "react";
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

function getSnapshot() {
  return cursorState;
}

const SERVER_SNAPSHOT: CursorState = { x: 0, y: 0, inside: false };
function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

/**
 * Track the pointer across the viewport using useSyncExternalStore.
 * Provides concurrent-safe viewport cursor state.
 */
export function useGlobalCursor() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
