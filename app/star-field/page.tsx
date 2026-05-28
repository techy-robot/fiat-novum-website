import { Metadata } from "next";

import StarGlowSurface from "@/components/Stars/StarGlowSurface";
import StarLink from "@/components/Stars/StarLink";
import TwinklingStar from "@/components/Stars/TwinklingStar";
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

          {/* These seed stars must be collected first to unlock the active field state. */}
          <TwinklingStar x={96} y={82} size={18} seedMode twinkleDuration={2.4} />
          <TwinklingStar
            x={220}
            y={178}
            size={14}
            seedMode
            twinkleDuration={2.9}
            twinkleDelay={0.25}
          />
          <TwinklingStar
            x={372}
            y={120}
            size={16}
            seedMode
            twinkleDuration={2.6}
            twinkleDelay={0.5}
          />

          {/* Once the seeds are complete, the remaining stars become collectable too. */}
          <TwinklingStar x={492} y={204} size={15} twinkleDuration={3.2} />
          <TwinklingStar
            x={612}
            y={108}
            size={13}
            twinkleDuration={2.7}
            twinkleDelay={0.2}
          />
          <TwinklingStar
            x={744}
            y={182}
            size={17}
            twinkleDuration={3}
            twinkleDelay={0.4}
          />
        </StarGlowSurface>
      </section>

      <section className={styles.linkSection}>
        <div>
          <p className={styles.eyebrow}>Link treatment</p>
          <h2 className={styles.sectionTitle}>A link with its own small constellation</h2>
          <p className={styles.sectionDescription}>
            This version adds three stars and a stronger glow so the call to action reads like a distinct interactive element.
          </p>
        </div>

        <div className={styles.linkPreview}>
          <StarGlowSurface className={styles.linkGlowSurface} style={{ overflow: "visible" }}>
            <StarLink href="/projects">
              Open the project archive
            </StarLink>
          </StarGlowSurface>
        </div>
      </section>
    </main>
  );
}