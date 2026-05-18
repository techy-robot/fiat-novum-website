
export interface BlogCardProps {
    title: string;
    summary: string;
    date: string;
    cover: string | undefined; // Changed from null to undefined
    url: string;
  }
