import Link from 'next/link';
import { GetStaticProps } from 'next';
import BlogIndexLayout from '../../components/BlogIndexLayout';
import BlogCard from '../../components/BlogCard';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../keystatic.config';

const reader = createReader(process.cwd(), keystaticConfig);

// Keep your slugify helper
const slugify = (text: string) => 
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

export const getStaticProps: GetStaticProps = async () => {
  // 1. Fetch all posts directly from the Keystatic config collection
  // (Assuming your collection is named 'posts' in keystatic.config.ts)
  const rawPosts = await reader.collections.posts.all();

  const posts = rawPosts.map((post) => {
    // 'post.slug' is automatically the directory name
    // 'post.entry' contains your frontmatter fields
    const { title, publishDate } = post.entry;
    
    const [year, month, day] = (publishDate || "2026-01-01").split('-');
    const safeSlug = slugify(title || post.slug);
    
    return {
      title: title || "Untitled",
      date: publishDate || "No Date",
      url: `/blog/${year}/${month}/${day}/${safeSlug}` 
    };
  });

  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return { props: { posts } };
};

export default function BlogIndex({ posts }: { posts: any[] }) {
  return (
    <BlogIndexLayout 
      postListSlot={
        <>
          {posts.map((post) => (
            <Link href={post.url} key={post.url} style={{ textDecoration: 'none' }}>
              <BlogCard title={post.title} date={post.date} />
            </Link>
          ))}
        </>
      }
    />
  );
}
