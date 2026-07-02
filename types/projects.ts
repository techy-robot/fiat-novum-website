
export interface ProjectCardProps {
    title: string;
    summary: string;
    coolnessFactor: number;
    cover: string | undefined; // Changed from null to undefined
    coverAlignment?: string;
    url: string;
  }
