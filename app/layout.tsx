import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Propel - Decentralized Crowdfunding',
  description: 'Propel is a decentralized crowdfunding platform that allows users to create, fund, and manage projects. Built on the Linera network, Propel ensures secure, transparent, and efficient crowdfunding operations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <div className="pt-14">
          {children}
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
