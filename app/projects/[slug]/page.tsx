import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '@/keystatic.config'; 
import ProjectPostLayout from '@/components/ProjectPostLayout'; // Client Wrapper
import { MDXRemote } from 'next-mdx-remote/rsc'; 

const reader = createReader(process.cwd(), keystaticConfig);

interface RouteParams {
  params: { slug: string };
}

// Generate Static Paths for Vercel Build
export async function generateStaticParams() {
  const projects = await reader.collections.projects.all();

  return projects.map((project) => ({
    slug: project.slug,
  }));
}

// Generate SEO Metadata Dynamically
export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = params;
  
  const project = await reader.collections.projects.read(slug);

  if (!project) return { title: "Project Not Found | Fiat Novum" };

  return {
    title: `${project.title} | Fiat Novum`,
    description: project.summary || "View this project.",
  };
}

// Render the Page
export default async function ProjectPostPage({ params }: RouteParams) {
  const { slug } = params;

  // Fetch directly via slug
  const project = await reader.collections.projects.read(slug);

  if (!project) {
    notFound(); 
  }

  // Extract the raw MDX content string
  const mdxContentStr = await project.content(); 

  return (
    <ProjectPostLayout 
      title={project.title}
      coolnessFactor={project.coolnessFactor ?? undefined}
      coverImage={project.cover ?? undefined}
      contentSlot={
        <MDXRemote source={mdxContentStr} />
      } 
    />
  );
}