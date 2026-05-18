"use client";

import React from 'react';
import * as Icons from '@tabler/icons-react'; // Import Tabler library
import type { IconProps } from '@tabler/icons-react';
import { PlasmicHomepage } from '@/components/plasmic/fiat_novum/PlasmicHomepage';
import SkillCard from './Cards/CardsSkillCard'; 
import ProjectCard from './Cards/CardsProjectCard';
import Link from 'next/link';
import { Skill } from '@/types/skills';
import { ProjectCardProps } from '@/types/projects';

interface HomepageClientProps {
  skills: Skill[];
  projects: ProjectCardProps[];
}

export default function Homepage({ skills, projects }: HomepageClientProps) {
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

      featuredProjects={
        <>
          <div className={"strict-grid-layout"}>
            {projects.map((project) => (
              <Link 
                href={project.url} 
                key={project.url} 
                style={{ 
                  textDecoration: 'none', 
                  display: 'flex', 
                  flexDirection: 'column' 
                }}
              >
                <ProjectCard 
                  title={project.title} 
                  summary={project.summary}
                  coolnessFactor={project.coolnessFactor}
                  coverImage={project.cover} 
                />
              </Link>
            ))}
          </div>
        </>
      }
    />
  );
}