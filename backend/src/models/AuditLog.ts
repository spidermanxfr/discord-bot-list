import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId: string; // Action taker discordId
  action: string; // e.g. 'BOT_APPROVE', 'USER_BAN', 'BOT_EDIT'
  targetId: string; // ID of entity acted upon
  targetType: 'bot' | 'user' | 'review' | 'settings';
  details?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  userId: { type: String, required: true, ref: 'User', index: true },
  action: { type: String, required: true, index: true },
  targetId: { type: String, required: true, index: true },
  targetType: { type: String, enum: ['bot', 'user', 'review', 'settings'], required: true },
  details: { type: String }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
