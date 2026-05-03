// app/layout.tsx
import '@/styles/globals.css'
import { Space_Mono, Handlee } from 'next/font/google';

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
});

const handlee = Handlee({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-handlee',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
