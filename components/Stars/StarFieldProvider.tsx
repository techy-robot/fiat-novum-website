"use client";

import React from "react";

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
  seedActivationRadius = 30,
  collectRadius = 30,
  onGameStart,
  onPointerMove,
  onPointerLeave,
  ...rest
}: StarFieldProviderProps) {
  const [cursor, setCursor] = React.useState<CursorState>({
    x: 0,
    y: 0,
    inside: false,
  });
  const [gameActive, setGameActive] = React.useState(false);
  const seedStarsRef = React.useRef(new Set<string>());
  const collectedSeedsRef = React.useRef(new Set<string>());
  const [seedCount, setSeedCount] = React.useState(0);
  const [collectedSeedCount, setCollectedSeedCount] = React.useState(0);

  const syncCounts = React.useCallback(() => {
    setSeedCount(seedStarsRef.current.size);
    setCollectedSeedCount(collectedSeedsRef.current.size);
  }, []);

  const maybeStartGame = React.useCallback(() => {
    const allSeedsCollected =
      seedStarsRef.current.size > 0 &&
      seedStarsRef.current.size === collectedSeedsRef.current.size;

    if (allSeedsCollected && !gameActive) {
      setGameActive(true);
      onGameStart?.();
    }
  }, [gameActive, onGameStart]);

  const registerSeedStar = React.useCallback(
    (id: string) => {
      seedStarsRef.current.add(id);
      syncCounts();
      maybeStartGame();
    },
    [maybeStartGame, syncCounts]
  );

  const unregisterSeedStar = React.useCallback(
    (id: string) => {
      seedStarsRef.current.delete(id);
      collectedSeedsRef.current.delete(id);
      syncCounts();
      maybeStartGame();
    },
    [maybeStartGame, syncCounts]
  );

  const markSeedCollected = React.useCallback(
    (id: string) => {
      if (!collectedSeedsRef.current.has(id)) {
        collectedSeedsRef.current.add(id);
        syncCounts();
        maybeStartGame();
      }
    },
    [maybeStartGame, syncCounts]
  );

  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();

      setCursor({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        inside: true,
      });

      onPointerMove?.(event);
    },
    [onPointerMove]
  );

  const handlePointerLeave = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      setCursor((previous) => ({
        ...previous,
        inside: false,
      }));

      onPointerLeave?.(event);
    },
    [onPointerLeave]
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
    [
      cursor,
      gameActive,
      seedCount,
      collectedSeedCount,
      seedActivationRadius,
      collectRadius,
      registerSeedStar,
      unregisterSeedStar,
      markSeedCollected,
    ]
  );

  return (
    <StarFieldContext.Provider value={value}>
      <div
        className={[
          "star-field",
          gameActive ? "star-field--active" : "",
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        {...rest}
      >
        {children}
      </div>
    </StarFieldContext.Provider>
  );
}