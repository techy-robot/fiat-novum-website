"use client";

import React from "react";
import { useMouseTracker, createCollector, DEFAULTS } from "@/lib/starGame";
import styles from "./star-game.module.css";

type CursorState = {
  x: number;
  y: number;
  inside: boolean;
};

type StarFieldContextValue = {
  cursor: CursorState;
  gameActive: boolean;
  seedCount: number;
  collectedSeedCount: number;
  allSeedsCollected: boolean;
  seedActivationRadius: number;
  collectRadius: number;
  registerSeedStar: (id: string) => void;
  unregisterSeedStar: (id: string) => void;
  markSeedCollected: (id: string) => void;
};

const StarFieldContext = React.createContext<StarFieldContextValue | null>(null);

export function useStarField() {
  return React.useContext(StarFieldContext);
}

export interface StarFieldProviderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  seedActivationRadius?: number;
  collectRadius?: number;
  onGameStart?: () => void;
}

export default function StarFieldProvider({
  children,
  className,
  style,
  seedActivationRadius = DEFAULTS.seedActivationRadius,
  collectRadius = DEFAULTS.collectRadius,
  onGameStart,
  ...rest
}: StarFieldProviderProps) {
  const { cursor, onPointerMove, onPointerLeave } = useMouseTracker();
  const [gameActive, setGameActive] = React.useState(false);
  const collectorRef = React.useRef(createCollector());
  const [seedCount, setSeedCount] = React.useState(0);
  const [collectedSeedCount, setCollectedSeedCount] = React.useState(0);

  const syncCounts = React.useCallback(() => {
    setSeedCount(collectorRef.current.getSeedCount());
    setCollectedSeedCount(collectorRef.current.getCollectedCount());
  }, []);

  const maybeStartGame = React.useCallback(() => {
    const allSeedsCollected = collectorRef.current.allCollected();

    if (allSeedsCollected && !gameActive) {
      setGameActive(true);
      onGameStart?.();
    }
  }, [gameActive, onGameStart]);

  const registerSeedStar = React.useCallback(
    (id: string) => {
      collectorRef.current.register(id);
      syncCounts();
      maybeStartGame();
    },
    [maybeStartGame, syncCounts]
  );

  const unregisterSeedStar = React.useCallback(
    (id: string) => {
      collectorRef.current.unregister(id);
      syncCounts();
      maybeStartGame();
    },
    [maybeStartGame, syncCounts]
  );

  const markSeedCollected = React.useCallback(
    (id: string) => {
      collectorRef.current.markCollected(id);
      syncCounts();
      maybeStartGame();
    },
    [maybeStartGame, syncCounts]
  );

  const value = React.useMemo<StarFieldContextValue>(
    () => ({
      cursor,
      gameActive,
      seedCount,
      collectedSeedCount,
      allSeedsCollected: seedCount > 0 && seedCount === collectedSeedCount,
      seedActivationRadius,
      collectRadius,
      registerSeedStar,
      unregisterSeedStar,
      markSeedCollected,
    }),
    [cursor, gameActive, seedCount, collectedSeedCount, seedActivationRadius, collectRadius, registerSeedStar, unregisterSeedStar, markSeedCollected]
  );

  return (
    <StarFieldContext.Provider value={value}>
      <div
        className={[styles.starField, gameActive ? styles.starFieldActive : "", className ?? ""].filter(Boolean).join(" ")}
        style={style}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        {...rest}
      >
        {children}
      </div>
    </StarFieldContext.Provider>
  );
}