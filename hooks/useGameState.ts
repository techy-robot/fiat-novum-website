"use client";

import { useEffect, useSyncExternalStore } from "react";
import { starGame } from "@/lib/starGame";

function subscribe(onStoreChange: () => void) {
  return starGame.subscribe(onStoreChange);
}

function getSnapshot() {
  return starGame.getState();
}

const SERVER_SNAPSHOT = { active: false, total: 0, collected: 0, resetRevision: 0 };
function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

/**
 * Subscribe to the shared star-game store from React components using useSyncExternalStore.
 * Guarantees concurrent-safe synchronization and prevents hydration mismatch tearing.
 */
export function useGameState() {
  useEffect(() => {
    starGame.hydrate();
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
