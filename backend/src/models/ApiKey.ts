import mongoose, { Schema, Document } from 'mongoose';

export interface IApiKey extends Document {
  botId: string;
  key: string;
  createdAt: Date;
}

const ApiKeySchema = new Schema<IApiKey>({
  botId: { type: String, required: true, unique: true, ref: 'Bot', index: true },
  key: { type: String, required: true, unique: true }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export const ApiKey = mongoose.model<IApiKey>('ApiKey', ApiKeySchema);
