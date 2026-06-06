"use client";

import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import StarGlowSurface from "./StarGlowSurface";
import TwinklingStar from "./TwinklingStar";
import { useGameState } from "@/hooks/useGameState";
import projectcss from "@/components/plasmic/fiat_novum/plasmic.module.css";
import styles from "./star-game.module.css";
import { starGame } from "@/lib/starGame";

export interface StarLinkProps extends Omit<React.ComponentPropsWithoutRef<typeof Link>, "href" | "children"> {
  href: string;
  children: React.ReactNode;
}

const STAR_POSITIONS = [
  { className: styles.starLinkStarTopLeft, delay: 0.02, size: 11, x: -14, y: -12 },
  { className: styles.starLinkStarTopRight, delay: 0.07, size: 10, x: 66, y: -18 },
  { className: styles.starLinkStarBottom, delay: 0.12, size: 12, x: 28, y: 22 },
] as const;

function getStarLinkCollectionId(href: string, index: number) {
  return `star-link:${href}:${index}`;
}

function getStarLinkCollectedCount(href: string) {
  return STAR_POSITIONS.reduce((count, _, index) => {
    return count + (starGame.isCollected(getStarLinkCollectionId(href, index)) ? 1 : 0);
  }, 0);
}

export default function StarLink({ href, children, className, onClick, target, ...rest }: StarLinkProps) {
  const router = useRouter();
  const global = useGameState();
  const [isCollecting, setIsCollecting] = React.useState(false);
  const [callbackTarget, setCallbackTarget] = React.useState<{ x: number; y: number } | null>(null);
  const [callbackSequence, setCallbackSequence] = React.useState(0);
  const [completedCount, setCompletedCount] = React.useState(0);

  React.useEffect(() => {
    if (!isCollecting) return;
    if (completedCount < STAR_POSITIONS.length) return;

    router.push(href);
  }, [completedCount, href, isCollecting, router]);

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event);

      if (event.defaultPrevented) return;
      if (event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey || target === "_blank") {
        return;
      }

      if (isCollecting) {
        event.preventDefault();
        return;
      }

      if (!global.active) {
        return;
      }

      const linkRect = event.currentTarget.getBoundingClientRect();
      const hasPointerCoordinates = event.clientX !== 0 || event.clientY !== 0;
      const clickX = hasPointerCoordinates ? event.clientX - linkRect.left : linkRect.width / 2;
      const clickY = hasPointerCoordinates ? event.clientY - linkRect.top : linkRect.height / 2;

      event.preventDefault();

        const initialCompletedCount = getStarLinkCollectedCount(href);
      setIsCollecting(true);
        setCompletedCount(initialCompletedCount);
      setCallbackTarget({ x: event.clientX || linkRect.left + clickX, y: event.clientY || linkRect.top + clickY });
      setCallbackSequence((value) => value + 1);
    },
    [global.active, href, isCollecting, onClick, target]
  );

  return (
    <StarGlowSurface className={styles.starLinkSurface}>
      <Link
        href={href}
        onClick={handleClick}
        className={[
          projectcss.plasmic_default_styles,
          projectcss.plasmic_tokens,
          styles.starLink,
          isCollecting ? styles.starLinkCollecting : "",
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
        target={target}
        {...rest}
      >
        <span className={styles.starLinkStars} aria-hidden="true">
          {STAR_POSITIONS.map((star, index) => (
            <TwinklingStar
              key={star.className}
              className={[styles.starLinkStar, star.className].join(" ")}
              x={star.x}
              y={star.y}
              size={star.size}
              twinkleDuration={2.1}
              twinkleDelay={star.delay}
              interactionMode="callback"
              collectionId={getStarLinkCollectionId(href, index)}
              callbackTarget={callbackTarget}
              callbackSequence={callbackSequence}
              onCallbackComplete={() => setCompletedCount((value) => value + 1)}
            />
          ))}
        </span>
        <span className={styles.starLinkLabel}>{children}</span>
      </Link>
    </StarGlowSurface>
  );
}