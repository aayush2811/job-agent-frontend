import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';
import { SocketProvider } from '@/providers/SocketProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Job Agent',
  description: 'AI Job Agent Automation SaaS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased min-h-screen bg-background`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <QueryProvider>
            <SocketProvider>
              {children}
              <Toaster position="top-right" theme="system" richColors />
            </SocketProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
