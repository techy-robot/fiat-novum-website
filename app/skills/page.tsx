import { Metadata } from 'next';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '@/keystatic.config'; 
import DynamicIcon from '@/components/UI/DynamicIcon';

// Import components
import BlogIndexLayout from '@/components/Pages/PagesBlogIndexLayout';
import SkillCard from '@/components/Cards/CardsSkillCard';

import styles from '@/styles/grid-layout.module.css';

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
        <div className={styles.skillsContainer}>
          {skills.map((skill) => (
            <SkillCard
              key={skill.url}
              text={skill.name}
              link={skill.url}
              iconSlot={
                <DynamicIcon 
                  iconName={skill.iconName}
                  size={24} 
                  stroke={1.5} 
                  color="#00FF9D" 
                  className={styles.skillIconGlow}
                />
              }
            />
          ))}
        </div>
      }
    />
  );
}