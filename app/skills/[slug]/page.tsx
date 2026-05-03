import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createReader } from '@keystatic/core/reader';
// Update this path to match your project root
import keystaticConfig from '@/keystatic.config'; 
import BlogPostLayout from '@/components/BlogPostLayout'; // Using blog layout for testing
// Use the React Server Component version of MDXRemote
import { MDXRemote } from 'next-mdx-remote/rsc'; 

const reader = createReader(process.cwd(), keystaticConfig);

// Skills use a much simpler URL structure, requiring only a slug parameter
interface RouteParams {
  params: { slug: string };
}

// Replaces getStaticPaths
export async function generateStaticParams() {
  const skills = await reader.collections.skills.all();

  return skills.map((skill) => ({
    slug: skill.slug,
  }));
}

// Generate SEO Metadata Dynamically
export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = params;
  
  // Use .read() for a direct lookup instead of filtering through .all()
  const skill = await reader.collections.skills.read(slug);

  if (!skill) return { title: "Skill Not Found | Fiat Novum" };

  return {
    title: `${skill.name} | Fiat Novum`,
  };
}

// Render the Page
export default async function SkillPage({ params }: RouteParams) {
  const { slug } = params;

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
        // MDXRemote/rsc takes the raw string directly
        <MDXRemote source={mdxContentStr} />
      } 
    />
  );
}