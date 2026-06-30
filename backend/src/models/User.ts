import mongoose, { Schema, Document } from 'mongoose';

export interface IGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  features?: string[];
}

export interface IUser extends Document {
  discordId: string;
  username: string;
  globalName?: string;
  avatar?: string;
  banner?: string;
  email?: string;
  locale?: string;
  guilds: IGuild[];
  premiumType: number;
  role: 'user' | 'moderator' | 'admin';
  isBanned: boolean;
  banReason?: string;
  apiKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GuildSchema = new Schema<IGuild>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  icon: { type: String, default: null },
  owner: { type: Boolean, required: true },
  permissions: { type: String, required: true },
  features: [String]
});

const UserSchema = new Schema<IUser>({
  discordId: { type: String, required: true, unique: true, index: true },
  username: { type: String, required: true },
  globalName: { type: String },
  avatar: { type: String },
  banner: { type: String },
  email: { type: String },
  locale: { type: String },
  guilds: { type: [GuildSchema], default: [] },
  premiumType: { type: Number, default: 0 },
  role: { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' },
  isBanned: { type: Boolean, default: false },
  banReason: { type: String },
  apiKey: { type: String, unique: true, sparse: true }
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>('User', UserSchema);
