'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { 
  Shield, Check, X, AlertTriangle, FileText, Settings, UserMinus, 
  Trash2, RefreshCw, Cpu, CheckCircle, Ban 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminControlPanel() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'queue' | 'bots' | 'reports' | 'logs'>('queue');
  const [loading, setLoading] = useState(true);
  
  // Data lists
  const [queue, setQueue] = useState<any[]>([]);
  const [bots, setBots] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  
  // Rejection/Ban overlay states
  const [rejectBotId, setRejectBotId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const [banUserId, setBanUserId] = useState<string | null>(null);
  const [banReason, setBanReason] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'queue') {
        const res = await api.get('/admin/queue');
        if (res.data.success) setQueue(res.data.bots || []);
      } else if (activeTab === 'bots') {
        const res = await api.get('/admin/bots');
        if (res.data.success) setBots(res.data.bots || []);
      } else if (activeTab === 'reports') {
        const res = await api.get('/admin/reports');
        if (res.data.success) setReports(res.data.reports || []);
      } else if (activeTab === 'logs') {
        const res = await api.get('/admin/audit-logs');
        if (res.data.success) setLogs(res.data.logs || []);
      }
    } catch (err: any) {
      toast.error('Failed to load admin queue. Make sure you have permission.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      toast.error('Access denied: Administrators and moderators only.');
      router.push('/');
      return;
    }
    fetchAdminData();
  }, [user, authLoading, activeTab]);

  const handleApprove = async (botId: string) => {
    try {
      const res = await api.post(`/admin/bot/${botId}/approve`);
      if (res.data.success) {
        toast.success('Bot approved and published live!');
        fetchAdminData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Approval action failed.');
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is required.');
      return;
    }
    try {
      const res = await api.post(`/admin/bot/${rejectBotId}/reject`, { reason: rejectionReason });
      if (res.data.success) {
        toast.success('Bot rejected successfully.');
        setRejectBotId(null);
        setRejectionReason('');
        fetchAdminData();
      }
    } catch (err: any) {
      toast.error('Rejection failed.');
    }
  };

  const handleBanUserSubmit = async () => {
    if (!banReason.trim()) {
      toast.error('Ban reason is required.');
      return;
    }
    try {
      const res = await api.post(`/admin/user/${banUserId}/ban`, { reason: banReason });
      if (res.data.success) {
        toast.success('User banned and owned bots disabled.');
        setBanUserId(null);
        setBanReason('');
        fetchAdminData();
      }
    } catch (err: any) {
      toast.error('Failed to ban user.');
    }
  };

  const handleToggleVerify = async (botId: string) => {
    try {
      const res = await api.post(`/admin/bot/${botId}/verify`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchAdminData();
      }
    } catch (err) {
      toast.error('Action failed.');
    }
  };

  const handleToggleFeature = async (botId: string) => {
    try {
      const res = await api.post(`/admin/bot/${botId}/feature`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchAdminData();
      }
    } catch (err) {
      toast.error('Action failed.');
    }
  };

  const handleDeleteBot = async (botId: string) => {
    if (!window.confirm('Are you sure you want to delete/remove this bot entirely? This action is permanent.')) {
      return;
    }
    try {
      const res = await api.delete(`/bots/${botId}`);
      if (res.data.success) {
        toast.success('Bot removed successfully!');
        fetchAdminData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove bot.');
    }
  };

  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    try {
      const res = await api.post(`/admin/reports/${reportId}/resolve`, {
        status,
        notes: `Ticket marked as ${status} by admin.`
      });
      if (res.data.success) {
        toast.success(`Report set to ${status}.`);
        fetchAdminData();
      }
    } catch (err) {
      toast.error('Failed to update ticket.');
    }
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 border-2 border-primary-custom border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 md:px-8 py-12 mx-auto max-w-7xl w-full flex flex-col gap-8">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-border-custom/50 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Shield className="h-8 w-8 text-warning-custom" />
            Admin Dashboard
          </h1>
          <p className="text-sm text-muted-text mt-1">Review bot submissions, process tickets, and manage audit trails.</p>
        </div>
        <button
          onClick={fetchAdminData}
          className="rounded-lg bg-card-bg border border-border-custom p-2.5 text-text-secondary hover:text-white"
        >
          <RefreshCw className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-secondary-bg/50 border border-border-custom p-1 rounded-xl self-start">
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'queue' ? 'bg-primary-custom text-white' : 'text-text-secondary hover:text-white'}`}
        >
          Submission Queue ({queue.length})
        </button>
        <button
          onClick={() => setActiveTab('bots')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'bots' ? 'bg-primary-custom text-white' : 'text-text-secondary hover:text-white'}`}
        >
          Manage Bots ({bots.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'reports' ? 'bg-primary-custom text-white' : 'text-text-secondary hover:text-white'}`}
        >
          Active Reports ({reports.length})
        </button>
        {user?.role === 'admin' && (
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'logs' ? 'bg-primary-custom text-white' : 'text-text-secondary hover:text-white'}`}
          >
            Audit Trails
          </button>
        )}
      </div>

      {/* List Renderings */}
      {loading ? (
        <div className="h-64 flex items-center justify-center border border-dashed border-border-custom/50 rounded-xl">
          <div className="h-8 w-8 border-2 border-primary-custom border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activeTab === 'queue' ? (
        queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border-custom/50 rounded-xl text-muted-text gap-2">
            <CheckCircle className="h-10 w-10 text-success-custom animate-pulse" />
            <p className="font-bold text-white text-md">Submission Queue is Empty</p>
            <p className="text-xs text-muted-text">Great job! All bots have been moderated.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {queue.map((bot) => (
              <div key={bot.botId} className="rounded-xl border border-border-custom bg-card-bg p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
                
                {/* Bot Profile */}
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-secondary-bg border border-border-custom flex items-center justify-center font-bold text-lg text-white overflow-hidden shrink-0">
                    {bot.avatar ? <img src={bot.avatar} alt="" className="h-full w-full object-cover" /> : bot.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-md font-bold text-white">{bot.name}</h3>
                    <p className="text-xs text-muted-text font-mono mt-0.5">ID: {bot.botId} | Prefix: {bot.prefix}</p>
                    <p className="text-xs text-text-secondary mt-1.5 line-clamp-2 max-w-xl">{bot.shortDesc}</p>
                  </div>
                </div>

                {/* Moderation Controls */}
                <div className="flex flex-wrap items-center gap-2 md:self-center shrink-0">
                  <button
                    onClick={() => handleToggleVerify(bot.botId)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${bot.verified ? 'bg-success-custom/10 border-success-custom/40 text-success-custom' : 'bg-background border-border-custom text-muted-text hover:text-white'}`}
                  >
                    Verify
                  </button>
                  <button
                    onClick={() => handleToggleFeature(bot.botId)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${bot.featured ? 'bg-primary-custom/10 border-primary-custom/40 text-primary-custom' : 'bg-background border-border-custom text-muted-text hover:text-white'}`}
                  >
                    Feature
                  </button>

                  <div className="h-8 w-px bg-border-custom/50 mx-1 hidden md:block" />

                  <button
                    onClick={() => handleApprove(bot.botId)}
                    className="flex items-center gap-1 bg-success-custom hover:bg-success-custom/85 text-xs font-semibold text-black px-4 py-2 rounded-lg transition-colors"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={() => setRejectBotId(bot.botId)}
                    className="flex items-center gap-1 bg-danger-custom hover:bg-danger-custom/85 text-xs font-semibold text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                    Reject
                  </button>
                </div>

              </div>
            ))}
          </div>
        )
      ) : activeTab === 'bots' ? (
        bots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border-custom/50 rounded-xl text-muted-text gap-2">
            <Cpu className="h-10 w-10 text-muted-text" />
            <p className="font-bold text-white text-md">No Bots Registered</p>
            <p className="text-xs text-muted-text">There are no bots in the database.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {bots.map((bot) => (
              <div key={bot.botId} className="rounded-xl border border-border-custom bg-card-bg p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
                
                {/* Bot Profile */}
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-secondary-bg border border-border-custom flex items-center justify-center font-bold text-lg text-white overflow-hidden shrink-0">
                    {bot.avatar ? <img src={bot.avatar} alt="" className="h-full w-full object-cover" /> : bot.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-md font-bold text-white">{bot.name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${
                        bot.status === 'approved' ? 'bg-success-custom/10 border-success-custom/30 text-success-custom' :
                        bot.status === 'pending' ? 'bg-warning-custom/10 border-warning-custom/30 text-warning-custom' :
                        'bg-danger-custom/10 border-danger-custom/30 text-danger-custom'
                      }`}>
                        {bot.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-text font-mono mt-0.5">ID: {bot.botId} | Prefix: {bot.prefix}</p>
                    <p className="text-xs text-text-secondary mt-1.5 line-clamp-1 max-w-xl">{bot.shortDesc}</p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleVerify(bot.botId)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      bot.verified 
                        ? 'bg-success-custom/10 border-success-custom/40 text-success-custom hover:bg-success-custom/20' 
                        : 'bg-background border-border-custom text-muted-text hover:text-white'
                    }`}
                  >
                    {bot.verified ? 'Verified' : 'Verify'}
                  </button>
                  <button
                    onClick={() => handleToggleFeature(bot.botId)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      bot.featured 
                        ? 'bg-primary-custom/10 border-primary-custom/40 text-primary-custom hover:bg-primary-custom/20' 
                        : 'bg-background border-border-custom text-muted-text hover:text-white'
                    }`}
                  >
                    {bot.featured ? 'Featured' : 'Feature'}
                  </button>

                  <div className="h-8 w-px bg-border-custom/50 mx-1 hidden md:block" />

                  <button
                    onClick={() => handleDeleteBot(bot.botId)}
                    className="flex items-center gap-1 bg-danger-custom/10 hover:bg-danger-custom text-danger-custom hover:text-white border border-danger-custom/35 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>

              </div>
            ))}
          </div>
        )
      ) : activeTab === 'reports' ? (
        reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border-custom/50 rounded-xl text-muted-text gap-2">
            <CheckCircle className="h-10 w-10 text-primary-custom" />
            <p className="font-bold text-white text-md">No Reports Pending</p>
            <p className="text-xs text-muted-text">Zero complaints on file. Excellent server safety.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {reports.map((report) => (
              <div key={report._id} className="rounded-xl border border-border-custom bg-card-bg p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-danger-custom/15 text-danger-custom text-[10px] font-bold px-2 py-0.5 rounded border border-danger-custom/30 uppercase">
                      {report.targetType} Report
                    </span>
                    <span className="text-xs text-muted-text">Reporter: {report.reporterId}</span>
                  </div>
                  <p className="text-sm font-semibold text-white mt-2">Target entity: {report.targetId}</p>
                  <p className="text-xs text-text-secondary mt-1 bg-background/50 p-2.5 rounded border border-border-custom font-mono">
                    "{report.reason}"
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => setBanUserId(report.reporterId)}
                    className="flex items-center gap-1 text-xs font-semibold rounded-lg bg-background border border-border-custom px-3 py-1.5 text-danger-custom hover:bg-danger-custom/10 transition-colors"
                  >
                    <Ban className="h-3.5 w-3.5" />
                    Suspended Owner
                  </button>
                  <button
                    onClick={() => handleResolveReport(report._id, 'resolved')}
                    className="bg-success-custom hover:bg-success-custom/85 text-xs font-semibold text-black px-3.5 py-1.5 rounded-lg"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => handleResolveReport(report._id, 'dismissed')}
                    className="bg-secondary-bg hover:bg-hover-bg border border-border-custom text-xs font-semibold text-white px-3.5 py-1.5 rounded-lg"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        // Audit Logs (logs)
        logs.length === 0 ? (
          <div className="text-center text-sm text-muted-text py-12">No audit trails logged yet.</div>
        ) : (
          <div className="rounded-xl border border-border-custom bg-card-bg overflow-hidden shadow-2xl">
            <div className="p-4 bg-secondary-bg/20 border-b border-border-custom/50 text-xs font-bold text-muted-text">
              System Audit Trails (Last 100 entries)
            </div>
            <div className="divide-y divide-border-custom/30 text-xs">
              {logs.map((log) => (
                <div key={log._id} className="p-4 flex items-start justify-between gap-4 font-mono">
                  <div>
                    <span className="text-primary-custom font-semibold">[{log.action}]</span>
                    <span className="text-text-secondary ml-2">Taker: {log.userId} | Target: {log.targetId} ({log.targetType})</span>
                    <p className="text-xxs text-muted-text mt-1">{log.details}</p>
                  </div>
                  <span className="text-xxs text-muted-text shrink-0">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {/* Rejection Reason Overlay */}
      {rejectBotId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-card-bg border border-border-custom p-6 shadow-2xl">
            <h3 className="text-md font-bold text-white mb-2">Reject Bot Submission</h3>
            <textarea
              placeholder="State the reason (e.g. Broken commands, clone bot, bad description)."
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full rounded-lg bg-background border border-border-custom p-3 text-sm text-text-primary focus:border-primary-custom focus:outline-none"
            />
            <div className="flex gap-2 justify-end mt-4">
              <button
                onClick={() => setRejectBotId(null)}
                className="rounded-lg bg-secondary-bg hover:bg-hover-bg text-sm px-4 py-2 text-muted-text hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                className="rounded-lg bg-danger-custom hover:bg-red-600 text-sm px-4 py-2 font-bold text-white"
              >
                Reject Bot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban User Overlay */}
      {banUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-card-bg border border-border-custom p-6 shadow-2xl">
            <h3 className="text-md font-bold text-white mb-2">Suspend Developer</h3>
            <textarea
              placeholder="State the suspension reason. All owned bots will be disabled."
              rows={4}
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              className="w-full rounded-lg bg-background border border-border-custom p-3 text-sm text-text-primary focus:border-primary-custom focus:outline-none"
            />
            <div className="flex gap-2 justify-end mt-4">
              <button
                onClick={() => setBanUserId(null)}
                className="rounded-lg bg-secondary-bg hover:bg-hover-bg text-sm px-4 py-2 text-muted-text hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleBanUserSubmit}
                className="rounded-lg bg-danger-custom hover:bg-red-600 text-sm px-4 py-2 font-bold text-white"
              >
                Suspend User
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
