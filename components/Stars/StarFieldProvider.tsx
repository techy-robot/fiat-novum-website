"use client";

import React from "react";
import { useMouseTracker, createCollector, DEFAULTS, starGame } from "@/lib/starGame";
import styles from "./star-game.module.css";

type CursorState = {
  x: number;
  y: number;
  inside: boolean;
};

type StarFieldContextValue = {
  cursor: CursorState;
  seedCount: number;
  collectedSeedCount: number;
  allSeedsCollected: boolean;
  seedActivationRadius: number;
  collectRadius: number;
  registerSeedStar: (id: string) => void;
  unregisterSeedStar: (id: string) => void;
  markSeedCollected: (id: string) => void;
  reportCursorGlow: (id: string, intensity: number) => void;
  clearCursorGlow: (id: string) => void;
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
  const [globalGameState, setGlobalGameState] = React.useState(() => starGame.getState());
  React.useEffect(() => {
    return starGame.subscribe((s) => setGlobalGameState(s));
  }, []);
  const collectorRef = React.useRef(createCollector());
  const [seedCount, setSeedCount] = React.useState(0);
  const [collectedSeedCount, setCollectedSeedCount] = React.useState(0);
  const cursorGlowReportsRef = React.useRef(new Map<string, number>());
  const [cursorGlowIntensity, setCursorGlowIntensity] = React.useState(0);

  const syncCursorGlow = React.useCallback(() => {
    let maxIntensity = 0;

    for (const intensity of cursorGlowReportsRef.current.values()) {
      if (intensity > maxIntensity) {
        maxIntensity = intensity;
      }
    }

    setCursorGlowIntensity((current) => (current === maxIntensity ? current : maxIntensity));
  }, []);

  const reportCursorGlow = React.useCallback(
    (id: string, intensity: number) => {
      if (intensity <= 0) {
        cursorGlowReportsRef.current.delete(id);
        syncCursorGlow();
        return;
      }

      cursorGlowReportsRef.current.set(id, Math.min(1, intensity));
      syncCursorGlow();
    },
    [syncCursorGlow]
  );

  const clearCursorGlow = React.useCallback(
    (id: string) => {
      if (cursorGlowReportsRef.current.delete(id)) {
        syncCursorGlow();
      }
    },
    [syncCursorGlow]
  );

  const syncCounts = React.useCallback(() => {
    const total = collectorRef.current.getSeedCount();
    const collected = collectorRef.current.getCollectedCount();
    setSeedCount(total);
    setCollectedSeedCount(collected);
    starGame.setCounts(total, collected);
  }, []);

  const maybeStartGame = React.useCallback(() => {
    const allSeedsCollected = collectorRef.current.allCollected();

    if (allSeedsCollected && !globalGameState.active) {
      starGame.start();
      onGameStart?.();
    }
  }, [globalGameState.active, onGameStart]);

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
      seedCount,
      collectedSeedCount,
      allSeedsCollected: seedCount > 0 && seedCount === collectedSeedCount,
      seedActivationRadius,
      collectRadius,
      registerSeedStar,
      unregisterSeedStar,
      markSeedCollected,
      reportCursorGlow,
      clearCursorGlow,
    }),
    [cursor, seedCount, collectedSeedCount, seedActivationRadius, collectRadius, registerSeedStar, unregisterSeedStar, markSeedCollected, reportCursorGlow, clearCursorGlow]
  );

  const seedCollectionProgress = seedCount > 0 ? collectedSeedCount / seedCount : 0;
  const seedFieldAmbientGlow = cursor.inside && seedCount > 0 ? Math.pow(seedCollectionProgress, 1.8) : 0;
  const cursorGlowLevel = cursor.inside ? Math.max(cursorGlowIntensity, seedFieldAmbientGlow) : 0;

  const fieldStyle = React.useMemo(
    () =>
      ({
        ...style,
        "--cursor-glow-x": `${cursor.x}px`,
        "--cursor-glow-y": `${cursor.y}px`,
        "--cursor-glow-opacity": cursorGlowLevel,
        "--cursor-glow-scale": cursorGlowLevel > 0 ? 0.7 + cursorGlowLevel * 0.55 : 0,
      }) as React.CSSProperties,
    [style, cursor.x, cursor.y, cursorGlowLevel]
  );

  return (
    <StarFieldContext.Provider value={value}>
      <div
        className={[styles.starField, globalGameState.active ? styles.starFieldActive : "", className ?? ""].filter(Boolean).join(" ")}
        style={fieldStyle}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        {...rest}
      >
        <div aria-hidden="true" className={styles.cursorGlow} />
        {children}
      </div>
    </StarFieldContext.Provider>
  );
}