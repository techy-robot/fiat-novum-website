// app/blog/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { createReader } from '@keystatic/core/reader';
// Update this path to match your project root
import keystaticConfig from '@/keystatic.config'; 
import BlogIndexLayout from '@/components/BlogIndexLayout'; // Import your Client Wrapper
import BlogCard from '@/components/BlogCard'; // Import your Client Wrapper

export const metadata: Metadata = {
  title: "Blog | Fiat Novum",
  description: "Read the latest thoughts and updates.",
};

const reader = createReader(process.cwd(), keystaticConfig);

const slugify = (text: string) => 
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

export default async function BlogIndexPage() {
  // Fetch data directly inside the Server Component
  const rawPosts = await reader.collections.posts.all();

  const posts = rawPosts.map((post) => {
    const { title, publishDate, summary } = post.entry;
    const [year, month, day] = (publishDate || "2026-01-01").split('-');
    const safeSlug = slugify(title || post.slug);
    
    return {
      title: title || "Untitled",
      date: publishDate || "No Date",
      url: `/blog/${year}/${month}/${day}/${safeSlug}`,
      summary: summary || "No Summary",
    };
  });

  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <BlogIndexLayout 
      postListSlot={
        <>
          {posts.map((post) => (
            <Link href={post.url} key={post.url} style={{ textDecoration: 'none' }}>
              <BlogCard title={post.title} date={post.date} summary={post.summary} />
            </Link>
          ))}
        </>
      }
    />
  );
}