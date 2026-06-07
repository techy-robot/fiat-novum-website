"use client";

import React from "react";
import { motion, useAnimation } from "framer-motion";
import { IconStarFilled } from "@tabler/icons-react";
import { DEFAULTS, getLocalCursorPosition, hashString, starGame, type Position, distanceBetween } from "@/lib/starGame";
import { useGlobalCursor } from "@/hooks/useGlobalCursor";
import { useGameState } from "@/hooks/useGameState";
import styles from "./star-game.module.css";

/**
 * Internal spring tuning for the cursor-chasing motion.
 * Kept private so Plasmic only exposes layout and visual knobs.
 */
const STAR_DRIFT_SPEED = 0.085;

/**
 * Render one animated star in the play surface.
 * Seed stars participate in the activation phase, while regular stars become collectable once the game is live.
 */
export interface TwinklingStarProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "style"> {
  /** Horizontal position inside the field. */
  x: React.CSSProperties["left"];
  /** Vertical position inside the field. */
  y: React.CSSProperties["top"];
  /** Stable identifier used to persist collection state on the device. */
  collectionId?: string;
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
  isReady: boolean;
  setIsCollected: React.Dispatch<React.SetStateAction<boolean>>;
};

type TwinklingStarShellProps = TwinklingStarProps & {
  controls?: ReturnType<typeof useAnimation>;
  starRef?: React.MutableRefObject<HTMLSpanElement | null>;
  isCollected?: boolean;
  isGone?: boolean;
  isReady?: boolean;
};

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getStarShellStyle(x: React.CSSProperties["left"], y: React.CSSProperties["top"], size: number, style?: React.CSSProperties) {
  return {
    width: size,
    height: size,
    left: x,
    top: y,
    ...style,
  } as React.CSSProperties;
}

function getStarGlyphStyle(size: number) {
  return {
    width: size,
    height: size,
    position: "absolute" as const,
    inset: 0,
  };
}

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

const useIsomorphicLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

function useTwinklingStarCollection(collectionId?: string): TwinklingStarCollectionState {
  const [isCollected, setIsCollected] = React.useState(false);
  const [isGone, setIsGone] = React.useState(false);
  const [isReady, setIsReady] = React.useState(() => !collectionId);

  useIsomorphicLayoutEffect(() => {
    if (!collectionId) return;

    starGame.hydrate();
    const persisted = starGame.isCollected(collectionId);
    setIsCollected(persisted);
    setIsGone(persisted);
    setIsReady(true);
  }, [collectionId]);

  React.useEffect(() => {
    if (!isCollected) return;

    const timeout = window.setTimeout(() => setIsGone(true), 220);
    return () => window.clearTimeout(timeout);
  }, [isCollected]);

  return { isCollected, isGone, isReady, setIsCollected };
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
      className={joinClasses(styles.twinklingStarPulse, isCollected && styles.twinklingStarPulseCollected)}
      style={{ animationDuration: `${twinkleDuration}s`, animationDelay: `${twinkleDelay}s` }}
    >
      <IconStarFilled className={styles.twinklingStarIcon} size={size} color={color} aria-hidden="true" />
    </span>
  );
}

function TwinklingStarShell({
  x,
  y,
  size = DEFAULTS.size,
  className,
  style,
  collectionId,
  isReady = true,
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

  const inlineStyle = getStarShellStyle(x, y, size, style);
  const collectionVisibility = collectionId && !isReady ? "hidden" : "visible";
  const animationProps = controls ? { animate: controls } : {};

  return (
    <motion.span
      ref={starRef}
      className={joinClasses(styles.twinklingStar, className)}
      style={{ ...inlineStyle, visibility: collectionVisibility }}
      aria-hidden="true"
      initial={false}
      {...animationProps}
      {...(rest as React.ComponentPropsWithoutRef<typeof motion.span>)}
    >
      <span className={styles.twinklingStarGlyph} style={getStarGlyphStyle(size)}>
        <TwinklingStarGlyph size={size} twinkleDuration={twinkleDuration} twinkleDelay={twinkleDelay} color={color} isCollected={isCollected} />
      </span>
    </motion.span>
  );
}

function CallbackTwinklingStar({
  x,
  y,
  collectionId,
  callbackTarget,
  callbackSequence,
  onCallbackComplete,
  ...rest
}: TwinklingStarProps) {
  const { controls, starRef, basePositionRef } = useTwinklingStarMotion();
  const { isCollected, isGone, isReady, setIsCollected } = useTwinklingStarCollection(collectionId);

  React.useEffect(() => {
    if (!isReady || !callbackTarget || isCollected || isGone) return;

    const target = getLocalCursorPosition(callbackTarget, starRef.current);
    setIsCollected(true);

    if (collectionId) {
      starGame.markCollected(collectionId);
    }

    const basePosition = basePositionRef.current ?? { x: 0, y: 0 };

    void controls.start(
      { x: target.x - basePosition.x, y: target.y - basePosition.y, scale: 1.9, opacity: 0 },
      { duration: 0.18, ease: "easeOut" }
    ).then(() => {
      onCallbackComplete?.();
    });
  }, [basePositionRef, callbackSequence, callbackTarget, collectionId, controls, isCollected, isGone, isReady, onCallbackComplete, setIsCollected, starRef]);

  return <TwinklingStarShell x={x} y={y} {...rest} collectionId={collectionId} isReady={isReady} controls={controls} starRef={starRef} isCollected={isCollected} isGone={isGone} />;
}

function ProximityTwinklingStar({
  x,
  y,
  collectionId,
  interactionMode = DEFAULTS.interactionMode,
  activationRadius = DEFAULTS.activationRadius,
  ...rest
}: TwinklingStarProps) {
  const viewportCursor = useGlobalCursor();
  const global = useGameState();
  const { controls, starRef, position, basePositionRef } = useTwinklingStarMotion();
  const generatedCollectionId = React.useId();
  const starId = collectionId ?? generatedCollectionId;
  const { isCollected, isGone, isReady, setIsCollected } = useTwinklingStarCollection(collectionId);
  const motionVariation = hashString(starId);
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
    if (!isReady || interactionMode !== "seed" || !collectionId) return;

    starGame.registerSeedStar(collectionId);
    return () => {
      starGame.unregisterSeedStar(collectionId);
    };
  }, [collectionId, interactionMode, isReady]);

  React.useEffect(() => {
    positionRef.current = position;
  }, [position]);

  React.useEffect(() => {
    if (!isReady || isGone || isCollected) return;

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
      if (collectionId) {
        if (interactionMode === "seed") {
          starGame.markSeedCollected(collectionId);
        } else {
          starGame.markCollected(collectionId);
        }
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
        stiffness: (110 * driftScale * (1 + STAR_DRIFT_SPEED) + 140 * easedIntensity) * committedBoost,
        damping: (isCommittedRef.current ? 15 : 18) - Math.min(isCommittedRef.current ? 5 : 4, easedIntensity * (isCommittedRef.current ? 5 : 4)),
      }
    );
  }, [
    activationRadius,
    controls,
    driftScale,
    collectionId,
    global.active,
    interactionMode,
    isCollected,
    isGone,
    isReady,
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

  return <TwinklingStarShell x={x} y={y} {...rest} collectionId={collectionId} isReady={isReady} controls={controls} starRef={starRef} isCollected={isCollected} isGone={isGone} />;
}

export default function TwinklingStar(props: TwinklingStarProps) {
  const { resetRevision } = useGameState();
  const interactionMode = props.interactionMode ?? DEFAULTS.interactionMode;
  const resolvedProps: TwinklingStarProps = {
    ...props,
    interactionMode,
  };

  switch (interactionMode) {
    case "callback":
      return <CallbackTwinklingStar key={resetRevision} {...resolvedProps} />;
    case "seed":
      return <ProximityTwinklingStar key={resetRevision} {...resolvedProps} />;
    case "fixed":
      return <TwinklingStarShell key={resetRevision} {...resolvedProps} isCollected={false} />;
    case "gameState":
    default:
      return <ProximityTwinklingStar key={resetRevision} {...resolvedProps} />;
  }
}
