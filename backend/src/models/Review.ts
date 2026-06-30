import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  botId: string;
  userId: string;
  rating: number; // 1-5
  content: string;
  likes: string[]; // user discordIds who liked this review
  reports: number;
  ownerReply?: string;
  ownerReplyAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  botId: { type: String, required: true, ref: 'Bot', index: true },
  userId: { type: String, required: true, ref: 'User', index: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  content: { type: String, required: true, minlength: 10, maxlength: 1000 },
  likes: { type: [String], default: [] },
  reports: { type: Number, default: 0 },
  ownerReply: { type: String },
  ownerReplyAt: { type: Date }
}, {
  timestamps: true
});

// Ensure a user can only review a bot once
ReviewSchema.index({ botId: 1, userId: 1 }, { unique: true });

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
