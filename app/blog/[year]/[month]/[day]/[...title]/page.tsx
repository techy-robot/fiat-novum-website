import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '@/keystatic.config'; 
import BlogPostLayout from '@/components/Pages/PagesBlogPostLayout';
// Use the React Server Component version of MDXRemote
import { MDXRemote } from 'next-mdx-remote/rsc'; 

const reader = createReader(process.cwd(), keystaticConfig);

// Define our URL parameters
interface RouteParams {
  params: Promise<{ year: string; month: string; day: string; title: string[] }>;
}

// Generate static routes for each post
export async function generateStaticParams() {
  const posts = await reader.collections.posts.all();

  return posts.map((post) => {
    const publishDate = post.entry.publishDate;
    if (!publishDate) return null;

    const [year, month, day] = publishDate.split('-');
    return { year, month, day, title: [post.slug] };
  }).filter(Boolean) as { year: string, month: string, day: string, title: string[] }[];
}

// Generate SEO Metadata Dynamically
export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { year, month, day } = await params;
  const targetDate = `${year}-${month}-${day}`;
  
  // Filter through all posts to find the one for this specific date
  const allPosts = await reader.collections.posts.all();
  const post = allPosts.find((p) => p.entry.publishDate === targetDate);

  if (!post) return { title: "Post Not Found" };

  // Construct the absolute path to the generated open graph image
  const ogImageUrl = `/api/og/blog/${year}/${month}/${day}/${post.slug}`;

  const tagSlugs = post.entry.tags || [];
  const allTags = await reader.collections.tags.all();
  const resolvedTags = tagSlugs
    .map((slug) => allTags.find((t) => t.slug === slug)?.entry.name || slug)
    .filter((t): t is string => !!t);

  const skillSlugs = post.entry.skills || [];
  const allSkills = await reader.collections.skills.all();
  const resolvedSkillNames = skillSlugs
    .map((slug) => allSkills.find((s) => s.slug === slug)?.entry.name || slug)
    .filter((s): s is string => !!s);

  const combinedKeywords = [...resolvedTags, ...resolvedSkillNames];

  return {
    title: `${post.entry.title}`,
    description: post.entry.summary || `Read ${post.entry.title}`,
    keywords: combinedKeywords,
    openGraph: {
      title: post.entry.title,
      description: post.entry.summary,
      type: 'article',
      publishedTime: post.entry.publishDate,
      url: `https://www.fiatnovum.com/blog/${year}/${month}/${day}/${post.slug}`,
      images: [
        {
          url: ogImageUrl,
          alt: post.entry.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.entry.title,
      description: post.entry.summary,
      images: [ogImageUrl],
    },
  };
}

// Render the Page
export default async function BlogPostPage({ params }: RouteParams) {
  const { year, month, day, title } = await params;
  const requestedSlug = title[0];
  const targetDate = `${year}-${month}-${day}`;

  // Filter through all posts to find the one for this specific date
  const allPosts = await reader.collections.posts.all();
  const post = allPosts.find((p) => p.entry.publishDate === targetDate);

  // 404 if no post exists for this specific date
  if (!post) {
    notFound(); 
  }

  // Fluid Slug Handling: Redirect if the slug doesn't match
  if (requestedSlug !== post.slug) {
    redirect(`/blog/${year}/${month}/${day}/${post.slug}`);
  }

  // Extract the raw MDX content string
  const mdxContentStr = await post.entry.content(); 

  const tagSlugs = post.entry.tags || [];
  const allTags = await reader.collections.tags.all();
  const resolvedTags = tagSlugs
    .map((slug) => allTags.find((t) => t.slug === slug)?.entry.name || slug)
    .filter((t): t is string => !!t);

  const skillSlugs = post.entry.skills || [];
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
    '@type': 'Article',
    headline: post.entry.title,
    image: post.entry.cover || 'https://www.fiatnovum.com/default-blog-og.jpg',
    datePublished: post.entry.publishDate,
    author: {
      '@type': 'Person',
      name: 'Asher Edwards',
      url: 'https://www.fiatnovum.com',
    },
    description: post.entry.summary,
    keywords: [...resolvedTags, ...resolvedSkills.map((s) => s.name)].join(', '),
  };

  return (
    <section>
      {/* Add the JSON-LD to the page head dynamically */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <BlogPostLayout 
        title={post.entry.title}
        contentSlot={
          <MDXRemote source={mdxContentStr} />
        } 
        date={post.entry.publishDate}
        coverImage={post.entry.cover ?? undefined}
        coverAlignment={post.entry.coverAlignment ?? undefined}
        tags={resolvedTags}
        skills={resolvedSkills}
      />
    </section>
  );
}