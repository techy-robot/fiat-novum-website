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
export interface TwinklingStarProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "style"> {
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

type TwinklingStarMotionState = {
  controls: ReturnType<typeof useAnimation>;
  starRef: React.MutableRefObject<HTMLSpanElement | null>;
};

type TwinklingStarCollectionState = {
  isCollected: boolean;
  isGone: boolean;
  setIsCollected: React.Dispatch<React.SetStateAction<boolean>>;
};

type TwinklingStarShellState = Omit<TwinklingStarCollectionState, "setIsCollected">;

type TwinklingStarShellProps = Omit<TwinklingStarProps, "x" | "y"> &
  TwinklingStarMotionState &
  TwinklingStarShellState;

type TwinklingStarStaticProps = Omit<TwinklingStarProps, "style"> & {
  className?: string;
  style?: React.CSSProperties;
  isCollected?: boolean;
};

function useTwinklingStarMotion(x: number, y: number): TwinklingStarMotionState {
  const controls = useAnimation();
  const starRef = React.useRef<HTMLSpanElement | null>(null);

  React.useEffect(() => {
    controls.set({ x, y, scale: 1, opacity: 1 });
  }, [controls, x, y]);

  return { controls, starRef };
}

function useTwinklingStarCollection(): TwinklingStarCollectionState {
  const [isCollected, setIsCollected] = React.useState(false);
  const [isGone, setIsGone] = React.useState(false);

  React.useEffect(() => {
    if (!isCollected) return;

    const timeout = window.setTimeout(() => setIsGone(true), 220);
    return () => window.clearTimeout(timeout);
  }, [isCollected]);

  return { isCollected, isGone, setIsCollected };
}

function TwinklingStarGlyph({
  size = DEFAULTS.size,
  twinkleDuration = DEFAULTS.twinkleDuration,
  twinkleDelay = DEFAULTS.twinkleDelay,
  color = "currentColor",
  isCollected,
}: Pick<TwinklingStarShellProps, "size" | "twinkleDuration" | "twinkleDelay" | "color" | "isCollected">) {
  return (
    <span
      className={[styles.twinklingStarPulse, isCollected ? styles.twinklingStarPulseCollected : ""].filter(Boolean).join(" ")}
      style={{ animationDuration: `${twinkleDuration}s`, animationDelay: `${twinkleDelay}s` }}
    >
      <IconStarFilled className={styles.twinklingStarIcon} size={size} color={color} aria-hidden="true" />
    </span>
  );
}

function TwinklingStarMotionShell({
  size = DEFAULTS.size,
  className,
  style,
  twinkleDuration = DEFAULTS.twinkleDuration,
  twinkleDelay = DEFAULTS.twinkleDelay,
  color = "currentColor",
  controls,
  starRef,
  isCollected,
  isGone,
  ...rest
}: TwinklingStarShellProps) {
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
        className={styles.twinklingStarGlyph}
        style={{ width: size, height: size, position: "absolute", left: 0, top: 0, transform: "translate(-50%, -50%)" }}
        animate={controls}
        initial={false}
      >
        <TwinklingStarGlyph size={size} twinkleDuration={twinkleDuration} twinkleDelay={twinkleDelay} color={color} isCollected={isCollected} />
      </motion.span>
    </span>
  );
}

function TwinklingStarStatic({
  x,
  y,
  size = DEFAULTS.size,
  twinkleDuration = DEFAULTS.twinkleDuration,
  twinkleDelay = DEFAULTS.twinkleDelay,
  color = "currentColor",
  className,
  style,
  isCollected = false,
  ...rest
}: TwinklingStarStaticProps) {

  const inlineStyle: React.CSSProperties = {
    width: size,
    height: size,
    left: x,
    top: y,
    ...style,
  };

  return (
    <span
      className={[styles.twinklingStar, className ?? ""].filter(Boolean).join(" ")}
      style={inlineStyle}
      aria-hidden="true"
      {...rest}
    >
      <span className={styles.twinklingStarGlyph} style={{ width: size, height: size, position: "absolute", left: 0, top: 0, transform: "translate(-50%, -50%)" }}>
        <TwinklingStarGlyph size={size} twinkleDuration={twinkleDuration} twinkleDelay={twinkleDelay} color={color} isCollected={isCollected} />
      </span>
    </span>
  );
}

function CallbackTwinklingStar({
  x,
  y,
  callbackTarget,
  callbackSequence,
  onCallbackComplete,
  ...rest
}: TwinklingStarProps) {
  const { controls, starRef } = useTwinklingStarMotion(x, y);
  const { isCollected, isGone, setIsCollected } = useTwinklingStarCollection();

  React.useEffect(() => {
    if (!callbackTarget || isCollected || isGone) return;

    const target = getLocalCursorPosition(callbackTarget, starRef.current);
    setIsCollected(true);

    void controls.start(
      { x: target.x, y: target.y, scale: 1.9, opacity: 0 },
      { duration: 0.18, ease: "easeOut" }
    ).then(() => {
      onCallbackComplete?.();
    });
  }, [callbackSequence, callbackTarget, controls, isCollected, isGone, onCallbackComplete, setIsCollected, starRef]);

  return <TwinklingStarMotionShell {...rest} controls={controls} starRef={starRef} isCollected={isCollected} isGone={isGone} />;
}

function ProximityTwinklingStar({
  x,
  y,
  interactionMode = DEFAULTS.interactionMode,
  activationRadius = DEFAULTS.activationRadius,
  driftSpeed = DEFAULTS.driftSpeed,
  ...rest
}: TwinklingStarProps) {
  const viewportCursor = useGlobalCursor();
  const global = useGameState();
  const { controls, starRef } = useTwinklingStarMotion(x, y);
  const { isCollected, isGone, setIsCollected } = useTwinklingStarCollection();
  const starId = React.useId();
  const motionVariation = React.useMemo(() => hashString(starId), [starId]);
  const driftScale = 0.82 + ((motionVariation % 24) / 100);
  const radiusOffset = (motionVariation % 7) - 3;
  const positionRef = React.useRef<Position>({ x, y });
  const isCommittedRef = React.useRef(false);
  const committedTargetRef = React.useRef<Position | null>(null);

  React.useEffect(() => {
    isCommittedRef.current = false;
    committedTargetRef.current = null;
  }, [interactionMode, x, y]);

  React.useEffect(() => {
    if (interactionMode !== "seed") return;

    starGame.registerSeedStar(starId);
    return () => {
      starGame.unregisterSeedStar(starId);
    };
  }, [interactionMode, starId]);

  React.useEffect(() => {
    positionRef.current = { x, y };
  }, [x, y]);

  React.useEffect(() => {
    if (isGone || isCollected) return;

    const canChase = interactionMode === "seed" || (interactionMode === "gameState" && global.active);
    if (!canChase) return;

    const cursor = getLocalCursorPosition(viewportCursor, starRef.current);
    const movementRadius = activationRadius + radiusOffset;
    const collectionRadius = movementRadius * 0.34;
    const currentPosition = positionRef.current;
    const cursorPosition = { x: cursor.x, y: cursor.y };
    const distanceToCursor = distanceBetween(currentPosition, cursorPosition);

    if (!isCommittedRef.current) {
      if (!viewportCursor.inside || distanceToCursor > movementRadius) return;

      isCommittedRef.current = true;
    }

    committedTargetRef.current = cursorPosition;
    const target = committedTargetRef.current;
    const distanceToTarget = distanceBetween(currentPosition, target);

    if (distanceToTarget <= collectionRadius) {
      setIsCollected(true);
      if (interactionMode === "seed") {
        starGame.markSeedCollected(starId);
      }

      controls.start({ scale: 0, opacity: 0 }, { duration: 0.22 });
      return;
    }

    positionRef.current = target;

    const intensity = 1 - Math.min(distanceToTarget / movementRadius, 1);
    const easedIntensity = intensity * intensity;
    const committedBoost = isCommittedRef.current ? 1.35 : 1;

    controls.start(
      { x: target.x, y: target.y },
      {
        type: "spring",
        stiffness: (110 * driftScale * (1 + driftSpeed) + 140 * easedIntensity) * committedBoost,
        damping: (isCommittedRef.current ? 15 : 18) - Math.min(isCommittedRef.current ? 5 : 4, easedIntensity * (isCommittedRef.current ? 5 : 4)),
      }
    );
  }, [
    activationRadius,
    controls,
    driftScale,
    driftSpeed,
    global.active,
    interactionMode,
    isCollected,
    isGone,
    radiusOffset,
    setIsCollected,
    starId,
    starRef,
    viewportCursor,
    viewportCursor.inside,
    viewportCursor.x,
    viewportCursor.y,
  ]);

  return <TwinklingStarMotionShell {...rest} controls={controls} starRef={starRef} isCollected={isCollected} isGone={isGone} />;
}

export default function TwinklingStar(props: TwinklingStarProps) {
  const interactionMode = props.interactionMode ?? DEFAULTS.interactionMode;
  const resolvedProps: TwinklingStarProps = {
    ...props,
    interactionMode,
  };

  switch (interactionMode) {
    case "callback":
      return <CallbackTwinklingStar {...resolvedProps} />;
    case "seed":
      return <ProximityTwinklingStar {...resolvedProps} />;
    case "fixed":
      return <TwinklingStarStatic {...resolvedProps} isCollected={false} />;;
    case "gameState":
    default:
      return <ProximityTwinklingStar {...resolvedProps} />;
  }
}
