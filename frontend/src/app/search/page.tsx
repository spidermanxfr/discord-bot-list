'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { BotCard, BotData } from '@/components/BotCard';
import { Search, Filter, SortAsc, RefreshCw, AlertCircle } from 'lucide-react';

const CATEGORIES = ['All', 'Moderation', 'Music', 'Utility', 'Economy', 'Social & Fun', 'Logging', 'Games'];
const LIBRARIES = ['All', 'discord.js', 'discord.py', 'discord-go', 'eris', 'other'];

const SearchPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search parameters state
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [library, setLibrary] = useState(searchParams.get('library') || 'All');
  const [verified, setVerified] = useState(searchParams.get('verified') === 'true');
  const [featured, setFeatured] = useState(searchParams.get('featured') === 'true');
  const [premium, setPremium] = useState(searchParams.get('premium') === 'true');
  const [sort, setSort] = useState(searchParams.get('sort') || 'votes');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const [bots, setBots] = useState<BotData[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBots, setTotalBots] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync params to URL
  const updateUrlParams = () => {
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (category !== 'All') params.set('category', category);
    if (library !== 'All') params.set('library', library);
    if (verified) params.set('verified', 'true');
    if (featured) params.set('featured', 'true');
    if (premium) params.set('premium', 'true');
    if (sort !== 'votes') params.set('sort', sort);
    if (page > 1) params.set('page', page.toString());
    
    router.push(`/search?${params.toString()}`);
  };

  const fetchBots = async () => {
    setLoading(true);
    try {
      let url = `/bots/search?page=${page}&limit=12&sort=${sort}`;
      if (query) url += `&query=${encodeURIComponent(query)}`;
      if (category !== 'All') url += `&category=${encodeURIComponent(category)}`;
      if (library !== 'All') url += `&library=${encodeURIComponent(library)}`;
      if (verified) url += `&verified=true`;
      if (featured) url += `&featured=true`;
      if (premium) url += `&premium=true`;

      const res = await api.get(url);
      if (res.data.success) {
        setBots(res.data.bots);
        setTotalPages(res.data.totalPages || 1);
        setTotalBots(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load search results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBots();
  }, [category, library, verified, featured, premium, sort, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBots();
    updateUrlParams();
  };

  const clearFilters = () => {
    setQuery('');
    setCategory('All');
    setLibrary('All');
    setVerified(false);
    setFeatured(false);
    setPremium(false);
    setSort('votes');
    setPage(1);
  };

  return (
    <div className="flex-1 px-4 md:px-8 py-10 mx-auto max-w-7xl w-full flex flex-col md:flex-row gap-8">
      
      {/* Left Sidebar: Filters */}
      <aside className="w-full md:w-64 shrink-0 flex flex-col gap-4 md:gap-6 bg-card-bg/30 border border-border-custom rounded-xl p-4 md:p-0 md:bg-transparent md:border-none">
        
        {/* Filters Header */}
        <div className="flex items-center justify-between border-b border-border-custom/50 pb-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Filter className="h-4.5 w-4.5 text-primary-custom" />
            Filters
          </h2>
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="md:hidden text-xs bg-hover-bg hover:bg-hover-bg/80 text-white font-medium rounded px-2.5 py-1 border border-border-custom transition-all"
            >
              {mobileFiltersOpen ? 'Hide' : 'Show All'}
            </button>
            <button 
              onClick={clearFilters}
              className="text-xs text-muted-text hover:text-white flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              Reset
            </button>
          </div>
        </div>

        {/* Collapsible Container */}
        <div className={`${mobileFiltersOpen ? 'flex' : 'hidden'} md:flex flex-col gap-6`}>
          {/* Categories Select */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Category</label>
            <div className="flex flex-col gap-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); setPage(1); }}
                  className={`text-sm text-left px-3 py-2 rounded-lg transition-colors ${category === cat ? 'bg-primary-custom text-white font-semibold' : 'text-text-secondary hover:bg-hover-bg hover:text-white'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Libraries Select */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Library</label>
            <div className="flex flex-col gap-1">
              {LIBRARIES.map((lib) => (
                <button
                  key={lib}
                  onClick={() => { setLibrary(lib); setPage(1); }}
                  className={`text-sm text-left px-3 py-2 rounded-lg transition-colors ${library === lib ? 'bg-primary-custom text-white font-semibold' : 'text-text-secondary hover:bg-hover-bg hover:text-white'}`}
                >
                  {lib}
                </button>
              ))}
            </div>
          </div>

          {/* Badges Checklist */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Badges</label>
            <div className="flex flex-col gap-2 mt-1">
              <label className="flex items-center gap-2.5 text-sm text-text-secondary cursor-pointer hover:text-white">
                <input 
                  type="checkbox" 
                  checked={verified} 
                  onChange={(e) => { setVerified(e.target.checked); setPage(1); }}
                  className="h-4 w-4 rounded border-border-custom bg-background text-primary-custom focus:ring-primary-custom" 
                />
                <span>Verified Only</span>
              </label>
              <label className="flex items-center gap-2.5 text-sm text-text-secondary cursor-pointer hover:text-white">
                <input 
                  type="checkbox" 
                  checked={featured} 
                  onChange={(e) => { setFeatured(e.target.checked); setPage(1); }}
                  className="h-4 w-4 rounded border-border-custom bg-background text-primary-custom focus:ring-primary-custom" 
                />
                <span>Featured Only</span>
              </label>
              <label className="flex items-center gap-2.5 text-sm text-text-secondary cursor-pointer hover:text-white">
                <input 
                  type="checkbox" 
                  checked={premium} 
                  onChange={(e) => { setPremium(e.target.checked); setPage(1); }}
                  className="h-4 w-4 rounded border-border-custom bg-background text-primary-custom focus:ring-primary-custom" 
                />
                <span>Premium Only</span>
              </label>
            </div>
          </div>
        </div>

      </aside>

      {/* Right Content: Bots Search Results */}
      <section className="flex-1 flex flex-col gap-6">
        
        {/* Search & Sort Panel */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-secondary-bg/30 border border-border-custom rounded-xl p-4">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full flex items-center">
            <input
              type="text"
              placeholder="Search bots..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg bg-background border border-border-custom px-4 py-2 pl-10 text-sm text-text-primary focus:border-primary-custom focus:outline-none"
            />
            <Search className="absolute left-3 h-4 w-4 text-muted-text" />
          </form>

          {/* Sort Selection */}
          <div className="flex items-center gap-2 w-full sm:w-auto self-stretch shrink-0">
            <SortAsc className="h-4 w-4 text-muted-text hidden sm:inline" />
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="w-full sm:w-44 rounded-lg bg-background border border-border-custom px-3 py-2 text-sm text-text-primary focus:border-primary-custom focus:outline-none cursor-pointer"
            >
              <option value="votes">Most Votes (All time)</option>
              <option value="monthly">Most Votes (Monthly)</option>
              <option value="newest">Recently Added</option>
              <option value="views">Most Views</option>
              <option value="servers">Largest Servers</option>
            </select>
          </div>
        </div>

        {/* Dynamic Bot Listings */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-[340px] rounded-xl bg-card-bg border border-border-custom animate-pulse" />
            ))}
          </div>
        ) : bots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border-custom/50 rounded-2xl gap-4">
            <AlertCircle className="h-12 w-12 text-muted-text opacity-40 animate-bounce" />
            <div className="text-center">
              <h3 className="text-lg font-bold text-white">No Bots Found</h3>
              <p className="text-sm text-muted-text max-w-sm mt-1">
                We couldn't find any bots matching your query. Try adjusting your filters or clearing search.
              </p>
            </div>
            <button
              onClick={clearFilters}
              className="rounded-lg bg-primary-custom px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bots.map((bot) => (
              <BotCard key={bot.botId} bot={bot} />
            ))}
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              disabled={page === 1}
              onClick={() => { setPage((p) => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="rounded-lg bg-card-bg border border-border-custom px-4 py-2 text-sm font-semibold text-text-primary hover:bg-hover-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-text-secondary">
              Page <span className="font-bold text-white">{page}</span> of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="rounded-lg bg-card-bg border border-border-custom px-4 py-2 text-sm font-semibold text-text-primary hover:bg-hover-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}

      </section>

    </div>
  );
};

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 rounded-full border-2 border-primary-custom border-t-transparent animate-spin" />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
