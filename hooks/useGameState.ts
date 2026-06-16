"use client";

import React, { useEffect, useState } from "react";
import { starGame } from "@/lib/starGame";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : React.useLayoutEffect;

/**
 * Subscribe to the shared star-game store from React components.
 * The initial snapshot is read synchronously so the first render matches the current game state.
 * This sits next to the cursor hooks so the star UI can pull both shared inputs from one folder.
 */
export function useGameState() {
  const [state, setState] = useState(() => starGame.getState());

  useIsomorphicLayoutEffect(() => {
    const unsubscribe = starGame.subscribe((s) => setState(s));
    starGame.hydrate();

    return unsubscribe;
  }, []);

  return state;
}
