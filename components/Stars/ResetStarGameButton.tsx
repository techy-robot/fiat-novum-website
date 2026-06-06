"use client";

import React from "react";
import { starGame } from "@/lib/starGame";
import styles from "./ResetStarGameButton.module.css";

export interface ResetStarGameButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export default function ResetStarGameButton({ className, type = "button", onClick, ...rest }: ResetStarGameButtonProps) {
  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);

      if (event.defaultPrevented) return;

      starGame.reset();
    },
    [onClick]
  );

  return (
    <button type={type} className={[styles.resetButton, className ?? ""].filter(Boolean).join(" ")} onClick={handleClick} {...rest}>
      Reset demo
    </button>
  );
}
