// app/blog/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { createReader } from '@keystatic/core/reader';
// Update this path to match your project root
import keystaticConfig from '@/keystatic.config'; 
import BlogIndexLayout from '@/components/Pages/PagesBlogIndexLayout'; // Import your Client Wrapper
import BlogCard from '@/components/Cards/CardsBlogCard'; // Import your Client Wrapper
import { BlogCardProps } from '@/types/blog';

export const metadata: Metadata = {
  title: "Blog",
  description: "Read my latest blog posts on various projects or random thoughts.",
};

const reader = createReader(process.cwd(), keystaticConfig);

const slugify = (text: string) => 
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

export default async function BlogIndexPage() {
  // Fetch data directly inside the Server Component
  const rawPosts = await reader.collections.posts.all();

  const posts: BlogCardProps[] = rawPosts.map((post) => {
    const { title, publishDate, summary, cover } = post.entry;
    const [year, month, day] = (publishDate || "2026-01-01").split('-');
    const safeSlug = slugify(title || post.slug);
    
    return {
      title: title || "Untitled",
      summary: summary || "No Summary",
      date: publishDate || "No Date",
      cover: cover || undefined,
      url: `/blog/${year}/${month}/${day}/${safeSlug}`
    };
  });

  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <BlogIndexLayout 
      postListSlot={
        <div style={{ 
          display: 'grid', 
          /* This auto-fill logic automatically handles mobile/desktop breakpoints! */
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '2rem', 
          width: '100%',
          alignItems: 'stretch' /* Forces all cards in a row to be the same height */
        }}>
          {posts.map((post) => (
            <Link 
              href={post.url} 
              key={post.url} 
              style={{ 
                textDecoration: 'none', 
                display: 'flex', 
                flexDirection: 'column' 
              }}
            >
              <BlogCard 
                title={post.title}
                summary={post.summary}
                date={post.date}
                coverImage={post.cover}
              />
            </Link>
          ))}
        </div>
      }
    />
  );
}