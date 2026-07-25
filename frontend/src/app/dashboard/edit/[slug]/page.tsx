'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Save, Plus, X, Trash2, Settings, Users, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Moderation', 'Music', 'Utility', 'Economy', 'Social & Fun', 'Logging', 'Games'];

const schema = z.object({
  prefix: z.string().min(1).max(10),
  shortDesc: z.string().min(10).max(120),
  longDesc: z.string().min(50),
  library: z.string().optional().or(z.literal('')),
  language: z.string().optional().or(z.literal('')),
  inviteUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  supportUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  websiteUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  docsUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  customSlug: z.string().regex(/^[a-z0-9-]{3,20}$/, '3-20 lowercase alphanumeric characters/hyphens').optional().or(z.literal(''))
});

type FormValues = z.infer<typeof schema>;

export default function EditBot() {
  const { slug } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [bot, setBot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Team management state
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [newMemberId, setNewMemberId] = useState('');
  const [syncing, setSyncing] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema)
  });

  useEffect(() => {
    const fetchBotData = async () => {
      try {
        const res = await api.get(`/bots/${slug}`);
        if (res.data.success) {
          const b = res.data.bot;
          setBot(b);
          setSelectedCats(b.categories || []);
          setTeamMembers(b.team || []);
          
          // Populate form fields
          setValue('prefix', b.prefix);
          setValue('shortDesc', b.shortDesc);
          setValue('longDesc', b.longDesc);
          setValue('library', b.library || '');
          setValue('language', b.language || '');
          setValue('inviteUrl', b.inviteUrl || '');
          setValue('supportUrl', b.supportUrl || '');
          setValue('websiteUrl', b.websiteUrl || '');
          setValue('githubUrl', b.githubUrl || '');
          setValue('docsUrl', b.docsUrl || '');
          setValue('customSlug', b.customSlug || '');
        }
      } catch (err: any) {
        toast.error('Failed to load bot details.');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchBotData();
  }, [slug, setValue]);

  const toggleCategory = (cat: string) => {
    if (selectedCats.includes(cat)) {
      setSelectedCats(selectedCats.filter((c) => c !== cat));
    } else {
      setSelectedCats([...selectedCats, cat]);
    }
  };

  const handleAddTeamMember = () => {
    const cleanId = newMemberId.trim();
    if (!/^\d{17,19}$/.test(cleanId)) {
      toast.error('Invalid Discord ID. Must be 17-19 numeric digits.');
      return;
    }
    if (teamMembers.includes(cleanId)) {
      toast.error('Member already added.');
      return;
    }
    setTeamMembers([...teamMembers, cleanId]);
    setNewMemberId('');
  };

  const handleRemoveTeamMember = (id: string) => {
    setTeamMembers(teamMembers.filter((m) => m !== id));
  };

  const onSubmit = async (data: FormValues) => {
    if (selectedCats.length === 0) {
      toast.error('Select at least one category.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.put(`/bots/${bot.botId}`, {
        ...data,
        categories: selectedCats,
        team: teamMembers
      });
      if (res.data.success) {
        toast.success('Bot details updated successfully!');
        router.push('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[65vh]">
        <div className="h-10 w-10 border-2 border-primary-custom border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 md:px-8 py-12 mx-auto max-w-3xl w-full flex flex-col gap-6">
      
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="p-2 rounded-lg bg-card-bg border border-border-custom text-text-secondary hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary-custom" />
            Edit "{bot.name}"
          </h1>
          <p className="text-sm text-muted-text mt-0.5">Modify properties and settings for your bot listing.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-border-custom bg-card-bg p-6 md:p-8 flex flex-col gap-6 shadow-2xl">
        
        {/* Custom Slug */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-white">Custom Slug (Vanity URL)</label>
          <input type="text" placeholder="my-awesome-bot" {...register('customSlug')} className="discord-input" />
          {errors.customSlug && <p className="text-xs text-danger-custom">{errors.customSlug.message}</p>}
          <p className="text-xxs text-muted-text">Access your bot at /bots/my-awesome-bot. Alphanumeric characters and hyphens only.</p>
        </div>

        {/* Prefix */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-white">Prefix <span className="text-danger-custom">*</span></label>
          <input type="text" {...register('prefix')} className="discord-input" />
          {errors.prefix && <p className="text-xs text-danger-custom">{errors.prefix.message}</p>}
        </div>

        {/* Categories Pills */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-white">Categories</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCats.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`text-xs font-semibold rounded-lg px-3 py-1.5 border transition-all ${isSelected ? 'bg-primary-custom border-primary-custom text-white' : 'bg-background border-border-custom text-muted-text hover:text-white'}`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Short Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-white">Short Description</label>
          <input type="text" {...register('shortDesc')} className="discord-input" />
          {errors.shortDesc && <p className="text-xs text-danger-custom">{errors.shortDesc.message}</p>}
        </div>

        {/* Long Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-white">Long Description (Markdown)</label>
          <textarea rows={8} {...register('longDesc')} className="discord-input font-mono text-xs" />
          {errors.longDesc && <p className="text-xs text-danger-custom">{errors.longDesc.message}</p>}
        </div>

        {/* Co-owners / Team Members */}
        <div className="border-t border-border-custom/50 pt-4 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Users className="h-4.5 w-4.5 text-primary-custom" />
            Co-Owners / Team Members
          </h3>
          <p className="text-xs text-muted-text">Add other developers using their Discord Snowflake IDs so they can edit descriptions or reply to reviews.</p>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. 235311234567890123"
              value={newMemberId}
              onChange={(e) => setNewMemberId(e.target.value)}
              className="flex-1 discord-input"
            />
            <button
              type="button"
              onClick={handleAddTeamMember}
              className="rounded-lg bg-card-bg border border-border-custom px-4 text-sm font-semibold text-text-primary hover:bg-hover-bg hover:text-white transition-colors"
            >
              Add Member
            </button>
          </div>

          {teamMembers.length > 0 && (
            <div className="flex flex-col gap-2 mt-1 bg-background/50 border border-border-custom rounded-lg p-3">
              {teamMembers.map((member) => (
                <div key={member} className="flex items-center justify-between text-xs text-text-secondary bg-card-bg border border-border-custom px-3 py-2 rounded">
                  <span className="font-mono">{member}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTeamMember(member)}
                    className="text-danger-custom hover:text-red-400 font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Social connections */}
        <div className="border-t border-border-custom/50 pt-4 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Social Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-text-secondary">Invite Link</label>
              <input type="text" {...register('inviteUrl')} className="discord-input text-xs" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-text-secondary">Support Server Link</label>
              <input type="text" {...register('supportUrl')} className="discord-input text-xs" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-text-secondary">Website URL</label>
              <input type="text" {...register('websiteUrl')} className="discord-input text-xs" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-text-secondary">GitHub Repository URL</label>
              <input type="text" {...register('githubUrl')} className="discord-input text-xs" />
            </div>
          </div>
        </div>

        {/* Save button */}
        {/* Save & Sync buttons row */}
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-lg bg-primary-custom hover:bg-primary-hover py-3 font-bold text-white transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Save className="h-4.5 w-4.5" />
            <span>{submitting ? 'Saving Changes...' : 'Save Bot Settings'}</span>
          </button>
          
          <button
            type="button"
            onClick={handleSync}
            disabled={syncing}
            className="flex-1 rounded-lg bg-card-bg border border-border-custom hover:bg-hover-bg py-3 font-bold text-white transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`h-4.5 w-4.5 text-primary-custom ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync Name & Avatar'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
