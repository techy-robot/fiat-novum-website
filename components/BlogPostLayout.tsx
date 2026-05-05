"use client";
import * as React from "react";
import {
  PlasmicBlogPostLayout,
  DefaultBlogPostLayoutProps
} from "./plasmic/fiat_novum/PlasmicBlogPostLayout";
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
// interface BlogPostLayoutProps extends Omit<DefaultBlogPostLayoutProps, "hideProps1"|"hideProp2"> {
//   // etc.
// }
//
// You can also stop extending from DefaultBlogPostLayoutProps altogether and have
// total control over the props for your component.
export interface BlogPostLayoutProps extends DefaultBlogPostLayoutProps {}

function BlogPostLayout_(
  props: BlogPostLayoutProps,
  ref: HTMLElementRefOf<"div">
) {

  // Props you can pass into PlasmicBlogPostLayout are:
  // 1. Variants you want to activate,
  // 2. Contents for slots you want to fill,
  // 3. Overrides for any named node in the component to attach behavior and data,
  // 4. Props to set on the root node.

  const { contentSlot, ...rest } = props;

  return (
    <PlasmicBlogPostLayout
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

const BlogPostLayout = React.forwardRef(BlogPostLayout_);
export default BlogPostLayout;