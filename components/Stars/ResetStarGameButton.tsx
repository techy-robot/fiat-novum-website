"use client";

import React from "react";
import { starGame } from "@/lib/starGame";
import projectcss from "@/components/plasmic/fiat_novum/plasmic.module.css";
import styles from "./ResetStarGameButton.module.css";

export interface ResetStarGameButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string
}

export default function ResetStarGameButton({ className, type = "button", onClick, text = "Reset Star Collection", ...rest }: ResetStarGameButtonProps) {
  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);

      if (event.defaultPrevented) return;

      starGame.reset();
    },
    [onClick]
  );

  return (
    <button type={type} className={[styles.resetButton, projectcss.plasmic_default_styles, projectcss.plasmic_tokens, className ?? ""].filter(Boolean).join(" ")} onClick={handleClick} {...rest}>
      {text}
    </button>
  );
}
