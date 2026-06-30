import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  reporterId: string;
  targetId: string; // Bot ID or Review ID
  targetType: 'bot' | 'review';
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  resolvedBy?: string;
  resolutionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>({
  reporterId: { type: String, required: true, ref: 'User', index: true },
  targetId: { type: String, required: true, index: true },
  targetType: { type: String, enum: ['bot', 'review'], required: true },
  reason: { type: String, required: true, minlength: 10, maxlength: 500 },
  status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending', index: true },
  resolvedBy: { type: String, ref: 'User' },
  resolutionNotes: { type: String }
}, {
  timestamps: true
});

export const Report = mongoose.model<IReport>('Report', ReportSchema);
