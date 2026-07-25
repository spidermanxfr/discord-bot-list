'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Code } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-border-custom bg-secondary-bg/50 mt-auto py-10 px-4 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Logo and Info */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-custom text-white">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <span>Dis<span className="text-primary-custom">Cova</span></span>
            </Link>
            <p className="text-sm text-muted-text">
              The premier marketplace to discover, invite, and rate Discord bots. Upgrade your Discord server today.
            </p>
          </div>

          {/* Links: Platform */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Platform</h4>
            <ul className="flex flex-col gap-2 text-sm">
              <li><Link href="/search" className="text-muted-text hover:text-white transition-colors">Search Bots</Link></li>
              <li><Link href="/leaderboard" className="text-muted-text hover:text-white transition-colors">Leaderboard</Link></li>
              <li><Link href="/dashboard/submit" className="text-muted-text hover:text-white transition-colors">Add Your Bot</Link></li>
              <li><Link href="/search?premium=true" className="text-muted-text hover:text-white transition-colors">Premium Bots</Link></li>
            </ul>
          </div>

          {/* Links: Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Popular Tags</h4>
            <ul className="flex flex-col gap-2 text-sm">
              <li><Link href="/search?category=Moderation" className="text-muted-text hover:text-white transition-colors">Moderation</Link></li>
              <li><Link href="/search?category=Music" className="text-muted-text hover:text-white transition-colors">Music</Link></li>
              <li><Link href="/search?category=Anime" className="text-muted-text hover:text-white transition-colors">Anime & Fun</Link></li>
              <li><Link href="/search?category=Economy" className="text-muted-text hover:text-white transition-colors">Economy</Link></li>
            </ul>
          </div>

          {/* Links: Legal */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Company</h4>
            <ul className="flex flex-col gap-2 text-sm">
              <li><Link href="/privacy" className="text-muted-text hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-muted-text hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/about" className="text-muted-text hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-muted-text hover:text-white transition-colors">Support Contact</Link></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-border-custom/50 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-text">
          <p>© {new Date().getFullYear()} DisCova. Not affiliated with Discord Inc.</p>
          <div className="flex gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
              <Code className="h-4 w-4" />
              Source Code
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
