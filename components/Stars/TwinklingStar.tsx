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
  x: React.CSSProperties["left"];
  /** Vertical position inside the field. */
  y: React.CSSProperties["top"];
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
  position: Position;
  basePositionRef: React.MutableRefObject<Position | null>;
};

type TwinklingStarCollectionState = {
  isCollected: boolean;
  isGone: boolean;
  setIsCollected: React.Dispatch<React.SetStateAction<boolean>>;
};

type TwinklingStarShellState = Omit<TwinklingStarCollectionState, "setIsCollected">;

type TwinklingStarShellProps = TwinklingStarProps & Pick<TwinklingStarMotionState, "controls" | "starRef"> & TwinklingStarShellState;

type TwinklingStarStaticProps = Omit<TwinklingStarProps, "style"> & {
  className?: string;
  style?: React.CSSProperties;
  isCollected?: boolean;
};

function useResolvedStarPosition(
  starRef: React.MutableRefObject<HTMLSpanElement | null>,
  basePositionRef: React.MutableRefObject<Position | null>
) {
  const [position, setPosition] = React.useState<Position>({ x: 0, y: 0 });

  React.useLayoutEffect(() => {
    const updatePosition = () => {
      const starElement = starRef.current;
      const offsetParent = starElement?.offsetParent instanceof HTMLElement ? starElement.offsetParent : starElement?.parentElement;

      if (!offsetParent || !starElement) {
        setPosition({ x: 0, y: 0 });
        return;
      }

      const parentRect = offsetParent.getBoundingClientRect();
      const starRect = starElement.getBoundingClientRect();
      const resolvedPosition = { x: starRect.left - parentRect.left, y: starRect.top - parentRect.top };

      setPosition(resolvedPosition);

      if (!basePositionRef.current) {
        basePositionRef.current = resolvedPosition;
      }
    };

    updatePosition();

    const observedElement = starRef.current?.offsetParent instanceof HTMLElement ? starRef.current.offsetParent : starRef.current?.parentElement;
    if (!observedElement) return;

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updatePosition);
      return () => window.removeEventListener("resize", updatePosition);
    }

    const observer = new ResizeObserver(updatePosition);
    observer.observe(observedElement);

    return () => observer.disconnect();
  }, [basePositionRef, starRef]);

  return position;
}

function useTwinklingStarMotion(): TwinklingStarMotionState {
  const controls = useAnimation();
  const starRef = React.useRef<HTMLSpanElement | null>(null);
  const basePositionRef = React.useRef<Position | null>(null);
  const position = useResolvedStarPosition(starRef, basePositionRef);

  React.useEffect(() => {
    controls.set({ x: 0, y: 0, scale: 1, opacity: 1 });
  }, [controls]);

  return { controls, starRef, position, basePositionRef };
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
  x,
  y,
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
    left: x,
    top: y,
    ...style,
  };

  return (
    <motion.span
      ref={starRef}
      className={[styles.twinklingStar, className ?? ""].filter(Boolean).join(" ")}
      style={inlineStyle}
      aria-hidden="true"
      animate={controls}
      initial={false}
      {...(rest as React.ComponentPropsWithoutRef<typeof motion.span>)}
    >
      <span
        className={styles.twinklingStarGlyph}
        style={{ width: size, height: size, position: "absolute", left: 0, top: 0, transform: "translate(-50%, -50%)" }}
      >
        <TwinklingStarGlyph size={size} twinkleDuration={twinkleDuration} twinkleDelay={twinkleDelay} color={color} isCollected={isCollected} />
      </span>
    </motion.span>
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
  const { controls, starRef, basePositionRef } = useTwinklingStarMotion();
  const { isCollected, isGone, setIsCollected } = useTwinklingStarCollection();

  React.useEffect(() => {
    if (!callbackTarget || isCollected || isGone) return;

    const target = getLocalCursorPosition(callbackTarget, starRef.current);
    setIsCollected(true);

    const basePosition = basePositionRef.current ?? { x: 0, y: 0 };

    void controls.start(
      { x: target.x - basePosition.x, y: target.y - basePosition.y, scale: 1.9, opacity: 0 },
      { duration: 0.18, ease: "easeOut" }
    ).then(() => {
      onCallbackComplete?.();
    });
  }, [basePositionRef, callbackSequence, callbackTarget, controls, isCollected, isGone, onCallbackComplete, setIsCollected, starRef]);

  return <TwinklingStarMotionShell x={x} y={y} {...rest} controls={controls} starRef={starRef} isCollected={isCollected} isGone={isGone} />;
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
  const { controls, starRef, position, basePositionRef } = useTwinklingStarMotion();
  const { isCollected, isGone, setIsCollected } = useTwinklingStarCollection();
  const starId = React.useId();
  const motionVariation = React.useMemo(() => hashString(starId), [starId]);
  const driftScale = 0.82 + ((motionVariation % 24) / 100);
  const radiusOffset = (motionVariation % 7) - 3;
  const positionRef = React.useRef<Position>(position);
  const isCommittedRef = React.useRef(false);
  const committedTargetRef = React.useRef<Position | null>(null);

  React.useEffect(() => {
    isCommittedRef.current = false;
    committedTargetRef.current = null;
  }, [interactionMode, position]);

  React.useEffect(() => {
    if (interactionMode !== "seed") return;

    starGame.registerSeedStar(starId);
    return () => {
      starGame.unregisterSeedStar(starId);
    };
  }, [interactionMode, starId]);

  React.useEffect(() => {
    positionRef.current = position;
  }, [position]);

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
    const basePosition = basePositionRef.current ?? { x: 0, y: 0 };

    const intensity = 1 - Math.min(distanceToTarget / movementRadius, 1);
    const easedIntensity = intensity * intensity;
    const committedBoost = isCommittedRef.current ? 1.35 : 1;

    controls.start(
      { x: target.x - basePosition.x, y: target.y - basePosition.y },
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
    basePositionRef,
    starId,
    starRef,
    viewportCursor,
    viewportCursor.inside,
    viewportCursor.x,
    viewportCursor.y,
  ]);

  return <TwinklingStarMotionShell x={x} y={y} {...rest} controls={controls} starRef={starRef} isCollected={isCollected} isGone={isGone} />;
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
