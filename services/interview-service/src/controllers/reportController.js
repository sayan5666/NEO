const Report = require('../models/Report');
const InterviewSession = require('../models/InterviewSession');

// GET /reports/:sessionId
const getReportBySessionId = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.userId;

    const session = await InterviewSession.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found or unauthorized',
      });
    }

    const report = await Report.findOne({ sessionId, userId });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation report has not been generated for this session yet',
      });
    }

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// POST /reports
const createOrUpdateReport = async (req, res, next) => {
  try {
    const {
      sessionId,
      role,
      verdict,
      verdictSubtitle,
      scores,
      categoryMetrics,
      sentiment,
      strengths,
      weaknesses,
      overallScore,
      suggestions,
      observations,
      transcriptSnippets,
    } = req.body;
    const userId = req.userId;

    const session = await InterviewSession.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found or unauthorized',
      });
    }

    // Mark session as completed
    session.status = 'completed';
    await session.save();

    const report = await Report.findOneAndUpdate(
      { sessionId },
      {
        sessionId,
        userId,
        role: role || session.role || 'Senior Software Engineer',
        verdict: verdict || (overallScore >= 70 ? 'RECOMMENDED' : 'NOT QUALIFIED'),
        verdictSubtitle: verdictSubtitle || (overallScore >= 70 ? '[SYSTEM_PASS_THRESHOLD_MET]' : '[BELOW_BENCHMARK]'),
        scores: scores || { technical: 85, communication: 80, problemSolving: 85 },
        categoryMetrics: categoryMetrics || { problemSolving: 90, communication: 75, systemDesign: 85, codeQuality: 60 },
        sentiment: sentiment || { confidence: 85, aggression: 42, clarity: 91 },
        strengths: strengths || [],
        weaknesses: weaknesses || [],
        overallScore: typeof overallScore === 'number' ? overallScore : 82,
        suggestions: suggestions || [],
        observations: observations || [],
        transcriptSnippets: transcriptSnippets || [],
      },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Report saved successfully and session marked as completed',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReportBySessionId,
  createOrUpdateReport,
};
