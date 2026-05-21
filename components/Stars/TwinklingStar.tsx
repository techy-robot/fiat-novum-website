"use client";

import React from "react";
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

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
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
  const starId = React.useId();
  const motionVariation = React.useMemo(() => hashString(starId), [starId]);
  const driftScale = 0.82 + ((motionVariation % 24) / 100);
  const radiusOffset = (motionVariation % 7) - 3;
  const [position, setPosition] = React.useState<Position>({ x, y });
  const positionRef = React.useRef<Position>({ x, y });
  const collectedRef = React.useRef(false);
  const [isCollected, setIsCollected] = React.useState(false);
  const [isGone, setIsGone] = React.useState(false);

  React.useEffect(() => {
    positionRef.current = { x, y };
    setPosition({ x, y });
  }, [x, y]);

  React.useEffect(() => {
    if (!starField || !seedMode) {
      return;
    }

    starField.registerSeedStar(starId);

    return () => {
      starField.unregisterSeedStar(starId);
    };
  }, [seedMode, starField, starId]);

  React.useEffect(() => {
    if (isCollected) {
      const timeout = window.setTimeout(() => {
        setIsGone(true);
      }, 220);

      return () => window.clearTimeout(timeout);
    }

    return undefined;
  }, [isCollected]);

  React.useEffect(() => {
    if (isGone) {
      return;
    }

    const field = starField;

    if (!field) {
      return;
    }

    const canChase = seedMode || field.gameActive;

    if (!canChase) {
      return;
    }

    let animationFrameId = 0;
    let cancelled = false;

    const animate = () => {
      if (cancelled || !field || isCollected || isGone) {
        return;
      }

      const {
        cursor,
        gameActive,
        seedActivationRadius,
        collectRadius: fieldCollectRadius,
      } = field;

      const interactionRadius =
        seedMode && !gameActive
          ? (activationRadius ?? seedActivationRadius) + radiusOffset
          : (collectRadius ?? fieldCollectRadius) + radiusOffset;

      const collectionRadius = Math.max(6, interactionRadius * 0.42);

      if (!cursor.inside) {
        return;
      }

      const currentPosition = positionRef.current;
      const cursorPosition = { x: cursor.x, y: cursor.y };
      const distanceToCursor = distanceBetween(currentPosition, cursorPosition);

      if (distanceToCursor > Math.max(8, interactionRadius)) {
        animationFrameId = window.requestAnimationFrame(animate);
        return;
      }

      if (distanceToCursor <= collectionRadius && !collectedRef.current) {
        collectedRef.current = true;
        setIsCollected(true);

        if (seedMode && !gameActive) {
          field.markSeedCollected(starId);
        }

        return;
      }

      const nextPosition = {
        x:
          currentPosition.x +
          (cursorPosition.x - currentPosition.x) * (driftSpeed * driftScale),
        y:
          currentPosition.y +
          (cursorPosition.y - currentPosition.y) * (driftSpeed * driftScale),
      };

      positionRef.current = nextPosition;
      setPosition(nextPosition);
      animationFrameId = window.requestAnimationFrame(animate);
    };

    animationFrameId = window.requestAnimationFrame(animate);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [
    activationRadius,
    collectRadius,
    driftSpeed,
    driftScale,
    isCollected,
    isGone,
    radiusOffset,
    seedMode,
    starField,
    starId,
  ]);

  if (isGone) {
    return null;
  }

  const inlineStyle: React.CSSProperties = {
    width: size,
    height: size,
    left: 0,
    top: 0,
    ...style,
  };

  return (
    <span
      className={[
        "twinkling-star",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={inlineStyle}
      aria-hidden="true"
      {...rest}
    >
      <span
        className={[
          "twinkling-star__glyph",
          seedMode ? "twinkling-star__glyph--seed" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`,
          width: size,
          height: size,
        }}
      >
        <span
          className={[
            "twinkling-star__pulse",
            isCollected ? "twinkling-star__pulse--collected" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{
            animationDuration: `${twinkleDuration}s`,
            animationDelay: `${twinkleDelay}s`,
          }}
        >
          <span className="twinkling-star__core" />
          <span className="twinkling-star__spark twinkling-star__spark--horizontal" />
          <span className="twinkling-star__spark twinkling-star__spark--vertical" />
        </span>
      </span>
    </span>
  );
}