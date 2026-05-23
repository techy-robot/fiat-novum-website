"use client";

import { useEffect, useState } from "react";
import { starGame } from "@/lib/starGame";

export function useGameState() {
  const [state, setState] = useState(() => starGame.getState());

  useEffect(() => {
    return starGame.subscribe((s) => setState(s));
  }, []);

  return state;
}
