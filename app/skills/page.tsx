import { Metadata } from 'next';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '@/keystatic.config'; 
import * as Icons from '@tabler/icons-react';
import type { IconProps } from '@tabler/icons-react';

// Import components
import BlogIndexLayout from '@/components/Pages/PagesBlogIndexLayout';
import SkillCard from '@/components/Cards/CardsSkillCard';

// Basic metadata, no complex opengraph logic
export const metadata: Metadata = {
  title: "Skills",
  description: "Asher Edwards' Skills",
};

const reader = createReader(process.cwd(), keystaticConfig);

export default async function SkillsIndexPage() {

  // Fetch skills and sort by proficiency
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

  // Render skill cards
  return (
    <BlogIndexLayout 
      postListSlot={
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          justifyContent: 'center',
          maxWidth: '900px',
          margin: '0 auto',
          padding: '24px 16px'
        }}>
          {skills.map((skill) => {
            // Format the name (e.g., "Cpu" -> "IconCpu")
            const iconKey = `Icon${skill.iconName}`;
            
            // Type-safe lookup: cast Icons to a record of Tabler components
            const IconsRecord = Icons as unknown as Record<string, React.FC<IconProps>>;
            
            // Select the icon or fall back to a default
            const SelectedIcon = IconsRecord[iconKey] || Icons.IconCpu;

            return (
              <SkillCard
                key={skill.url}
                text={skill.name}
                link={skill.url}
                iconSlot={
                  <SelectedIcon 
                    size={24} 
                    stroke={1.5} 
                    color="#00FF9D" 
                    // Add a filter/shadow for glow
                    style={{ filter: 'drop-shadow(0 0 5px rgba(0, 255, 157, 0.4))' }}
                  />
                }
              />
            );
          })}
        </div>
      }
    />
  );
}