"use client";

import * as React from "react";
import {
  PlasmicPagesBlogPostLayout,
  DefaultPagesBlogPostLayoutProps
} from "../plasmic/fiat_novum/PlasmicPagesBlogPostLayout";
import { HTMLElementRefOf } from "@plasmicapp/react-web";

// Your component props start with props for variants and slots you defined
// in Plasmic, but you can add more here, like event handlers that you can
// attach to named nodes in your component.
//
// If you don't want to expose certain variants or slots as a prop, you can use
// Omit to hide them:
//
// interface PagesBlogPostLayoutProps extends Omit<DefaultPagesBlogPostLayoutProps, "hideProps1"|"hideProp2"> {
//   // etc.
// }
//
// You can also stop extending from DefaultPagesBlogPostLayoutProps altogether and have
// total control over the props for your component.
export interface PagesBlogPostLayoutProps extends DefaultPagesBlogPostLayoutProps {}

function PagesBlogPostLayout_(
  props: PagesBlogPostLayoutProps,
  ref: HTMLElementRefOf<"div">
) {

  // Props you can pass into PlasmicPagesBlogPostLayout are:
  // 1. Variants you want to activate,
  // 2. Contents for slots you want to fill,
  // 3. Overrides for any named node in the component to attach behavior and data,
  // 4. Props to set on the root node.

  const { contentSlot, ...rest } = props;

  return (
    <PlasmicPagesBlogPostLayout
      root={{ ref }}
      // Inject the hashed classes into the content slot
      contentSlot={
        <article className={`${"plasmic_default_styles"} ${"root_reset_77YCnrwhevb2XmBSeMeRKC"} ${"root_reset_77YCnrwhevb2XmBSeMeRKC_tags"}`}>
          {contentSlot}
        </article>
      }
      {...rest}
    />
  );
}

const PagesBlogPostLayout = React.forwardRef(PagesBlogPostLayout_);
export default PagesBlogPostLayout;