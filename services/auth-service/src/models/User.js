const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    passwordHash: {
      type: String,
      required: function () {
        return this.authProvider === 'local';
      },
      default: null,
    },
    googleId: {
      type: String,
      default: null,
      sparse: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: null,
      trim: true,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    tokenBalance: {
      type: Number,
      default: 3,
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
    resumeSummary: {
      type: String,
      default: null,
    },
    resumeParsedAt: {
      type: Date,
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  delete user.refreshToken;
  delete user.__v;
  return user;
};

module.exports = mongoose.model('User', userSchema);
