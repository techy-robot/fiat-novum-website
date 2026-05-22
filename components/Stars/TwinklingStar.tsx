"use client";

import React from "react";
import { motion, useAnimation } from "framer-motion";
import { useStarField } from "./StarFieldProvider";

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

    const canChase = seedMode || field.gameActive;
    if (!canChase) return;

    const { cursor, gameActive, seedActivationRadius, collectRadius: fieldCollectRadius } = field;

    const interactionRadius =
      seedMode && !gameActive
        ? (activationRadius ?? seedActivationRadius) + radiusOffset
        : (collectRadius ?? fieldCollectRadius) + radiusOffset;

    const collectionRadius = Math.max(6, interactionRadius * 0.42);

    if (!cursor.inside) return;

    const currentPosition = positionRef.current;
    const cursorPosition = { x: cursor.x, y: cursor.y };
    const distanceToCursor = distanceBetween(currentPosition, cursorPosition);

    if (distanceToCursor <= collectionRadius && !isCollected) {
      setIsCollected(true);
      if (seedMode && !gameActive) {
        field.markSeedCollected(starId);
      }
      controls.start({ scale: 0, opacity: 0 }, { duration: 0.22 });
      const t = window.setTimeout(() => setIsGone(true), 220);
      return () => window.clearTimeout(t);
    }

    if (distanceToCursor > Math.max(8, interactionRadius)) {
      // out of influence — do nothing
      return;
    }

    const target = { x: cursorPosition.x, y: cursorPosition.y };
    positionRef.current = target;
    controls.start(
      { x: target.x, y: target.y },
      { type: "spring", stiffness: 140 * driftScale * (1 + driftSpeed), damping: 20 }
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
      className={["twinkling-star", className ?? ""].filter(Boolean).join(" ")}
      style={inlineStyle}
      aria-hidden="true"
      {...rest}
    >
      <motion.span
        className={["twinkling-star__glyph", seedMode ? "twinkling-star__glyph--seed" : ""].filter(Boolean).join(" ")}
        style={{ width: size, height: size, position: "absolute", left: 0, top: 0, transform: "translate(-50%, -50%)" }}
        animate={controls}
        initial={false}
      >
        <span
          className={["twinkling-star__pulse", isCollected ? "twinkling-star__pulse--collected" : ""].filter(Boolean).join(" ")}
          style={{ animationDuration: `${twinkleDuration}s`, animationDelay: `${twinkleDelay}s` }}
        >
          <span className="twinkling-star__core" />
          <span className="twinkling-star__spark twinkling-star__spark--horizontal" />
          <span className="twinkling-star__spark twinkling-star__spark--vertical" />
        </span>
      </motion.span>
    </span>
  );
}
