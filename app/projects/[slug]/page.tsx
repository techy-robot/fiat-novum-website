import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '@/keystatic.config'; 
// Client Wrapper
import ProjectPostLayout from '@/components/Pages/PagesProjectPostLayout'; 
// Use the React Server Component version of MDXRemote
import { MDXRemote } from 'next-mdx-remote/rsc'; 

const reader = createReader(process.cwd(), keystaticConfig);

// Define our URL parameters
interface RouteParams {
  params: Promise<{ slug: string }>;
}

// Generate Static Routes for each project
export async function generateStaticParams() {
  const projects = await reader.collections.projects.all();

  return projects.map((project) => ({
    slug: project.slug,
  }));
}

// Generate SEO Metadata Dynamically
export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  
  const project = await reader.collections.projects.read(slug);

  if (!project) return { title: "Project Not Found" };

  // Construct the absolute path to the generated open graph image
  const ogImageUrl = `/api/og/projects/${slug}`;

  const tagSlugs = project.tags || [];
  const allTags = await reader.collections.tags.all();
  const resolvedTags = tagSlugs
    .map((ts) => allTags.find((t) => t.slug === ts)?.entry.name || ts)
    .filter((t): t is string => !!t);

  const skillSlugs = project.skills || [];
  const allSkills = await reader.collections.skills.all();
  const resolvedSkillNames = skillSlugs
    .map((slug) => allSkills.find((s) => s.slug === slug)?.entry.name || slug)
    .filter((s): s is string => !!s);

  const combinedKeywords = [...resolvedTags, ...resolvedSkillNames];

  return {
    title: `${project.title}`,
    description: project.summary || `View project ${project.title}`,
    keywords: combinedKeywords,
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
  const { slug } = await params;

  // Fetch directly via slug
  const project = await reader.collections.projects.read(slug);

  if (!project) {
    notFound(); 
  }

  // Extract the raw MDX content string
  const mdxContentStr = await project.content(); 

  const tagSlugs = project.tags || [];
  const allTags = await reader.collections.tags.all();
  const resolvedTags = tagSlugs
    .map((ts) => allTags.find((t) => t.slug === ts)?.entry.name || ts)
    .filter((t): t is string => !!t);

  const skillSlugs = project.skills || [];
  const allSkills = await reader.collections.skills.all();
  const resolvedSkills = skillSlugs
    .map((slug) => {
      const match = allSkills.find((s) => s.slug === slug);
      if (!match) return null;
      return {
        name: match.entry.name || slug,
        iconName: match.entry.iconName || "Code",
        link: `/skills/${slug}`,
      };
    })
    .filter((s): s is { name: string; iconName: string; link: string; } => !!s);

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
    keywords: [...resolvedTags, ...resolvedSkills.map((s) => s.name)].join(', '),
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
        coverAlignment={project.coverAlignment ?? undefined}
        tags={resolvedTags}
        skills={resolvedSkills}
        contentSlot={
          <MDXRemote source={mdxContentStr} />
        }
      />
    </section>
  );
}