import mongoose, { Schema, Document } from 'mongoose';

export interface IBot extends Document {
  botId: string;
  name: string;
  avatar?: string;
  shortDesc: string;
  longDesc: string;
  prefix: string;
  library?: string;
  language?: string;
  categories: string[];
  tags: string[];
  inviteUrl?: string;
  supportUrl?: string;
  websiteUrl?: string;
  githubUrl?: string;
  docsUrl?: string;
  owner: string; // User discordId
  team: string[]; // List of co-owner discordIds
  status: 'pending' | 'approved' | 'rejected' | 'banned';
  rejectionReason?: string;
  verified: boolean;
  featured: boolean;
  premium: boolean;
  serverCount: number;
  shardCount: number;
  votes: number;
  monthlyVotes: number;
  views: number;
  uniqueClicks: number;
  customSlug?: string;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BotSchema = new Schema<IBot>({
  botId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  avatar: { type: String },
  shortDesc: { type: String, required: true, maxlength: 120 },
  longDesc: { type: String, required: true },
  prefix: { type: String, required: true },
  library: { type: String, default: 'discord.js' },
  language: { type: String, default: 'JavaScript' },
  categories: { type: [String], default: [] },
  tags: { type: [String], default: [] },
  inviteUrl: { type: String },
  supportUrl: { type: String },
  websiteUrl: { type: String },
  githubUrl: { type: String },
  docsUrl: { type: String },
  owner: { type: String, required: true, ref: 'User', index: true },
  team: { type: [String], default: [] },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'banned'], default: 'pending' },
  rejectionReason: { type: String },
  verified: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  premium: { type: Boolean, default: false },
  serverCount: { type: Number, default: 0 },
  shardCount: { type: Number, default: 0 },
  votes: { type: Number, default: 0 },
  monthlyVotes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  uniqueClicks: { type: Number, default: 0 },
  customSlug: { type: String, unique: true, sparse: true },
  lastSyncAt: { type: Date }
}, {
  timestamps: true
});

// Indexes for search performance
BotSchema.index(
  { name: 'text', shortDesc: 'text', longDesc: 'text' },
  { language_override: 'dummy_field_name' }
);
BotSchema.index({ status: 1, votes: -1 });

export const Bot = mongoose.model<IBot>('Bot', BotSchema);
