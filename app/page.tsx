
import { Metadata } from "next";
import Homepage from "@/components/Homepagewrapper";
import PlasmicClientProvider from "./PlasmicClientProvider";
import { Analytics } from '@vercel/analytics/next';
import '../styles/globals.css';

// Handle SEO here
export const metadata: Metadata = {
  title: "Fiat Novum | Home",
  description: "Welcome to my personal website.",
};

// Render the page
export default function Page() {
  return (
    <PlasmicClientProvider>
      <Homepage />
      <Analytics />
    </PlasmicClientProvider>
  );
}