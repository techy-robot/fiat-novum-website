import { initPlasmicLoader } from "@plasmicapp/loader-nextjs";

import ResetStarGameButton from "@/components/Stars/ResetStarGameButton";
import StarGlowSurface from "@/components/Stars/StarGlowSurface";
import StarLink from "@/components/Stars/StarLink";
import TwinklingStar from "@/components/Stars/TwinklingStar";

export const PLASMIC = initPlasmicLoader({
  projects: [
    {
      id: "77YCnrwhevb2XmBSeMeRKC",
      token: "vbQyou03NYKoUJYS5XQuqHd1f0lvaFhEPqfaaHmK31dT23rx3SxsFVupkacMBjTpM3WPzbm42ZdACSUug",
    },
  ],
  platformOptions: {
    nextjs: {
      appDir: false,
    }
  },
  
  // By default Plasmic will use the last published version of your project.
  // For development, you can set preview to true, which will use the unpublished
  // project, allowing you to see your designs without publishing.  Please
  // only use this for development, as this is significantly slower.
  preview: false,
});

const STAR_GAME_SECTION = "Star Game";

PLASMIC.registerComponent(StarGlowSurface, {
  name: "StarGlowSurface",
  displayName: "Star Glow Surface",
  description: "A glow-enabled surface for building the star-field layout.",
  section: STAR_GAME_SECTION,
  importPath: "@/components/Stars/StarGlowSurface",
  isDefaultExport: true,
  props: {
    children: { type: "slot", displayName: "Content" },
    completionMessage: {
      type: "slot",
      displayName: "Completion Message",
      description: "Message/Content to display once all seed stars are collected."
    },
  },
  styleSections: true,
});

PLASMIC.registerComponent(TwinklingStar, {
  name: "TwinklingStar",
  displayName: "Twinkling Star",
  description: "An animated star that can be used as a fixed accent or interactive game piece.",
  section: STAR_GAME_SECTION,
  importPath: "@/components/Stars/TwinklingStar",
  isDefaultExport: true,
  props: {
    x: { type: "string", displayName: "X", defaultValue: "0px" },
    y: { type: "string", displayName: "Y", defaultValue: "0px" },
    size: { type: "number", displayName: "Size", defaultValue: 14 },
    interactionMode: {
      type: "choice",
      displayName: "Interaction mode",
      options: [
        { label: "Game state", value: "gameState" },
        { label: "Seed", value: "seed" },
        { label: "Callback", value: "callback" },
        { label: "Fixed", value: "fixed" },
      ],
      defaultValue: "gameState",
    },
    activationRadius: { type: "number", displayName: "Activation radius", defaultValue: 48, advanced: true },
    twinkleDuration: { type: "number", displayName: "Twinkle duration", defaultValue: 2.7, advanced: true },
    twinkleDelay: { type: "number", displayName: "Twinkle delay", defaultValue: 0, advanced: true },
    color: { type: "string", displayName: "Icon color", defaultValue: "currentColor", advanced: true },
    collectionId: { type: "string", displayName: "Collection ID", description: "Stable identifier used to persist collection state on the device. Falls back to a position-based identifier if left blank." },
  },
  styleSections: true,
});

PLASMIC.registerComponent(StarLink, {
  name: "StarLink",
  displayName: "Star Link",
  description: "A Plasmic-style link with collectible stars around the content.",
  section: STAR_GAME_SECTION,
  importPath: "@/components/Stars/StarLink",
  isDefaultExport: true,
  props: {
    href: { type: "href", displayName: "Destination", defaultValue: "/projects" },
    target: {
      type: "choice",
      displayName: "Open in new tab?",
      options: [
        { label: "Same tab", value: "_self" },
        { label: "New tab", value: "_blank" },
      ],
      defaultValue: "_self",
    },
    className: { type: "string", displayName: "Class Name" },
    tabIndex: { type: "number", displayName: "Tab Index" },
    title: { type: "string", displayName: "Hover text" },
    id: { type: "string", displayName: "Id" },
    role: { type: "string", displayName: "Role" },
    ariaDescribedby: { type: "string", displayName: "Aria Describedby" },
    ariaHidden: { type: "boolean", displayName: "Aria Hidden" },
    ariaLabel: { type: "string", displayName: "Aria Label" },
    ariaLabelledby: { type: "string", displayName: "Aria Labelledby" },
    children: { type: "slot", displayName: "Content" },
  },
  styleSections: true,
});

PLASMIC.registerComponent(ResetStarGameButton, {
  name: "ResetStarGameButton",
  displayName: "Reset Star Game Button",
  description: "A button that resets the star collection game state.",
  section: STAR_GAME_SECTION,
  importPath: "@/components/Stars/ResetStarGameButton",
  isDefaultExport: true,
  props: {
    text: { type: "string", displayName: "Text", defaultValue: "Reset Star Collection" },
  },
  styleSections: true,
});

// You can register any code components that you want to use here; see
// https://docs.plasmic.app/learn/code-components-ref/
// And configure your Plasmic project to use the host url pointing at
// the /plasmic-host page of your nextjs app (for example,
// http://localhost:3000/plasmic-host).  See
// https://docs.plasmic.app/learn/app-hosting/#set-a-plasmic-project-to-use-your-app-host

// PLASMIC.registerComponent(...);
