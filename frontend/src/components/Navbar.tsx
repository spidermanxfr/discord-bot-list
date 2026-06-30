'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Search, Plus, User, LogOut, LayoutDashboard, Shield, ChevronDown, Sparkles, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleDiscordLogin = () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    window.location.href = `${backendUrl}/api/auth/discord`;
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border-custom bg-secondary-bg/95 backdrop-blur-md px-4 py-3 md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-custom text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <span>Dis<span className="text-primary-custom">Cova</span></span>
        </Link>

        {/* Search Bar (Desktop) */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex relative flex-1 max-w-md items-center">
          <input
            type="text"
            placeholder="Search awesome bots... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg bg-background border border-border-custom px-4 py-2 pl-10 text-sm text-text-primary placeholder:text-muted-text focus:border-primary-custom focus:outline-none"
          />
          <Search className="absolute left-3 h-4 w-4 text-muted-text" />
        </form>

        {/* Action Items (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/search" className="text-sm font-medium text-text-secondary hover:text-white transition-colors">
            Explore
          </Link>
          <Link href="/leaderboard" className="text-sm font-medium text-text-secondary hover:text-white transition-colors">
            Leaderboard
          </Link>
          
          <Link 
            href="/dashboard/submit" 
            className="flex items-center gap-1.5 rounded-lg bg-primary-custom px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
          >
            <Plus className="h-4 w-4" />
            Submit Bot
          </Link>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-lg bg-card-bg border border-border-custom px-3 py-1.5 hover:bg-hover-bg transition-colors"
              >
                <div className="h-6 w-6 rounded-full bg-primary-custom text-[11px] flex items-center justify-center text-white font-bold overflow-hidden">
                  {user.avatar ? (
                    <img src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`} alt={user.username} className="h-full w-full object-cover" />
                  ) : (
                    user.username.substring(0, 2).toUpperCase()
                  )}
                </div>
                <span className="text-sm font-medium text-white max-w-[100px] truncate">{user.username}</span>
                <ChevronDown className={`h-4 w-4 text-muted-text transition-transform ${dropdownOpen ? 'rotate-185' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-card-bg border border-border-custom p-1.5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-border-custom/50 mb-1">
                    <p className="text-xs text-muted-text">Logged in as</p>
                    <p className="text-sm font-semibold text-white truncate">{user.globalName || user.username}</p>
                  </div>

                  <Link 
                    href="/dashboard" 
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-hover-bg hover:text-white transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Developer Dashboard
                  </Link>

                  {(user.role === 'admin' || user.role === 'moderator') && (
                    <Link 
                      href="/admin" 
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-hover-bg hover:text-white transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Shield className="h-4 w-4 text-warning-custom" />
                      Admin Control Panel
                    </Link>
                  )}

                  <button 
                    onClick={logout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger-custom hover:bg-danger-custom/10 transition-colors mt-1"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={handleDiscordLogin} 
              className="rounded-lg bg-[#5865F2] hover:bg-[#4752C4] px-4 py-1.5 text-sm font-semibold text-white transition-colors"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 bg-card-bg border border-border-custom text-white hover:bg-hover-bg"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-border-custom flex flex-col gap-3 animate-in slide-in-from-top duration-200">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              placeholder="Search bots..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg bg-background border border-border-custom px-4 py-2 pl-10 text-sm text-text-primary focus:border-primary-custom focus:outline-none"
            />
            <Search className="absolute left-3 h-4 w-4 text-muted-text" />
          </form>

          <Link 
            href="/search" 
            className="text-sm font-medium text-text-secondary hover:text-white transition-colors py-1"
            onClick={() => setMobileMenuOpen(false)}
          >
            Explore
          </Link>
          <Link 
            href="/leaderboard" 
            className="text-sm font-medium text-text-secondary hover:text-white transition-colors py-1"
            onClick={() => setMobileMenuOpen(false)}
          >
            Leaderboard
          </Link>
          
          <Link 
            href="/dashboard/submit" 
            className="flex justify-center items-center gap-1.5 rounded-lg bg-primary-custom py-2 text-sm font-semibold text-white hover:bg-primary-hover"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Plus className="h-4 w-4" />
            Submit Bot
          </Link>

          {user ? (
            <div className="border-t border-border-custom/50 pt-2 flex flex-col gap-2">
              <div className="px-1 py-1">
                <p className="text-xs text-muted-text">Logged in as</p>
                <p className="text-sm font-semibold text-white truncate">{user.username}</p>
              </div>
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 text-sm text-text-secondary hover:text-white py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LayoutDashboard className="h-4 w-4" />
                Developer Dashboard
              </Link>
              {(user.role === 'admin' || user.role === 'moderator') && (
                <Link 
                  href="/admin" 
                  className="flex items-center gap-2 text-sm text-text-secondary hover:text-white py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Shield className="h-4 w-4 text-warning-custom" />
                  Admin Panel
                </Link>
              )}
              <button 
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 text-sm text-danger-custom hover:text-red-400 py-1"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={handleDiscordLogin} 
              className="w-full text-center rounded-lg bg-[#5865F2] hover:bg-[#4752C4] py-2 text-sm font-semibold text-white transition-colors"
            >
              Login with Discord
            </button>
          )}
        </div>
      )}
    </nav>
  );
};
export default Navbar;
