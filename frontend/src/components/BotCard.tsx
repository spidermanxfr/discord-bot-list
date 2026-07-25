'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { ShieldCheck, Star, Vote as VoteIcon, Cpu, Eye, ExternalLink, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export interface BotData {
  botId: string;
  name: string;
  avatar?: string;
  shortDesc: string;
  votes: number;
  serverCount: number;
  categories: string[];
  verified: boolean;
  featured: boolean;
  premium: boolean;
  customSlug?: string;
}

interface BotCardProps {
  bot: BotData;
  onVoteSuccess?: () => void;
}

export const BotCard: React.FC<BotCardProps> = ({ bot, onVoteSuccess }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [voteCount, setVoteCount] = useState(bot.votes);
  const [voting, setVoting] = useState(false);

  const botSlug = bot.customSlug || bot.botId;

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('You must log in to vote!');
      return;
    }

    setVoting(true);
    try {
      const res = await api.post(`/bots/${bot.botId}/vote`);
      if (res.data.success) {
        setVoteCount(res.data.votes);
        toast.success(res.data.message || 'Voted successfully!');
        if (onVoteSuccess) onVoteSuccess();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to vote.';
      if (err.response?.data?.cooldownRemaining) {
        toast.error(`${msg} Cooldown: ${err.response.data.cooldownRemaining.formatted}`);
      } else {
        toast.error(msg);
      }
    } finally {
      setVoting(false);
    }
  };

  const handleInvite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(`https://discord.com/oauth2/authorize?client_id=${bot.botId}&permissions=0&scope=bot%20applications.commands`, '_blank');
  };

  return (
    <Link 
      href={`/bots/${botSlug}`} 
      className="group relative block rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-primary-custom/30 hover:scale-[1.02] hover:shadow-[0_12px_30px_rgba(88,101,242,0.15)] transition-all duration-300 overflow-hidden flex flex-col justify-between h-[350px] backdrop-blur-md"
    >
      {/* Top light hover indicator */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-primary-custom via-pink-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="p-6 flex flex-col gap-4">
        
        {/* Header Avatar + Badges */}
        <div className="flex items-start justify-between">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-xl font-bold text-white overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-300">
              {bot.avatar ? (
                <img src={bot.avatar} alt={bot.name} className="h-full w-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-custom/40 to-pink-500/40 flex items-center justify-center font-black tracking-wider text-sm">
                  {bot.name.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            {bot.premium && (
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md border border-[#0B0D12] flex items-center gap-0.5 shadow-md">
                <Star className="h-2 w-2 fill-black" />
                PRM
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5 items-end">
            <div className="flex gap-1.5">
              {bot.featured && (
                <span className="rounded-lg bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-2.5 py-1 border border-indigo-500/20 shadow-sm flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Featured
                </span>
              )}
              {bot.verified && (
                <span className="rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2.5 py-1 border border-emerald-500/20 flex items-center gap-1 shadow-sm">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified
                </span>
              )}
            </div>
            {bot.serverCount > 0 && (
              <span className="text-xs text-muted-text flex items-center gap-1 mt-0.5">
                <Cpu className="h-3.5 w-3.5 opacity-60" />
                <span>{bot.serverCount.toLocaleString()} servers</span>
              </span>
            )}
          </div>
        </div>

        {/* Bot Name & Description */}
        <div>
          <h3 className="text-xl font-extrabold text-white group-hover:text-primary-custom transition-colors flex items-center gap-1.5">
            {bot.name}
          </h3>
          <p className="text-sm text-text-secondary line-clamp-3 mt-2 leading-relaxed min-h-[60px]">
            {bot.shortDesc}
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1.5">
          {bot.categories.slice(0, 3).map((cat) => (
            <span key={cat} className="text-xs rounded-lg bg-white/[0.02] border border-white/[0.04] px-2.5 py-1 text-muted-text font-medium">
              {cat}
            </span>
          ))}
        </div>

      </div>

      {/* Footer Quick Actions */}
      <div className="border-t border-white/[0.04] px-6 py-4 bg-white/[0.01] flex items-center justify-between mt-auto">
        <button
          onClick={handleVote}
          disabled={voting}
          className="flex items-center gap-2 text-sm font-bold rounded-xl bg-white/[0.03] border border-white/[0.08] px-4 py-2 text-text-primary hover:bg-primary-custom hover:border-primary-custom hover:text-white transition-all duration-200 disabled:opacity-50 hover:shadow-md hover:shadow-primary-custom/25"
        >
          <VoteIcon className="h-4 w-4" />
          <span>{voteCount}</span>
        </button>

        <button
          onClick={handleInvite}
          className="flex items-center gap-1 text-sm font-bold text-primary-custom hover:text-white group/invite transition-colors"
        >
          <span>Invite Bot</span>
          <ExternalLink className="h-3.5 w-3.5 group-hover/invite:translate-x-0.5 group-hover/invite:-translate-y-0.5 transition-transform" />
        </button>
      </div>

    </Link>
  );
};

export default BotCard;
