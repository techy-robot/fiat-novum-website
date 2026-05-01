// app/not-found.tsx
import { Metadata } from 'next';
import NotFoundClient from './NotFoundClient'; 

export const metadata: Metadata = {
  title: '404 - Page Not Found',
};

export default function NotFound() {
  return <NotFoundClient />;
}
