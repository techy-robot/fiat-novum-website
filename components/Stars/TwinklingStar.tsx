"use client";

import React from "react";
import { motion, useAnimation } from "framer-motion";
import { useStarField } from "./StarFieldProvider";
import { useGameState } from "@/hooks/useGameState";
import styles from "./star-game.module.css";

export interface TwinklingStarProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "style"> {
  x: number;
  y: number;
  style?: React.CSSProperties;
  size?: number;
  seedMode?: boolean;
  activationRadius?: number;
  collectRadius?: number;
  twinkleDuration?: number;
  twinkleDelay?: number;
  driftSpeed?: number;
}

type Position = {
  x: number;
  y: number;
};

const DEFAULT_DRIFT_SPEED = 0.085;

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function distanceBetween(a: Position, b: Position) {
  return Math.hypot(a.x - b.x, a.y - b.y);
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
  const starField = useStarField();
  const controls = useAnimation();
  const global = useGameState();
  const starId = React.useId();
  const motionVariation = React.useMemo(() => hashString(starId), [starId]);
  const driftScale = 0.82 + ((motionVariation % 24) / 100);
  const radiusOffset = (motionVariation % 7) - 3;
  const positionRef = React.useRef<Position>({ x, y });
  const [isCollected, setIsCollected] = React.useState(false);
  const [isGone, setIsGone] = React.useState(false);

  React.useEffect(() => {
    positionRef.current = { x, y };
    controls.set({ x, y, scale: 1, opacity: 1 });
  }, [x, y, controls]);

  React.useEffect(() => {
    if (!starField || !seedMode) return;
    starField.registerSeedStar(starId);
    return () => starField.unregisterSeedStar(starId);
  }, [seedMode, starField, starId]);

  React.useEffect(() => {
    if (isCollected) {
      const t = window.setTimeout(() => setIsGone(true), 220);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [isCollected]);

  React.useEffect(() => {
    if (isGone) return;
    const field = starField;
    if (!field) return;

    const canChase = seedMode || global.active;
    if (!canChase) return;

    const { cursor, seedActivationRadius, collectRadius: fieldCollectRadius } = field;

    const interactionRadius =
      seedMode && !global.active
        ? (activationRadius ?? seedActivationRadius) + radiusOffset
        : (collectRadius ?? fieldCollectRadius) + radiusOffset;

    const influenceRadius = Math.max(18, interactionRadius * 2.2);
    const collectionRadius = Math.max(10, interactionRadius * 0.34);

    if (!cursor.inside) return;

    const currentPosition = positionRef.current;
    const cursorPosition = { x: cursor.x, y: cursor.y };
    const distanceToCursor = distanceBetween(currentPosition, cursorPosition);
    console.log(
      `Star ${starId}: distance=${distanceToCursor.toFixed(1)}, collectionRadius=${collectionRadius.toFixed(
        1
      )}, seedMode=${seedMode}`
    );

    if (distanceToCursor <= collectionRadius && !isCollected) {
      setIsCollected(true);
      console.log(`COLLECTED! Star ${starId}, seedMode=${seedMode}`);
      if (seedMode) {
        field.markSeedCollected(starId);
      }
      controls.start({ scale: 0, opacity: 0 }, { duration: 0.22 });
      const t = window.setTimeout(() => setIsGone(true), 220);
      return () => window.clearTimeout(t);
    }

    if (distanceToCursor > influenceRadius) {
      // out of influence — do nothing
      return;
    }

    const target = { x: cursorPosition.x, y: cursorPosition.y };
    positionRef.current = target;
    const intensity = 1 - distanceToCursor / influenceRadius;
    const easedIntensity = intensity * intensity;
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
    seedMode,
    starField,
    starId,
    controls,
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
          <span className={styles.twinklingStarCore} />
          <span className={[styles.twinklingStarSpark, styles.twinklingStarSparkHorizontal].join(" ")} />
          <span className={[styles.twinklingStarSpark, styles.twinklingStarSparkVertical].join(" ")} />
        </span>
      </motion.span>
    </span>
  );
}
