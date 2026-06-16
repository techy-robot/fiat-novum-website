import { Metadata } from 'next';
import Link from 'next/link';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '@/keystatic.config'; 

// Import components
import ProjectIndexLayout from '@/components/Pages/PagesProjectIndexLayout'; 
import ProjectCard from '@/components/Cards/CardsProjectCard'; 

import { ProjectCardProps } from '@/types/projects';

// Basic metadata, no complex opengraph logic
export const metadata: Metadata = {
  title: "Projects",
  description: "Explore my latest work and projects.",
};

const reader = createReader(process.cwd(), keystaticConfig);

export default async function ProjectsIndexPage() {

  // Fetch all projects and sort by coolness factor
  const rawProjects = await reader.collections.projects.all();

  const projects: ProjectCardProps[] = rawProjects.map((project) => {
    const { title, summary, coolnessFactor, cover } = project.entry;
    
    return {
      title: title || "Untitled Project",
      summary: summary || "",
      coolnessFactor: coolnessFactor || 0,
      // Convert Keystatic's null to undefined so Plasmic accepts it as a simple string
      cover: cover ?? undefined, 
      url: `/projects/${project.slug}` 
    };
  });

  projects.sort((a, b) => b.coolnessFactor - a.coolnessFactor);

  // Render project cards
  return (
    <ProjectIndexLayout 
      projectListSlot={
        <div style={{ 
          display: 'grid', 
          /* This auto-fill logic automatically handles mobile/desktop breakpoints! */
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '2rem', 
          width: '100%',
          alignItems: 'stretch' /* Forces all cards in a row to be the same height */
        }}>
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
      }
    />
  );
}