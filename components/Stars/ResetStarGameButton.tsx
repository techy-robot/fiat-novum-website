"use client";

import React from "react";
import { starGame } from "@/lib/starGame";
import UiButton, { UiButtonProps } from "@/components/UI/UiButton";

export interface ResetStarGameButtonProps extends Omit<UiButtonProps, "onClick"> {
  text?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick?: (event: any) => void;
}

export default function ResetStarGameButton({
  onClick,
  text = "Reset Star Collection",
  label,
  ...props
}: ResetStarGameButtonProps) {
  const handleClick = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event: any) => {
      onClick?.(event);

      if (event && event.defaultPrevented) return;

      starGame.reset();
    },
    [onClick]
  );

  return (
    <UiButton
      onClick={handleClick}
      label={label ?? text}
      {...props}
    />
  );
}

