import { Metadata } from "next";

import StarFieldProvider from "@/components/Stars/StarFieldProvider";
import TwinklingStar from "@/components/Stars/TwinklingStar";

export const metadata: Metadata = {
  title: "Star Field Prototype",
  description: "Interactive star collection demo for the Fiat Novum website.",
};

export default function StarFieldPage() {
  return (
    <main style={{ padding: "2rem 1.25rem 4rem" }}>
      <StarFieldProvider
        className="star-field-demo"
        style={{
          minHeight: 440,
          borderRadius: "1.5rem",
          border: "1px solid rgba(0, 255, 157, 0.16)",
          background:
            "radial-gradient(circle at top, rgba(0, 255, 157, 0.14), rgba(0, 0, 0, 0.04) 35%, rgba(0, 0, 0, 0.82) 100%)",
          boxShadow: "0 30px 90px rgba(0, 0, 0, 0.35)",
        }}
      >
        <div style={{ position: "relative", zIndex: 1, padding: "1.5rem" }}>
          <p
            style={{
              marginBottom: "0.5rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontSize: "0.75rem",
            }}
          >
            Prototype
          </p>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
            Collect the seed stars
          </h1>
          <p style={{ maxWidth: 560, lineHeight: 1.6 }}>
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