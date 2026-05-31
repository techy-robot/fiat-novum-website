import { Metadata } from "next";

import StarGlowSurface from "@/components/Stars/StarGlowSurface";
import StarLink from "@/components/Stars/StarLink";
import TwinklingStar from "@/components/Stars/TwinklingStar";
import { STAR_FIELD_LAYOUT_SIZE, STAR_FIELD_STARS, getStarInteractionMode } from "@/lib/starFieldLayout";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Star Field Prototype",
  description: "Interactive star collection demo for the Fiat Novum website.",
};

/**
 * Demo route for the star-game interaction.
 * The page keeps the layout simple so the activation flow is easy to understand.
 */
export default function StarFieldPage() {
  const stars = STAR_FIELD_STARS.map((star) => ({
    ...star,
    x: star.x / STAR_FIELD_LAYOUT_SIZE.width,
    y: star.y / STAR_FIELD_LAYOUT_SIZE.height,
  }));

  return (
    <main className={styles.page}>
      <section>
        <StarGlowSurface className={styles.demo}>
          <div className={styles.content}>
            <p className={styles.eyebrow}>Prototype</p>
            <h1 className={styles.title}>Collect the seed stars</h1>
            <p className={styles.description}>
              Move the cursor near the seed stars. Once all of them are collected, the section flips into game mode and every star becomes collectable.
            </p>
          </div>

          {stars.map((star) => (
            <TwinklingStar
              key={star.id}
              x={star.x}
              y={star.y}
              coordinateSpace="ratio"
              size={star.size}
              interactionMode={getStarInteractionMode(star.role)}
              twinkleDuration={star.twinkleDuration}
              twinkleDelay={star.twinkleDelay}
            />
          ))}
        </StarGlowSurface>
      </section>

      <section className={styles.linkSection}>
        <div>
          <p className={styles.eyebrow}>Link treatment</p>
          <h2 className={styles.sectionTitle}>A link that collects on click</h2>
          <p className={styles.sectionDescription}>
            Click the link and the stars zoom in first, then the page changes right after the animation finishes.
          </p>
        </div>

        <div className={styles.linkPreview}>
          <StarLink href="/projects">Open the project archive</StarLink>
        </div>
      </section>
    </main>
  );
}