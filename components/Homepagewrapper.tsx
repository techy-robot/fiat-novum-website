"use client";

import React from 'react';
import * as Icons from '@tabler/icons-react'; // Import Tabler library
import type { IconProps } from '@tabler/icons-react';
import { PlasmicHomepage } from '@/components/plasmic/fiat_novum/PlasmicHomepage';
import SkillCard from './SkillCard'; 
import ProjectCard from './ProjectCard';
import Link from 'next/link';

interface Skill {
  name: string;
  iconName: string; // The string from Keystatic (e.g., "Cpu")
  link: string;
}

interface HomepageClientProps {
  skills: Skill[];
  featuredProjects: {
    title: string;
    summary: string;
    coolnessFactor: number;
    coverImage: string | undefined;
    link: string;
  }[];
}

export default function Homepage({ skills, featuredProjects }: HomepageClientProps) {
  return (
    <PlasmicHomepage 
      skillTrackSlot={
        <div className="skill-track-animation flex">
          {[...skills, ...skills, ...skills].map((skill, i) => {
            
            // 1. Format the name (e.g., "Cpu" -> "IconCpu")
            const iconKey = `Icon${skill.iconName}`;
            
            // 2. Type-safe lookup: cast Icons to a record of Tabler components
            const IconsRecord = Icons as unknown as Record<string, React.FC<IconProps>>;
            
            // 3. Select the icon or fall back to a default
            const SelectedIcon = IconsRecord[iconKey] || Icons.IconCpu;
            
            return (
              <SkillCard
                key={`${skill.name}-${i}`}
                text={skill.name}
                link={skill.link}
                // 4. Inject the React Component into the Slot
                iconSlot={
                  <SelectedIcon 
                    size={24} 
                    stroke={1.5} 
                    color="#00FF9D" 
                    // Add a filter/shadow here if you want that extra "glow"
                    style={{ filter: 'drop-shadow(0 0 5px rgba(0, 255, 157, 0.4))' }}
                  />
                }
              />
            );
          })}
        </div>
      }

      topThreeProjects={
        <>
          {featuredProjects.map((project) => (
            <Link href={project.link} key={project.link} style={{ textDecoration: 'none' }}>
              <ProjectCard
                title={project.title}
                summary={project.summary}
                coolnessFactor={project.coolnessFactor}
                coverImage={project.coverImage}
              />
            </Link>
          ))}
        </>
      }
    />
  );
}