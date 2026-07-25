'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { BotCard, BotData } from '@/components/BotCard';
import { Search, Bot, Flame, Shield, PlusCircle, Server, Code, Heart, Sparkles, TrendingUp, Compass, Clock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORIES = [
  { name: 'Moderation', desc: 'Keep your server clean and safe', icon: Server, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/25 hover:border-indigo-400/50 hover:shadow-indigo-500/10' },
  { name: 'Music', desc: 'Play high-quality audio in voice calls', icon: Heart, color: 'text-pink-400 bg-pink-500/10 border-pink-500/25 hover:border-pink-400/50 hover:shadow-pink-500/10' },
  { name: 'Utility', desc: 'General helper tools and dashboards', icon: Code, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25 hover:border-emerald-400/50 hover:shadow-emerald-500/10' },
  { name: 'Economy', desc: 'Custom games, currency, and shop systems', icon: Flame, color: 'text-orange-400 bg-orange-500/10 border-orange-500/25 hover:border-orange-400/50 hover:shadow-orange-500/10' },
  { name: 'Social & Fun', desc: 'Engaging games, memes, and profiles', icon: Bot, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/25 hover:border-yellow-400/50 hover:shadow-yellow-500/10' },
  { name: 'Logging', desc: 'Audit server events and warning logs', icon: Shield, color: 'text-teal-400 bg-teal-500/10 border-teal-500/25 hover:border-teal-400/50 hover:shadow-teal-500/10' }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: 'spring' as const,
      stiffness: 90,
      damping: 15
    } 
  }
};

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
      <section className="flex flex-col gap-6 relative">
        <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.06] text-primary-custom shadow-inner">
              {icon}
            </span>
            {title}
          </h2>
          {showMock && (
            <span className="text-[10px] font-bold bg-primary-custom/10 text-primary-custom px-2.5 py-1 rounded border border-primary-custom/25 tracking-wide uppercase shadow-sm">
              Demo Seed
            </span>
          )}
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-[340px] rounded-xl bg-card-bg/50 border border-white/[0.05] animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
          >
            {mockBots.map((bot) => (
              <motion.div key={bot.botId} variants={itemVariants}>
                <BotCard bot={bot} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    );
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      
      {/* Aurora Ambient Lighting */}
      <div className="absolute top-[-10%] left-1/4 h-[500px] w-[500px] rounded-full aurora-glow-indigo opacity-40 blur-[100px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-[25vh] right-[10%] h-[600px] w-[600px] rounded-full aurora-glow-pink opacity-25 blur-[120px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '-3s' }} />
      <div className="absolute bottom-[10vh] left-[5%] h-[550px] w-[550px] rounded-full aurora-glow-emerald opacity-15 blur-[110px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 grid-pattern pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-20 px-4 md:px-8 py-16 mx-auto max-w-7xl w-full">
        
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center gap-6 py-12 md:py-20 max-w-3xl mx-auto">
          
          {/* Glowing Pill Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/[0.03] backdrop-blur-md text-primary-custom text-xs font-semibold px-4 py-2 border border-white/[0.08] shadow-lg"
          >
            <Sparkles className="h-4 w-4 animate-float" />
            <span>Discover the Future of Discord Communities</span>
          </motion.div>

          {/* Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight mt-2"
          >
            Find the perfect <br />
            <span className="text-gradient-purple-pink drop-shadow-[0_2px_15px_rgba(129,140,248,0.25)]">Discord Bots</span>
          </motion.h1>
          
          {/* Subtext */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base md:text-lg text-text-secondary max-w-2xl leading-relaxed mt-2"
          >
            Elevate your community servers with verified moderation systems, music streamers, engaging economic utilities, global games, and full server analytics.
          </motion.p>

          {/* Big Search Bar */}
          <motion.form 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100, delay: 0.3 }}
            onSubmit={handleSearchSubmit} 
            className="w-full max-w-2xl relative flex items-center mt-6 group"
          >
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary-custom to-pink-500 opacity-20 blur-md group-hover:opacity-40 group-focus-within:opacity-50 transition duration-300" />
            
            <div className="relative w-full flex items-center bg-[#151922]/80 backdrop-blur-xl border border-white/[0.08] group-hover:border-white/[0.15] group-focus-within:border-primary-custom/80 rounded-2xl transition-all duration-300 shadow-2xl">
              <input
                type="text"
                placeholder="Search by bot name, category, features... (e.g. Dyno, Music)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent px-5 pr-28 py-5 pl-14 text-base text-text-primary placeholder:text-muted-text focus:outline-none"
              />
              <Search className="absolute left-5 h-5 w-5 text-muted-text group-focus-within:text-primary-custom transition-colors" />
              <button 
                type="submit"
                className="absolute right-3 rounded-xl bg-primary-custom hover:bg-primary-hover px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-custom/25 transition-all hover:scale-[1.02]"
              >
                Search
              </button>
            </div>
          </motion.form>

          {/* Metrics / Uptime details */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="flex flex-wrap justify-center gap-6 md:gap-10 mt-6 text-xs font-medium text-muted-text border-t border-b border-white/[0.04] py-4 w-full max-w-xl"
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-white font-extrabold text-sm">1,500+</span> Bots Listed
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-white font-extrabold text-sm">45k+</span> Active Votes
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
              <span className="text-white font-extrabold text-sm">99.9%</span> Active Uptime
            </div>
          </motion.div>

          {/* Fast Tag pills */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-2.5 mt-2"
          >
            {['Moderation', 'Music', 'Fun', 'Economy', 'Utility'].map((tag) => (
              <button
                key={tag}
                onClick={() => router.push(`/search?category=${tag}`)}
                className="text-xs rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] hover:border-white/[0.12] px-4 py-2 text-text-secondary hover:text-white transition-all hover:scale-105 shadow-inner"
              >
                #{tag}
              </button>
            ))}
          </motion.div>
        </section>

        {/* Popular Categories Grid */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.06] text-primary-custom shadow-inner">
                <Compass className="h-5 w-5" />
              </span>
              Explore Popular Categories
            </h2>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
          >
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <motion.button
                  variants={itemVariants}
                  key={cat.name}
                  onClick={() => router.push(`/search?category=${cat.name}`)}
                  className={`text-left rounded-2xl bg-white/[0.02] border p-6 transition-all duration-300 flex items-start gap-5 hover:bg-white/[0.05] hover:-translate-y-1 hover:shadow-xl group cursor-pointer ${cat.color}`}
                >
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 bg-white/[0.03] border border-white/[0.06] shadow-inner group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-primary-custom transition-colors">{cat.name}</h3>
                    <p className="text-sm text-muted-text mt-1.5 leading-relaxed">{cat.desc}</p>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </section>

        {/* Featured Bots Grid */}
        {renderBotSection('Featured Bots', <Sparkles className="h-5 w-5 text-indigo-400" />, featuredBots, 'featured')}

        {/* Trending Bots Grid */}
        {renderBotSection('Trending Bots', <Flame className="h-5 w-5 text-orange-400" />, trendingBots, 'trending')}

        {/* Newest Bots Grid */}
        {renderBotSection('Recently Added', <Clock className="h-5 w-5 text-emerald-400" />, newestBots, 'new')}

        {/* CTA Developer Section */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden border border-white/[0.06] bg-gradient-to-br from-[#121620]/90 to-[#1b212f]/90 p-8 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10 mt-8 shadow-2xl"
        >
          {/* Inner Glowing lights */}
          <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-primary-custom/10 blur-[60px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-pink-500/10 blur-[60px] pointer-events-none" />
          
          <div className="flex flex-col gap-4 relative z-10">
            <div className="inline-flex items-center gap-2 rounded-lg bg-primary-custom/10 text-primary-custom text-xs font-extrabold px-3 py-1 border border-primary-custom/20 w-fit">
              <Zap className="h-3.5 w-3.5" />
              <span>DEVELOPER PORTAL</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">Have a Discord Bot?</h2>
            <p className="text-base text-text-secondary max-w-xl leading-relaxed">
              List your bot on Discova to reach thousands of monthly active users, gather ratings, track user statistics, and build a community.
            </p>
          </div>
          
          <button
            onClick={() => router.push('/dashboard/submit')}
            className="relative flex items-center gap-2.5 rounded-xl bg-primary-custom hover:bg-primary-hover px-7 py-4 text-base font-bold text-white shadow-lg shadow-primary-custom/30 transition-all hover:scale-105 shrink-0"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Add Your Bot Now</span>
          </button>
        </motion.section>

      </div>
    </div>
  );
}
