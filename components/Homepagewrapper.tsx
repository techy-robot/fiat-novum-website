"use client";

import React from 'react';
import { PlasmicHomepage } from '@/components/plasmic/fiat_novum/PlasmicHomepage';

interface HomepageClientProps {
  skills: React.JSX.Element;
  projects: React.JSX.Element;
}

export default function Homepage({ skills, projects }: HomepageClientProps) {
  return (
    <PlasmicHomepage 
      skillTrackSlot={skills}
      featuredProjects={projects}
    />
  );
}