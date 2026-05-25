"use client";

import React from "react";
import { motion, useAnimation } from "framer-motion";
import { IconStarFilled } from "@tabler/icons-react";
import { DEFAULTS, starGame } from "@/lib/starGame";
import { useViewportCursor } from "@/hooks/useViewportCursor";
import { useGameState } from "@/hooks/useGameState";
import styles from "./star-game.module.css";

/**
 * Render one animated star in the play surface.
 * Seed stars participate in the activation phase, while regular stars become collectable once the game is live.
 */
export interface TwinklingStarProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "style"> {
  /** Horizontal position inside the field. */
  x: number;
  /** Vertical position inside the field. */
  y: number;
  /** Optional inline styles layered on top of the built-in positioning. */
  style?: React.CSSProperties;
  /** Visual size of the star glyph in pixels. */
  size?: number;
  /** Mark the star as part of the seed set that unlocks the game. */
  seedMode?: boolean;
  /** Override for the pre-game activation radius. */
  activationRadius?: number;
  /** Override for the active-game collection radius. */
  collectRadius?: number;
  /** Duration of the idle twinkle loop in seconds. */
  twinkleDuration?: number;
  /** Delay before the twinkle loop starts. */
  twinkleDelay?: number;
  /** Spring tuning used when the star chases the cursor. */
  driftSpeed?: number;
}

/** 2D point used for cursor and star positions. */
type Position = {
  x: number;
  y: number;
};

/** Default drift speed used when a caller does not provide one. */
const DEFAULT_DRIFT_SPEED = 0.085;

/**
 * Hash a React id into a stable variation bucket.
 * This keeps each star's motion distinct without introducing randomness on re-render.
 */
function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Measure the distance between the cursor and a star position. */
function distanceBetween(a: Position, b: Position) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Convert viewport coordinates into the star's local parent coordinates. */
function getLocalCursorPosition(cursor: Position, starElement: HTMLSpanElement | null) {
  const offsetParent = starElement?.offsetParent instanceof HTMLElement ? starElement.offsetParent : starElement?.parentElement;

  if (!offsetParent) {
    return cursor;
  }

  const rect = offsetParent.getBoundingClientRect();
  return {
    x: cursor.x - rect.left,
    y: cursor.y - rect.top,
  };
}

export default function TwinklingStar({
  x,
  y,
  size = 14,
  seedMode = false,
  activationRadius,
  collectRadius,
  twinkleDuration = 2.7,
  twinkleDelay = 0,
  driftSpeed = DEFAULT_DRIFT_SPEED,
  className,
  style,
  ...rest
}: TwinklingStarProps) {
  const viewportCursor = useViewportCursor();
  const controls = useAnimation();
  const global = useGameState();
  // Shared game state tells the star whether the field is still in seed-collection mode.
  const starId = React.useId();
  // Use the React id so each star keeps the same motion profile for its lifetime.
  const motionVariation = React.useMemo(() => hashString(starId), [starId]);
  // Small offsets make neighboring stars feel less mechanically uniform.
  const driftScale = 0.82 + ((motionVariation % 24) / 100);
  const radiusOffset = (motionVariation % 7) - 3;
  // Keep the last target position so the spring continues from the previous cursor chase.
  const positionRef = React.useRef<Position>({ x, y });
  const starRef = React.useRef<HTMLSpanElement | null>(null);
  const [isCollected, setIsCollected] = React.useState(false);
  const [isGone, setIsGone] = React.useState(false);
  // Seed stars glow harder as the shared game gets closer to completion.
  const seedCollectionProgress = global.total > 0 ? global.collected / global.total : 0;

  React.useEffect(() => {
    // Reset the animation target if the authored position changes.
    positionRef.current = { x, y };
    controls.set({ x, y, scale: 1, opacity: 1 });
  }, [x, y, controls]);

  React.useEffect(() => {
    // Seed stars register while mounted so the shared game can count them.
    if (!seedMode) return;
    starGame.registerSeedStar(starId);
    return () => {
      starGame.unregisterSeedStar(starId);
    };
  }, [seedMode, starId]);

  React.useEffect(() => {
    // Clear any reported glow when this instance leaves the tree.
    return () => {
      starGame.clearCursorGlow(starId);
    };
  }, [starId]);

  React.useEffect(() => {
    if (isCollected) {
      // Let the collection animation finish before removing the star.
      const t = window.setTimeout(() => setIsGone(true), 220);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [isCollected]);

  React.useEffect(() => {
    if (isGone) return;

    if (isCollected) {
      starGame.reportCursorGlow(starId, 0);
      return;
    }

    // Seed stars are interactive before activation; regular stars wake up afterward.
    const canChase = seedMode || global.active;
    if (!canChase) return;

    const { seedActivationRadius, collectRadius: fieldCollectRadius } = DEFAULTS;
    const cursor = getLocalCursorPosition(viewportCursor, starRef.current);

    // Each phase uses its own radius so the pre-game and active states feel distinct.
    const interactionRadius =
      seedMode && !global.active
        ? (activationRadius ?? seedActivationRadius) + radiusOffset
        : (collectRadius ?? fieldCollectRadius) + radiusOffset;

    const influenceRadius = Math.max(18, interactionRadius * 2.2);
    const collectionRadius = Math.max(10, interactionRadius * 0.34);

    if (!viewportCursor.inside) return;

    const currentPosition = positionRef.current;
    const cursorPosition = { x: cursor.x, y: cursor.y };
    const distanceToCursor = distanceBetween(currentPosition, cursorPosition);

    const canGlow = seedMode ? !global.active : global.active;
    if (!canGlow) {
      starGame.reportCursorGlow(starId, 0);
    }

    if (distanceToCursor <= collectionRadius && !isCollected) {
      // Close enough to collect, the star fades out and marks itself complete.
      setIsCollected(true);
      if (seedMode) {
        starGame.markSeedCollected(starId);
      }
      controls.start({ scale: 0, opacity: 0 }, { duration: 0.22 });
      starGame.reportCursorGlow(starId, 0);
      const t = window.setTimeout(() => setIsGone(true), 220);
      return () => window.clearTimeout(t);
    }

    if (distanceToCursor > influenceRadius) {
      // Outside the influence radius, the star stays put and stops contributing glow.
      starGame.reportCursorGlow(starId, 0);
      return;
    }

    if (!canGlow) {
      return;
    }

    // Closer stars respond more strongly and emit a brighter glow.
    const intensity = 1 - distanceToCursor / influenceRadius;
    const easedIntensity = intensity * intensity;
    // Seed stars scale their glow with overall collection progress.
    const glowIntensity = seedMode ? easedIntensity * seedCollectionProgress : 1;

    starGame.reportCursorGlow(starId, glowIntensity);

    const target = { x: cursorPosition.x, y: cursorPosition.y };
    positionRef.current = target;
    // Pull the star toward the cursor with a spring that varies slightly per instance.
    controls.start(
      { x: target.x, y: target.y },
      {
        type: "spring",
        stiffness: 110 * driftScale * (1 + driftSpeed) + 140 * easedIntensity,
        damping: 18 - Math.min(4, easedIntensity * 4),
      }
    );
  }, [
    activationRadius,
    collectRadius,
    driftScale,
    driftSpeed,
    isCollected,
    isGone,
    radiusOffset,
    seedCollectionProgress,
    seedMode,
    starId,
    controls,
    viewportCursor,
    viewportCursor.inside,
    viewportCursor.x,
    viewportCursor.y,
    global.active,
  ]);

  if (isGone) return null;

  const inlineStyle: React.CSSProperties = {
    width: size,
    height: size,
    left: 0,
    top: 0,
    ...style,
  };

  return (
    <span
      ref={starRef}
      className={[styles.twinklingStar, className ?? ""].filter(Boolean).join(" ")}
      style={inlineStyle}
      aria-hidden="true"
      {...rest}
    >
      <motion.span
        className={[styles.twinklingStarGlyph, seedMode ? styles.twinklingStarGlyphSeed : ""].filter(Boolean).join(" ")}
        style={{ width: size, height: size, position: "absolute", left: 0, top: 0, transform: "translate(-50%, -50%)" }}
        animate={controls}
        initial={false}
      >
        <span
          className={[styles.twinklingStarPulse, isCollected ? styles.twinklingStarPulseCollected : ""].filter(Boolean).join(" ")}
          style={{ animationDuration: `${twinkleDuration}s`, animationDelay: `${twinkleDelay}s` }}
        >
          <IconStarFilled
            className={styles.twinklingStarIcon}
            size={size}
            color="#00ffa5"
            aria-hidden="true"
          />
        </span>
      </motion.span>
    </span>
  );
}
