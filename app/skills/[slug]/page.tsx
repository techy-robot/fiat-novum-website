import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '@/keystatic.config'; 
// Client Wrapper
import BlogPostLayout from '@/components/Pages/PagesBlogPostLayout';
// Use the React Server Component version of MDXRemote
import { MDXRemote } from 'next-mdx-remote/rsc'; 

const reader = createReader(process.cwd(), keystaticConfig);

// Define our URL parameters
interface RouteParams {
  params: Promise<{ slug: string }>;
}

// Generate Static Routes for each skill
export async function generateStaticParams() {
  const skills = await reader.collections.skills.all();

  return skills.map((skill) => ({
    slug: skill.slug,
  }));
}

// Generate SEO Metadata Dynamically
export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  
  // Use .read() for a direct lookup instead of filtering through .all()
  const skill = await reader.collections.skills.read(slug);

  if (!skill) return { title: "Skill has not been learned" };

  return {
    title: `${skill.name} Skill`,
  };
}

// Render the Page
export default async function SkillPage({ params }: RouteParams) {
  const { slug } = await params;

  // Fetch the specific skill entry directly via its slug
  const skill = await reader.collections.skills.read(slug);

  // 404 if no skill exists for this specific slug
  if (!skill) {
    notFound(); 
  }

  // Extract the raw MDX content string from the skill entry
  const mdxContentStr = await skill.content(); 

  return (
    <BlogPostLayout 
      title={skill.name}
      contentSlot={
        <MDXRemote source={mdxContentStr} />
      } 
    />
  );
}