'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Save, Plus, X, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Moderation', 'Music', 'Utility', 'Economy', 'Social & Fun', 'Logging', 'Games'];

const schema = z.object({
  botId: z.string().regex(/^\d{17,19}$/, 'Invalid Discord Client ID. Must be 17-19 numeric characters.'),
  prefix: z.string().min(1, 'Prefix is required').max(10, 'Prefix too long'),
  shortDesc: z.string().min(10, 'Min 10 characters').max(120, 'Max 120 characters'),
  longDesc: z.string().min(50, 'Provide a detailed description of your bot features (min 50 characters)'),
  library: z.string().optional().or(z.literal('')),
  language: z.string().optional().or(z.literal('')),
  inviteUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  supportUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  websiteUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  docsUrl: z.string().url('Invalid URL').optional().or(z.literal(''))
});

type FormValues = z.infer<typeof schema>;

export default function SubmitBot() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      library: '',
      language: ''
    }
  });

  const toggleCategory = (cat: string) => {
    if (selectedCats.includes(cat)) {
      setSelectedCats(selectedCats.filter((c) => c !== cat));
    } else {
      setSelectedCats([...selectedCats, cat]);
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (selectedCats.length === 0) {
      toast.error('Please select at least one category.');
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await api.post('/bots', {
        ...data,
        categories: selectedCats
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Bot submitted successfully!');
        router.push('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 px-4 md:px-8 py-12 mx-auto max-w-3xl w-full flex flex-col gap-6">
      
      {/* Back button and title */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="p-2 rounded-lg bg-card-bg border border-border-custom text-text-secondary hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Plus className="h-6 w-6 text-primary-custom" />
            Add Your Bot
          </h1>
          <p className="text-sm text-muted-text mt-0.5">Submit your Discord Bot for review and listing on BotSpace.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-border-custom bg-card-bg p-6 md:p-8 flex flex-col gap-6 shadow-2xl">
        
        {/* Client ID */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-white">Bot Client ID <span className="text-danger-custom">*</span></label>
          <input
            type="text"
            placeholder="123456789012345678"
            {...register('botId')}
            className="discord-input"
          />
          {errors.botId && <p className="text-xs text-danger-custom mt-1">{errors.botId.message}</p>}
          <p className="text-xxs text-muted-text mt-0.5">Retrieve this from your Discord Developer Portal under Application General Information.</p>
        </div>

        {/* Prefix, Library & Language */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-white">Prefix <span className="text-danger-custom">*</span></label>
            <input
              type="text"
              placeholder="!"
              {...register('prefix')}
              className="discord-input"
            />
            {errors.prefix && <p className="text-xs text-danger-custom mt-1">{errors.prefix.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-white">Library</label>
            <select
              {...register('library')}
              className="discord-input cursor-pointer"
            >
              <option value="">Select (Optional)</option>
              <option value="discord.js">discord.js</option>
              <option value="discord.py">discord.py</option>
              <option value="discord-go">discord-go</option>
              <option value="eris">eris</option>
              <option value="other">other</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-white">Language</label>
            <select
              {...register('language')}
              className="discord-input cursor-pointer"
            >
              <option value="">Select (Optional)</option>
              <option value="JavaScript">JavaScript</option>
              <option value="TypeScript">TypeScript</option>
              <option value="Python">Python</option>
              <option value="Go">Go</option>
              <option value="Java">Java</option>
              <option value="Rust">Rust</option>
              <option value="C#">C#</option>
            </select>
          </div>
        </div>

        {/* Category Pills Select */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-white">Categories <span className="text-danger-custom">*</span></label>
          <p className="text-xs text-muted-text">Select one or more categories that apply to your bot:</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCats.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`text-xs font-semibold rounded-lg px-3 py-1.5 border transition-all ${isSelected ? 'bg-primary-custom border-primary-custom text-white' : 'bg-background border-border-custom text-muted-text hover:text-white hover:border-hover-bg'}`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Short Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-white">Short Description <span className="text-danger-custom">*</span></label>
          <input
            type="text"
            placeholder="A multi-purpose bot featuring clean music streams and robust auto-moderation."
            {...register('shortDesc')}
            className="discord-input"
          />
          {errors.shortDesc && <p className="text-xs text-danger-custom mt-1">{errors.shortDesc.message}</p>}
          <p className="text-xxs text-muted-text mt-0.5">Brief description shown in card grids. Max 120 characters.</p>
        </div>

        {/* Long Description (Markdown text) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-white">Detailed Description (Markdown) <span className="text-danger-custom">*</span></label>
          <textarea
            placeholder="# Features&#10;- Powerful moderation filter&#10;- High fidelity music player&#10;- Custom leveling profiles"
            rows={8}
            {...register('longDesc')}
            className="discord-input font-mono text-xs"
          />
          {errors.longDesc && <p className="text-xs text-danger-custom mt-1">{errors.longDesc.message}</p>}
        </div>

        {/* Optional Link Connections */}
        <div className="border-t border-border-custom/50 pt-4 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Socials & Direct Links (Optional)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-text-secondary">Custom Invite Link</label>
              <input type="text" placeholder="https://discord.com/..." {...register('inviteUrl')} className="discord-input text-xs" />
              {errors.inviteUrl && <p className="text-xxs text-danger-custom">{errors.inviteUrl.message}</p>}
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-text-secondary">Support Server URL</label>
              <input type="text" placeholder="https://discord.gg/..." {...register('supportUrl')} className="discord-input text-xs" />
              {errors.supportUrl && <p className="text-xxs text-danger-custom">{errors.supportUrl.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-text-secondary">Website Link</label>
              <input type="text" placeholder="https://mybot.com" {...register('websiteUrl')} className="discord-input text-xs" />
              {errors.websiteUrl && <p className="text-xxs text-danger-custom">{errors.websiteUrl.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-text-secondary">GitHub Repository Link</label>
              <input type="text" placeholder="https://github.com/..." {...register('githubUrl')} className="discord-input text-xs" />
              {errors.githubUrl && <p className="text-xxs text-danger-custom">{errors.githubUrl.message}</p>}
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-primary-custom hover:bg-primary-hover py-3 font-bold text-white transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2"
        >
          <Save className="h-4.5 w-4.5" />
          <span>{submitting ? 'Submitting Bot...' : 'Submit Bot for Review'}</span>
        </button>

      </form>

    </div>
  );
}
