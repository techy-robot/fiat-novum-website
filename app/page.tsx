// app/page.tsx
import { Metadata } from "next";
import Homepage from "@/components/Homepagewrapper";
import PlasmicClientProvider from "./PlasmicClientProvider";
import { Analytics } from '@vercel/analytics/next';
import '../styles/globals.css';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../keystatic.config';

// Handle SEO here
export const metadata: Metadata = {
  title: "Fiat Novum | Home",
  description: "Welcome to my personal website.",
};

// types/skills.ts
interface Skill {
  name: string;
  iconName: string; // The string from Keystatic (e.g., "Cpu")
  link: string;
}

// Define the shape for our Featured Project prop
interface FeaturedProject {
  title: string;
  summary: string;
  coolnessFactor: number;
  coverImage: string | undefined;
  link: string;
}

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
  
  const featuredProjects: FeaturedProject[] = projectsData
    .map(item => ({
      title: item.entry.title || "Untitled",
      summary: item.entry.summary || "",
      coolnessFactor: item.entry.coolnessFactor || 0,
      coverImage: item.entry.cover ?? undefined, 
      link: `projects/${item.slug}`,
    }))
    // Sort highest coolness factor to lowest
    .sort((a, b) => b.coolnessFactor - a.coolnessFactor) 
    // Grab only the top 3
    .slice(0, 3); 

  return (
    <PlasmicClientProvider>
      {/* Pass the new featuredProjects array to your wrapper */}
      <Homepage skills={skills} featuredProjects={featuredProjects} />
      <Analytics />
    </PlasmicClientProvider>
  );
}