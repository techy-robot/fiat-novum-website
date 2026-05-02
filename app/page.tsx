
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

// Render the page
export default async function Page() {

  const reader = createReader(process.cwd(), keystaticConfig);
  const skillsData = await reader.collections.skills.all();
  
  // Transform Keystatic entries into our typed Skill array
  const skills: Skill[] = skillsData.map(item => ({
    name: item.entry.name,
    iconName: item.entry.iconName,
    link: item.slug,
  }));

  return (
    <PlasmicClientProvider>
      <Homepage skills={skills} />
      <Analytics />
    </PlasmicClientProvider>
  );
}
