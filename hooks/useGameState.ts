"use client";

import { useEffect, useState } from "react";
import { starGame } from "@/lib/starGame";

/**
 * Subscribe to the shared star-game store from React components.
 * The initial snapshot is read synchronously so the first render matches the current game state.
 */
export function useGameState() {
  const [state, setState] = useState(() => starGame.getState());

  useEffect(() => {
    return starGame.subscribe((s) => setState(s));
  }, []);

  return state;
}
