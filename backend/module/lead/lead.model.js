import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  company: {
    type: String,
    required: true,
    trim: true,
  },
  linkedinBio: {
    type: String,
    maxLength: 3000, // Grounding data used for AI prompt injection
  },
  status: {
    type: String,
    enum: ['new', 'pitch_ready', 'emailed', 'replied', 'unresponsive'],
    default: 'new',
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

// Performance Optimization: Compound index for quick dashboard loading filtered by user and status
LeadSchema.index({ userId: 1, status: 1, isDeleted: 1 });

export default mongoose.model("Lead", LeadSchema);
