"use client";

import * as React from "react";
import {
  PlasmicPagesProjectPostLayout,
  DefaultPagesProjectPostLayoutProps
} from "../plasmic/fiat_novum/PlasmicPagesProjectPostLayout";
import { HTMLElementRefOf } from "@plasmicapp/react-web";


// Import styles as an object to handle hashing
import styles from '@/components/plasmic/fiat_novum/plasmic.module.css';

// Your component props start with props for variants and slots you defined
// in Plasmic, but you can add more here, like event handlers that you can
// attach to named nodes in your component.
//
// If you don't want to expose certain variants or slots as a prop, you can use
// Omit to hide them:
//
// interface PagesProjectPostLayoutProps extends Omit<DefaultPagesProjectPostLayoutProps, "hideProps1"|"hideProp2"> {
//   // etc.
// }
//
// You can also stop extending from DefaultPagesProjectPostLayoutProps altogether and have
// total control over the props for your component.
export interface PagesProjectPostLayoutProps
  extends DefaultPagesProjectPostLayoutProps {}

function PagesProjectPostLayout_(
  props: PagesProjectPostLayoutProps,
  ref: HTMLElementRefOf<"div">
) {
  // Use PlasmicPagesProjectPostLayout to render this component as it was
  // designed in Plasmic, by activating the appropriate variants,
  // attaching the appropriate event handlers, etc.  You
  // can also install whatever React hooks you need here to manage state or
  // fetch data.
  //
  // Props you can pass into PlasmicPagesProjectPostLayout are:
  // 1. Variants you want to activate,
  // 2. Contents for slots you want to fill,
  // 3. Overrides for any named node in the component to attach behavior and data,
  // 4. Props to set on the root node.
  //
  // By default, we are just piping all PagesProjectPostLayoutProps here, but feel free
  // to do whatever works for you.

  const { contentSlot, ...rest } = props;

  return (
    <PlasmicPagesProjectPostLayout
      root={{ ref }}
      // Inject the hashed classes into the content slot
      contentSlot={
        <article className={`${styles.plasmic_default_styles} ${styles.root_reset} ${styles.root_reset_tags}`}>
          {contentSlot}
        </article>
      }
      {...rest}
    />
  );
}

const PagesProjectPostLayout = React.forwardRef(PagesProjectPostLayout_);
export default PagesProjectPostLayout;
