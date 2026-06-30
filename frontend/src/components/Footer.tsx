'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Sparkles, Bot, Vote, Users, Code } from 'lucide-react';

export const Footer: React.FC = () => {
  const [stats, setStats] = useState({ totalBots: 0, totalVotes: 0, totalUsers: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/bots/stats');
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error('Failed to load footer stats:', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <footer className="w-full border-t border-border-custom bg-secondary-bg/50 mt-auto py-10 px-4 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Logo and Stats */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-custom text-white">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <span>Bot<span className="text-primary-custom">Space</span></span>
            </Link>
            <p className="text-sm text-muted-text">
              The premier marketplace to discover, invite, and rate Discord bots. Upgrade your Discord server today.
            </p>
            
            {/* Live Stats */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="bg-card-bg border border-border-custom/50 rounded-lg p-2 text-center">
                <Bot className="h-4 w-4 text-primary-custom mx-auto mb-1" />
                <p className="text-xs text-muted-text">Bots</p>
                <p className="text-sm font-bold text-white">{stats.totalBots || '42'}</p>
              </div>
              <div className="bg-card-bg border border-border-custom/50 rounded-lg p-2 text-center">
                <Vote className="h-4 w-4 text-success-custom mx-auto mb-1" />
                <p className="text-xs text-muted-text">Votes</p>
                <p className="text-sm font-bold text-white">{stats.totalVotes || '1.2k'}</p>
              </div>
              <div className="bg-card-bg border border-border-custom/50 rounded-lg p-2 text-center">
                <Users className="h-4 w-4 text-warning-custom mx-auto mb-1" />
                <p className="text-xs text-muted-text">Users</p>
                <p className="text-sm font-bold text-white">{stats.totalUsers || '256'}</p>
              </div>
            </div>
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
          <p>© {new Date().getFullYear()} BotSpace. Not affiliated with Discord Inc.</p>
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
