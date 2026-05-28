import Link from "next/link";
import React from "react";
import TwinklingStar from "./TwinklingStar";
import styles from "./star-game.module.css";

export interface StarLinkProps extends Omit<React.ComponentPropsWithoutRef<typeof Link>, "href" | "children"> {
  href: string;
  children: React.ReactNode;
  collectRadius?: number;
}

export default function StarLink({ href, children, className, collectRadius = 6, ...rest }: StarLinkProps) {
  return (
    <Link href={href} className={[styles.starLink, className ?? ""].filter(Boolean).join(" ")} {...rest}>
      <TwinklingStar x={-14} y={-12} size={11} twinkleDuration={2.2} twinkleDelay={0.1} collectRadius={collectRadius} />
      <TwinklingStar x={66} y={-18} size={10} twinkleDuration={2.7} twinkleDelay={0.55} collectRadius={collectRadius} />
      <TwinklingStar x={28} y={22} size={12} twinkleDuration={2.4} twinkleDelay={0.9} collectRadius={collectRadius} />
      <span className={styles.starLinkLabel}>{children}</span>
    </Link>
  );
}