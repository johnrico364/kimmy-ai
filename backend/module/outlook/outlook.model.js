import mongoose from 'mongoose';

const OutreachLogSchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['initial_pitch', 'follow_up', 'inbound_reply'],
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  
  // AI Generation & Analysis Metadata
  aiMetadata: {
    promptTokens: Number,
    completionTokens: Number,
    modelUsed: { type: String, default: 'gpt-4o' },
    
    // Filled only when type is 'Inbound_Reply' via Sentiment Analysis
    sentimentAnalysis: {
      sentiment: { type: String, enum: ['positive', 'neutral', 'negative'] },
      urgency: { type: String, enum: ['high', 'medium', 'low'] },
      summary: String,
    }
  }
}, { timestamps: true });

// Indexing for quick chronological lookups of a lead's touchpoints
OutreachLogSchema.index({ leadId: 1, createdAt: -1 });

export default mongoose.model("OutreachLog", OutreachLogSchema);