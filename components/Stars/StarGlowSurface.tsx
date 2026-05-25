"use client";

import React from "react";
import { useGameState } from "@/hooks/useGameState";
import { useMouseTracker } from "@/hooks/useMouseTracker";
import styles from "./star-game.module.css";

/**
 * Visual surface for the star-field glow.
 * Any div can use this wrapper to get the cursor glow and active cursor styling.
 */
export interface StarGlowSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional extra glow intensity to layer on top of the game-driven glow. */
  glowIntensity?: number;
}

export default function StarGlowSurface({
  children,
  className,
  style,
  glowIntensity = 0,
  ...rest
}: StarGlowSurfaceProps) {
  const { cursor, onPointerMove, onPointerLeave } = useMouseTracker();
  const global = useGameState();

  const seedCollectionProgress = global.total > 0 ? global.collected / global.total : 0;
  const seedFieldAmbientGlow = cursor.inside && seedCollectionProgress > 0 ? Math.pow(seedCollectionProgress, 1.8) : 0;
  const cursorGlowLevel = cursor.inside ? Math.max(glowIntensity, global.cursorGlowIntensity, seedFieldAmbientGlow) : 0;

  const fieldStyle = React.useMemo(
    () =>
      ({
        ...style,
        "--cursor-glow-x": `${cursor.x}px`,
        "--cursor-glow-y": `${cursor.y}px`,
        "--cursor-glow-opacity": cursorGlowLevel,
        "--cursor-glow-scale": cursorGlowLevel > 0 ? 0.7 + cursorGlowLevel * 0.55 : 0,
      }) as React.CSSProperties,
    [style, cursor.x, cursor.y, cursorGlowLevel]
  );

  return (
    <div
      className={[styles.starField, global.active ? styles.starFieldActive : "", className ?? ""].filter(Boolean).join(" ")}
      style={fieldStyle}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      {...rest}
    >
      <div aria-hidden="true" className={styles.cursorGlow} />
      {children}
    </div>
  );
}
