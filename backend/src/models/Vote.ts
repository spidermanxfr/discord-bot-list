import mongoose, { Schema, Document } from 'mongoose';

export interface IVote extends Document {
  botId: string;
  userId: string;
  timestamp: Date;
  cooldownExpiry: Date;
}

const VoteSchema = new Schema<IVote>({
  botId: { type: String, required: true, ref: 'Bot', index: true },
  userId: { type: String, required: true, ref: 'User', index: true },
  timestamp: { type: Date, default: Date.now },
  cooldownExpiry: { type: Date, required: true }
});

// Compound index to quickly query votes by user and bot
VoteSchema.index({ userId: 1, botId: 1, cooldownExpiry: -1 });

export const Vote = mongoose.model<IVote>('Vote', VoteSchema);
