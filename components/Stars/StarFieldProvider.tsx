"use client";

import React from "react";
import { useMouseTracker, createCollector, DEFAULTS, starGame } from "@/lib/starGame";
import styles from "./star-game.module.css";

/** Cursor position reported in field-local coordinates. */
type CursorState = {
  x: number;
  y: number;
  inside: boolean;
};

/**
 * Context values shared with stars that live inside the provider.
 * The provider owns the bookkeeping and the children only read or report state.
 */
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

/** Read the star-field context from a descendant component. */
export function useStarField() {
  return React.useContext(StarFieldContext);
}

/**
 * Configure a container that shares cursor tracking, collection counts,
 * and cursor glow aggregation with all nested star components.
 */
export interface StarFieldProviderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Radius used while the page is still waiting for seed stars to be collected. */
  seedActivationRadius?: number;
  /** Radius used once the field has flipped into active game mode. */
  collectRadius?: number;
  /** Fires once the final seed star is collected and the field becomes active. */
  onGameStart?: () => void;
}

/**
 * Wrap a region of the page in shared star-field state.
 * Seed stars register here, report glow intensity, and promote the field into game mode once complete.
 */
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
    // Mirror the singleton store inside React so the provider can respond to lifecycle changes.
    return starGame.subscribe((s) => setGlobalGameState(s));
  }, []);
  const collectorRef = React.useRef(createCollector());
  const [seedCount, setSeedCount] = React.useState(0);
  const [collectedSeedCount, setCollectedSeedCount] = React.useState(0);
  // Multiple stars can report glow at once, so the field keeps the strongest live report per id.
  const cursorGlowReportsRef = React.useRef(new Map<string, number>());
  const [cursorGlowIntensity, setCursorGlowIntensity] = React.useState(0);

  const syncCursorGlow = React.useCallback(() => {
    // Blend all active reports into one intensity for the field overlay.
    let maxIntensity = 0;

    for (const intensity of cursorGlowReportsRef.current.values()) {
      if (intensity > maxIntensity) {
        maxIntensity = intensity;
      }
    }

    // Only re-render when the aggregate intensity actually changes.
    setCursorGlowIntensity((current) => (current === maxIntensity ? current : maxIntensity));
  }, []);

  // Each star reports its own glow contribution, and the provider keeps only the strongest one per id.
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

  // When a star unmounts or loses focus, remove its glow contribution from the aggregate field state.
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
    // Keep the singleton store aligned with the collector so other consumers can read the same totals.
    starGame.setCounts(total, collected);
  }, []);

  const maybeStartGame = React.useCallback(() => {
    const allSeedsCollected = collectorRef.current.allCollected();

    if (allSeedsCollected && !globalGameState.active) {
      // The game only starts once all registered seed stars are collected.
      starGame.start();
      onGameStart?.();
    }
  }, [globalGameState.active, onGameStart]);

  // Seed stars register on mount so the provider knows how many must be collected before activation.
  const registerSeedStar = React.useCallback(
    (id: string) => {
      collectorRef.current.register(id);
      syncCounts();
      maybeStartGame();
    },
    [maybeStartGame, syncCounts]
  );

  // If an uncollected seed disappears, it should stop participating in the completion check.
  const unregisterSeedStar = React.useCallback(
    (id: string) => {
      collectorRef.current.unregister(id);
      syncCounts();
      maybeStartGame();
    },
    [maybeStartGame, syncCounts]
  );

  // Once a seed star is collected, the collector updates the shared totals and may unlock the game.
  const markSeedCollected = React.useCallback(
    (id: string) => {
      collectorRef.current.markCollected(id);
      syncCounts();
      maybeStartGame();
    },
    [maybeStartGame, syncCounts]
  );

  const allSeedsCollected = seedCount > 0 && seedCount === collectedSeedCount;

  const value = React.useMemo<StarFieldContextValue>(
    () => ({
      cursor,
      seedCount,
      collectedSeedCount,
      allSeedsCollected,
      seedActivationRadius,
      collectRadius,
      registerSeedStar,
      unregisterSeedStar,
      markSeedCollected,
      reportCursorGlow,
      clearCursorGlow,
    }),
    [cursor, seedCount, collectedSeedCount, allSeedsCollected, seedActivationRadius, collectRadius, registerSeedStar, unregisterSeedStar, markSeedCollected, reportCursorGlow, clearCursorGlow]
  );

  // The field itself gets brighter as the seed set fills up.
  const seedCollectionProgress = seedCount > 0 ? collectedSeedCount / seedCount : 0;
  // Seed progress contributes a soft ambient glow before the game flips into active mode.
  const seedFieldAmbientGlow = cursor.inside && seedCount > 0 ? Math.pow(seedCollectionProgress, 1.8) : 0;
  // Live star reports still win when they are stronger than the ambient field glow.
  const cursorGlowLevel = cursor.inside ? Math.max(cursorGlowIntensity, seedFieldAmbientGlow) : 0;

  const fieldStyle = React.useMemo(
    () =>
      ({
        // CSS variables let the glow overlay stay declarative.
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