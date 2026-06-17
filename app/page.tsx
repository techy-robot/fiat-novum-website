
import { Metadata } from "next";
import Homepage from "@/components/Homepagewrapper";
import { Analytics } from '@vercel/analytics/next';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../keystatic.config';
import { ProjectCardProps } from "@/types/projects";
import { Skill } from "@/types/skills";
import { MDXRemote } from 'next-mdx-remote/rsc';

import React from 'react';
import * as Icons from '@tabler/icons-react'; // Import Tabler library
import type { IconProps } from '@tabler/icons-react';
import SkillCard from '@/components/Cards/CardsSkillCard'; 
import ProjectCard from '@/components/Cards/CardsProjectCard';
import Link from 'next/link';
import styles from './page.module.css';

// Handle SEO here
export const metadata: Metadata = {
  title: "Fiat Novum | Engineering & Design Portfolio",
  description: "Bridging the gap between hardware engineering and magic.",
};

// Render the page
export default async function Page() {

  const reader = createReader(process.cwd(), keystaticConfig);
  
  // 1. Fetch Skills Data
  const skillsData = await reader.collections.skills.all();
  const skills: Skill[] = skillsData.map(item => ({
    name: item.entry.name,
    iconName: item.entry.iconName,
    link: `skills/${item.slug}`,
  }));

  // 2. Fetch and Process Projects Data
  const projectsData = await reader.collections.projects.all();
  
  const featuredProjects: ProjectCardProps[] = projectsData
    .map(item => ({
      title: item.entry.title || "Untitled",
      summary: item.entry.summary || "",
      coolnessFactor: item.entry.coolnessFactor || 0,
      cover: item.entry.cover ?? undefined, 
      url: `projects/${item.slug}`,
    }))
    // Sort highest coolness factor to lowest
    .sort((a, b) => b.coolnessFactor - a.coolnessFactor) 
    // Grab only the top 3
    .slice(0, 3); 

  // 3. Fetch About Me Data
  const about = await reader.singletons.about.read();
  let aboutTitle = "";
  let aboutAvatar = "";
  let aboutContentStr = "";

  if (about) {
    aboutTitle = about.title;
    aboutAvatar = about.avatar ?? "";
    aboutContentStr = await about.content();
  }

  const skillTrackSlot=(
    <div className={`${styles.skillTrackAnimation} flex`}>
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
  );

  const featuredProjectsSlot=(
    <>
      <div className={styles.strictGridLayout}>
        {featuredProjects.map((project) => (
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
  );

  return (
    <>
      {/* Pass the new featuredProjects array to your wrapper */}
      <Homepage 
        skills={skillTrackSlot} 
        projects={featuredProjectsSlot} 
        aboutTitle={aboutTitle}
        aboutAvatar={aboutAvatar}
        aboutContent={aboutContentStr ? <MDXRemote source={aboutContentStr} /> : null}
      />
      <Analytics />
    </>
  );
}