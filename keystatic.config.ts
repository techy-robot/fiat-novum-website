#!/usr/bin/env tsx

// keystatic.config.ts
import { config, fields, collection, singleton } from '@keystatic/core';

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
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        // The date field is crucial for the URL scheme
        publishDate: fields.date({ label: 'Publish Date', validation: { isRequired: true } }),
        cover: fields.image({ 
          label: 'Cover Image',
          directory: 'public/images/blog', 
          publicPath: '/images/blog/' 
        }),
        coverAlignment: fields.select({
          label: 'Cover Focal Alignment',
          description: 'Adjusts how the image is framed inside the card',
          options: [
            { label: 'Center', value: 'center' },
            { label: 'Top / Start', value: 'top' },
            { label: 'Bottom / End', value: 'bottom' },
            { label: 'Left', value: 'left' },
            { label: 'Right', value: 'right' },
          ],
          defaultValue: 'center',
        }),
        summary: fields.text({ label: 'Summary', validation: { isRequired: true } }),
        content: fields.mdx({ 
          label: 'Content',
          options: {
            image: {
              directory: 'public/images/blog/mdx', 
              publicPath: '/images/blog/mdx/' 
            }
          }
        }),
        tags: fields.array(
          fields.relationship({
            label: 'Tag',
            collection: 'tags',
          }),
          {
            label: 'Tags',
            itemLabel: (props) => props.value || 'Select a tag',
          }
        ),
      },
    }),
    projects: collection({
      label: 'Projects',
      slugField: 'title', 
      path: 'content/projects/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        cover: fields.image({ 
          label: 'Cover Image',
          directory: 'public/images/projects', 
          publicPath: '/images/projects/' 
        }),
        coverAlignment: fields.select({
          label: 'Cover Focal Alignment',
          description: 'Adjusts how the image is framed inside the card',
          options: [
            { label: 'Center', value: 'center' },
            { label: 'Top / Start', value: 'top' },
            { label: 'Bottom / End', value: 'bottom' },
            { label: 'Left', value: 'left' },
            { label: 'Right', value: 'right' },
          ],
          defaultValue: 'center',
        }),
        coolnessFactor: fields.integer({ label: 'Coolness Factor', validation: {min: 0,max: 10}}),
        summary: fields.text({ label: 'Summary', validation: { isRequired: true } }),
        content: fields.mdx({ 
          label: 'Content',
          options: {
            image: {
              directory: 'public/images/projects/mdx', 
              publicPath: '/images/projects/mdx/' 
            }
          }
        }),
        tags: fields.array(
          fields.relationship({
            label: 'Tag',
            collection: 'tags',
          }),
          {
            label: 'Tags',
            itemLabel: (props) => props.value || 'Select a tag',
          }
        ),
      },
    }),
    skills: collection({
      label: 'Skills',
      slugField: 'name',
      path: 'content/skills/*',
      format: { data: 'json' },
      schema: {
        name: fields.slug({ name: { label: 'Skill Name' } }),
        proficiency: fields.integer({ label: 'Proficiency Level', validation: {min: 0,max: 10}}),
        iconName: fields.text({ label: 'Tabler Icon Name (e.g., Cpu, Zap, Code)' }),
        description: fields.text({ label: 'Write Up', multiline: true }),
      },
    }),

    tags: collection({
      label: 'Tags',
      slugField: 'name',
      path: 'content/tags/*',
      format: { data: 'json' },
      schema: {
        name: fields.slug({ name: { label: 'Name' } }),
      },
    }),
  },

  singletons: {
    about: singleton({
      label: 'About Me',
      path: 'content/about',
      format: { contentField: 'content' },
      schema: {
        title: fields.text({ label: 'Title', validation: { isRequired: true } }),
        summary: fields.text({ label: 'Summary', validation: { isRequired: true } }),
        avatar: fields.image({
          label: 'Avatar / Profile Image',
          directory: 'public/images/about',
          publicPath: '/images/about/'
        }),
        content: fields.mdx({
          label: 'Content',
          options: {
            image: {
              directory: 'public/images/about/mdx',
              publicPath: '/images/about/mdx/'
            }
          }
        }),
      },
    }),
  },

});
