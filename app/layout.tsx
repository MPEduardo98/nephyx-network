import type { Metadata } from 'next';
import '@/global/lib/fontawesome';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AlertProvider } from '@/global/components/alerts/AlertProvider';
import Providers from '@/global/components/Providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Nephyx Network',
  description: 'Plataforma de esports profesional',
};

// Script inline para aplicar el tema ANTES del primer render (evita flash)
const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('nephyx-theme');
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.setAttribute('data-theme', stored);
    } else {
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;

// app/layout.tsx
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <AlertProvider>
            {children}
          </AlertProvider>
        </Providers>
      </body>
    </html>
  );
}