"use client";

import * as React from "react";
import {
  PlasmicCardsBlogCard,
  DefaultCardsBlogCardProps
} from "../plasmic/fiat_novum/PlasmicCardsBlogCard";
import { HTMLElementRefOf } from "@plasmicapp/react-web";

// Your component props start with props for variants and slots you defined
// in Plasmic, but you can add more here, like event handlers that you can
// attach to named nodes in your component.
//
// If you don't want to expose certain variants or slots as a prop, you can use
// Omit to hide them:
//
// interface CardsBlogCardProps extends Omit<DefaultCardsBlogCardProps, "hideProps1"|"hideProp2"> {
//   // etc.
// }
//
// You can also stop extending from DefaultCardsBlogCardProps altogether and have
// total control over the props for your component.
export interface CardsBlogCardProps extends DefaultCardsBlogCardProps {
  coverAlignment?: string;
}

function CardsBlogCard_(
  props: CardsBlogCardProps,
  ref: HTMLElementRefOf<"div">
) {
  // Use PlasmicCardsBlogCard to render this component as it was
  // designed in Plasmic, by activating the appropriate variants,
  // attaching the appropriate event handlers, etc.  You
  // can also install whatever React hooks you need here to manage state or
  // fetch data.
  //
  // Props you can pass into PlasmicCardsBlogCard are:
  // 1. Variants you want to activate,
  // 2. Contents for slots you want to fill,
  // 3. Overrides for any named node in the component to attach behavior and data,
  // 4. Props to set on the root node.
  //
  // By default, we are just piping all CardsBlogCardProps here, but feel free
  // to do whatever works for you.

  const { coverAlignment, ...rest } = props;

  return (
    <PlasmicCardsBlogCard
      root={{ ref }}
      img={{
        className: 'plasmic-cover-align-img',
        style: coverAlignment ? {
          '--cover-alignment': coverAlignment,
        } as React.CSSProperties : undefined
      }}
      {...rest}
    />
  );
}

const CardsBlogCard = React.forwardRef(CardsBlogCard_);
export default CardsBlogCard;
