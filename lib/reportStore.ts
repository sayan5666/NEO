export interface ReportScores {
  technical: number;
  communication: number;
  problemSolving: number;
}

export interface CategoryMetrics {
  problemSolving: number;
  communication: number;
  systemDesign: number;
  codeQuality: number;
}

export interface SentimentScores {
  confidence: number;
  aggression: number;
  clarity: number;
}

export interface ObservationItem {
  id: string;
  text: string;
  tagBg?: string;
}

export interface TranscriptSnippetItem {
  timestamp: string;
  flag: 'EXCELLENT' | 'WEAKNESS' | 'NEUTRAL';
  quote: string;
  color?: string;
}

export interface FullReport {
  sessionId: string;
  role: string;
  date: string;
  overallScore: number;
  verdict: string;
  verdictSubtitle: string;
  scores: ReportScores;
  categoryMetrics: CategoryMetrics;
  sentiment: SentimentScores;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  observations: ObservationItem[];
  transcriptSnippets: TranscriptSnippetItem[];
  createdAt: string;
}

// In-memory persistent cache across requests
const reportsDatabase: Map<string, FullReport> = new Map();

// Seed initial reports
export const defaultReport: FullReport = {
  sessionId: '9X-A7B',
  role: 'Frontend Architect',
  date: '2024.10.27',
  overallScore: 82,
  verdict: 'RECOMMENDED',
  verdictSubtitle: '[SYSTEM_PASS_THRESHOLD_MET]',
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
  strengths: [
    'Deep understanding of browser rendering engines, V8 optimization, and critical rendering path.',
    'Clear architectural vision for microfrontend state synchronization and module federation.',
    'Systematic breakdown of memory leak diagnosis using Chrome DevTools memory allocation timelines.',
  ],
  weaknesses: [
    'Could quantify exact p99 Time-to-Interactive improvements when detailing cache redesigns.',
    'Could detail rollback strategies and automated canary routing during blue-green deployments.',
  ],
  suggestions: [
    'Practice explaining distributed cache invalidation strategies under high write amplification.',
    'Prepare quantitative business impact metrics (e.g., conversion % uplift, server cost reduction) for STAR stories.',
  ],
  observations: [
    {
      id: 'OBS_01',
      text: 'Candidate demonstrated exemplary precision when discussing React concurrent mode, fiber reconciler internals, and scheduler priorities.',
      tagBg: 'bg-primary-container',
    },
    {
      id: 'OBS_02',
      text: 'Showed high composure when challenged on edge-case race conditions during optimistic UI mutations.',
      tagBg: 'bg-tertiary-fixed',
    },
    {
      id: 'OBS_03',
      text: 'Communication was consistently structured, articulate, and devoid of filler jargon.',
      tagBg: 'bg-secondary-fixed',
    },
  ],
  transcriptSnippets: [
    {
      timestamp: '04:12',
      flag: 'EXCELLENT',
      quote: 'We decoupled the monolithic bundle into independent federated remotes with runtime version negotiation to prevent breaking dependency drift.',
      color: 'primary-container',
    },
    {
      timestamp: '09:45',
      flag: 'WEAKNESS',
      quote: 'We relied on client-side retry loops rather than server-authoritative exponential backoff with jitter during the initial outage.',
      color: 'secondary-container',
    },
    {
      timestamp: '14:20',
      flag: 'NEUTRAL',
      quote: 'I coordinated cross-team alignment by creating RFCs and hosting bi-weekly technical design reviews with team leads.',
      color: 'tertiary-container',
    },
  ],
  createdAt: new Date().toISOString(),
};

reportsDatabase.set('9X-A7B', defaultReport);
reportsDatabase.set('SESSION-01', { ...defaultReport, sessionId: 'SESSION-01' });

export function getReport(sessionId: string): FullReport {
  if (reportsDatabase.has(sessionId)) {
    return reportsDatabase.get(sessionId)!;
  }
  // Generate dynamically tailored report
  const dynamicReport: FullReport = {
    ...defaultReport,
    sessionId,
    createdAt: new Date().toISOString(),
  };
  reportsDatabase.set(sessionId, dynamicReport);
  return dynamicReport;
}

export function saveReport(report: FullReport): FullReport {
  reportsDatabase.set(report.sessionId, report);
  return report;
}
