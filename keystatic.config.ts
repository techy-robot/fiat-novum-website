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
        content: fields.mdx({ label: 'Content' }),
      },
    }),
  },
});
