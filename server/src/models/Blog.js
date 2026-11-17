import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema(
  { id: String, type: { type: String, enum: ['h2', 'h3', 'p'], default: 'p' }, text: { type: String, default: '' } },
  { _id: false }
);

const blogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'Untitled draft', trim: true },
    topic: { type: String, default: '' },
    primaryKeyword: { type: String, default: '' },
    secondaryKeywords: [String],
    tone: { type: String, default: 'conversational' },
    metaDescription: { type: String, default: '' },
    blocks: [blockSchema],
    wordCount: { type: Number, default: 0 },
    seoScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Blog', blogSchema);
