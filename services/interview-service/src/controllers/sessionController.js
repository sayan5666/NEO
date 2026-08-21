const InterviewSession = require('../models/InterviewSession');
const {
  cacheSessionState,
  getCachedSessionState,
  invalidateSessionState,
} = require('../config/redis');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:5001';

// POST /sessions
const createSession = async (req, res, next) => {
  try {
    const { role, track, currentAgent, resumeText: customResumeText, resumeUrl: customResumeUrl } = req.body;
    const userId = req.userId;

    let resumeText = customResumeText || null;
    let resumeUrl = customResumeUrl || null;
    let tokenBalance = 0;

    // Fetch user details from auth-service (includes tokenBalance and resume)
    if (userId) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const authRes = await fetch(`${AUTH_SERVICE_URL}/api/auth/me`, {
          signal: controller.signal,
          headers: {
            Authorization: req.headers.authorization || '',
          },
        });
        clearTimeout(timeoutId);
        if (authRes.ok) {
          const authData = await authRes.json();
          if (authData.success && authData.data) {
            tokenBalance = authData.data.tokenBalance || 0;
            if (!resumeText) resumeText = authData.data.resumeText || null;
            if (!resumeUrl) resumeUrl = authData.data.resumeUrl || null;
          }
        }
      } catch (err) {
        console.warn('[Interview Service] Could not fetch user details from auth-service:', err.message);
      }
    }

    if (tokenBalance < 1) {
      return res.status(402).json({
        success: false,
        message: 'Insufficient token balance. Please purchase more tokens.',
      });
    }

    const newSession = new InterviewSession({
      userId,
      role,
      track,
      status: 'in-progress',
      currentAgent: currentAgent || 'screening_agent',
      resumeText,
      resumeUrl,
      transcript: [],
    });

    await newSession.save();

    // Decrement token balance
    try {
      await fetch(`${AUTH_SERVICE_URL}/internal/users/${userId}/tokens`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ delta: -1 }),
      });
    } catch (err) {
      console.warn('[Interview Service] Failed to decrement token balance:', err.message);
    }

    // Cache initial session state in Redis with 2-hour TTL
    await cacheSessionState(newSession._id.toString(), {
      _id: newSession._id.toString(),
      userId,
      role: newSession.role,
      track: newSession.track,
      status: newSession.status,
      currentAgent: newSession.currentAgent,
      resumeText: newSession.resumeText,
      resumeUrl: newSession.resumeUrl,
      transcript: newSession.transcript,
      createdAt: newSession.createdAt,
    });

    return res.status(201).json({
      success: true,
      message: 'Interview session created successfully',
      data: newSession,
    });
  } catch (error) {
    next(error);
  }
};

// GET /sessions/:id
const getSessionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // 1. Check Redis cache first to avoid hitting MongoDB on every active polling/check
    const cachedState = await getCachedSessionState(id);
    if (cachedState && (!userId || String(cachedState.userId) === String(userId))) {
      return res.status(200).json({
        success: true,
        source: 'redis_cache',
        data: cachedState,
      });
    }

    // 2. Cache miss: Fetch from MongoDB
    const session = await InterviewSession.findOne({ _id: id, userId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found or unauthorized',
      });
    }

    // Backfill Redis cache with 2-hour TTL
    await cacheSessionState(id, {
      _id: session._id.toString(),
      userId: session.userId,
      role: session.role,
      track: session.track,
      status: session.status,
      currentAgent: session.currentAgent,
      transcript: session.transcript,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    });

    return res.status(200).json({
      success: true,
      source: 'mongodb',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

// GET /sessions
const listSessions = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { status, limit = 50, page = 1 } = req.query;

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [sessions, total] = await Promise.all([
      InterviewSession.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      InterviewSession.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      count: sessions.length,
      total,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /sessions/:id
const updateSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { status, currentAgent, transcriptEntry, transcript } = req.body;

    const session = await InterviewSession.findOne({ _id: id, userId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found or unauthorized',
      });
    }

    // Update status if provided
    if (status) {
      session.status = status;
    }

    // Update currentAgent if provided
    if (currentAgent) {
      session.currentAgent = currentAgent;
    }

    // Append single transcript item
    if (transcriptEntry) {
      session.transcript.push({
        agent: transcriptEntry.agent || session.currentAgent || 'screening_agent',
        question: transcriptEntry.question,
        answer: transcriptEntry.answer || '',
        timestamp: transcriptEntry.timestamp || new Date(),
      });
    }

    // Or replace/append full transcript batch if provided
    if (Array.isArray(transcript)) {
      transcript.forEach((item) => {
        session.transcript.push({
          agent: item.agent || session.currentAgent || 'screening_agent',
          question: item.question,
          answer: item.answer || '',
          timestamp: item.timestamp || new Date(),
        });
      });
    }

    // Persist to MongoDB
    await session.save();

    // Update Redis cache with refreshed session state
    if (session.status === 'completed') {
      // If completed, session is finalized in MongoDB, we can clean up cache or update it
      await invalidateSessionState(id);
    } else {
      await cacheSessionState(id, {
        _id: session._id.toString(),
        userId: session.userId,
        role: session.role,
        track: session.track,
        status: session.status,
        currentAgent: session.currentAgent,
        transcript: session.transcript,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Interview session updated successfully',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSession,
  getSessionById,
  listSessions,
  updateSession,
};

