#!/usr/bin/env tsx

// keystatic.config.ts
import { config, fields, collection } from '@keystatic/core';

export default config({

  storage: {
    // Uses local files on machine, but connects to GitHub in production
    kind: process.env.NODE_ENV === 'production' ? 'github' : 'local',
    repo: {
      owner: 'techy-robot',
      name: 'fiat-novum-website',
    },
  },
  /*storage: {
    kind: 'local', 
  },*/

  collections: {
    posts: collection({
      label: 'Blog Posts',
      // This determines the filename (e.g., "my-awesome-post.mdx")
      slugField: 'title', 
      path: 'content/blog/*',
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        // The date field is crucial for your URL scheme
        publishDate: fields.date({ label: 'Publish Date', validation: { isRequired: true } }),
        cover: fields.image({ label: 'Cover Image' }),
        summary: fields.text({ label: 'Summary', validation: { isRequired: true } }),
        content: fields.mdx({ label: 'Content' }),
      },
    }),
    projects: collection({
      label: 'Projects',
      // This determines the filename (e.g., "my-awesome-post.mdx")
      slugField: 'title', 
      path: 'content/blog/*',
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        // The date field is crucial for your URL scheme
        publishDate: fields.date({ label: 'Publish Date', validation: { isRequired: true } }),
        cover: fields.image({ label: 'Cover Image' }),
        coolnessFactor: fields.integer({ label: 'Coolness Factor', validation: {min: 0,max: 10}}),
        summary: fields.text({ label: 'Summary', validation: { isRequired: true } }),
        content: fields.mdx({ label: 'Content' }),
      },
    }),
    skills: collection({
      label: 'Skills',
      slugField: 'name',
      path: 'content/skills/*',
      schema: {
        name: fields.slug({ name: { label: 'Skill Name' } }),
        proficiency: fields.integer({ label: 'Proficiency Level', validation: {min: 0,max: 10}}),
        iconName: fields.text({ label: 'Lucide Icon Name (e.g., Cpu, Zap, Code)' }),
        content: fields.mdx({ label: 'Write up' }),
      },
    }),
  },

    
});
