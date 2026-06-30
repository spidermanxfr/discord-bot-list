import mongoose, { Schema, Document } from 'mongoose';

export interface IWebhookLog extends Document {
  botId: string;
  url: string;
  event: string; // e.g. 'vote'
  payload: string;
  statusCode?: number;
  errorMessage?: string;
  success: boolean;
  createdAt: Date;
}

const WebhookLogSchema = new Schema<IWebhookLog>({
  botId: { type: String, required: true, ref: 'Bot', index: true },
  url: { type: String, required: true },
  event: { type: String, required: true },
  payload: { type: String, required: true },
  statusCode: { type: Number },
  errorMessage: { type: String },
  success: { type: Boolean, required: true }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export const WebhookLog = mongoose.model<IWebhookLog>('WebhookLog', WebhookLogSchema);
