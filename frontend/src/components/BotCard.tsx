'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { ShieldCheck, Star, Vote as VoteIcon, Cpu, Eye, ExternalLink } from 'lucide-react';
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
    <Link href={`/bots/${botSlug}`} className="group block rounded-xl bg-card-bg border border-border-custom hover:bg-hover-bg hover:scale-[1.02] hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between h-[340px]">
      
      <div className="p-5 flex flex-col gap-4">
        
        {/* Header Avatar + Badges */}
        <div className="flex items-start justify-between">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-secondary-bg border border-border-custom flex items-center justify-center text-xl font-bold text-white overflow-hidden">
              {bot.avatar ? (
                <img src={bot.avatar} alt={bot.name} className="h-full w-full object-cover" />
              ) : (
                bot.name.substring(0, 2).toUpperCase()
              )}
            </div>
            {bot.premium && (
              <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[9px] font-black uppercase px-1 rounded border border-card-bg">
                PRM
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1 items-end">
            <div className="flex gap-1.5">
              {bot.featured && (
                <span className="rounded bg-primary-custom/10 text-primary-custom text-[10px] font-bold px-2 py-0.5 border border-primary-custom/20">
                  Featured
                </span>
              )}
              {bot.verified && (
                <span className="rounded bg-success-custom/10 text-success-custom text-[10px] font-bold px-2 py-0.5 border border-success-custom/20 flex items-center gap-0.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified
                </span>
              )}
            </div>
            {bot.serverCount > 0 && (
              <span className="text-xs text-muted-text flex items-center gap-1 mt-1">
                <Cpu className="h-3 w-3" />
                {bot.serverCount.toLocaleString()} servers
              </span>
            )}
          </div>
        </div>

        {/* Bot Name & Description */}
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-primary-custom transition-colors flex items-center gap-1">
            {bot.name}
          </h3>
          <p className="text-sm text-text-secondary line-clamp-3 mt-1.5 leading-relaxed min-h-[60px]">
            {bot.shortDesc}
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1.5">
          {bot.categories.slice(0, 3).map((cat) => (
            <span key={cat} className="text-xs rounded bg-background border border-border-custom px-2 py-0.5 text-muted-text">
              {cat}
            </span>
          ))}
        </div>

      </div>

      {/* Footer Quick Actions */}
      <div className="border-t border-border-custom/50 px-5 py-3.5 bg-secondary-bg/30 flex items-center justify-between mt-auto">
        <button
          onClick={handleVote}
          disabled={voting}
          className="flex items-center gap-1.5 text-sm font-semibold rounded-lg bg-card-bg border border-border-custom px-3 py-1.5 text-text-primary hover:bg-primary-custom hover:text-white transition-all disabled:opacity-50"
        >
          <VoteIcon className="h-4 w-4" />
          <span>{voteCount}</span>
        </button>

        <button
          onClick={handleInvite}
          className="flex items-center gap-1 text-sm font-semibold text-primary-custom hover:text-white transition-colors"
        >
          <span>Invite</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>

    </Link>
  );
};
export default BotCard;
