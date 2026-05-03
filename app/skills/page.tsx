// app/blog/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { createReader } from '@keystatic/core/reader';
// Update this path to match your project root
import keystaticConfig from '@/keystatic.config'; 
import BlogIndexLayout from '@/components/BlogIndexLayout'; // Import your Client Wrapper
import BlogCard from '@/components/BlogCard'; // Import your Client Wrapper

export const metadata: Metadata = {
  title: "Skills | Fiat Novum",
  description: "Asher Edwards' Skills",
};

const reader = createReader(process.cwd(), keystaticConfig);

export default async function SkillsIndexPage() {
  // Fetch data directly inside the Server Component
  const rawSkills = await reader.collections.skills.all();

  const skills = rawSkills.map((skill) => {
    const { name, proficiency, iconName} = skill.entry;
    
    return {
      name: name || "Skill",
      proficiency: proficiency || 0,
      url: `/skills/${skill.slug}`,
      iconName: iconName || "Code",
    };
  });

  skills.sort((a, b) => b.proficiency - a.proficiency);

  return (
    <BlogIndexLayout 
      postListSlot={
        <>
          {skills.map((skill) => (
            <Link href={skill.url} key={skill.url} style={{ textDecoration: 'none' }}>
              <BlogCard title={skill.name} date={skill.proficiency} />
            </Link>
          ))}
        </>
      }
    />
  );
}