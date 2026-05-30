"use client";

import React from "react";
import { motion, useAnimation } from "framer-motion";
import { IconStarFilled } from "@tabler/icons-react";
import { DEFAULTS, getLocalCursorPosition, hashString, starGame, type Position, distanceBetween } from "@/lib/starGame";
import { useGlobalCursor } from "@/hooks/useGlobalCursor";
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
  /** Controls how the star reacts to interaction. */
  interactionMode?: "seed" | "gameState" | "callback" | "fixed";
  /** Override for the radius where the star starts moving. */
  activationRadius?: number;
  /** Cursor or click target, provided in viewport coordinates. */
  callbackTarget?: Position | null;
  /** Bump the callback trigger so the star can react to repeated clicks at the same point. */
  callbackSequence?: number;
  /** Notified after the callback-triggered zoom finishes. */
  onCallbackComplete?: () => void;
  /** Duration of the idle twinkle loop in seconds. */
  twinkleDuration?: number;
  /** Delay before the twinkle loop starts. */
  twinkleDelay?: number;
  /** Spring tuning used when the star chases the cursor. */
  driftSpeed?: number;
  /** Optional icon color override; defaults to inheriting the current text color. */
  color?: string;
}

export default function TwinklingStar({
  x,
  y,
  size = DEFAULTS.size,
  interactionMode = DEFAULTS.interactionMode,
  activationRadius = DEFAULTS.activationRadius,
  callbackTarget = DEFAULTS.callbackTarget,
  callbackSequence = DEFAULTS.callbackSequence,
  onCallbackComplete,
  twinkleDuration = DEFAULTS.twinkleDuration,
  twinkleDelay = DEFAULTS.twinkleDelay,
  driftSpeed = DEFAULTS.driftSpeed,
  color = "currentColor",
  className,
  style,
  ...rest
}: TwinklingStarProps) {
  const viewportCursor = useGlobalCursor();
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
    if (interactionMode !== "seed") return;
    starGame.registerSeedStar(starId);
    return () => {
      starGame.unregisterSeedStar(starId);
    };
  }, [interactionMode, starId]);

  React.useEffect(() => {
    // Clear any reported glow when this instance leaves the tree.
    return () => {
      starGame.clearCursorGlow(starId);
    };
  }, [starId]);

  React.useEffect(() => {
    if (interactionMode !== "callback") return;
    if (!callbackTarget || isCollected || isGone) return;

    const target = getLocalCursorPosition(callbackTarget, starRef.current);
    positionRef.current = target;
    starGame.reportCursorGlow(starId, 0);
    setIsCollected(true);

    void controls.start(
      { x: target.x, y: target.y, scale: 1.9, opacity: 0 },
      { duration: 0.18, ease: "easeOut" }
    ).then(() => {
      onCallbackComplete?.();
    });
  }, [callbackSequence, callbackTarget, controls, interactionMode, isCollected, isGone, onCallbackComplete, starId]);

  React.useEffect(() => {
    if (isCollected) {
      // Let the collection animation finish before removing the star.
      const t = window.setTimeout(() => setIsGone(true), 220);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [isCollected]);

  React.useEffect(() => {
    if (interactionMode === "callback" || interactionMode === "fixed") return;
    if (isGone) return;

    if (isCollected) {
      starGame.reportCursorGlow(starId, 0);
      return;
    }

    // Seed stars are interactive before activation; regular stars wake up afterward.
    const canChase = interactionMode === "seed" || (interactionMode === "gameState" && global.active);
    if (!canChase) return;

    const cursor = getLocalCursorPosition(viewportCursor, starRef.current);

    const movementRadius = activationRadius + radiusOffset;
    const collectionRadius = movementRadius * 0.34;

    if (!viewportCursor.inside) return;

    const currentPosition = positionRef.current;
    const cursorPosition = { x: cursor.x, y: cursor.y };
    const distanceToCursor = distanceBetween(currentPosition, cursorPosition);

    const canGlow = interactionMode === "seed" ? !global.active : global.active;
    if (!canGlow) {
      starGame.reportCursorGlow(starId, 0);
    }

    if (distanceToCursor <= collectionRadius && !isCollected) {
      // Close enough to collect, the star fades out and marks itself complete.
      setIsCollected(true);
      if (interactionMode === "seed") {
        starGame.markSeedCollected(starId);
      }
      controls.start({ scale: 0, opacity: 0 }, { duration: 0.22 });
      starGame.reportCursorGlow(starId, 0);
      const t = window.setTimeout(() => setIsGone(true), 220);
      return () => window.clearTimeout(t);
    }

    if (distanceToCursor > movementRadius) {
      // Outside the influence radius, the star stays put and stops contributing glow.
      starGame.reportCursorGlow(starId, 0);
      return;
    }

    if (!canGlow) {
      return;
    }

    // Closer stars respond more strongly and emit a brighter glow.
    const intensity = 1 - distanceToCursor / movementRadius;
    const easedIntensity = intensity * intensity;
    // Seed stars scale their glow with overall collection progress.
    const glowIntensity = interactionMode === "seed" ? easedIntensity * seedCollectionProgress : 1;

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
    driftScale,
    driftSpeed,
    isCollected,
    isGone,
    radiusOffset,
    seedCollectionProgress,
    starId,
    controls,
    interactionMode,
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
        className={[styles.twinklingStarGlyph].filter(Boolean).join(" ")}
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
            color={color}
            aria-hidden="true"
          />
        </span>
      </motion.span>
    </span>
  );
}
