
"use client";

import { PlasmicRootProvider } from "@plasmicapp/react-web";

// Add the type definition for children here:
export default function PlasmicClientProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
    return <PlasmicRootProvider>{children}</PlasmicRootProvider>;
}