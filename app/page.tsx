
import { Metadata } from "next";
import Homepage from "@/components/Homepagewrapper";
import { Analytics } from '@vercel/analytics/next';
import '../styles/globals.css';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../keystatic.config';
import { ProjectCardProps } from "@/types/projects";
import { Skill } from "@/types/skills";

// Handle SEO here
export const metadata: Metadata = {
  title: "Fiat Novum | Home",
  description: "Welcome to my personal website.",
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

  return (
    <>
      {/* Pass the new featuredProjects array to your wrapper */}
      <Homepage skills={skills} projects={featuredProjects} />
      <Analytics />
    </>
  );
}