import { z } from 'zod';

export const BotSubmissionSchema = z.object({
  body: z.object({
    botId: z.string().regex(/^\d{17,19}$/, { message: 'Invalid Discord Bot Client ID. Must be 17-19 numeric characters.' }),
    prefix: z.string().min(1, 'Prefix is required').max(10, 'Prefix cannot exceed 10 characters'),
    shortDesc: z.string().min(10, 'Short description must be at least 10 characters').max(120, 'Short description cannot exceed 120 characters'),
    longDesc: z.string().min(50, 'Long description must be at least 50 characters of Markdown'),
    library: z.string().optional().or(z.literal('')),
    language: z.string().optional().or(z.literal('')),
    categories: z.array(z.string()).min(1, 'Specify at least one category'),
    tags: z.array(z.string()).optional().default([]),
    inviteUrl: z.string().url('Invalid Invite URL').optional().or(z.literal('')),
    supportUrl: z.string().url('Invalid Support Server URL').optional().or(z.literal('')),
    websiteUrl: z.string().url('Invalid Website URL').optional().or(z.literal('')),
    githubUrl: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
    docsUrl: z.string().url('Invalid Documentation URL').optional().or(z.literal(''))
  })
});

export const BotEditSchema = z.object({
  body: z.object({
    prefix: z.string().min(1).max(10).optional(),
    shortDesc: z.string().min(10).max(120).optional(),
    longDesc: z.string().min(50).optional(),
    library: z.string().optional().or(z.literal('')),
    language: z.string().optional().or(z.literal('')),
    categories: z.array(z.string()).min(1).optional(),
    tags: z.array(z.string()).optional(),
    inviteUrl: z.string().url().optional().or(z.literal('')),
    supportUrl: z.string().url().optional().or(z.literal('')),
    websiteUrl: z.string().url().optional().or(z.literal('')),
    githubUrl: z.string().url().optional().or(z.literal('')),
    docsUrl: z.string().url().optional().or(z.literal('')),
    customSlug: z.string().regex(/^[a-z0-9-]{3,20}$/, 'Slug must be 3-20 lowercase alphanumeric characters/hyphens').optional().or(z.literal(''))
  })
});

export const ReviewSchema = z.object({
  body: z.object({
    rating: z.number().min(1, 'Rating must be at least 1 star').max(5, 'Rating cannot exceed 5 stars'),
    content: z.string().min(10, 'Review must be at least 10 characters long').max(1000, 'Review cannot exceed 1000 characters')
  })
});

export const ReviewReplySchema = z.object({
  body: z.object({
    reply: z.string().min(2, 'Reply must be at least 2 characters').max(1000, 'Reply cannot exceed 1000 characters')
  })
});

export const ReportSchema = z.object({
  body: z.object({
    targetId: z.string().min(1, 'Target ID is required'),
    targetType: z.enum(['bot', 'review'], { errorMap: () => ({ message: 'Target type must be bot or review' }) }),
    reason: z.string().min(10, 'Reason must be at least 10 characters').max(500, 'Reason cannot exceed 500 characters')
  })
});

export const BotStatsSchema = z.object({
  body: z.object({
    serverCount: z.number().min(0, 'Server count cannot be negative'),
    shardCount: z.number().min(0, 'Shard count cannot be negative').optional()
  })
});
