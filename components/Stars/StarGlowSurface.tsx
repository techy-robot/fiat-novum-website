"use client";

import React from "react";
import { useGameState } from "@/hooks/useGameState";
import { useContainerCursor } from "@/hooks/useContainerCursor";
import styles from "./star-game.module.css";
import Link from "next/link";

/**
 * Visual surface for the star-field glow.
 * Any div can use this wrapper to get the cursor glow and active cursor styling.
 */
export interface StarGlowSurfaceProps extends React.HTMLAttributes<HTMLElement> {
  completionMessage?: React.ReactNode;
}

const StarGlowSurface = React.forwardRef<HTMLElement, StarGlowSurfaceProps>(function StarGlowSurface(
  { children, className, style, completionMessage, ...rest },
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

  // Check if any child is a Next.js Link or inline element
  const hasInlineChild = React.Children.toArray(children).some((child) => {
    if (!React.isValidElement(child)) return false;
    // Detects Next.js Link components or raw standard anchor tags
    return child.type === Link || child.type === 'a';
  });

  // Fall back to 'span' if used inline, otherwise default to 'div'. 
  // Prevents nesting divs in paragraphs which causes HTML validation issues and unexpected styling problems.
  const Component = hasInlineChild ? 'span' : 'div';

  return (
    <Component
      ref={ref as React.Ref<HTMLSpanElement> & React.Ref<HTMLDivElement>}
      className={[styles.starField, global.active ? styles.starFieldActive : "", className ?? ""].filter(Boolean).join(" ")}
      style={fieldStyle}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      {...rest}
    >
      <span aria-hidden="true" className={styles.cursorGlow} />
      {global.active && completionMessage && (
        <Component className={styles.completionMessageContainer}>
          {completionMessage}
        </Component>
      )}
      {children}
    </Component>
  );
});

export default StarGlowSurface;
