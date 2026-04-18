import type { Metadata } from 'next';
import { Inter, Bebas_Neue, Playfair_Display } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400', variable: '--font-bebas' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Ball & Boujee Admin',
  description: 'Ball & Boujee Admin Dashboard',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#C9A84C" />
      </head>
      <body className={`${inter.variable} ${bebas.variable} ${playfair.variable} ${inter.className} bg-[#0A0A0A] text-white`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
