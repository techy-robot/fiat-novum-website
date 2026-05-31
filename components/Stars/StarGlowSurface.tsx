"use client";

import React from "react";
import { useGameState } from "@/hooks/useGameState";
import { useContainerCursor } from "@/hooks/useContainerCursor";
import styles from "./star-game.module.css";

/**
 * Visual surface for the star-field glow.
 * Any div can use this wrapper to get the cursor glow and active cursor styling.
 */
export interface StarGlowSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {

}

const StarGlowSurface = React.forwardRef<HTMLDivElement, StarGlowSurfaceProps>(function StarGlowSurface(
  { children, className, style, ...rest },
  ref
) {
  const { cursor, onPointerMove, onPointerLeave } = useContainerCursor();
  const global = useGameState();

  const seedCollectionProgress = global.total > 0 ? global.collected / global.total : 0;
  const cursorGlowLevel = cursor.inside && seedCollectionProgress > 0 ? Math.pow(seedCollectionProgress, 1.8) : 0;

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
      ref={ref}
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
});

export default StarGlowSurface;
