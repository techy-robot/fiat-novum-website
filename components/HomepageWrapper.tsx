"use client";

import React from 'react';
import { PlasmicHomepage } from '@/components/plasmic/fiat_novum/PlasmicHomepage';
import { classNames } from '@plasmicapp/react-web';
import sty from '@/components/plasmic/fiat_novum/PlasmicHomepage.module.css';
import Image from 'next/image';

interface HomepageClientProps {
  skills: React.JSX.Element;
  projects: React.JSX.Element;
  aboutTitle?: string;
  aboutAvatar?: string;
  aboutContent?: React.ReactNode;
}

export default function Homepage({ 
  skills, 
  projects,
  aboutTitle,
  aboutAvatar,
  aboutContent 
}: HomepageClientProps) {
  return (
    <PlasmicHomepage 
      skillTrackSlot={skills}
      featuredProjects={projects}
      aboutme={aboutContent}
      headshot={
        aboutAvatar ? (
          <Image
            alt={aboutTitle || "About Me"}
            className={classNames(sty.img__rQ9Y5)}
            src={aboutAvatar}
            width={180}
            height={180}
            style={{
              objectFit: 'cover',
              width: '50%',
              aspectRatio: '1/1',
              borderRadius: '50%',
            }}
          />
        ) : undefined
      }
    />
  );
}