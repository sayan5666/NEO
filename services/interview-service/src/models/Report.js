const mongoose = require('mongoose');

const scoresSchema = new mongoose.Schema(
  {
    technical: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    communication: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    problemSolving: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  { _id: false }
);

const sentimentSchema = new mongoose.Schema(
  {
    confidence: { type: Number, default: 85, min: 0, max: 100 },
    aggression: { type: Number, default: 42, min: 0, max: 100 },
    clarity: { type: Number, default: 91, min: 0, max: 100 },
  },
  { _id: false }
);

const categoryMetricsSchema = new mongoose.Schema(
  {
    problemSolving: { type: Number, default: 90, min: 0, max: 100 },
    communication: { type: Number, default: 75, min: 0, max: 100 },
    systemDesign: { type: Number, default: 85, min: 0, max: 100 },
    codeQuality: { type: Number, default: 60, min: 0, max: 100 },
  },
  { _id: false }
);

const observationSchema = new mongoose.Schema(
  {
    id: { type: String, default: 'OBS_01' },
    text: { type: String, required: true },
    tagBg: { type: String, default: 'bg-primary-container' },
  },
  { _id: false }
);

const transcriptSnippetSchema = new mongoose.Schema(
  {
    timestamp: { type: String, default: '00:00' },
    flag: {
      type: String,
      enum: ['EXCELLENT', 'WEAKNESS', 'NEUTRAL'],
      default: 'NEUTRAL',
    },
    quote: { type: String, required: true },
    color: { type: String, default: 'primary-container' },
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewSession',
      required: [true, 'sessionId is required'],
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
      index: true,
    },
    role: {
      type: String,
      default: 'Senior Software Engineer',
    },
    verdict: {
      type: String,
      default: 'RECOMMENDED',
    },
    verdictSubtitle: {
      type: String,
      default: '[SYSTEM_PASS_THRESHOLD_MET]',
    },
    scores: {
      type: scoresSchema,
      required: true,
      default: () => ({ technical: 85, communication: 80, problemSolving: 85 }),
    },
    categoryMetrics: {
      type: categoryMetricsSchema,
      default: () => ({ problemSolving: 90, communication: 75, systemDesign: 85, codeQuality: 60 }),
    },
    sentiment: {
      type: sentimentSchema,
      default: () => ({ confidence: 85, aggression: 42, clarity: 91 }),
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 82,
    },
    suggestions: {
      type: [String],
      default: [],
    },
    observations: {
      type: [observationSchema],
      default: [],
    },
    transcriptSnippets: {
      type: [transcriptSnippetSchema],
      default: [],
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

reportSchema.methods.toJSON = function () {
  const report = this.toObject();
  delete report.__v;
  return report;
};

module.exports = mongoose.model('Report', reportSchema);
