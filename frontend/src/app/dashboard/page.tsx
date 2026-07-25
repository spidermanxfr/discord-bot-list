'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { 
  Bot, ShieldCheck, Key, Eye, PlusCircle, RefreshCw, 
  Trash2, Settings, TrendingUp, AlertTriangle, Shield, CheckCircle, XCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DeveloperDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // API Key management
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [keyLoading, setKeyLoading] = useState(false);

  // Webhook log drawer
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  const [showLogsBotId, setShowLogsBotId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/user/dashboard');
      if (res.data.success) {
        setBots(res.data.bots);
      }
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      toast.error('You must log in to view the dashboard.');
      router.push('/');
      return;
    }
    fetchDashboardData();
  }, [user, authLoading]);

  const handleShowKey = async (botId: string) => {
    if (selectedBotId === botId && apiKey) {
      // Toggle off
      setApiKey(null);
      setSelectedBotId(null);
      return;
    }

    setKeyLoading(true);
    try {
      const res = await api.get(`/user/dashboard/${botId}/key`);
      if (res.data.success) {
        setApiKey(res.data.apiKey || 'No key generated yet.');
        setSelectedBotId(botId);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch API key.');
    } finally {
      setKeyLoading(false);
    }
  };

  const handleGenerateKey = async (botId: string) => {
    setKeyLoading(true);
    try {
      const res = await api.post(`/user/dashboard/${botId}/key`);
      if (res.data.success) {
        setApiKey(res.data.apiKey);
        setSelectedBotId(botId);
        toast.success('New API Key generated successfully!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate API key.');
    } finally {
      setKeyLoading(false);
    }
  };

  const handleDeleteBot = async (botId: string) => {
    if (!confirm('Are you sure you want to delete this bot? This action is permanent.')) return;
    try {
      const res = await api.delete(`/bots/${botId}`);
      if (res.data.success) {
        toast.success('Bot deleted successfully.');
        fetchDashboardData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete bot.');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[65vh]">
        <div className="h-10 w-10 border-2 border-primary-custom border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center gap-1 text-xs text-success-custom bg-success-custom/10 border border-success-custom/25 px-2.5 py-0.5 rounded-full"><CheckCircle className="h-3 w-3" /> Approved</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 text-xs text-warning-custom bg-warning-custom/10 border border-warning-custom/25 px-2.5 py-0.5 rounded-full"><TrendingUp className="h-3 w-3 animate-pulse" /> Pending Review</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1 text-xs text-danger-custom bg-danger-custom/10 border border-danger-custom/25 px-2.5 py-0.5 rounded-full"><XCircle className="h-3 w-3" /> Rejected</span>;
      case 'banned':
        return <span className="inline-flex items-center gap-1 text-xs text-danger-custom bg-danger-custom/15 border border-danger-custom/40 px-2.5 py-0.5 rounded-full"><AlertTriangle className="h-3 w-3" /> Suspended</span>;
      default:
        return <span className="text-xs text-muted-text bg-background border px-2.5 py-0.5 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="flex-1 px-4 md:px-8 py-12 mx-auto max-w-7xl w-full flex flex-col gap-8">
      
      {/* Top Welcome Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-custom/50 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Developer Dashboard</h1>
          <p className="text-sm text-muted-text mt-1">Manage and monitor your Discord bots listed on DisCova.</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/submit')}
          className="flex items-center gap-1.5 rounded-lg bg-primary-custom hover:bg-primary-hover px-4 py-2.5 text-sm font-semibold text-white transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          Submit New Bot
        </button>
      </div>

      {bots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border-custom/50 rounded-2xl gap-4">
          <Bot className="h-16 w-16 text-muted-text opacity-40 animate-pulse" />
          <div className="text-center">
            <h3 className="text-xl font-bold text-white">No Bots Submitted</h3>
            <p className="text-sm text-muted-text max-w-sm mt-1.5">
              You haven't listed any bots yet. Click the button below to add your first bot and start tracking statistics!
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/submit')}
            className="rounded-lg bg-primary-custom px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
          >
            List a Bot
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          
          {/* Bots Table */}
          <div className="rounded-xl border border-border-custom bg-card-bg overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-custom/50 bg-secondary-bg/30 text-xs font-bold uppercase tracking-wider text-muted-text">
                    <th className="p-4 pl-6">Bot</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Server Count</th>
                    <th className="p-4">Votes (All-time)</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-custom/30 text-sm">
                  {bots.map((bot) => (
                    <tr key={bot.botId} className="hover:bg-hover-bg/35 transition-colors">
                      
                      {/* Name + Avatar */}
                      <td className="p-4 pl-6 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-secondary-bg border border-border-custom flex items-center justify-center font-bold text-xs text-white overflow-hidden shrink-0">
                          {bot.avatar ? (
                            <img src={bot.avatar} alt="" className="h-full w-full object-cover" />
                          ) : (
                            bot.name.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white flex items-center gap-1.5">
                            {bot.name}
                            {bot.verified && <ShieldCheck className="h-4 w-4 text-success-custom" />}
                          </p>
                          <p className="text-xs text-muted-text font-mono truncate max-w-[120px]">{bot.botId}</p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">{getStatusBadge(bot.status)}</td>

                      {/* Servers */}
                      <td className="p-4 font-semibold text-white">{bot.serverCount.toLocaleString()}</td>

                      {/* Votes */}
                      <td className="p-4 font-semibold text-white">{bot.votes}</td>

                      {/* Actions */}
                      <td className="p-4 pr-6 text-right flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => handleShowKey(bot.botId)}
                          className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${selectedBotId === bot.botId ? 'bg-primary-custom/10 border-primary-custom/40 text-primary-custom' : 'bg-background border-border-custom text-text-secondary hover:text-white'}`}
                          title="View API Token"
                        >
                          <Key className="h-3.5 w-3.5" />
                          API Token
                        </button>
                        <button
                          onClick={() => router.push(`/dashboard/edit/${bot.botId}`)}
                          className="p-2 rounded-lg bg-background border border-border-custom text-text-secondary hover:text-white"
                          title="Edit Bot"
                        >
                          <Settings className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBot(bot.botId)}
                          className="p-2 rounded-lg bg-danger-custom/10 hover:bg-danger-custom/25 border border-danger-custom/15 text-danger-custom"
                          title="Delete Bot"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* API Key Display Box */}
          {selectedBotId && (
            <div className="rounded-xl border border-border-custom bg-secondary-bg/40 p-5 flex flex-col gap-3 animate-in slide-in-from-bottom duration-250">
              <div className="flex items-center justify-between border-b border-border-custom/50 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Key className="h-4.5 w-4.5 text-primary-custom" />
                  API Token for "{bots.find(b => b.botId === selectedBotId)?.name}"
                </h3>
                <button
                  onClick={() => handleGenerateKey(selectedBotId)}
                  disabled={keyLoading}
                  className="text-xs text-primary-custom hover:text-white flex items-center gap-1 font-semibold transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Regenerate Token
                </button>
              </div>
              <p className="text-xs text-muted-text">
                Use this token to authenticate your bot when posting statistics (like guild server count) to our rest endpoints. Do NOT share it!
              </p>
              
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  readOnly
                  value={apiKey || ''}
                  className="w-full rounded-lg bg-background border border-border-custom px-4 py-2.5 font-mono text-sm text-success-custom focus:outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(apiKey || '');
                    toast.success('Token copied to clipboard!');
                  }}
                  className="rounded-lg bg-primary-custom hover:bg-primary-hover px-4 py-2.5 text-sm font-bold text-white transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          {/* Simulated Performance Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* View Activity Chart mockup */}
            <div className="rounded-xl border border-border-custom bg-card-bg p-5 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <TrendingUp className="h-4.5 w-4.5 text-success-custom" />
                Hourly View Activity (Mocked)
              </h3>
              
              <div className="h-40 flex items-end justify-between gap-1 pt-4 border-b border-border-custom/50 px-2">
                {[45, 60, 35, 78, 120, 95, 65, 80, 110, 140, 105, 125].map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                    <div 
                      style={{ height: `${(val / 160) * 100}%` }} 
                      className="w-full rounded-t bg-gradient-to-t from-primary-custom to-primary-hover min-h-[5px]"
                    />
                    <span className="text-[9px] text-muted-text">{idx * 2}h</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vote Activity Chart mockup */}
            <div className="rounded-xl border border-border-custom bg-card-bg p-5 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <TrendingUp className="h-4.5 w-4.5 text-primary-custom" />
                Daily Voting Trends (Mocked)
              </h3>
              
              <div className="h-40 flex items-end justify-between gap-2 pt-4 border-b border-border-custom/50 px-2">
                {[12, 18, 15, 24, 30, 20, 28].map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                    <div 
                      style={{ height: `${(val / 35) * 100}%` }} 
                      className="w-full rounded-t bg-gradient-to-t from-success-custom to-[#26A69A] min-h-[5px]"
                    />
                    <span className="text-[9px] text-muted-text">Day {idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
