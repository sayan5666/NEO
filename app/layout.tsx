import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NEO_INTV - Digital Punk AI Interview Platform',
  description: 'AI-driven technical, behavioral, and screening interview evaluation platform.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light">
      <head>
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body suppressHydrationWarning className="bg-[#FFFDF5] text-[#1b1b1b] min-h-screen">
        {children}
      </body>
    </html>
  );
}
