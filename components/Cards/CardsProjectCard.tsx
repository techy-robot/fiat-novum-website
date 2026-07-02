"use client";

import * as React from "react";
import {
  PlasmicCardsProjectCard,
  DefaultCardsProjectCardProps
} from "../plasmic/fiat_novum/PlasmicCardsProjectCard";
import { HTMLElementRefOf } from "@plasmicapp/react-web";

// Your component props start with props for variants and slots you defined
// in Plasmic, but you can add more here, like event handlers that you can
// attach to named nodes in your component.
//
// If you don't want to expose certain variants or slots as a prop, you can use
// Omit to hide them:
//
// interface CardsProjectCardProps extends Omit<DefaultCardsProjectCardProps, "hideProps1"|"hideProp2"> {
//   // etc.
// }
//
// You can also stop extending from DefaultCardsProjectCardProps altogether and have
// total control over the props for your component.
export interface CardsProjectCardProps extends DefaultCardsProjectCardProps {
  coverAlignment?: string;
}

function CardsProjectCard_(
  props: CardsProjectCardProps,
  ref: HTMLElementRefOf<"div">
) {
  // Use PlasmicCardsProjectCard to render this component as it was
  // designed in Plasmic, by activating the appropriate variants,
  // attaching the appropriate event handlers, etc.  You
  // can also install whatever React hooks you need here to manage state or
  // fetch data.
  //
  // Props you can pass into PlasmicCardsProjectCard are:
  // 1. Variants you want to activate,
  // 2. Contents for slots you want to fill,
  // 3. Overrides for any named node in the component to attach behavior and data,
  // 4. Props to set on the root node.
  //
  // By default, we are just piping all CardsProjectCardProps here, but feel free
  // to do whatever works for you.

  const { coverAlignment, ...rest } = props;

  return (
    <PlasmicCardsProjectCard
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

const CardsProjectCard = React.forwardRef(CardsProjectCard_);
export default CardsProjectCard;
