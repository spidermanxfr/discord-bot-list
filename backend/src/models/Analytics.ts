import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  botId: string; // 'global' for site-wide stats or specific botId
  date: Date; // Normalized to YYYY-MM-DD
  views: number;
  uniqueClicks: number;
  votes: number;
  countries: Map<string, number>;
  devices: Map<string, number>;
  os: Map<string, number>;
  browsers: Map<string, number>;
  sources: Map<string, number>;
}

const AnalyticsSchema = new Schema<IAnalytics>({
  botId: { type: String, required: true, index: true },
  date: { type: Date, required: true, index: true },
  views: { type: Number, default: 0 },
  uniqueClicks: { type: Number, default: 0 },
  votes: { type: Number, default: 0 },
  countries: { type: Map, of: Number, default: () => new Map() },
  devices: { type: Map, of: Number, default: () => new Map() },
  os: { type: Map, of: Number, default: () => new Map() },
  browsers: { type: Map, of: Number, default: () => new Map() },
  sources: { type: Map, of: Number, default: () => new Map() }
});

// Compound index for queries by bot and date range
AnalyticsSchema.index({ botId: 1, date: 1 }, { unique: true });

export const Analytics = mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
