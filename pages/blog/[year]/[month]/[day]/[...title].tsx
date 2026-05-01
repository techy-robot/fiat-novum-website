import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { GetStaticPaths, GetStaticProps } from 'next';
import BlogPostLayout from '../../../../../components/BlogPostLayout';

import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../../../../keystatic.config';

const reader = createReader(process.cwd(), keystaticConfig);

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await reader.collections.posts.all();

  const paths = posts.map((post) => {
    const publishDate = post.entry.publishDate;
    if (!publishDate) return null;

    const [year, month, day] = publishDate.split('-');
    
    return {
      params: { year, month, day, title: [post.slug] },
    };
  }).filter(Boolean) as { params: { year: string, month: string, day: string, title: string[] } }[];

  return { paths, fallback: 'blocking' };
};

// Define the interface
interface BlogPostLayoutProps {
  frontmatter: {
    title: string;
    publishDate: string;
  };
  mdxSource: MDXRemoteSerializeResult;
}

export const getStaticProps: GetStaticProps<BlogPostLayoutProps> = async ({ params }) => {
  const { year, month, day, title } = params as { year: string; month: string; day: string; title: string[] };
  const requestedSlug = title[0];
  const targetDate = `${year}-${month}-${day}`;

  // 1. Fetch ALL posts so we can search by Date instead of Slug
  const allPosts = await reader.collections.posts.all();

  // 2. Find the post that matches the target date (This makes the Date your UID)
  const post = allPosts.find((p) => p.entry.publishDate === targetDate);

  // 404 if no post exists for this specific date
  if (!post) {
    return { notFound: true };
  }

  // 3. Fluid Slug Handling: Does the URL slug match the actual Keystatic slug?
  // If they visit /2026/04/29/old-title, redirect them to the correct one!
  if (requestedSlug !== post.slug) {
    return {
      redirect: {
        destination: `/blog/${year}/${month}/${day}/${post.slug}`,
        permanent: true, // 301 Redirect tells search engines to update the link
      },
    };
  }

  // 4. If the URL is perfect, extract the raw MDX content
  // Note: When using .all(), the data is nested inside the .entry object
  const mdxContentStr = await post.entry.content(); 
  const mdxSource = await serialize(mdxContentStr);

  return {
    props: {
      frontmatter: {
        title: post.entry.title,
        publishDate: post.entry.publishDate,
      },
      mdxSource,
    },
  };
};

export default function BlogPost({ frontmatter, mdxSource }: BlogPostLayoutProps) {
  return (
    <BlogPostLayout 
      title={frontmatter.title}
      contentSlot={<><MDXRemote {...mdxSource} /></>} 
    />
  );
}
