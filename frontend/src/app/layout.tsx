import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CommandPalette } from '@/components/CommandPalette';

export const metadata: Metadata = {
  title: 'Discova — Discover & Add Discord Bots',
  description: 'Explore the best Discord bots. Moderation, music, games, anime, economy, and more. Find the perfect bot for your Discord server today.',
  keywords: 'discord, bots, discord bot list, top gg, bot list, music bot, mod bot',
  openGraph: {
    title: 'Discova — Discord Bot List',
    description: 'Explore the best Discord bots. Add custom utilities to your server.',
    url: 'https://discova.local',
    siteName: 'Discova',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Discova — Discord Bot List',
    description: 'Discover the best Discord bots for your server.',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-background antialiased">
        <Providers>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
          <CommandPalette />
        </Providers>
      </body>
    </html>
  );
}
