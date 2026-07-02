import { Metadata } from 'next';
import Link from 'next/link';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '@/keystatic.config'; 

// Import components (with client wrappers)
import BlogIndexLayout from '@/components/Pages/PagesBlogIndexLayout';
import BlogCard from '@/components/Cards/CardsBlogCard';

import { BlogCardProps } from '@/types/blog';

import styles from '@/styles/grid-layout.module.css';

// Basic metadata, no complex opengraph logic
export const metadata: Metadata = {
  title: "Blog",
  description: "Read my latest blog posts on various projects or random thoughts.",
};

const reader = createReader(process.cwd(), keystaticConfig);

// Slugify function
const slugify = (text: string) => 
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

export default async function BlogIndexPage() {
  // Fetch all blog posts and sort by date
  const rawPosts = await reader.collections.posts.all();

  const posts: BlogCardProps[] = rawPosts.map((post) => {
    const { title, publishDate, summary, cover, coverAlignment } = post.entry;
    const [year, month, day] = (publishDate || "2026-01-01").split('-');
    const safeSlug = slugify(title || post.slug);
    
    return {
      title: title || "Untitled",
      summary: summary || "No Summary",
      date: publishDate || "No Date",
      cover: cover || undefined,
      coverAlignment: coverAlignment || undefined,
      url: `/blog/${year}/${month}/${day}/${safeSlug}`
    };
  });

  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Render blog cards
  return (
    <BlogIndexLayout 
      postListSlot={
        <div className={styles.autoGrid}>
          {posts.map((post) => (
            <Link 
              href={post.url} 
              key={post.url} 
              className={styles.cardLink}
            >
              <BlogCard 
                title={post.title}
                summary={post.summary}
                date={post.date}
                coverImage={post.cover}
                coverAlignment={post.coverAlignment}
              />
            </Link>
          ))}
        </div>
      }
    />
  );
}