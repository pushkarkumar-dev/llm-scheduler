import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { CategoryProvider } from '@/components/CategoryProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'LLM Scheduler',
  description: 'Self-hosted scheduler for prompts against a local LLM',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
        <CategoryProvider>
          <Navbar />
          <main className="flex-1 w-full px-6 py-8" style={{ maxWidth: 1180, marginInline: 'auto' }}>
            <div className="animate-page">{children}</div>
          </main>
        </CategoryProvider>
      </body>
    </html>
  );
}
