const mongoose = require('mongoose');

const transcriptItemSchema = new mongoose.Schema(
  {
    agent: {
      type: String,
      required: [true, 'Agent identifier is required'],
      trim: true,
      default: 'TechnicalAgent',
    },
    question: {
      type: String,
      required: [true, 'Question content is required'],
      trim: true,
    },
    answer: {
      type: String,
      default: '',
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
      index: true,
    },
    role: {
      type: String,
      required: [true, 'Interview target role is required'],
      trim: true,
    },
    track: {
      type: String,
      required: [true, 'Interview track is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed'],
      default: 'in-progress',
      index: true,
    },
    currentAgent: {
      type: String,
      default: 'screening_agent',
      trim: true,
    },
    resumeUrl: {
      type: String,
      default: null,
      trim: true,
    },
    resumeText: {
      type: String,
      default: null,
    },
    transcript: {
      type: [transcriptItemSchema],
      default: [],
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

interviewSessionSchema.methods.toJSON = function () {
  const session = this.toObject();
  delete session.__v;
  return session;
};

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
