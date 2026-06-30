'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { BotCard, BotData } from '@/components/BotCard';
import { Search, Bot, Flame, Shield, PlusCircle, Server, Code, Heart, Sparkles } from 'lucide-react';

const CATEGORIES = [
  { name: 'Moderation', desc: 'Keep your server clean and safe', icon: Server, color: 'text-primary-custom bg-primary-custom/10' },
  { name: 'Music', desc: 'Play high-quality audio in voice calls', icon: Heart, color: 'text-[#EC407A] bg-[#EC407A]/10' },
  { name: 'Utility', desc: 'General helper tools and dashboard integrations', icon: Code, color: 'text-success-custom bg-success-custom/10' },
  { name: 'Economy', desc: 'Custom games, currency, and shop systems', icon: Flame, color: 'text-[#FF7043] bg-[#FF7043]/10' },
  { name: 'Social & Fun', desc: 'Engaging games, meme generators, and profiles', icon: Bot, color: 'text-warning-custom bg-warning-custom/10' },
  { name: 'Logging', desc: 'Audit server events, messages, and warnings', icon: Shield, color: 'text-[#26A69A] bg-[#26A69A]/10' }
];

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredBots, setFeaturedBots] = useState<BotData[]>([]);
  const [trendingBots, setTrendingBots] = useState<BotData[]>([]);
  const [newestBots, setNewestBots] = useState<BotData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBots = async () => {
      try {
        setLoading(true);
        // Load featured bots
        const featuredRes = await api.get('/bots/search?featured=true&limit=4');
        if (featuredRes.data.success) setFeaturedBots(featuredRes.data.bots);

        // Load trending bots (sorted by votes desc)
        const trendingRes = await api.get('/bots/search?sort=votes&limit=4');
        if (trendingRes.data.success) setTrendingBots(trendingRes.data.bots);

        // Load newest bots (sorted by newest desc)
        const newestRes = await api.get('/bots/search?sort=newest&limit=4');
        if (newestRes.data.success) setNewestBots(newestRes.data.bots);
      } catch (err) {
        console.error('Failed to fetch home bots:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBots();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Beautiful fallback mock data if backend has no bots listed yet (cold start)
  const renderBotSection = (title: string, icon: React.ReactNode, botsList: BotData[], fallbackType: 'featured' | 'trending' | 'new') => {
    const showMock = botsList.length === 0;
    
    // Generate beautiful mock bots matching the card structure
    const mockBots: BotData[] = showMock ? [
      {
        botId: '101',
        name: fallbackType === 'featured' ? 'DynoX' : fallbackType === 'trending' ? 'Rythmify' : 'ModGuard',
        shortDesc: 'A powerful, easy-to-use administration bot featuring moderation tools, automod, logging, music, and interactive games.',
        votes: 124,
        serverCount: 15400,
        categories: ['Moderation', 'Utility'],
        verified: true,
        featured: fallbackType === 'featured',
        premium: true,
        customSlug: fallbackType === 'featured' ? 'dynox' : fallbackType === 'trending' ? 'rythmify' : 'modguard'
      },
      {
        botId: '102',
        name: fallbackType === 'featured' ? 'Aria' : fallbackType === 'trending' ? 'MEE6 Mock' : 'Aegis Security',
        shortDesc: 'High fidelity audio stream bot supporting YouTube, Spotify, Soundcloud, auto-playlists, and direct server web streams.',
        votes: 98,
        serverCount: 8900,
        categories: ['Music', 'Social & Fun'],
        verified: false,
        featured: fallbackType === 'featured',
        premium: false,
        customSlug: fallbackType === 'featured' ? 'aria' : fallbackType === 'trending' ? 'mee6-mock' : 'aegis-security'
      },
      {
        botId: '103',
        name: fallbackType === 'featured' ? 'LootBox' : fallbackType === 'trending' ? 'Dank Memer Mock' : 'Cryptic Economist',
        shortDesc: 'Advanced RPG economy bot featuring global marketplace trading, loot crates, virtual stocks, pet battles, and leaderboards.',
        votes: 87,
        serverCount: 12200,
        categories: ['Economy', 'Social & Fun'],
        verified: true,
        featured: fallbackType === 'featured',
        premium: true,
        customSlug: fallbackType === 'featured' ? 'lootbox' : fallbackType === 'trending' ? 'dank-memer-mock' : 'cryptic-economist'
      },
      {
        botId: '104',
        name: fallbackType === 'featured' ? 'AuditLink' : fallbackType === 'trending' ? 'ServerLog' : 'Vortex Auto',
        shortDesc: 'Comprehensive tracking bot that posts beautiful embeds monitoring message edits, voice logs, bans, and invite creators.',
        votes: 65,
        serverCount: 4500,
        categories: ['Logging', 'Utility'],
        verified: true,
        featured: fallbackType === 'featured',
        premium: false,
        customSlug: fallbackType === 'featured' ? 'auditlink' : fallbackType === 'trending' ? 'serverlog' : 'vortex-auto'
      }
    ] : botsList;

    return (
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-border-custom/50 pb-2">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            {icon}
            {title}
          </h2>
          {showMock && <span className="text-xxs font-semibold bg-primary-custom/10 text-primary-custom px-2 py-0.5 rounded border border-primary-custom/20">DEMO SEED</span>}
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-[340px] rounded-xl bg-card-bg border border-border-custom animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {mockBots.map((bot) => (
              <BotCard key={bot.botId} bot={bot} />
            ))}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="flex flex-col gap-16 px-4 md:px-8 py-12 mx-auto max-w-7xl w-full">
      
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center gap-6 py-10 md:py-16">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-custom/10 text-primary-custom text-xs font-bold px-4 py-1.5 border border-primary-custom/20">
          <Bot className="h-4 w-4" />
          Verified Discord Bot Directory
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
          Find the best <span className="text-primary-custom">Discord Bots</span>
        </h1>
        
        <p className="text-base md:text-lg text-text-secondary max-w-xl leading-relaxed">
          Level up your community with verified moderation tools, music streams, engaging economy games, and deep analytics.
        </p>

        {/* Big Search Bar */}
        <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl relative flex items-center mt-4">
          <input
            type="text"
            placeholder="Search by bot name, category, or features... (e.g. Dyno, Music)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-card-bg border border-border-custom px-5 pr-24 py-4 pl-12 text-base text-text-primary placeholder:text-muted-text focus:border-primary-custom focus:outline-none shadow-2xl transition-all"
          />
          <Search className="absolute left-4 h-5 w-5 text-muted-text" />
          <button 
            type="submit"
            className="absolute right-3 rounded-lg bg-primary-custom px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
          >
            Search
          </button>
        </form>

        {/* Fast Tag pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {['Moderation', 'Music', 'Fun', 'Economy', 'Utility'].map((tag) => (
            <button
              key={tag}
              onClick={() => router.push(`/search?category=${tag}`)}
              className="text-xs rounded-lg bg-secondary-bg hover:bg-hover-bg border border-border-custom px-3 py-1.5 text-text-secondary hover:text-white transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      </section>

      {/* Popular Categories Grid */}
      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2 border-b border-border-custom/50 pb-2">
          <Bot className="h-5 w-5 text-primary-custom" />
          Explore Popular Categories
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                onClick={() => router.push(`/search?category=${cat.name}`)}
                className="text-left rounded-xl bg-card-bg border border-border-custom p-5 hover:bg-hover-bg transition-all duration-200 group flex items-start gap-4"
              >
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${cat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-md font-bold text-white group-hover:text-primary-custom transition-colors">{cat.name}</h3>
                  <p className="text-xs text-muted-text mt-1">{cat.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured Bots Grid */}
      {renderBotSection('Featured Bots', <Sparkles className="h-5 w-5 text-primary-custom" />, featuredBots, 'featured')}

      {/* Trending Bots Grid */}
      {renderBotSection('Trending Bots', <Flame className="h-5 w-5 text-[#FF7043]" />, trendingBots, 'trending')}

      {/* Newest Bots Grid */}
      {renderBotSection('Recently Added', <Bot className="h-5 w-5 text-success-custom" />, newestBots, 'new')}

      {/* CTA Developer Section */}
      <section className="rounded-2xl bg-gradient-to-br from-primary-custom/20 to-secondary-bg border border-primary-custom/10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 mt-6">
        <div className="flex flex-col gap-3">
          <h2 className="text-2xl md:text-3xl font-black text-white">Have a Discord Bot?</h2>
          <p className="text-sm md:text-md text-text-secondary max-w-xl leading-relaxed">
            List your bot on Discova to reach thousands of monthly active users, gather ratings, track user statistics, and build a community.
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/submit')}
          className="flex items-center gap-2 rounded-xl bg-primary-custom hover:bg-primary-hover px-6 py-3.5 text-base font-bold text-white transition-colors"
        >
          <PlusCircle className="h-5 w-5" />
          Add Your Bot Now
        </button>
      </section>

    </div>
  );
}
