import { Metadata } from "next";

import StarFieldProvider from "@/components/Stars/StarFieldProvider";
import TwinklingStar from "@/components/Stars/TwinklingStar";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Star Field Prototype",
  description: "Interactive star collection demo for the Fiat Novum website.",
};

export default function StarFieldPage() {
  return (
    <main className={styles.page}>
      <StarFieldProvider
        className={styles.demo}
      >
        <div className={styles.content}>
          <p className={styles.eyebrow}>Prototype</p>
          <h1 className={styles.title}>
            Collect the seed stars
          </h1>
          <p className={styles.description}>
            Move the cursor near the seed stars. Once all of them are collected, the section flips into game mode and every star becomes collectable.
          </p>
        </div>

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
      </StarFieldProvider>
    </main>
  );
}