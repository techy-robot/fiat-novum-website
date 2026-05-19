import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createReader } from '@keystatic/core/reader';
// Update this path to match your project root
import keystaticConfig from '@/keystatic.config'; 
import BlogPostLayout from '@/components/Pages/PagesBlogPostLayout'; // Import your Client Wrapper
// Use the React Server Component version of MDXRemote
import { MDXRemote } from 'next-mdx-remote/rsc'; 

const reader = createReader(process.cwd(), keystaticConfig);

// Define the shape of our URL parameters
interface RouteParams {
  params: { year: string; month: string; day: string; title: string[] };
}

// Replaces getStaticPaths
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
  const { year, month, day } = params;
  const targetDate = `${year}-${month}-${day}`;
  
  const allPosts = await reader.collections.posts.all();
  const post = allPosts.find((p) => p.entry.publishDate === targetDate);

  if (!post) return { title: "Post Not Found" };

  // Construct the absolute path to the generated open graph image
  const ogImageUrl = `/api/og/blog?year=${year}&month=${month}&day=${day}&slug=${post.slug}`;

  return {
    title: `${post.entry.title}`,
    description: post.entry.summary || `Read ${post.entry.title}`,
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
  const { year, month, day, title } = params;
  const requestedSlug = title[0];
  const targetDate = `${year}-${month}-${day}`;

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
          // MDXRemote/rsc takes the raw string directly!
          <MDXRemote source={mdxContentStr} />
        } 
        date={post.entry.publishDate}
        coverImage={post.entry.cover ?? undefined}
      />
    </section>
  );
}