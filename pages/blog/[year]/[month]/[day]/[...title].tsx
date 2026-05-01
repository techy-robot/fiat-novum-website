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

export const getStaticProps: GetStaticProps<BlogPostProps> = async ({ params }) => {
  const { year, month, day, title } = params as { year: string; month: string; day: string; title: string[] };
  const requestedSlug = title[0];
  const targetDate = `${year}-${month}-${day}`;

  // 1. Fetch the specific post by its slug
  const post = await reader.collections.posts.read(requestedSlug);

  // 404 if it doesn't exist
  if (!post) return { notFound: true };

  // 2. SEO Date Check
  if (post.publishDate !== targetDate) {
    const [correctYear, correctMonth, correctDay] = post.publishDate.split('-');
    return {
      redirect: {
        destination: `/blog/${correctYear}/${correctMonth}/${correctDay}/${requestedSlug}`,
        permanent: true,
      },
    };
  }

  // 3. Extract the raw MDX content
  // Depending on your config, Keystatic returns MDX as an async function you must call
  const mdxContentStr = await post.content(); 
  const mdxSource = await serialize(mdxContentStr);

  return {
    props: {
      frontmatter: {
        title: post.title,
        publishDate: post.publishDate,
      },
      mdxSource,
    },
  };
};

export default function BlogPost({ frontmatter, mdxSource }: BlogPostProps) {
  return (
    <BlogPostLayout 
      title={frontmatter.title}
      contentSlot={<><MDXRemote {...mdxSource} /></>} 
    />
  );
}
