"use client";

import * as React from "react";
import {
  PlasmicPagesProjectPostLayout,
  DefaultPagesProjectPostLayoutProps
} from "../plasmic/fiat_novum/PlasmicPagesProjectPostLayout";
import { HTMLElementRefOf } from "@plasmicapp/react-web";
import UiButton from "@/components/UI/UiButton";
import DynamicIcon from "@/components/UI/DynamicIcon";

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
  extends DefaultPagesProjectPostLayoutProps {
  coverAlignment?: string;
  tags?: string[];
  skills?: { name: string; iconName: string; link: string; }[];
}

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

  const { contentSlot, coverAlignment, tags, skills, ...rest } = props;

  return (
    <PlasmicPagesProjectPostLayout
      root={{ ref }}
      // Inject the hashed classes into the content slot
      contentSlot={
        <article className={`${"plasmic_default_styles"} ${"root_reset_77YCnrwhevb2XmBSeMeRKC"} ${"root_reset_77YCnrwhevb2XmBSeMeRKC_tags"}`}>
          {((tags && tags.length > 0) || (skills && skills.length > 0)) && (
            <div className="post-metadata-block">
              {tags && tags.length > 0 && (
                <div className="tags-container">
                  {tags.map((tag) => (
                    <UiButton
                      key={tag}
                      label={tag}
                      size="small"
                      outlineStyle={false}
                    />
                  ))}
                </div>
              )}
              {skills && skills.length > 0 && (
                <div className="skills-used-container">
                  <span className="skills-used-label">Skills Used:</span>
                  <div className="skills-list">
                    {skills.map((skill) => (
                      <UiButton
                        key={skill.name}
                        label={skill.name}
                        linkTo={skill.link}
                        iconStart={true}
                        iconSlot={
                          <DynamicIcon
                            iconName={skill.iconName}
                            size={18}
                            stroke={1.5}
                            color="#000000"
                            style={{ marginRight: "6px" }}
                          />
                        }
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {contentSlot}
        </article>
      }
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

const PagesProjectPostLayout = React.forwardRef(PagesProjectPostLayout_);
export default PagesProjectPostLayout;
