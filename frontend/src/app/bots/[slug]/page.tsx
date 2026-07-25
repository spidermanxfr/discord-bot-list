'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { 
  ShieldCheck, Star, Vote, ExternalLink, MessageSquare, 
  Settings, Award, Heart, Cpu, AlertTriangle, MessageCircle, Trash2, Send, Eye, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

// Simple lightweight Markdown and HTML rendering helper
const renderMarkdown = (text: string) => {
  if (!text) return { __html: '' };

  let html = text;

  // 1. Code blocks: ```javascript ... ```
  html = html.replace(/```([\s\S]*?)```/g, (match, p1) => {
    return `<pre><code>${p1.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
  });

  // 2. Inline code: `code`
  html = html.replace(/`([^`\n]+)`/g, (match, p1) => {
    return `<code>${p1.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`;
  });

  // 3. Headers: #, ##, ###
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // 4. Bold and Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // 5. Links: [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');

  // 6. Lists: - item
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');

  // 7. Handle line breaks (preserving existing block tags)
  html = html.replace(/\n/g, '<br />');

  // Restore pre/code block formatting (remove <br /> inside code blocks)
  html = html.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, (match, p1) => {
    return `<pre><code>${p1.replace(/<br \/>/g, '\n')}</code></pre>`;
  });

  return { __html: html };
};

export default function BotDetails() {
  const { slug } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [bot, setBot] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Tab control
  const [activeTab, setActiveTab] = useState<'about' | 'reviews'>('about');
  
  // Review inputs
  const [rating, setRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Reply inputs
  const [replyInputId, setReplyInputId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Report details
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [syncing, setSyncing] = useState(false);

  const fetchBotDetails = async () => {
    try {
      const botRes = await api.get(`/bots/${slug}`);
      if (botRes.data.success) {
        setBot(botRes.data.bot);
        // Load reviews
        const reviewRes = await api.get(`/reviews/${botRes.data.bot.botId}`);
        if (reviewRes.data.success) {
          setReviews(reviewRes.data.reviews);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load bot details.');
      router.push('/search');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) fetchBotDetails();
  }, [slug]);

  const handleVote = async () => {
    if (!user) {
      toast.error('You must log in to vote!');
      return;
    }
    try {
      const res = await api.post(`/bots/${bot.botId}/vote`);
      if (res.data.success) {
        setBot((prev: any) => ({ ...prev, votes: res.data.votes }));
        toast.success('Vote recorded!');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Vote failed.';
      if (err.response?.data?.cooldownRemaining) {
        toast.error(`${msg} Cooldown remaining: ${err.response.data.cooldownRemaining.formatted}`);
      } else {
        toast.error(msg);
      }
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await api.post(`/bots/${bot.botId}/sync`);
      if (res.data.success) {
        setBot(res.data.bot);
        toast.success('Bot details successfully synced with Discord!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Sync failed.');
    } finally {
      setSyncing(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Login to submit reviews.');
      return;
    }
    if (reviewContent.length < 10) {
      toast.error('Review must be at least 10 characters.');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.post(`/reviews/${bot.botId}`, {
        rating,
        content: reviewContent
      });
      if (res.data.success) {
        toast.success('Review posted!');
        setReviewContent('');
        setRating(5);
        // Refresh reviews
        fetchBotDetails();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to post review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await api.delete(`/reviews/${reviewId}`);
      if (res.data.success) {
        toast.success('Review deleted.');
        fetchBotDetails();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete review.');
    }
  };

  const handleLikeReview = async (reviewId: string) => {
    if (!user) {
      toast.error('Log in to like reviews.');
      return;
    }
    try {
      const res = await api.post(`/reviews/${reviewId}/like`);
      if (res.data.success) {
        // Toggle in UI directly
        setReviews((prev) => 
          prev.map((r) => {
            if (r._id === reviewId) {
              const currentLikes = [...r.likes];
              const uIdx = currentLikes.indexOf(user.discordId);
              if (uIdx > -1) {
                currentLikes.splice(uIdx, 1);
              } else {
                currentLikes.push(user.discordId);
              }
              return { ...r, likes: currentLikes };
            }
            return r;
          })
        );
      }
    } catch (err: any) {
      toast.error('Action failed.');
    }
  };

  const handleReplySubmit = async (reviewId: string) => {
    if (!replyText.trim()) return;
    try {
      const res = await api.post(`/reviews/${reviewId}/reply`, { reply: replyText });
      if (res.data.success) {
        toast.success('Reply submitted.');
        setReplyText('');
        setReplyInputId(null);
        fetchBotDetails();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to post reply.');
    }
  };

  const handleReportSubmit = async () => {
    if (reportReason.length < 10) {
      toast.error('Please specify a detailed reason (min 10 chars).');
      return;
    }
    try {
      const res = await api.post('/admin/reports', {
        targetId: bot.botId,
        targetType: 'bot',
        reason: reportReason
      });
      if (res.data.success) {
        toast.success('Report submitted successfully. Our team will review it.');
        setReportReason('');
        setShowReportModal(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to file report.');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 border-2 border-primary-custom border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!bot) return null;

  const isDeveloper = user && (bot.owner === user.discordId || bot.team.includes(user.discordId));
  const isUnclaimed = bot.owner === 'unclaimed';

  return (
    <div className="flex-1 flex flex-col w-full pb-16">
      
      {/* Hero Banner Header */}
      <div className="relative w-full h-48 bg-gradient-to-r from-[#151922] via-[#0b0d12] to-[#151922] border-b border-border-custom/50 flex items-end">
        {/* Subtle grid pattern inside hero */}
        <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
        {/* Ambient Aurora glow behind the bot info */}
        <div className="absolute bottom-[-50px] left-[15%] h-56 w-56 rounded-full bg-primary-custom/10 blur-[50px] pointer-events-none animate-pulse-glow" />
        
        <div className="mx-auto max-w-7xl w-full px-4 md:px-8 pb-5 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 transform translate-y-8 sm:translate-y-10 z-10">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
            <div className="relative group shrink-0">
              {/* Outer soft glowing border */}
              <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-primary-custom to-indigo-500 opacity-40 blur-md transition duration-300 group-hover:opacity-65" />
              <div className="relative h-28 w-28 rounded-3xl bg-card-bg border border-white/10 flex items-center justify-center text-3xl font-bold text-white overflow-hidden shadow-2xl">
                {bot.avatar ? (
                  <img src={bot.avatar} alt={bot.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  bot.name.substring(0, 2).toUpperCase()
                )}
              </div>
            </div>
            
            <div className="text-center sm:text-left flex flex-col gap-1.5 pb-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-3xl font-black text-white">{bot.name}</h1>
                <div className="flex gap-1.5">
                  {bot.premium && <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[9px] font-black uppercase px-1.5 py-0.5 rounded border border-card-bg">PREMIUM</span>}
                  {bot.featured && <span className="bg-primary-custom/20 text-primary-custom text-[10px] font-bold px-2 py-0.5 rounded border border-primary-custom/30">FEATURED</span>}
                  {bot.verified && <span className="bg-success-custom/20 text-success-custom text-[10px] font-bold px-2 py-0.5 rounded border border-success-custom/30 flex items-center gap-0.5"><ShieldCheck className="h-3.5 w-3.5" /> VERIFIED</span>}
                </div>
              </div>
              <p className="text-md text-text-secondary">{bot.shortDesc}</p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 pb-2 shrink-0 w-full sm:w-auto justify-center sm:justify-end">
            <button
              onClick={() => window.open(bot.inviteUrl || `https://discord.com/oauth2/authorize?client_id=${bot.botId}&permissions=0&scope=bot`, '_blank')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-lg bg-primary-custom hover:bg-primary-hover px-5 py-2.5 text-sm font-bold text-white transition-colors text-center shadow-lg shadow-primary-custom/10 hover:shadow-primary-custom/25"
            >
              Invite Bot
              <ExternalLink className="h-4 w-4" />
            </button>
            <button
              onClick={handleVote}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-lg bg-card-bg border border-border-custom hover:bg-hover-bg px-5 py-2.5 text-sm font-bold text-white transition-colors text-center"
            >
              <Vote className="h-4 w-4 text-success-custom animate-pulse" />
              Vote ({bot.votes})
            </button>
            {isDeveloper && (
              <div className="flex gap-2 flex-1 sm:flex-none">
                <button
                  type="button"
                  onClick={handleSync}
                  disabled={syncing}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-lg bg-card-bg border border-border-custom hover:bg-hover-bg px-4 py-2.5 text-sm font-bold text-white transition-colors text-center disabled:opacity-50"
                  title="Sync bot details with Discord"
                >
                  <RefreshCw className={`h-4 w-4 text-primary-custom ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing...' : 'Sync Info'}
                </button>
                <button
                  onClick={() => router.push(`/dashboard/edit/${bot.botId}`)}
                  className="flex items-center justify-center p-2.5 rounded-lg bg-card-bg border border-border-custom text-muted-text hover:text-white"
                >
                  <Settings className="h-4.5 w-4.5" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Alert Banner for Unclaimed Bot Profiles */}
      {isUnclaimed && (
        <div className="mx-auto max-w-7xl w-full px-4 md:px-8 mt-20 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="relative overflow-hidden rounded-2xl border border-warning-custom/35 bg-warning-custom/5 p-5 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-5 shadow-2xl">
            {/* Ambient inner glow */}
            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-warning-custom/10 blur-[40px] pointer-events-none" />
            
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-warning-custom/10 border border-warning-custom/25 flex items-center justify-center text-warning-custom shrink-0 mt-0.5 shadow-inner">
                <AlertTriangle className="h-5 w-5 animate-pulse" />
              </div>
              <div className="flex flex-col gap-1 text-left">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Unclaimed Profile
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed max-w-2xl">
                  This bot profile was added manually by platform administrators to showcase popular community tools. 
                  If you are the official developer of <strong>{bot.name}</strong>, you can claim ownership to manage details, view stats, and customize your page by raising a claim ticket on our support server.
                </p>
              </div>
            </div>
            
            <a
              href="/contact"
              className="w-full md:w-auto text-center text-xs font-extrabold bg-warning-custom text-black hover:bg-warning-custom/90 px-5 py-3 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-warning-custom/20 shrink-0"
            >
              Raise Claim Ticket
            </a>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className={`mx-auto max-w-7xl w-full px-4 md:px-8 ${isUnclaimed ? 'mt-8' : 'mt-24'} grid grid-cols-1 lg:grid-cols-3 gap-8`}>
        
        {/* Left Column: Quick Info & Stats */}
        <div className="lg:col-span-1 flex flex-col gap-6 order-2 lg:order-1">
          <div className="rounded-xl bg-card-bg border border-border-custom p-5 flex flex-col gap-4 shadow-xl">
            <h3 className="text-md font-bold text-white border-b border-border-custom/50 pb-2">Information</h3>
            
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex justify-between items-start gap-4 py-2.5 border-b border-white/[0.03] hover:bg-white/[0.01] px-1 rounded transition-colors">
                <span className="text-muted-text">Developer</span>
                {isUnclaimed ? (
                  <span className="text-amber-400 font-bold text-right text-xs max-w-[200px] leading-relaxed">
                    No author provided (Added by Admins). For claiming, <Link href="/contact" className="underline hover:text-amber-300">raise a ticket</Link>.
                  </span>
                ) : (
                  <span className="text-white font-semibold">{bot.owner}</span>
                )}
              </div>
              {bot.prefix && (
                <div className="flex justify-between items-center py-2.5 border-b border-white/[0.03] hover:bg-white/[0.01] px-1 rounded transition-colors">
                  <span className="text-muted-text">Prefix</span>
                  <span className="bg-background border border-border-custom px-2 py-0.5 rounded font-mono text-xs text-white font-semibold">{bot.prefix}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2.5 border-b border-white/[0.03] hover:bg-white/[0.01] px-1 rounded transition-colors">
                <span className="text-muted-text">Server Count</span>
                <span className="text-white font-bold flex items-center gap-1"><Cpu className="h-4 w-4 text-primary-custom" /> {bot.serverCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 hover:bg-white/[0.01] px-1 rounded transition-colors">
                <span className="text-muted-text">Views</span>
                <span className="text-white font-bold flex items-center gap-1"><Eye className="h-4 w-4 text-warning-custom" /> {bot.views.toLocaleString()}</span>
              </div>
            </div>

            {/* Links row */}
            <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-border-custom/50">
              {bot.supportUrl && <a href={bot.supportUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between text-sm text-text-secondary hover:text-white py-1 hover:translate-x-0.5 transition-transform"><span className="flex items-center gap-1.5"><MessageCircle className="h-4 w-4 text-primary-custom" /> Support Server</span> <ExternalLink className="h-3 w-3" /></a>}
              {bot.websiteUrl && <a href={bot.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between text-sm text-text-secondary hover:text-white py-1 hover:translate-x-0.5 transition-transform"><span className="flex items-center gap-1.5"><Heart className="h-4 w-4 text-danger-custom" /> Website</span> <ExternalLink className="h-3 w-3" /></a>}
              {bot.githubUrl && <a href={bot.githubUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between text-sm text-text-secondary hover:text-white py-1 hover:translate-x-0.5 transition-transform"><span className="flex items-center gap-1.5"><Cpu className="h-4 w-4 text-white" /> GitHub Repository</span> <ExternalLink className="h-3 w-3" /></a>}
            </div>

            {/* Flag Report Button */}
            <button
              onClick={() => { if (!user) { toast.error('Login to report.'); return; } setShowReportModal(true); }}
              className="mt-2 w-full text-center text-xs font-semibold text-danger-custom bg-danger-custom/10 hover:bg-danger-custom/20 rounded-lg py-2.5 flex items-center justify-center gap-1.5 transition-colors"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Report this Bot
            </button>
          </div>

          {/* Tags card */}
          {bot.tags && bot.tags.length > 0 && (
            <div className="rounded-xl bg-card-bg border border-border-custom p-5 flex flex-col gap-3 shadow-xl">
              <h3 className="text-sm font-bold text-white">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {bot.tags.map((tag: string) => (
                  <span key={tag} className="text-xs rounded bg-background border border-border-custom px-2.5 py-1 text-muted-text hover:text-white hover:border-white/10 transition-colors">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: About Tabs (Markdown long description or reviews list) */}
        <div className="lg:col-span-2 flex flex-col gap-6 order-1 lg:order-2">
          
          {/* Tab selectors */}
          <div className="flex gap-2 border-b border-border-custom/50 pb-2">
            <button
              onClick={() => setActiveTab('about')}
              className={`pb-2 px-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'about' ? 'border-primary-custom text-white' : 'border-transparent text-muted-text hover:text-white'}`}
            >
              About Bot
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-2 px-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'reviews' ? 'border-primary-custom text-white' : 'border-transparent text-muted-text hover:text-white'} flex items-center gap-1.5`}
            >
              Reviews ({reviews.length})
            </button>
          </div>

          {activeTab === 'about' ? (
            <div className="rounded-xl bg-card-bg border border-border-custom p-6 md:p-8 min-h-[300px]">
              <div className="bot-description" dangerouslySetInnerHTML={renderMarkdown(bot.longDesc)} />
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              
              {/* Post a Review form */}
              {user && bot.owner !== user.discordId ? (
                <form onSubmit={handleReviewSubmit} className="rounded-xl bg-card-bg border border-border-custom p-5 flex flex-col gap-4">
                  <h3 className="text-md font-bold text-white">Write a Review</h3>
                  
                  {/* Stars select */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-text-secondary mr-2">Your Rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-amber-500 hover:scale-110 transition-transform"
                      >
                        <Star className={`h-6 w-6 ${rating >= star ? 'fill-amber-500' : 'text-muted-text'}`} />
                      </button>
                    ))}
                  </div>

                  {/* Comment */}
                  <textarea
                    placeholder="Provide your feedback. Min 10, max 1000 characters. Markdown format supported."
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg bg-background border border-border-custom p-3 text-sm text-text-primary focus:border-primary-custom focus:outline-none"
                  />

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="rounded-lg bg-primary-custom hover:bg-primary-hover py-2 text-sm font-bold text-white transition-colors self-end px-5 disabled:opacity-50"
                  >
                    Submit Review
                  </button>
                </form>
              ) : !user ? (
                <div className="rounded-xl bg-secondary-bg/30 border border-dashed border-border-custom p-6 text-center text-sm text-muted-text">
                  Please log in to submit a review for this bot.
                </div>
              ) : null}

              {/* Reviews List */}
              <div className="flex flex-col gap-4">
                {reviews.length === 0 ? (
                  <div className="rounded-xl bg-card-bg border border-border-custom p-10 text-center text-sm text-muted-text">
                    No reviews yet. Be the first to share your experience!
                  </div>
                ) : (
                  reviews.map((rev) => {
                    const isReviewAuthor = user && user.discordId === rev.userId._id;
                    const isReviewLiked = user && rev.likes.includes(user.discordId);
                    
                    return (
                      <div key={rev._id} className="rounded-xl bg-card-bg border border-border-custom p-5 flex flex-col gap-4">
                        
                        {/* Author Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary-custom flex items-center justify-center font-bold text-white text-xs overflow-hidden shrink-0">
                              {rev.userId.avatar ? (
                                <img src={`https://cdn.discordapp.com/avatars/${rev.userId.discordId}/${rev.userId.avatar}.png`} alt="" className="h-full w-full object-cover" />
                              ) : (
                                rev.userId.username.substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white">{rev.userId.globalName || rev.userId.username}</p>
                              <div className="flex gap-0.5 mt-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star key={s} className={`h-3.5 w-3.5 ${rev.rating >= s ? 'fill-amber-500 text-amber-500' : 'text-muted-text'}`} />
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Delete Review button (only author or mod) */}
                          {user && (isReviewAuthor || user.role === 'admin' || user.role === 'moderator') && (
                            <button
                              onClick={() => handleDeleteReview(rev._id)}
                              className="text-muted-text hover:text-danger-custom transition-colors p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        {/* Review Content */}
                        <p className="text-sm text-text-secondary whitespace-pre-wrap">{rev.content}</p>

                        {/* Review Footer: Likes and Replies */}
                        <div className="flex items-center gap-4 text-xs text-muted-text">
                          <button
                            onClick={() => handleLikeReview(rev._id)}
                            className={`flex items-center gap-1.5 hover:text-white transition-colors ${isReviewLiked ? 'text-primary-custom font-semibold' : ''}`}
                          >
                            <Heart className={`h-4 w-4 ${isReviewLiked ? 'fill-primary-custom text-primary-custom' : ''}`} />
                            <span>{rev.likes.length} Likes</span>
                          </button>
                          
                          {/* Developer Reply trigger */}
                          {isDeveloper && !rev.ownerReply && (
                            <button
                              onClick={() => setReplyInputId(replyInputId === rev._id ? null : rev._id)}
                              className="flex items-center gap-1 hover:text-white transition-colors"
                            >
                              <MessageSquare className="h-4 w-4" />
                              <span>Reply</span>
                            </button>
                          )}
                        </div>

                        {/* Owner Reply Render */}
                        {rev.ownerReply && (
                          <div className="mt-2 pl-4 border-l-2 border-primary-custom bg-secondary-bg/30 p-3.5 rounded-r-lg flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="bg-primary-custom text-white text-[9px] font-black uppercase px-1 rounded">Developer</span>
                              <span className="text-xs font-bold text-white">{bot.name} Team</span>
                            </div>
                            <p className="text-sm text-text-secondary">{rev.ownerReply}</p>
                          </div>
                        )}

                        {/* Reply Form */}
                        {replyInputId === rev._id && (
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="text"
                              placeholder="Write a response as developer..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="flex-1 rounded-lg bg-background border border-border-custom px-3 py-1.5 text-sm text-text-primary focus:outline-none"
                            />
                            <button
                              onClick={() => handleReplySubmit(rev._id)}
                              className="rounded-lg bg-primary-custom hover:bg-primary-hover p-2 text-white"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          </div>
                        )}

                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Report Bot modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-lg bg-[#313338] border border-border-custom shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 flex flex-col gap-1.5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-danger-custom" />
                Report Bot ({bot.name})
              </h3>
              <p className="text-xs text-text-secondary">
                Please specify details about the violation (terms, offensive profile, malware). A moderator will check.
              </p>
            </div>

            {/* Body */}
            <div className="px-4 pb-4">
              <textarea
                placeholder="Provide a detailed explanation. Minimum 10 characters."
                rows={4}
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full rounded bg-[#1e1f22] border border-black/40 p-3 text-sm text-text-primary placeholder:text-muted-text focus:border-primary-custom focus:outline-none transition-colors"
              />
            </div>

            {/* Footer */}
            <div className="bg-[#2b2d31] px-4 py-3 flex gap-3 justify-end border-t border-black/20">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="text-sm px-4 py-2 text-text-secondary hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReportSubmit}
                className="rounded bg-danger-custom hover:bg-red-600 text-sm px-4 py-2 font-bold text-white transition-colors"
              >
                File Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
