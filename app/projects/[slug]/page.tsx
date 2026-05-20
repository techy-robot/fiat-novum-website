import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '@/keystatic.config'; 
import ProjectPostLayout from '@/components/Pages/PagesProjectPostLayout'; // Client Wrapper
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

  if (!project) return { title: "Project Not Found" };

  // Construct the absolute path to the generated open graph image
  const ogImageUrl = `/api/og/projects/${slug}`;

  return {
    title: `${project.title}`,
    description: project.summary || `View project ${project.title}`,
    openGraph: {
      title: project.title,
      description: project.summary,
      type: 'article',
      url: `https://www.fiatnovum.com/projects/${slug}`,
      images: [
        {
          url: ogImageUrl,
          alt: project.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.summary,
      images: [ogImageUrl],
    },
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

  // Generate JSON-LD SEO metadata
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    headline: project.title,
    image: project.cover || 'https://www.fiatnovum.com/default-project-og.jpg',
    author: {
      '@type': 'Person',
      name: 'Asher Edwards',
      url: 'https://www.fiatnovum.com',
    },
    description: project.summary,
  };

  return (
    <section>
      {/* Add the JSON-LD to the page head dynamically */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ProjectPostLayout 
        title={project.title}
        coolnessFactor={project.coolnessFactor ?? undefined}
        coverImage={project.cover ?? undefined}
        contentSlot={
          <MDXRemote source={mdxContentStr} />
        } 
      />
    </section>
  );
}