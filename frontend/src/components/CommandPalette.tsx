'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Search, Bot, Compass, Plus, Award, Shield, Terminal } from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Toggle Command Palette on Ctrl + K or Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setQuery('');
        setResults([]);
        setSelectedIndex(0);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch quick bot results on query change
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await api.get(`/bots/search?query=${encodeURIComponent(query)}&limit=5`);
        if (res.data.success) {
          setResults(res.data.bots || []);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error('Failed to query command palette:', err);
      }
    }, 150);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (item: any) => {
    setIsOpen(false);
    if (item.type === 'bot') {
      router.push(`/bots/${item.customSlug || item.botId}`);
    } else if (item.type === 'route') {
      router.push(item.path);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = [...staticRoutes, ...results.map(b => ({ type: 'bot', ...b }))];
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) {
        handleSelect(items[selectedIndex]);
      }
    }
  };

  const staticRoutes = [
    { type: 'route', label: 'Explore All Bots', path: '/search', icon: Compass },
    { type: 'route', label: 'Leaderboard', path: '/leaderboard', icon: Award },
    { type: 'route', label: 'Submit new Bot', path: '/dashboard/submit', icon: Plus },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-xs pt-[15vh] px-4 animate-in fade-in duration-150">
      <div 
        ref={containerRef}
        onKeyDown={handleKeyDown}
        className="w-full max-w-lg rounded-xl bg-card-bg border border-border-custom shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-200"
      >
        {/* Input field */}
        <div className="relative flex items-center border-b border-border-custom/50 p-4">
          <Search className="h-5 w-5 text-muted-text" />
          <input
            type="text"
            autoFocus
            placeholder="Type to search bots or command links..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent px-3 text-base text-text-primary placeholder:text-muted-text focus:outline-none"
          />
          <kbd className="hidden sm:inline-block rounded bg-background border border-border-custom px-1.5 py-0.5 text-xxs font-mono text-muted-text">
            ESC
          </kbd>
        </div>

        {/* Results list */}
        <div className="max-h-[320px] overflow-y-auto p-2 flex flex-col gap-0.5">
          {/* Quick Actions */}
          {!query && (
            <div className="px-3 py-1.5 text-xxs font-semibold uppercase tracking-wider text-muted-text">
              Quick Navigation
            </div>
          )}

          {staticRoutes.map((route, idx) => {
            const Icon = route.icon;
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={route.path}
                onClick={() => handleSelect(route)}
                className={`w-full text-left flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${isSelected ? 'bg-primary-custom text-white' : 'hover:bg-hover-bg text-text-secondary'}`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span className="text-sm font-medium">{route.label}</span>
              </button>
            );
          })}

          {/* Bot Results */}
          {query && (
            <>
              <div className="px-3 py-1.5 text-xxs font-semibold uppercase tracking-wider text-muted-text border-t border-border-custom/50 mt-1.5 pt-2">
                Matching Bots
              </div>
              {results.length === 0 ? (
                <div className="text-sm text-muted-text text-center py-6 flex flex-col items-center gap-1">
                  <Terminal className="h-5 w-5 opacity-40" />
                  No bots found for "{query}"
                </div>
              ) : (
                results.map((bot, idx) => {
                  const itemsIdx = staticRoutes.length + idx;
                  const isSelected = itemsIdx === selectedIndex;
                  return (
                    <button
                      key={bot.botId}
                      onClick={() => handleSelect({ type: 'bot', ...bot })}
                      className={`w-full text-left flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${isSelected ? 'bg-primary-custom text-white' : 'hover:bg-hover-bg text-text-secondary'}`}
                    >
                      <div className="h-7 w-7 rounded bg-secondary-bg border border-border-custom overflow-hidden flex items-center justify-center font-bold text-xs text-white">
                        {bot.avatar ? (
                          <img src={bot.avatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          bot.name.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{bot.name}</p>
                        <p className={`text-xs truncate ${isSelected ? 'text-white/80' : 'text-muted-text'}`}>{bot.shortDesc}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="border-t border-border-custom/50 px-4 py-2 bg-secondary-bg/30 text-xxs text-muted-text flex items-center justify-between">
          <span>Use <kbd className="font-mono bg-card-bg px-1 rounded">↑↓</kbd> to navigate, <kbd className="font-mono bg-card-bg px-1 rounded">Enter</kbd> to select</span>
          <span>Close with <kbd className="font-mono bg-card-bg px-1 rounded">ESC</kbd></span>
        </div>

      </div>
    </div>
  );
};
export default CommandPalette;
