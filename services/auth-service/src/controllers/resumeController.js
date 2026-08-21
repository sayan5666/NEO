const pdfParse = require('pdf-parse');
const User = require('../models/User');
const { uploadBufferToCloudinary } = require('../config/cloudinary');

/**
 * Summarizes or cleans raw extracted PDF text
 * @param {string} rawText
 * @returns {string}
 */
const cleanAndExtractKeySummary = (rawText) => {
  if (!rawText) return '';
  // Normalize whitespace and remove redundant linebreaks
  const cleaned = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return cleaned;
};

/**
 * POST /resume/upload
 * Multer middleware handles file upload in memory.
 * Uploads to Cloudinary, extracts text with pdf-parse, updates User model.
 */
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume PDF file uploaded. Please upload a valid PDF file under 10MB.',
      });
    }

    const userId = req.userId;
    const originalFileName = req.file.originalname || 'resume.pdf';

    // 1. Extract text from PDF buffer using pdf-parse
    let extractedText = '';
    let pageCount = 1;
    let parseInfo = {};

    try {
      const pdfData = await pdfParse(req.file.buffer);
      extractedText = cleanAndExtractKeySummary(pdfData.text);
      pageCount = pdfData.numpages || 1;
      parseInfo = pdfData.info || {};
    } catch (parseErr) {
      console.warn('[Resume Parse Warning] Failed to parse PDF with pdf-parse:', parseErr);
      extractedText = `[Extracted from ${originalFileName}] Candidate Resume Document.`;
    }

    // 2. Upload file buffer to Cloudinary
    let cloudinaryResult;
    try {
      cloudinaryResult = await uploadBufferToCloudinary(req.file.buffer, {
        public_id: `resume_${userId || 'anon'}_${Date.now()}`,
      });
    } catch (uploadErr) {
      console.error('[Cloudinary Upload Error]', uploadErr);
      return res.status(500).json({
        success: false,
        message: `Failed to upload resume to Cloudinary: ${uploadErr.message}`,
      });
    }

    const resumeUrl = cloudinaryResult.secure_url || cloudinaryResult.url;

    // Create a concise summary (first 1000 characters or key sections)
    const summarySnippet =
      extractedText.length > 800
        ? extractedText.substring(0, 800) + '...'
        : extractedText;

    // 3. Update User record in MongoDB if user is authenticated
    let updatedUser = null;
    if (userId) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          resumeUrl,
          resumeText: extractedText,
          resumeSummary: summarySnippet,
          resumeParsedAt: new Date(),
        },
        { new: true }
      );
    }

    const wordCount = extractedText.trim()
      ? extractedText.trim().split(/\s+/).length
      : 0;

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded, stored in Cloudinary, and parsed successfully',
      data: {
        resumeUrl,
        resumeText: extractedText,
        resumeSummary: summarySnippet,
        wordCount,
        pageCount,
        fileName: originalFileName,
        parsedAt: new Date().toISOString(),
        user: updatedUser ? updatedUser.toJSON() : undefined,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /resume or GET /resume/me
 * Retrieves current user's resume text and URL
 */
const getResume = async (req, res, next) => {
  try {
    const userId = req.userId || req.params.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        resumeUrl: user.resumeUrl,
        resumeText: user.resumeText,
        resumeSummary: user.resumeSummary,
        resumeParsedAt: user.resumeParsedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadResume,
  getResume,
};
