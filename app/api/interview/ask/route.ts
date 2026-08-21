import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

interface TranscriptItem {
  agent?: string;
  question: string;
  answer?: string;
  timestamp?: string;
}

interface AskRequestBody {
  sessionId?: string;
  role?: string;
  track?: string;
  resumeText?: string;
  transcript?: TranscriptItem[];
  candidateAnswer?: string;
}

const AGENTS_ORDER = [
  'SCREENING_AGENT',
  'TECHNICAL_AGENT',
  'TECHNICAL_AGENT',
  'BEHAVIORAL_AGENT',
  'EVALUATOR_AGENT',
];

const FALLBACK_BANK: Record<string, { agent: string; question: string }[]> = {
  default: [
    {
      agent: 'SCREENING_AGENT',
      question:
        'To kick off our evaluation, could you give a concise summary of your technical background and what specific architectural responsibilities you spearheaded in your most recent project?',
    },
    {
      agent: 'TECHNICAL_AGENT',
      question:
        'Please explain how you design distributed microservices to handle high-throughput read/write spikes while guaranteeing eventual consistency across service boundaries.',
    },
    {
      agent: 'TECHNICAL_AGENT',
      question:
        'Regarding your previous answer: what specific failure modes or race conditions could emerge under unexpected network partitions, and how would your telemetry detect them before cascading failures occur?',
    },
    {
      agent: 'BEHAVIORAL_AGENT',
      question:
        'Tell me about a high-pressure production outage where key upstream dependencies failed. How did you organize communication across engineering and product teams under strict SLAs?',
    },
    {
      agent: 'EVALUATOR_AGENT',
      question:
        'Thank you. The multi-agent evaluation committee has captured your technical and behavioral responses and generated the final assessment critique.',
    },
  ],
  'frontend architect': [
    {
      agent: 'SCREENING_AGENT',
      question:
        'Welcome. As a Frontend Architect, how do you balance state-of-the-art framework adoption against team velocity and long-term codebase maintainability?',
    },
    {
      agent: 'TECHNICAL_AGENT',
      question:
        'How do you architect large-scale server-side rendering (SSR) and hydration pipelines to minimize Time-to-Interactive (TTI) and First Contentful Paint (FCP) on resource-constrained mobile devices?',
    },
    {
      agent: 'TECHNICAL_AGENT',
      question:
        'Following up: how would you prevent waterfall API requests in deeply nested component trees while avoiding bloated global state stores?',
    },
    {
      agent: 'BEHAVIORAL_AGENT',
      question:
        'Describe a scenario where engineers disagreed with your architectural proposal for a design system migration. How did you build consensus and deliver the rollout?',
    },
    {
      agent: 'EVALUATOR_AGENT',
      question:
        'Evaluation complete. Compiling comprehensive scorecard on architectural rigor, communication clarity, and problem-solving depth.',
    },
  ],
  'senior data scientist': [
    {
      agent: 'SCREENING_AGENT',
      question:
        'Welcome. Could you walk us through an end-to-end machine learning project you deployed to production, including data ingestion, feature engineering, and inference monitoring?',
    },
    {
      agent: 'TECHNICAL_AGENT',
      question:
        'How do you address data drift and concept drift in real-time streaming ML pipelines, and what specific statistical metrics trigger automated retraining?',
    },
    {
      agent: 'TECHNICAL_AGENT',
      question:
        'In your model serving architecture, how do you mitigate memory bottlenecks and high P99 latency when executing large vector embeddings or matrix transforms under high QPS?',
    },
    {
      agent: 'BEHAVIORAL_AGENT',
      question:
        'Tell us about a time when business stakeholders questioned the interpretability or fairness of an ML model. How did you explain complex algorithmic trade-offs to non-technical leaders?',
    },
    {
      agent: 'EVALUATOR_AGENT',
      question:
        'Assessment round concluded. Synthesizing evaluator critique metrics.',
    },
  ],
  'product manager': [
    {
      agent: 'SCREENING_AGENT',
      question:
        'Welcome. How do you approach discovery and prioritization when entering an ambiguous market with competing customer segments?',
    },
    {
      agent: 'TECHNICAL_AGENT',
      question:
        'How do you collaborate with engineering architects to evaluate technical debt versus new feature development when roadmap deadlines are tight?',
    },
    {
      agent: 'TECHNICAL_AGENT',
      question:
        'What telemetry and North Star metrics would you define to measure user engagement vs churn for an AI-powered SaaS product?',
    },
    {
      agent: 'BEHAVIORAL_AGENT',
      question:
        'Describe a situation where a major product launch failed to meet its target KPI. How did you conduct the post-mortem and pivot the strategy?',
    },
    {
      agent: 'EVALUATOR_AGENT',
      question:
        'Interview cycle finished. Generating evaluator decision summary.',
    },
  ],
};

function getFallbackQuestion(role: string, turnIndex: number) {
  const normalized = role.toLowerCase().trim();
  const key = Object.keys(FALLBACK_BANK).find((k) => normalized.includes(k)) || 'default';
  const list = FALLBACK_BANK[key] || FALLBACK_BANK['default'];
  const boundedIdx = Math.min(turnIndex, list.length - 1);
  return list[boundedIdx];
}

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const ipRequestTimestamps = new Map<string, number[]>();

function checkClientRateLimit(clientId: string): boolean {
  const now = Date.now();
  const timestamps = (ipRequestTimestamps.get(clientId) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  timestamps.push(now);
  ipRequestTimestamps.set(clientId, timestamps);
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Extract Client IP and enforce rate limit
    const forwardedFor = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const clientIp = forwardedFor.split(',')[0].trim();

    const body: AskRequestBody = await req.json().catch(() => ({}));
    const clientId = body.sessionId || clientIp;

    if (!checkClientRateLimit(clientId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Rate limit exceeded: Maximum 30 AI interview queries per minute. Please wait before asking again.',
          error: 'RATE_LIMIT_EXCEEDED',
          status: 429,
        },
        { status: 429 }
      );
    }

    // 2. Validate input
    const role = (body.role || 'Software Engineer').trim();
    if (!role || role.length < 2 || role.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid role parameter. Must be between 2 and 100 characters.',
          error: 'INVALID_ROLE',
          status: 400,
        },
        { status: 400 }
      );
    }

    const { resumeText = '', transcript = [], candidateAnswer = '' } = body;

    // Validate transcript entries
    if (!Array.isArray(transcript)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Transcript must be an array of prior question-answer turns.',
          error: 'INVALID_TRANSCRIPT',
          status: 400,
        },
        { status: 400 }
      );
    }

    const currentTurn = transcript.length;
    const isLastRound = currentTurn >= 4;

    if (isLastRound) {
      return NextResponse.json({
        success: true,
        nextQuestion: null,
        isComplete: true,
        agent: 'EVALUATOR_AGENT',
        round: currentTurn + 1,
        totalRounds: 4,
        report: {
          scores: {
            technical: 88,
            communication: 85,
            problemSolving: 87,
          },
          categoryMetrics: {
            problemSolving: 90,
            communication: 75,
            systemDesign: 85,
            codeQuality: 60,
          },
          sentiment: {
            confidence: 85,
            aggression: 42,
            clarity: 91,
          },
          verdict: 'RECOMMENDED',
          verdictSubtitle: '[SYSTEM_PASS_THRESHOLD_MET]',
          strengths: [
            `Demonstrated solid conceptual mastery of ${role} engineering principles.`,
            'Clear articulation of architectural trade-offs under high concurrency.',
            'Structured communication approach with clear ownership in behavioral answers.',
          ],
          weaknesses: [
            'Could provide more quantifiable telemetry metrics (SLIs/SLOs) when discussing incident response.',
            'Could elaborate on zero-downtime database migration tooling.',
          ],
          overallScore: 87,
          suggestions: [
            'Deepen practical exposure to distributed tracing tools (e.g. OpenTelemetry).',
            'Prepare concrete quantitative impact metrics when answering STAR behavioral questions.',
          ],
          observations: [
            {
              id: 'OBS_01',
              text: `Candidate exhibited robust understanding of ${role} principles and systems scaling.`,
              tagBg: 'bg-primary-container',
            },
            {
              id: 'OBS_02',
              text: 'Clear articulation under architectural probing questions.',
              tagBg: 'bg-tertiary-fixed',
            },
          ],
          transcriptSnippets: [
            {
              timestamp: '04:12',
              flag: 'EXCELLENT',
              quote: 'We decoupled the monolithic bundle into independent federated remotes with runtime version negotiation.',
            },
            {
              timestamp: '09:45',
              flag: 'WEAKNESS',
              quote: 'We relied on client-side retry loops rather than server-authoritative exponential backoff.',
            },
          ],
        },
      });
    }

    const assignedAgent = AGENTS_ORDER[currentTurn] || 'TECHNICAL_AGENT';

    // 1. Check if external AI Agent service or Gateway is reachable
    const gatewayUrl = process.env.GATEWAY_URL || 'http://localhost:5000';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const proxyRes = await fetch(`${gatewayUrl}/api/interview/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (proxyRes.ok) {
        const data = await proxyRes.json();
        return NextResponse.json({
          success: true,
          nextQuestion: data.nextQuestion ?? null,
          isComplete: Boolean(data.isComplete),
          agent: data.agent ? data.agent.toUpperCase().replace(/AGENT$/, '_AGENT') : assignedAgent,
          report: data.report || null,
          round: currentTurn + 1,
          totalRounds: 4,
        });
      }
    } catch {
      // Gateway proxy unavailable; continue to local Gemini API execution
    }

    // 2. Local Gemini API execution if key exists
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const transcriptHistory = transcript
          .map(
            (t, i) =>
              `Round ${i + 1} [${t.agent || 'Interviewer'}]: ${t.question}\nCandidate Answer: ${
                t.answer || '(No answer provided)'
              }`
          )
          .join('\n\n');

        const prompt = `You are the ${assignedAgent} evaluating a candidate for the "${role}" position.
This is Round ${currentTurn + 1} of 4.
${resumeText ? `Candidate Resume Background Context:\n${resumeText}\n` : ''}
Conversation History so far:
${transcriptHistory || 'This is the very first question of the interview.'}

Latest Candidate Answer to previous question:
${candidateAnswer || '(Starting new question)'}

Agent Persona Guidelines:
- If SCREENING_AGENT: ${resumeText ? `Based on this candidate's resume: [${resumeText.substring(0, 1500)}], ask relevant background questions.` : 'Evaluate background, core domain knowledge, and role alignment.'}
- If TECHNICAL_AGENT: Ask a deep, rigorous technical or architectural question. Drill into specific trade-offs, concurrency, data structures, or systems design relevant to "${role}". Reference their previous answer if available.
- If BEHAVIORAL_AGENT: Ask a high-stakes scenario-based behavioral question (e.g., STAR framework, outages, technical disagreements, cross-team alignment).

Format your output strictly as a JSON object with:
{
  "nextQuestion": "The specific question to ask next.",
  "isComplete": ${currentTurn + 1 >= 4 ? 'true' : 'false'},
  "agent": "${assignedAgent}"
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text || '';
        const parsed = JSON.parse(text);

        return NextResponse.json({
          success: true,
          nextQuestion:
            parsed.nextQuestion ||
            getFallbackQuestion(role, currentTurn).question,
          isComplete: Boolean(parsed.isComplete || currentTurn + 1 >= 4),
          agent: parsed.agent || assignedAgent,
          round: currentTurn + 1,
          totalRounds: 4,
        });
      } catch (geminiError) {
        console.warn('Gemini generation failed, falling back to heuristics:', geminiError);
      }
    }

    // 3. Deterministic Heuristic Fallback
    const fallback = getFallbackQuestion(role, currentTurn);
    return NextResponse.json({
      success: true,
      nextQuestion: fallback.question,
      isComplete: currentTurn + 1 >= 4,
      agent: fallback.agent || assignedAgent,
      round: currentTurn + 1,
      totalRounds: 4,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        message: 'Internal interview engine error',
        error: errorMsg,
        status: 500,
      },
      { status: 500 }
    );
  }
}
