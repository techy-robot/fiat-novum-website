// app/layout.tsx
import '@/styles/globals.css'
import PlasmicClientProvider from "./PlasmicClientProvider";

// Use the standard import just like you suggested!
import PageSupportCustomFooter from "@/components/PageSupport/PageSupportCustomFooter"; 

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="en">
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', margin: 0 }}>
        
        <PlasmicClientProvider>
          
          <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            {children} 
          </main>

          <footer style={{ width: '100%' }}>
             {/* Render it as a standard React component */}
             <PageSupportCustomFooter />
          </footer>

        </PlasmicClientProvider>
        
      </body>
    </html>
  );
}