import { MetadataRoute } from 'next';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../keystatic.config';

const BASE_URL = 'https://www.fiatnovum.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticPaths = [
        '',
        '/blog',
        '/projects',
        '/skills',
        // Add other specific static paths
    ];

    const staticRoutes: MetadataRoute.Sitemap = staticPaths.map((path) => ({
        url: `${BASE_URL}${path}`,
        lastModified: new Date(),
        changeFrequency: path === '' ? 'daily' : 'weekly',
        priority: path === '' ? 1.0 : 0.8,
    }));

    // Dynamic Blog Routes via Keystatic
    let blogRoutes: MetadataRoute.Sitemap = [];
    let projectsRoutes: MetadataRoute.Sitemap = [];
    let skillsRoutes: MetadataRoute.Sitemap = [];

    const reader = createReader(process.cwd(), keystaticConfig);
    const posts = await reader.collections.posts.all();
    const projects = await reader.collections.projects.all();
    const skills = await reader.collections.skills.all();

    blogRoutes = posts.map((post) => {
        // Safely parse date if it exists in frontmatter schema
        const lastMod = post.entry.publishDate 
        ? new Date(post.entry.publishDate) 
        : new Date();

        return {
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: lastMod,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
        };
    });

    projectsRoutes = projects.map((project) => ({
        url: `${BASE_URL}/projects/${project.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
    }));

    skillsRoutes = skills.map((skill) => ({
        url: `${BASE_URL}/skills/${skill.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
    }));

    return [...staticRoutes, ...blogRoutes, ...projectsRoutes, ...skillsRoutes];
}