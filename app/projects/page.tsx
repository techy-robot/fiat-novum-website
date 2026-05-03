// app/projects/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '@/keystatic.config'; 
import ProjectIndexLayout from '@/components/ProjectIndexLayout'; 
import ProjectCard from '@/components/ProjectCard'; 

export const metadata: Metadata = {
  title: "Projects | Fiat Novum",
  description: "Explore my latest work and projects.",
};

const reader = createReader(process.cwd(), keystaticConfig);

interface MappedProject {
  title: string;
  summary: string;
  coolnessFactor: number;
  cover: string | undefined; // Changed from null to undefined
  url: string;
}

export default async function ProjectsIndexPage() {
  const rawProjects = await reader.collections.projects.all();

  const projects: MappedProject[] = rawProjects.map((project) => {
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

  return (
    <ProjectIndexLayout 
      projectListSlot={
        <>
          {projects.map((project) => (
            <Link href={project.url} key={project.url} style={{ textDecoration: 'none' }}>
              <ProjectCard 
                title={project.title} 
                summary={project.summary}
                coolnessFactor={project.coolnessFactor}
                coverImage={project.cover} // Now purely string | undefined
              />
            </Link>
          ))}
        </>
      }
    />
  );
}