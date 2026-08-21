'use client';

import React, { useState, useEffect } from 'react';
import { InterviewChat, TranscriptEntry } from '@/components/interview/InterviewChat';
import { ResumeUpload, ResumeData } from '@/components/resume/ResumeUpload';

export default function Page() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'dashboard' | 'history' | 'login' | 'signup' | 'interview' | 'report' | 'buy_tokens'
  const [user, setUser] = useState({ name: 'CYBER_PUNK_01', tier: 'PREMIUM_TIER', email: 'punk@neo.intv', tokenBalance: 3 });
  const [, setIsAuthenticated] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Candidate Resume Context State (Prompt 8)
  const [resumeData, setResumeData] = useState<ResumeData | null>({
    fileName: 'senior_staff_engineer_cv.pdf',
    fileSize: 142800,
    wordCount: 485,
    pageCount: 2,
    resumeUrl: 'https://res.cloudinary.com/neo-intv/raw/upload/v1729800000/resumes/senior_staff_engineer_cv.pdf',
    resumeText: 'Senior Systems & Full Stack Engineer with 8+ years experience architecting distributed event-driven microservices with Node.js, Go, Python, React, and Apache Kafka. Led system migration to Kubernetes-orchestrated clusters processing 45,000 req/sec with 99.99% uptime. Designed Redis Pub/Sub WebSocket streaming pipelines and resilient distributed circuit breakers.',
    resumeSummary: '8+ years distributed systems, Go/Node.js/Python, Kafka, Kubernetes, Redis Pub/Sub, React microfrontends.',
    parsedAt: '2024-10-24T12:00:00Z',
  });

  // Selected session for interview or report
  const [activeSessionId, setActiveSessionId] = useState('9X-A7B');
  const [activeRole, setActiveRole] = useState('Frontend Architect');
  const [activeTrack, setActiveTrack] = useState('SOFTWARE_ENG');

  // Filter state for dashboard & history
  const [dashboardTrackFilter, setDashboardTrackFilter] = useState('ALL');
  const [historySearch, setHistorySearch] = useState('');
  const [historyTrack, setHistoryTrack] = useState('ALL_TRACKS');
  const [historyScoreFilter, setHistoryScoreFilter] = useState('SCORE: ALL');

  // Live Interview State
  const [currentAgent, setCurrentAgent] = useState('TECHNICAL_AGENT');
  const [currentQuestion, setCurrentQuestion] = useState(
    'Please explain the conceptual differences between a microservices architecture and a monolithic architecture, specifically detailing the trade-offs regarding deployment complexity and inter-service communication latency in high-throughput environments.'
  );
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [transcript, setTranscript] = useState<{ agent: string; question: string; answer: string }[]>([]);
  const [timerSeconds, setTimerSeconds] = useState(12 * 60 + 45);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('TYPING...');

  // Auth form states
  const [authEmail, setAuthEmail] = useState('candidate@neo.intv');
  const [authPassword, setAuthPassword] = useState('password123');
  const [authName, setAuthName] = useState('CYBER_PUNK_01');

  // Sessions dataset
  const [sessions, setSessions] = useState([
    {
      _id: '9x-a7b',
      id: '9X-A7B',
      role: 'Frontend Architect',
      status: 'completed',
      score: 94,
      date: '2024.10.24',
      track: 'SOFTWARE_ENG',
      tags: ['REACT', 'SYSTEM_DESIGN'],
      topics: ['Screening', 'Technical'],
      summary: 'Candidate demonstrated exceptional system architecture design capabilities under high concurrency.',
      metrics: { problemSolving: 95, communication: 88, systemDesign: 96, codeQuality: 92 },
      strengths: [
        'Exceptional system architecture design capabilities under pressure.',
        'Clear articulation of complex technical trade-offs.',
        'Strong grasp of distributed state and hydration nuances.'
      ],
      weaknesses: [
        'Could explore edge case race conditions in optimistic UI updates more thoroughly.'
      ],
      createdAt: '2024-10-24T14:30:00Z'
    },
    {
      _id: '4l-t2q',
      id: '4L-T2Q',
      role: 'Senior Data Scientist',
      status: 'completed',
      score: 78,
      date: '2024.10.22',
      track: 'DATA_SCIENCE',
      tags: ['PYTHON', 'ML_PIPELINE'],
      topics: ['Technical', 'System Design'],
      summary: 'Solid foundational modeling knowledge with opportunities to optimize latency in feature stores.',
      metrics: { problemSolving: 80, communication: 75, systemDesign: 76, codeQuality: 82 },
      strengths: [
        'Solid mathematical intuition around loss convergence.',
        'Pragmatic approach to model explainability.'
      ],
      weaknesses: [
        'Over-engineered pipeline for small batch offline training.',
        'Missed memory leak risk during batch pandas transforms.'
      ],
      createdAt: '2024-10-22T11:15:00Z'
    },
    {
      _id: '1m-p9x',
      id: '1M-P9X',
      role: 'Product Manager L4',
      status: 'completed',
      score: 42,
      date: '2024.10.20',
      track: 'PRODUCT_MGT',
      tags: ['STRATEGY', 'LEADERSHIP'],
      topics: ['Behavioral', 'Case Study'],
      summary: 'Struggled with user segmentation under ambiguous market entry conditions.',
      metrics: { problemSolving: 45, communication: 60, systemDesign: 35, codeQuality: 40 },
      strengths: [
        'Confident communication voice and good pacing.'
      ],
      weaknesses: [
        'Lacked structured data-backed prioritization framework.',
        'Unable to define clear North Star metrics for churn reduction.'
      ],
      createdAt: '2024-10-20T09:00:00Z'
    },
    {
      _id: '7k-d8w',
      id: '7K-D8W',
      role: 'Data Engineer',
      status: 'completed',
      score: 85,
      date: '2024.10.15',
      track: 'DATA_SCIENCE',
      tags: ['PYTHON', 'SQL', 'KAFKA'],
      topics: ['Technical', 'Streaming'],
      summary: 'Impressive understanding of stream-table duality and exactly-once delivery guarantees.',
      metrics: { problemSolving: 88, communication: 82, systemDesign: 86, codeQuality: 84 },
      strengths: [
        'Deep fluency in Kafka partitioning and consumer group rebalancing.',
        'Well-architected schema evolution handling with Avro.'
      ],
      weaknesses: [
        'Minor delay in diagnosing backpressure in sink connectors.'
      ],
      createdAt: '2024-10-15T16:45:00Z'
    }
  ]);

  // Timer effect during interview
  useEffect(() => {
    if (currentView !== 'interview') return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [currentView]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleOpenModal = () => {
    if (user.tokenBalance < 1) {
      if (window.confirm('You are out of tokens. Would you like to buy more?')) {
        setCurrentView('buy_tokens');
      }
    } else {
      handleOpenModal();
    }
  };

  const handleStartSession = (selectedRole: string, selectedTrack: string) => {
    if (user.tokenBalance < 1) return;
    setUser(u => ({...u, tokenBalance: u.tokenBalance - 1}));
    const shortId = Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 5).toUpperCase();
    const newSess = {
      _id: shortId.toLowerCase(),
      id: shortId,
      role: selectedRole,
      status: 'in_progress',
      score: 88,
      date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
      track: selectedTrack,
      tags: [selectedTrack.replace('_', ' '), 'TECHNICAL'],
      topics: ['Screening', 'Technical'],
      summary: 'Live AI multi-agent evaluation in progress.',
      metrics: { problemSolving: 88, communication: 85, systemDesign: 90, codeQuality: 80 },
      strengths: ['Clear technical articulation', 'Rapid problem breakdown'],
      weaknesses: ['Keep edge cases top of mind'],
      createdAt: new Date().toISOString()
    };
    setSessions([newSess, ...sessions]);
    setActiveSessionId(shortId);
    setActiveRole(selectedRole);
    setActiveTrack(selectedTrack);
    setTranscript([]);
    setCandidateAnswer('');
    setCurrentQuestion(`As a ${selectedRole}, how do you evaluate architectural trade-offs between low latency and horizontal scalability in distributed microservices?`);
    setTimerSeconds(15 * 60);
    setModalOpen(false);
    setCurrentView('interview');
  };

  const handleSubmitAnswer = async () => {
    if (!candidateAnswer.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setStatusMsg('SUBMITTING TO EVALUATOR...');

    const updatedTranscript = [
      ...transcript,
      { agent: currentAgent, question: currentQuestion, answer: candidateAnswer.trim() }
    ];
    setTranscript(updatedTranscript);

    // Call AI Agent or smart progression
    setTimeout(() => {
      setIsSubmitting(false);
      if (updatedTranscript.length >= 3) {
        setCurrentView('report');
      } else if (updatedTranscript.length === 1) {
        setCurrentAgent('TECHNICAL_AGENT');
        setCurrentQuestion('How do you manage eventual consistency and transaction rollbacks across distributed microservice boundaries?');
        setCandidateAnswer('');
        setStatusMsg('AWAITING CANDIDATE INPUT');
      } else if (updatedTranscript.length === 2) {
        setCurrentAgent('BEHAVIORAL_AGENT');
        setCurrentQuestion('Tell me about a high-stakes outage where key dependencies failed. How did you coordinate resolution under time pressure?');
        setCandidateAnswer('');
        setStatusMsg('AWAITING CANDIDATE INPUT');
      }
    }, 900);
  };

  const handleReadAloud = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentQuestion);
      utterance.rate = 1.0;
      utterance.pitch = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Filtered lists
  const filteredDashboardSessions = sessions.filter((s) => {
    if (dashboardTrackFilter === 'ALL') return true;
    return s.track === dashboardTrackFilter || s.role.toUpperCase().includes(dashboardTrackFilter.replace('_', ' '));
  });

  const filteredHistorySessions = sessions.filter((s) => {
    if (historyTrack !== 'ALL_TRACKS' && s.track !== historyTrack) return false;
    if (historyScoreFilter === 'SCORE: >90' && s.score < 90) return false;
    if (historyScoreFilter === 'SCORE: 70-89' && (s.score < 70 || s.score >= 90)) return false;
    if (historyScoreFilter === 'SCORE: <70' && s.score >= 70) return false;
    if (historySearch) {
      const q = historySearch.toLowerCase();
      return (s.id && s.id.toLowerCase().includes(q)) || (s.role && s.role.toLowerCase().includes(q));
    }
    return true;
  });

  const getScoreCardStyle = (score: number) => {
    if (score >= 90) {
      return { cardBg: 'bg-[#f9f9f9]', scoreBg: 'bg-[#ffd93d] text-[#1b1b1b]' };
    } else if (score >= 70) {
      return { cardBg: 'bg-[#e2e2e2]', scoreBg: 'bg-[#e8c426] text-[#554500]' };
    } else {
      return { cardBg: 'bg-[#ffdad8]', scoreBg: 'bg-[#ba1a1a] text-[#ffffff]' };
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-[#1b1b1b] flex flex-col font-sans selection:bg-[#ffd93d] selection:text-[#1b1b1b]">
      {/* -------------------- 1. LANDING PAGE VIEW -------------------- */}
      {currentView === 'landing' && (
        <div className="flex-1 flex flex-col">
          {/* Top Nav Header */}
          <header className="w-full border-b-[3px] border-[#1b1b1b] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-[#f9f9f9] z-50 sticky top-0">
            <div className="flex justify-between items-center w-full px-6 py-4 max-w-full">
              <div className="flex items-center gap-8 md:gap-12">
                <button
                  onClick={() => setCurrentView('landing')}
                  className="font-headline text-2xl md:text-3xl font-black tracking-tighter text-[#1b1b1b] uppercase cursor-pointer"
                >
                  NEO_INTV
                </button>
                <nav className="hidden md:flex gap-6 font-mono text-sm">
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className="font-bold text-[#4d4633] hover:text-[#1b1b1b] hover:bg-[#ffd93d] px-2 py-1 transition-all cursor-pointer"
                  >
                    DASHBOARD
                  </button>
                  <button
                    onClick={() => setCurrentView('history')}
                    className="font-bold text-[#4d4633] hover:text-[#1b1b1b] hover:bg-[#ffd93d] px-2 py-1 transition-all cursor-pointer"
                  >
                    HISTORY
                  </button>
                  <a
                    href="#squad"
                    className="font-bold text-[#4d4633] hover:text-[#1b1b1b] hover:bg-[#ffd93d] px-2 py-1 transition-all"
                  >
                    AGENTS
                  </a>
                </nav>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentView('login')}
                  className="hidden md:block font-mono text-sm font-bold text-[#4d4633] hover:bg-[#ffd93d] hover:text-[#1b1b1b] px-4 py-2 border-[3px] border-transparent hover:border-[#1b1b1b] transition-all cursor-pointer"
                >
                  LOGIN
                </button>
                <button
                  onClick={() => handleOpenModal()}
                  className="bg-[#ffd93d] text-[#1b1b1b] font-mono text-sm font-bold px-6 py-2 border-[3px] border-[#1b1b1b] neo-shadow neo-shadow-hover transition-all uppercase cursor-pointer"
                >
                  START_SESSION
                </button>
              </div>
            </div>
          </header>

          <main className="w-full flex-1">
            {/* Hero Section */}
            <section className="w-full py-16 md:py-[120px] px-6 md:px-12 border-b-[3px] border-[#1b1b1b] relative overflow-hidden">
              <div className="absolute top-10 right-10 w-32 h-32 border-[3px] border-[#1b1b1b] bg-[#f3f3f3] neo-shadow transform rotate-12 hidden md:block z-0 pointer-events-none"></div>
              <div className="absolute bottom-10 left-10 w-24 h-24 border-[3px] border-[#1b1b1b] bg-[#e0d6ff] neo-shadow transform -rotate-6 hidden md:block z-0 pointer-events-none"></div>

              <div className="max-w-6xl mx-auto flex flex-col items-start gap-6 relative z-10">
                <div className="bg-[#e2e2e2] border-[3px] border-[#1b1b1b] px-3 py-1 inline-block mb-2">
                  <span className="font-mono text-xs uppercase tracking-widest text-[#4d4633] font-bold">
                    {'SYS_MSG // V_2.4.1'}
                  </span>
                </div>

                <h1 className="font-headline text-4xl sm:text-5xl md:text-[64px] font-black text-[#1b1b1b] max-w-4xl uppercase leading-none tracking-tight">
                  PRACTICE INTERVIEWS. <br />
                  GET DESTROYED. <br />
                  GET BETTER.
                </h1>

                <p className="font-sans text-lg md:text-xl text-[#4d4633] max-w-2xl mt-4 leading-relaxed font-medium">
                  Stop pretending. Our AI agents are designed to expose your weaknesses before the real recruiters do. Prepare for technical, behavioral, and screening rounds with uncompromising feedback.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <button
                    onClick={() => handleOpenModal()}
                    className="bg-[#ffd93d] text-[#1b1b1b] font-mono text-sm font-bold px-8 py-4 border-[3px] border-[#1b1b1b] neo-shadow neo-shadow-hover transition-all uppercase flex items-center justify-center gap-3 cursor-pointer"
                  >
                    START FREE INTERVIEW
                    <span className="material-symbols-outlined text-2xl font-bold">arrow_forward</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className="bg-[#ffffff] text-[#1b1b1b] font-mono text-sm font-bold px-8 py-4 border-[3px] border-[#1b1b1b] neo-shadow neo-shadow-hover transition-all uppercase hover:bg-[#e2e2e2] cursor-pointer"
                  >
                    VIEW DASHBOARD
                  </button>
                </div>
              </div>
            </section>

            {/* The Squad (Bento Grid) */}
            <section id="squad" className="w-full py-16 px-6 md:px-12 bg-[#f3f3f3] border-b-[3px] border-[#1b1b1b]">
              <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-end mb-8">
                  <h2 className="font-headline text-3xl md:text-5xl font-black text-[#1b1b1b] uppercase tracking-tight">
                    THE SQUAD
                  </h2>
                  <span className="font-mono text-xs font-bold bg-[#1b1b1b] text-[#ffffff] px-3 py-1.5 uppercase hidden sm:block">
                    SELECT_AGENT
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Screening Agent */}
                  <div className="md:col-span-6 border-[3px] border-[#1b1b1b] bg-[#ffffff] neo-shadow p-6 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 bg-[#e2e2e2] border-l-[3px] border-b-[3px] border-[#1b1b1b] z-10">
                      <span className="font-mono text-xs font-bold">ID: 01</span>
                    </div>
                    <div className="mb-auto z-10 relative">
                      <span className="material-symbols-outlined text-[48px] mb-3 text-[#1b1b1b]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        person_search
                      </span>
                      <h3 className="font-headline text-2xl font-bold uppercase mb-2">Screening</h3>
                      <p className="font-sans text-base text-[#4d4633] leading-relaxed">
                        Filters the noise. Asks the standard HR questions to gauge basic fit and red flags.
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t-[3px] border-[#1b1b1b] flex gap-2 flex-wrap z-10 relative">
                      <span className="border-[2px] border-[#1b1b1b] px-2 py-0.5 font-mono text-xs uppercase bg-[#e2e2e2] font-bold">
                        HR_ROUND
                      </span>
                      <span className="border-[2px] border-[#1b1b1b] px-2 py-0.5 font-mono text-xs uppercase bg-[#e2e2e2] font-bold">
                        CULTURE_FIT
                      </span>
                    </div>
                  </div>

                  {/* Technical Agent */}
                  <div className="md:col-span-6 border-[3px] border-[#1b1b1b] bg-[#ffd93d] neo-shadow p-6 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 bg-[#e2e2e2] border-l-[3px] border-b-[3px] border-[#1b1b1b] z-10">
                      <span className="font-mono text-xs font-bold">ID: 02</span>
                    </div>
                    <div className="mb-auto z-10 relative">
                      <span className="material-symbols-outlined text-[48px] mb-3 text-[#1b1b1b]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        code
                      </span>
                      <h3 className="font-headline text-2xl font-bold uppercase mb-2">Technical</h3>
                      <p className="font-sans text-base text-[#4d4633] leading-relaxed">
                        Unforgiving coding challenges and system design drills. Prepares you for the worst.
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t-[3px] border-[#1b1b1b] flex gap-2 flex-wrap z-10 relative">
                      <span className="border-[2px] border-[#1b1b1b] px-2 py-0.5 font-mono text-xs uppercase bg-[#ffffff] font-bold">
                        ALGO
                      </span>
                      <span className="border-[2px] border-[#1b1b1b] px-2 py-0.5 font-mono text-xs uppercase bg-[#ffffff] font-bold">
                        SYS_DESIGN
                      </span>
                    </div>
                  </div>

                  {/* Behavioral Agent */}
                  <div className="md:col-span-4 border-[3px] border-[#1b1b1b] bg-[#e0d6ff] neo-shadow p-6 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 bg-[#e2e2e2] border-l-[3px] border-b-[3px] border-[#1b1b1b] z-10">
                      <span className="font-mono text-xs font-bold">ID: 03</span>
                    </div>
                    <div className="mb-auto z-10 relative">
                      <span className="material-symbols-outlined text-[48px] mb-3 text-[#1b1b1b]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        psychology
                      </span>
                      <h3 className="font-headline text-2xl font-bold uppercase mb-2">Behavioral</h3>
                      <p className="font-sans text-base text-[#4d4633] leading-relaxed">
                        STAR method enforcer. Digs into your past conflicts and leadership scenarios.
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t-[3px] border-[#1b1b1b] flex gap-2 flex-wrap z-10 relative">
                      <span className="border-[2px] border-[#1b1b1b] px-2 py-0.5 font-mono text-xs uppercase bg-[#ffffff] font-bold">
                        STAR
                      </span>
                      <span className="border-[2px] border-[#1b1b1b] px-2 py-0.5 font-mono text-xs uppercase bg-[#ffffff] font-bold">
                        SOFT_SKILLS
                      </span>
                    </div>
                  </div>

                  {/* Evaluator Agent */}
                  <div className="md:col-span-8 border-[3px] border-[#1b1b1b] bg-[#ffffff] neo-shadow p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden items-center">
                    <div className="absolute top-0 right-0 p-2 bg-[#e2e2e2] border-l-[3px] border-b-[3px] border-[#1b1b1b] z-10">
                      <span className="font-mono text-xs font-bold">ID: 04</span>
                    </div>
                    <div className="flex-1 z-10 relative w-full">
                      <span className="material-symbols-outlined text-[48px] mb-3 text-[#1b1b1b]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        analytics
                      </span>
                      <h3 className="font-headline text-2xl font-bold uppercase mb-2">Evaluator</h3>
                      <p className="font-sans text-base text-[#4d4633] leading-relaxed">
                        The final boss. Reviews your overall performance, provides a score, and pinpoints exact areas for improvement.
                      </p>
                      <div className="mt-6 pt-4 border-t-[3px] border-[#1b1b1b] flex gap-2 flex-wrap">
                        <span className="border-[2px] border-[#1b1b1b] px-2 py-0.5 font-mono text-xs uppercase bg-[#e2e2e2] font-bold">
                          METRICS
                        </span>
                        <span className="border-[2px] border-[#1b1b1b] px-2 py-0.5 font-mono text-xs uppercase bg-[#e2e2e2] font-bold">
                          FEEDBACK
                        </span>
                      </div>
                    </div>
                    <div className="hidden md:flex w-32 h-32 border-[3px] border-[#1b1b1b] bg-[#e2e2e2] items-center justify-center neo-shadow shrink-0">
                      <span className="font-headline text-5xl font-black text-[#1b1b1b]">99</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>

          {/* Footer */}
          <footer className="flex flex-col md:flex-row justify-between items-center w-full px-6 md:px-12 py-8 bg-[#1b1b1b] text-[#ffffff] border-t-[3px] border-[#1b1b1b] gap-4">
            <div className="font-mono text-sm font-bold text-[#ffe173] uppercase tracking-wider">
              {'NEO_INTV // ©2024 DIGITAL_PUNK_AI_SYSTEMS'}
            </div>
            <div className="flex gap-6 font-mono text-xs">
              <span className="opacity-80">PRIVACY</span>
              <span className="opacity-80">TERMINAL</span>
              <span className="opacity-80 flex items-center gap-1">
                <span className="w-2 h-2 bg-[#ffe173] inline-block"></span> STATUS: ONLINE
              </span>
            </div>
          </footer>
        </div>
      )}

      {/* -------------------- 2. DASHBOARD VIEW -------------------- */}
      {currentView === 'dashboard' && (
        <div className="flex-1 flex flex-col md:flex-row">
          {/* Sidebar */}
          <aside className="hidden md:flex flex-col h-screen w-64 border-r-[3px] border-[#1b1b1b] bg-[#f3f3f3] p-4 space-y-4 shadow-[6px_0px_0px_0px_rgba(0,0,0,1)] sticky top-0 shrink-0 z-20">
            <div className="mb-4">
              <button
                onClick={() => setCurrentView('landing')}
                className="font-headline text-xl font-black text-[#1b1b1b] mb-2 block tracking-tight uppercase cursor-pointer text-left"
              >
                NEO_INTV
              </button>
                            <div className="flex flex-col gap-2 p-2 border-[3px] border-[#1b1b1b] bg-[#f9f9f9] neo-shadow-static mt-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border-[3px] border-[#1b1b1b] bg-[#ffd93d] flex items-center justify-center shrink-0 font-bold">
                    <span className="material-symbols-outlined text-2xl text-[#1b1b1b]">smart_toy</span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-mono text-xs font-bold truncate text-[#1b1b1b]">{user.name}</div>
                    <div className="font-mono text-[10px] text-[#705d00] font-bold uppercase">{user.tier}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t-[2px] border-dashed border-[#1b1b1b] pt-2 mt-1">
                  <span className="font-mono text-[10px] font-bold">TOKENS: {user.tokenBalance}</span>
                  <button onClick={() => setCurrentView('buy_tokens')} className="font-mono text-[10px] bg-[#ffd93d] text-[#1b1b1b] px-2 py-0.5 border border-[#1b1b1b] hover:bg-[#e8c426] font-bold cursor-pointer">BUY</button>
                </div>
              </div>
            </div>

            <nav className="flex-1 flex flex-col space-y-2">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="flex items-center gap-3 p-3 font-mono text-sm bg-[#ffd93d] text-[#1b1b1b] border-[3px] border-[#1b1b1b] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold cursor-pointer text-left"
              >
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>grid_view</span>
                <span>DASHBOARD</span>
              </button>
              <button
                onClick={() => setCurrentView('history')}
                className="flex items-center gap-3 p-3 font-mono text-sm text-[#4d4633] hover:bg-[#e2e2e2] border-[3px] border-transparent hover:border-[#1b1b1b] transition-all cursor-pointer text-left"
              >
                <span className="material-symbols-outlined text-xl">forum</span>
                <span>INTERVIEWS</span>
              </button>
              <button
                onClick={() => setCurrentView('history')}
                className="flex items-center gap-3 p-3 font-mono text-sm text-[#4d4633] hover:bg-[#e2e2e2] border-[3px] border-transparent hover:border-[#1b1b1b] transition-all cursor-pointer text-left"
              >
                <span className="material-symbols-outlined text-xl">analytics</span>
                <span>REPORTS</span>
              </button>
            </nav>

            <div className="mt-auto pt-4 border-t-[3px] border-[#1b1b1b]">
              <button
                onClick={() => handleOpenModal()}
                className="w-full py-3 mb-3 font-mono text-sm bg-[#ffd93d] text-[#1b1b1b] border-[3px] border-[#1b1b1b] neo-shadow neo-btn font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">add</span>
                NEW_INTERVIEW
              </button>
              <button
                onClick={() => setCurrentView('landing')}
                className="flex items-center gap-3 p-3 w-full text-[#4d4633] hover:bg-[#e2e2e2] hover:text-[#ae2f34] font-mono text-sm border-[3px] border-transparent hover:border-[#1b1b1b] transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
                <span>EXIT_SESSION</span>
              </button>
            </div>
          </aside>

          {/* Main Area */}
          <main className="flex-1 overflow-y-auto p-6 md:p-12 relative min-w-0">
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between sm:items-end mb-10 pb-4 border-b-[3px] border-[#1b1b1b] gap-4">
              <div>
                <h1 className="font-headline text-4xl md:text-5xl font-black uppercase tracking-tight">
                  DASHBOARD
                </h1>
                <p className="font-mono text-xs md:text-sm text-[#4d4633] mt-1 font-bold">
                  {'// SYSTEM_OVERVIEW // USER_STATS'}
                </p>
              </div>
              <button
                onClick={() => handleOpenModal()}
                className="bg-[#ffd93d] text-[#1b1b1b] border-[3px] border-[#1b1b1b] font-headline text-base font-black px-8 py-3.5 neo-shadow neo-btn uppercase cursor-pointer"
              >
                START_SESSION
              </button>
            </header>

            {/* Bento Grid Stats */}
            <section className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
              {/* Stat Card 1 */}
              <div className="md:col-span-8 bg-[#ffffff] border-[3px] border-[#1b1b1b] p-6 neo-shadow flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <h3 className="font-mono text-sm font-bold uppercase text-[#1b1b1b]">
                    Total_Interviews
                  </h3>
                  <span className="material-symbols-outlined text-[#705d00] text-2xl font-bold">
                    data_usage
                  </span>
                </div>
                <div className="mt-8">
                  <span className="font-headline text-5xl md:text-6xl font-black block">
                    {sessions.length * 32}
                  </span>
                  <div className="h-[3px] w-full bg-[#1b1b1b] mt-3 mb-2"></div>
                  <span className="font-mono text-xs text-[#4d4633] font-bold">
                    +14% vs last cycle
                  </span>
                </div>
              </div>

              {/* Stat Card 2 */}
              <div className="md:col-span-4 bg-[#625595] text-[#ffffff] border-[3px] border-[#1b1b1b] p-6 neo-shadow flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <h3 className="font-mono text-sm font-bold uppercase">
                    Avg_Score
                  </h3>
                  <span className="material-symbols-outlined text-2xl">grade</span>
                </div>
                <div className="mt-8">
                  <span className="font-headline text-5xl font-black block">8.4</span>
                  <div className="flex gap-1 mt-2 text-[#ffd93d]">
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="material-symbols-outlined text-[18px] opacity-40">star</span>
                  </div>
                </div>
              </div>

              {/* Stat Card 3 */}
              <div className="md:col-span-12 bg-[#ffd93d] border-[3px] border-[#1b1b1b] p-4 neo-shadow flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-3xl text-[#1b1b1b] font-black">bolt</span>
                  <h3 className="font-headline text-xl md:text-2xl font-black uppercase text-[#1b1b1b]">
                    SYSTEM_READY
                  </h3>
                </div>
                <span className="font-mono text-xs md:text-sm font-bold bg-[#1b1b1b] text-[#ffffff] px-3 py-1 border-[2px] border-[#1b1b1b]">
                  STATUS: ONLINE
                </span>
              </div>
            </section>

            {/* Resume Upload & PDF Context Extraction Section (Prompt 8) */}
            <section className="mb-10">
              <ResumeUpload
                resume={resumeData}
                onUploadSuccess={(data) => setResumeData(data)}
                onClearResume={() => setResumeData(null)}
              />
            </section>

            {/* Controls: Track Picker */}
            <section className="mb-8 flex flex-wrap gap-3 items-center">
              <span className="font-mono text-xs md:text-sm font-bold mr-2 text-[#1b1b1b]">
                {'// FILTER_BY_TRACK:'}
              </span>
              {['ALL', 'SOFTWARE_ENGINEER', 'PRODUCT_MANAGER', 'DATA_SCIENTIST'].map((t) => (
                <button
                  key={t}
                  onClick={() => setDashboardTrackFilter(t)}
                  className={`border-[3px] border-[#1b1b1b] px-4 py-1.5 font-mono text-xs font-bold transition-all cursor-pointer ${
                    dashboardTrackFilter === t
                      ? 'bg-[#1b1b1b] text-[#ffffff] neo-shadow-sm'
                      : 'bg-[#ffffff] text-[#1b1b1b] hover:bg-[#ffd93d]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </section>

            {/* Recent Sessions List */}
            <section>
              <h2 className="font-headline text-2xl font-black uppercase mb-4 border-b-[3px] border-[#1b1b1b] pb-1 inline-block">
                RECENT_SESSIONS
              </h2>

              <div className="space-y-4">
                {filteredDashboardSessions.map((s, idx) => {
                  const colors = ['bg-[#625595] text-white', 'bg-[#ae2f34] text-white', 'bg-[#ffd93d] text-[#1b1b1b]', 'bg-[#e2e2e2] text-[#1b1b1b]'];
                  const badgeColor = colors[idx % colors.length];
                  const displayNum = String(idx + 1).padStart(2, '0');
                  const scoreVal = (s.score / 10).toFixed(1);

                  return (
                    <div
                      key={s.id || idx}
                      onClick={() => {
                        setActiveSessionId(s.id);
                        setActiveRole(s.role);
                        setCurrentView('report');
                      }}
                      className="bg-[#ffffff] border-[3px] border-[#1b1b1b] p-4 neo-shadow flex flex-col md:flex-row md:items-center justify-between gap-4 hover:-translate-y-0.5 transition-transform cursor-pointer"
                    >
                      <div className="flex items-center gap-4 md:gap-6">
                        <div className={`w-14 h-14 md:w-16 md:h-16 flex items-center justify-center border-[3px] border-[#1b1b1b] font-headline text-xl md:text-2xl font-black shrink-0 ${badgeColor}`}>
                          {displayNum}
                        </div>
                        <div>
                          <h4 className="font-headline text-lg md:text-xl font-bold uppercase">
                            {s.role.replace(/ /g, '_')}
                          </h4>
                          <div className="flex gap-2 mt-1.5 flex-wrap">
                            {(s.tags || ['REACT', 'SYSTEM_DESIGN']).map((tag) => (
                              <span
                                key={tag}
                                className="border-[2px] border-[#1b1b1b] px-2 py-0.5 font-mono text-[11px] font-bold bg-[#e2e2e2] uppercase"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 md:gap-10 pt-3 md:pt-0 border-t md:border-t-0 border-[#1b1b1b]/20">
                        <div className="text-left md:text-right">
                          <span className="font-mono text-[10px] block text-[#4d4633] font-bold">
                            DATE
                          </span>
                          <span className="font-mono text-xs md:text-sm font-bold">
                            {s.date}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-[10px] block text-[#4d4633] font-bold">
                            SCORE
                          </span>
                          <span className="font-headline text-xl md:text-2xl font-black">
                            {scoreVal}
                          </span>
                        </div>
                        <button
                          className="w-10 h-10 border-[3px] border-[#1b1b1b] flex items-center justify-center hover:bg-[#ffd93d] transition-colors shrink-0"
                        >
                          <span className="material-symbols-outlined font-bold">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </main>
        </div>
      )}

      {/* -------------------- 3. HISTORY PAGE VIEW -------------------- */}
      {currentView === 'history' && (
        <div className="flex-1 flex flex-col md:flex-row">
          {/* Sidebar */}
          <aside className="hidden md:flex flex-col h-screen w-64 border-r-[3px] border-[#1b1b1b] bg-[#f3f3f3] p-4 space-y-4 shadow-[6px_0px_0px_0px_rgba(0,0,0,1)] sticky top-0 shrink-0 z-20">
            <div className="mb-4">
              <button
                onClick={() => setCurrentView('landing')}
                className="font-headline text-xl font-black text-[#1b1b1b] mb-2 block tracking-tight uppercase cursor-pointer text-left"
              >
                NEO_INTV
              </button>
                            <div className="flex flex-col gap-2 p-2 border-[3px] border-[#1b1b1b] bg-[#f9f9f9] neo-shadow-static mt-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border-[3px] border-[#1b1b1b] bg-[#ffd93d] flex items-center justify-center shrink-0 font-bold">
                    <span className="material-symbols-outlined text-2xl text-[#1b1b1b]">smart_toy</span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-mono text-xs font-bold truncate text-[#1b1b1b]">{user.name}</div>
                    <div className="font-mono text-[10px] text-[#705d00] font-bold uppercase">{user.tier}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t-[2px] border-dashed border-[#1b1b1b] pt-2 mt-1">
                  <span className="font-mono text-[10px] font-bold">TOKENS: {user.tokenBalance}</span>
                  <button onClick={() => setCurrentView('buy_tokens')} className="font-mono text-[10px] bg-[#ffd93d] text-[#1b1b1b] px-2 py-0.5 border border-[#1b1b1b] hover:bg-[#e8c426] font-bold cursor-pointer">BUY</button>
                </div>
              </div>
            </div>

            <nav className="flex-1 flex flex-col space-y-2">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="flex items-center gap-3 p-3 font-mono text-sm text-[#4d4633] hover:bg-[#e2e2e2] border-[3px] border-transparent hover:border-[#1b1b1b] transition-all cursor-pointer text-left"
              >
                <span className="material-symbols-outlined text-xl">grid_view</span>
                <span>DASHBOARD</span>
              </button>
              <button
                onClick={() => setCurrentView('history')}
                className="flex items-center gap-3 p-3 font-mono text-sm text-[#4d4633] hover:bg-[#e2e2e2] border-[3px] border-transparent hover:border-[#1b1b1b] transition-all cursor-pointer text-left"
              >
                <span className="material-symbols-outlined text-xl">forum</span>
                <span>INTERVIEWS</span>
              </button>
              <button
                onClick={() => setCurrentView('history')}
                className="flex items-center gap-3 p-3 font-mono text-sm bg-[#ffd93d] text-[#1b1b1b] border-[3px] border-[#1b1b1b] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold cursor-pointer text-left"
              >
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                <span>REPORTS</span>
              </button>
            </nav>

            <div className="mt-auto pt-4 border-t-[3px] border-[#1b1b1b]">
              <button
                onClick={() => handleOpenModal()}
                className="w-full py-3 mb-3 font-mono text-sm bg-[#ffd93d] text-[#1b1b1b] border-[3px] border-[#1b1b1b] neo-shadow neo-btn font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">add</span>
                NEW_INTERVIEW
              </button>
              <button
                onClick={() => setCurrentView('landing')}
                className="flex items-center gap-3 p-3 w-full text-[#4d4633] hover:bg-[#e2e2e2] hover:text-[#ae2f34] font-mono text-sm border-[3px] border-transparent hover:border-[#1b1b1b] transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
                <span>EXIT_SESSION</span>
              </button>
            </div>
          </aside>

          {/* History Canvas */}
          <main className="flex-1 flex flex-col min-w-0">
            <div className="p-6 md:p-12 flex-grow">
              <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight">
                    INTERVIEW_HISTORY
                  </h1>
                  <p className="font-mono text-xs md:text-sm text-[#4d4633] mt-2 max-w-2xl font-bold">
                    Log of past AI-driven technical evaluations and candidate assessments.
                  </p>
                </div>
              </header>

              {/* Search & Filter Bar */}
              <div className="flex flex-col md:flex-row gap-4 mb-10 bg-[#f9f9f9] p-4 neo-border neo-shadow-static items-center">
                <div className="relative flex-grow w-full">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#1b1b1b] text-xl">
                    search
                  </span>
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="SEARCH_BY_ID_OR_ROLE..."
                    className="w-full pl-10 pr-4 py-3 neo-border bg-[#FFFDF5] focus:ring-0 focus:outline-none focus:bg-[#ffd93d] font-mono text-xs md:text-sm font-bold uppercase placeholder-[#4d4633]"
                  />
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                  <div className="relative w-1/2 md:w-48">
                    <select
                      value={historyTrack}
                      onChange={(e) => setHistoryTrack(e.target.value)}
                      className="w-full p-3 neo-border bg-[#FFFDF5] appearance-none font-mono text-xs font-bold focus:ring-0 focus:outline-none focus:bg-[#ffd93d] cursor-pointer uppercase pr-8"
                    >
                      <option value="ALL_TRACKS">ALL_TRACKS</option>
                      <option value="SOFTWARE_ENG">SOFTWARE_ENG</option>
                      <option value="PRODUCT_MGT">PRODUCT_MGT</option>
                      <option value="DATA_SCIENCE">DATA_SCIENCE</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#1b1b1b]">
                      arrow_drop_down
                    </span>
                  </div>

                  <div className="relative w-1/2 md:w-48">
                    <select
                      value={historyScoreFilter}
                      onChange={(e) => setHistoryScoreFilter(e.target.value)}
                      className="w-full p-3 neo-border bg-[#FFFDF5] appearance-none font-mono text-xs font-bold focus:ring-0 focus:outline-none focus:bg-[#ffd93d] cursor-pointer uppercase pr-8"
                    >
                      <option value="SCORE: ALL">SCORE: ALL</option>
                      <option value="SCORE: >90">SCORE: &gt;90</option>
                      <option value="SCORE: 70-89">SCORE: 70-89</option>
                      <option value="SCORE: <70">SCORE: &lt;70</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#1b1b1b]">
                      arrow_drop_down
                    </span>
                  </div>
                </div>
              </div>

              {/* Bento Grid Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHistorySessions.map((s, idx) => {
                  const { cardBg, scoreBg } = getScoreCardStyle(s.score);

                  return (
                    <article
                      key={s.id || idx}
                      className={`${cardBg} neo-border p-6 flex flex-col neo-shadow-static justify-between`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4 border-b-[3px] border-[#1b1b1b] pb-3">
                          <div className="font-mono text-xs md:text-sm font-bold">
                            [ID: {s.id}]
                          </div>
                          <div className="font-mono text-xs font-bold">
                            {s.date}
                          </div>
                        </div>

                        <h2 className="font-headline text-xl md:text-2xl font-bold mb-4">
                          {s.role}
                        </h2>

                        <div className="flex gap-2 mb-6 flex-wrap">
                          {(s.topics || s.tags || ['Screening', 'Technical']).map((t) => (
                            <span
                              key={t}
                              className="bg-[#e0d6ff] text-[#645797] neo-border px-2 py-0.5 font-mono text-xs uppercase font-bold"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 flex justify-between items-end pt-4 border-t-[3px] border-[#1b1b1b]/20">
                        <div>
                          <div className="font-mono text-[10px] uppercase font-bold mb-1">
                            Overall Score
                          </div>
                          <div
                            className={`${scoreBg} neo-border px-4 py-2 font-headline text-2xl md:text-3xl font-black inline-block neo-shadow-static`}
                          >
                            {s.score}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setActiveSessionId(s.id);
                            setActiveRole(s.role);
                            setCurrentView('report');
                          }}
                          className="bg-[#1b1b1b] text-[#ffffff] neo-border px-4 py-2 font-mono text-xs uppercase neo-shadow neo-btn font-bold cursor-pointer"
                        >
                          VIEW REPORT
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </main>
        </div>
      )}

      {/* -------------------- 4. LOGIN VIEW -------------------- */}
      {currentView === 'login' && (
        <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-[#FFFDF5]">
          <button
            onClick={() => setCurrentView('landing')}
            className="font-headline text-4xl font-black uppercase mb-8 tracking-tighter hover:text-[#705d00] transition-colors cursor-pointer"
          >
            NEO_INTV
          </button>

          <div className="w-full max-w-md bg-[#ffffff] neo-border neo-shadow p-8 relative">
            <div className="bg-[#ffd93d] text-[#1b1b1b] px-2 py-0.5 font-mono text-xs font-bold border-[2px] border-[#1b1b1b] inline-block mb-3">
              AUTH_SYSTEM // NODE_ACCESS
            </div>

            <h1 className="font-headline text-3xl font-black uppercase mb-2">
              USER_LOGIN
            </h1>
            <p className="font-mono text-xs text-[#4d4633] mb-6">
              {'// ENTER CREDENTIALS TO ACCESS ASSESSMENT LOGS'}
            </p>

            {/* Neo-Brutalist Google Sign In */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => {
                  setUser({ name: 'GOOGLE_PUNK_01', tier: 'PREMIUM_TIER', email: 'candidate@google.intv' });
                  setIsAuthenticated(true);
                  setCurrentView('dashboard');
                }}
                className="w-full py-3.5 px-4 bg-[#ffffff] hover:bg-[#fff9e6] text-[#1b1b1b] border-[3px] border-[#1b1b1b] neo-shadow font-mono text-sm font-black uppercase flex items-center justify-center gap-3 transition-all cursor-pointer active:translate-x-[2px] active:translate-y-[2px]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                  />
                </svg>
                <span>SIGN IN WITH GOOGLE</span>
              </button>

              <div className="flex items-center my-5">
                <div className="flex-1 h-[2px] bg-[#1b1b1b]"></div>
                <span className="px-3 font-mono text-[11px] font-bold text-[#4d4633] uppercase">
                  OR LOGIN WITH EMAIL
                </span>
                <div className="flex-1 h-[2px] bg-[#1b1b1b]"></div>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsAuthenticated(true);
                setCurrentView('dashboard');
              }}
              className="space-y-5"
            >
              <div>
                <label className="block font-mono text-xs font-bold uppercase mb-1.5">
                  EMAIL_ADDRESS:
                </label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full p-3 neo-border bg-[#f9f9f9] font-mono text-sm focus:bg-[#ffd93d] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase mb-1.5">
                  PASSWORD:
                </label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full p-3 neo-border bg-[#f9f9f9] font-mono text-sm focus:bg-[#ffd93d] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#ffd93d] text-[#1b1b1b] neo-border neo-shadow neo-btn font-headline text-base font-black uppercase tracking-wide cursor-pointer"
              >
                ACCESS TERMINAL →
              </button>
            </form>

            <div className="mt-8 pt-6 border-t-[3px] border-[#1b1b1b] text-center">
              <p className="font-mono text-xs text-[#4d4633]">
                NEED A NEW ASSESSMENT NODE?{' '}
                <button
                  onClick={() => setCurrentView('signup')}
                  className="text-[#1b1b1b] font-bold underline decoration-[2px] hover:text-[#705d00] cursor-pointer"
                >
                  REGISTER_HERE
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- 5. SIGNUP VIEW -------------------- */}
      {currentView === 'signup' && (
        <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-[#FFFDF5]">
          <button
            onClick={() => setCurrentView('landing')}
            className="font-headline text-4xl font-black uppercase mb-8 tracking-tighter hover:text-[#705d00] transition-colors cursor-pointer"
          >
            NEO_INTV
          </button>

          <div className="w-full max-w-md bg-[#ffffff] neo-border neo-shadow p-8 relative">
            <div className="bg-[#e0d6ff] text-[#645797] px-2 py-0.5 font-mono text-xs font-bold border-[2px] border-[#1b1b1b] inline-block mb-3">
              NODE_PROVISIONING // NEW_USER
            </div>

            <h1 className="font-headline text-3xl font-black uppercase mb-2">
              CREATE_ACCOUNT
            </h1>
            <p className="font-mono text-xs text-[#4d4633] mb-6">
              {'// INITIALIZE CANDIDATE IDENTITY FOR MULTI-AGENT DRILLS'}
            </p>

            {/* Neo-Brutalist Google Sign Up */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => {
                  setUser({ name: 'GOOGLE_CANDIDATE_01', tier: 'PREMIUM_TIER', email: 'candidate@google.intv' });
                  setIsAuthenticated(true);
                  setCurrentView('dashboard');
                }}
                className="w-full py-3.5 px-4 bg-[#ffffff] hover:bg-[#fff9e6] text-[#1b1b1b] border-[3px] border-[#1b1b1b] neo-shadow font-mono text-sm font-black uppercase flex items-center justify-center gap-3 transition-all cursor-pointer active:translate-x-[2px] active:translate-y-[2px]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                  />
                </svg>
                <span>SIGN UP WITH GOOGLE</span>
              </button>

              <div className="flex items-center my-5">
                <div className="flex-1 h-[2px] bg-[#1b1b1b]"></div>
                <span className="px-3 font-mono text-[11px] font-bold text-[#4d4633] uppercase">
                  OR REGISTER WITH EMAIL
                </span>
                <div className="flex-1 h-[2px] bg-[#1b1b1b]"></div>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setUser({ name: authName, tier: 'PREMIUM_TIER', email: authEmail });
                setIsAuthenticated(true);
                setCurrentView('dashboard');
              }}
              className="space-y-4"
            >
              <div>
                <label className="block font-mono text-xs font-bold uppercase mb-1.5">
                  HANDLE / NAME:
                </label>
                <input
                  type="text"
                  required
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full p-3 neo-border bg-[#f9f9f9] font-mono text-sm focus:bg-[#ffd93d] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase mb-1.5">
                  EMAIL_ADDRESS:
                </label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full p-3 neo-border bg-[#f9f9f9] font-mono text-sm focus:bg-[#ffd93d] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase mb-1.5">
                  PASSWORD:
                </label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full p-3 neo-border bg-[#f9f9f9] font-mono text-sm focus:bg-[#ffd93d] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 mt-2 bg-[#ffd93d] text-[#1b1b1b] neo-border neo-shadow neo-btn font-headline text-base font-black uppercase tracking-wide cursor-pointer"
              >
                INITIALIZE PROFILE →
              </button>
            </form>

            <div className="mt-8 pt-6 border-t-[3px] border-[#1b1b1b] text-center">
              <p className="font-mono text-xs text-[#4d4633]">
                ALREADY REGISTERED?{' '}
                <button
                  onClick={() => setCurrentView('login')}
                  className="text-[#1b1b1b] font-bold underline decoration-[2px] hover:text-[#705d00] cursor-pointer"
                >
                  ACCESS_LOGIN
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- 6. INTERVIEW VIEW -------------------- */}
      {currentView === 'interview' && (
        <InterviewChat
          sessionId={activeSessionId}
          role={activeRole}
          track={activeTrack}
          resumeText={resumeData?.resumeText || undefined}
          onComplete={(reportId, finishedTranscript: TranscriptEntry[]) => {
            setTranscript(finishedTranscript);
            setActiveSessionId(reportId);
            setCurrentView('report');
          }}
          onAbort={() => {
            setCurrentView('dashboard');
          }}
        />
      )}

      {/* -------------------- 7. REPORT VIEW -------------------- */}
      {currentView === 'report' && (
        <div className="flex-1 flex flex-col md:flex-row min-h-screen">
          {/* Sidebar */}
          <aside className="hidden md:flex flex-col h-screen w-64 border-r-[3px] border-[#1b1b1b] bg-[#f3f3f3] p-4 space-y-4 shadow-[6px_0px_0px_0px_rgba(0,0,0,1)] sticky top-0 shrink-0 z-20">
            <div className="mb-4">
              <button
                onClick={() => setCurrentView('landing')}
                className="font-headline text-xl font-black text-[#1b1b1b] mb-2 block tracking-tight uppercase cursor-pointer text-left"
              >
                NEO_INTV
              </button>
                            <div className="flex flex-col gap-2 p-2 border-[3px] border-[#1b1b1b] bg-[#f9f9f9] neo-shadow-static mt-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border-[3px] border-[#1b1b1b] bg-[#ffd93d] flex items-center justify-center shrink-0 font-bold">
                    <span className="material-symbols-outlined text-2xl text-[#1b1b1b]">smart_toy</span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-mono text-xs font-bold truncate text-[#1b1b1b]">{user.name}</div>
                    <div className="font-mono text-[10px] text-[#705d00] font-bold uppercase">{user.tier}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t-[2px] border-dashed border-[#1b1b1b] pt-2 mt-1">
                  <span className="font-mono text-[10px] font-bold">TOKENS: {user.tokenBalance}</span>
                  <button onClick={() => setCurrentView('buy_tokens')} className="font-mono text-[10px] bg-[#ffd93d] text-[#1b1b1b] px-2 py-0.5 border border-[#1b1b1b] hover:bg-[#e8c426] font-bold cursor-pointer">BUY</button>
                </div>
              </div>
            </div>

            <nav className="flex-1 flex flex-col space-y-2">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="flex items-center gap-3 p-3 font-mono text-sm text-[#4d4633] hover:bg-[#e2e2e2] border-[3px] border-transparent hover:border-[#1b1b1b] transition-all cursor-pointer text-left"
              >
                <span className="material-symbols-outlined text-xl">grid_view</span>
                <span>DASHBOARD</span>
              </button>
              <button
                onClick={() => setCurrentView('history')}
                className="flex items-center gap-3 p-3 font-mono text-sm text-[#4d4633] hover:bg-[#e2e2e2] border-[3px] border-transparent hover:border-[#1b1b1b] transition-all cursor-pointer text-left"
              >
                <span className="material-symbols-outlined text-xl">forum</span>
                <span>INTERVIEWS</span>
              </button>
              <button
                onClick={() => setCurrentView('history')}
                className="flex items-center gap-3 p-3 font-mono text-sm bg-[#ffd93d] text-[#1b1b1b] border-[3px] border-[#1b1b1b] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold cursor-pointer text-left"
              >
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                <span>REPORTS</span>
              </button>
            </nav>

            <div className="mt-auto pt-4 border-t-[3px] border-[#1b1b1b]">
              <button
                onClick={() => handleOpenModal()}
                className="w-full py-3 mb-3 font-mono text-sm bg-[#ffd93d] text-[#1b1b1b] border-[3px] border-[#1b1b1b] neo-shadow neo-btn font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">add</span>
                NEW_INTERVIEW
              </button>
              <button
                onClick={() => setCurrentView('landing')}
                className="flex items-center gap-3 p-3 w-full text-[#4d4633] hover:bg-[#e2e2e2] hover:text-[#ae2f34] font-mono text-sm border-[3px] border-transparent hover:border-[#1b1b1b] transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
                <span>EXIT_SESSION</span>
              </button>
            </div>
          </aside>

          {/* Report Main */}
          <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            <div className="p-6 md:p-12 flex-grow max-w-[1440px] w-full mx-auto">
              <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-[3px] border-[#1b1b1b] pb-6 mb-8">
                <div>
                  <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-[#1b1b1b] mb-2">
                    EVALUATOR_CRITIQUE
                  </h1>
                  <div className="flex flex-wrap gap-2 font-mono text-xs font-bold">
                    <span className="neo-border px-2.5 py-1 bg-[#e7deff]">
                      ID: {activeSessionId}
                    </span>
                    <span className="neo-border px-2.5 py-1 bg-[#e2e2e2] uppercase">
                      ROLE: {activeRole.replace(/ /g, '_')}
                    </span>
                    <span className="neo-border px-2.5 py-1 bg-[#ffdad8]">
                      DATE: 2024.10.27
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setCurrentView('history')}
                    className="bg-[#ffffff] text-[#1b1b1b] neo-border neo-shadow neo-btn px-4 py-2.5 text-xs font-mono font-bold uppercase cursor-pointer"
                  >
                    RETURN TO LOGS
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="bg-[#ffd93d] text-[#1b1b1b] neo-border neo-shadow neo-btn px-6 py-2.5 text-sm font-black font-headline uppercase flex items-center gap-2 cursor-pointer"
                  >
                    DOWNLOAD PDF
                    <span className="material-symbols-outlined text-base">download</span>
                  </button>
                </div>
              </section>

              {/* Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
                {/* Verdict Hero Card */}
                <div className="col-span-1 md:col-span-8 bg-[#ffd93d] neo-border neo-shadow p-6 md:p-8 flex flex-col justify-between min-h-[260px]">
                  <h3 className="font-headline text-2xl font-bold uppercase text-[#1b1b1b]">
                    The Verdict
                  </h3>
                  <div className="flex flex-col md:flex-row items-baseline gap-4 mt-auto">
                    <span className="text-[90px] md:text-[140px] font-headline font-black leading-none text-[#1b1b1b] tracking-tighter">
                      82
                    </span>
                    <div className="flex flex-col">
                      <span className="text-3xl md:text-4xl font-headline font-black uppercase text-[#1b1b1b]">
                        RECOMMENDED
                      </span>
                      <span className="font-mono text-xs md:text-sm text-[#1b1b1b] mt-1 font-bold">
                        [SYSTEM_PASS_THRESHOLD_MET]
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sentiment */}
                <div className="col-span-1 md:col-span-4 bg-[#ffffff] neo-border neo-shadow p-6 flex flex-col justify-between">
                  <h3 className="font-headline text-xl font-bold uppercase text-[#1b1b1b] mb-3 border-b-[3px] border-[#1b1b1b] pb-2">
                    Sentiment
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between font-mono text-xs font-bold mb-1">
                        <span>CONFIDENCE</span>
                        <span>85%</span>
                      </div>
                      <div className="w-full h-7 neo-border bg-[#e2e2e2] relative">
                        <div className="absolute top-0 left-0 h-full bg-[#ffdad8] border-r-[3px] border-[#1b1b1b]" style={{ width: '85%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs font-bold mb-1">
                        <span>AGGRESSION</span>
                        <span>42%</span>
                      </div>
                      <div className="w-full h-7 neo-border bg-[#e2e2e2] relative">
                        <div className="absolute top-0 left-0 h-full bg-[#ff6b6b] border-r-[3px] border-[#1b1b1b]" style={{ width: '42%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs font-bold mb-1">
                        <span>CLARITY</span>
                        <span>91%</span>
                      </div>
                      <div className="w-full h-7 neo-border bg-[#e2e2e2] relative">
                        <div className="absolute top-0 left-0 h-full bg-[#e7deff] border-r-[3px] border-[#1b1b1b]" style={{ width: '91%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-[#ffffff] neo-border neo-shadow p-6">
                  <h3 className="font-headline text-xl font-bold uppercase text-[#1b1b1b] border-b-[3px] border-[#1b1b1b] pb-2 mb-4 flex items-center justify-between">
                    STRENGTHS
                    <span className="material-symbols-outlined text-[#ffd93d] bg-[#1b1b1b] p-1 text-sm font-bold">
                      add
                    </span>
                  </h3>
                  <ul className="space-y-3">
                    {[
                      'Exceptional system architecture design capabilities under pressure.',
                      'Clear articulation of complex technical trade-offs.',
                      'Strong grasp of distributed data consistency models.'
                    ].map((s, idx) => (
                      <li key={idx} className="pb-3 border-b-[2px] border-[#1b1b1b]/20 last:border-b-0 flex items-start gap-3">
                        <span className="font-mono text-xs font-bold text-[#1b1b1b] mt-0.5">0{idx + 1}</span>
                        <span className="font-sans text-sm md:text-base leading-relaxed text-[#1b1b1b]">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#f3f3f3] neo-border neo-shadow p-6">
                  <h3 className="font-headline text-xl font-bold uppercase text-[#1b1b1b] border-b-[3px] border-[#1b1b1b] pb-2 mb-4 flex items-center justify-between">
                    WEAKNESSES
                    <span className="material-symbols-outlined text-[#ff6b6b] bg-[#1b1b1b] p-1 text-sm font-bold">
                      remove
                    </span>
                  </h3>
                  <ul className="space-y-3">
                    {[
                      'Over-engineered initial solution for simple CRUD endpoints.',
                      'Missed edge cases in concurrent rate limiting implementation.',
                      'Data insufficient for deep frontend assessment.'
                    ].map((w, idx) => (
                      <li key={idx} className="pb-3 border-b-[2px] border-[#1b1b1b]/20 last:border-b-0 flex items-start gap-3">
                        <span className="font-mono text-xs font-bold text-[#1b1b1b] mt-0.5">0{idx + 1}</span>
                        <span className="font-sans text-sm md:text-base leading-relaxed text-[#1b1b1b]">{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Category Metrics */}
              <div className="bg-[#ffffff] neo-border neo-shadow p-6 mb-8">
                <h3 className="font-headline text-2xl font-bold uppercase text-[#1b1b1b] border-b-[3px] border-[#1b1b1b] pb-2 mb-6">
                  CATEGORY_METRICS
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <div className="flex justify-between font-mono text-xs font-bold mb-1.5">
                      <span>PROBLEM_SOLVING</span>
                      <span>90%</span>
                    </div>
                    <div className="w-full h-8 neo-border bg-[#dadada] relative">
                      <div className="h-full bg-[#ffd93d] border-r-[3px] border-[#1b1b1b]" style={{ width: '90%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-mono text-xs font-bold mb-1.5">
                      <span>COMMUNICATION</span>
                      <span>75%</span>
                    </div>
                    <div className="w-full h-8 neo-border bg-[#dadada] relative">
                      <div className="h-full bg-[#e0d6ff] border-r-[3px] border-[#1b1b1b]" style={{ width: '75%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-mono text-xs font-bold mb-1.5">
                      <span>SYSTEM_DESIGN</span>
                      <span>85%</span>
                    </div>
                    <div className="w-full h-8 neo-border bg-[#dadada] relative">
                      <div className="h-full bg-[#ffd93d] border-r-[3px] border-[#1b1b1b]" style={{ width: '85%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-mono text-xs font-bold mb-1.5">
                      <span>CODE_QUALITY</span>
                      <span>60%</span>
                    </div>
                    <div className="w-full h-8 neo-border bg-[#dadada] relative">
                      <div className="h-full bg-[#ff6b6b] border-r-[3px] border-[#1b1b1b]" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Observations & Snippets */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
                <div className="md:col-span-6 flex flex-col gap-4">
                  <h3 className="font-headline text-2xl font-bold uppercase text-[#1b1b1b]">
                    Key Observations
                  </h3>
                  {[
                    { id: 'CRIT_01', bg: 'bg-[#ffd93d]', text: 'Candidate demonstrated robust understanding of asynchronous execution models, but failed to adequately explain error boundary implementation in React contexts.' },
                    { id: 'CRIT_02', bg: 'bg-[#ffdad8]', text: 'High frequency of filler words detected during architectural discussion. Eye tracking indicated distraction during algorithmic problem solving.' },
                    { id: 'CRIT_03', bg: 'bg-[#e7deff]', text: 'System design proposal was scalable but lacked considerations for rate limiting and aggressive caching strategies required for high-throughput nodes.' }
                  ].map((obs, idx) => (
                    <div key={idx} className="bg-[#f9f9f9] neo-border neo-shadow p-4">
                      <div className={`font-mono text-xs text-[#1b1b1b] mb-2 ${obs.bg} inline-block px-2 py-0.5 neo-border font-bold`}>
                        [{obs.id}]
                      </div>
                      <p className="font-sans text-sm md:text-base leading-relaxed text-[#1b1b1b]">
                        {obs.text}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="md:col-span-6 flex flex-col">
                  <h3 className="font-headline text-2xl font-bold uppercase text-[#1b1b1b] mb-4">
                    Transcript Snippets
                  </h3>
                  <div className="bg-[#1b1b1b] text-[#f9f9f9] neo-border neo-shadow p-6 flex-1 flex flex-col gap-5 font-mono text-xs leading-relaxed">
                    <div className="border-l-[3px] border-[#ffd93d] pl-3">
                      <div className="text-[#ffd93d] mb-1 font-bold">
                        &gt; TIMESTAMP_14:22 [FLAG: EXCELLENT]
                      </div>
                      <div className="opacity-90 font-sans text-sm">
                        &ldquo;The bottleneck is not the database, it is the network IO between the microservices. We need to implement a circuit breaker here to prevent cascading failures.&rdquo;
                      </div>
                    </div>

                    <div className="border-l-[3px] border-[#ff6b6b] pl-3">
                      <div className="text-[#ff6b6b] mb-1 font-bold">
                        &gt; TIMESTAMP_28:05 [FLAG: WEAKNESS]
                      </div>
                      <div className="opacity-90 font-sans text-sm">
                        &ldquo;Uh, I guess we could just use a bigger instance if the load gets too high? I have not really worked with Kubernetes auto-scaling before.&rdquo;
                      </div>
                    </div>

                    <div className="border-l-[3px] border-[#e2e2e2] pl-3 opacity-75">
                      <div className="text-[#e2e2e2] mb-1 font-bold">
                        &gt; TIMESTAMP_41:10 [FLAG: NEUTRAL]
                      </div>
                      <div className="opacity-90 font-sans text-sm">
                        &ldquo;Yes, I am comfortable working in a Neo-Brutalist design environment. It prioritizes function over form.&rdquo;
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* Role Selection Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FFFDF5] neo-border neo-shadow-static w-full max-w-xl p-6 md:p-8 relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6 border-b-[3px] border-[#1b1b1b] pb-4">
              <div>
                <span className="bg-[#ffd93d] text-[#1b1b1b] px-2 py-0.5 text-xs font-mono font-bold uppercase border-[2px] border-[#1b1b1b] inline-block mb-1">
                  SYS_INIT // SESSION_DISPATCH
                </span>
                <h2 className="text-2xl md:text-3xl font-headline font-black uppercase text-[#1b1b1b]">
                  CONFIGURE_INTERVIEW
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-9 h-9 border-[3px] border-[#1b1b1b] flex items-center justify-center font-black hover:bg-[#ae2f34] hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block font-mono text-xs font-bold uppercase mb-2 text-[#1b1b1b]">
                  {'// 01. SELECT_INTERVIEW_TRACK:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'SOFTWARE_ENG', name: 'Software Engineer', defaultRole: 'Frontend Architect' },
                    { id: 'PRODUCT_MGT', name: 'Product Manager', defaultRole: 'Product Manager L4' },
                    { id: 'DATA_SCIENCE', name: 'Data & AI', defaultRole: 'Senior Data Scientist' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setActiveTrack(t.id);
                        setActiveRole(t.defaultRole);
                      }}
                      className={`p-3 font-mono text-xs font-bold uppercase neo-border text-center transition-all cursor-pointer ${
                        activeTrack === t.id
                          ? 'bg-[#ffd93d] text-[#1b1b1b] neo-shadow-sm'
                          : 'bg-[#ffffff] text-[#4d4633] hover:bg-[#e2e2e2]'
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase mb-2 text-[#1b1b1b]">
                  {'// 02. TARGET_ROLE_SPEC:'}
                </label>
                <select
                  value={activeRole}
                  onChange={(e) => setActiveRole(e.target.value)}
                  className="w-full p-3.5 neo-border bg-[#ffffff] font-mono text-sm font-bold text-[#1b1b1b] focus:bg-[#ffd93d] focus:outline-none"
                >
                  {activeTrack === 'SOFTWARE_ENG' && (
                    <>
                      <option value="Frontend Architect">Frontend Architect</option>
                      <option value="Senior Backend Engineer">Senior Backend Engineer</option>
                      <option value="Full Stack Developer">Full Stack Developer</option>
                      <option value="Systems Engineer">Systems Engineer</option>
                    </>
                  )}
                  {activeTrack === 'PRODUCT_MGT' && (
                    <>
                      <option value="Product Manager L4">Product Manager L4</option>
                      <option value="Senior Technical PM">Senior Technical PM</option>
                      <option value="Growth Product Manager">Growth Product Manager</option>
                    </>
                  )}
                  {activeTrack === 'DATA_SCIENCE' && (
                    <>
                      <option value="Senior Data Scientist">Senior Data Scientist</option>
                      <option value="Data Engineer">Data Engineer</option>
                      <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase mb-2 text-[#1b1b1b]">
                  {'// 03. CANDIDATE_RESUME & CONTEXT (PDF-PARSE + CLOUDINARY):'}
                </label>
                <ResumeUpload
                  compact
                  resume={resumeData}
                  onUploadSuccess={(data) => setResumeData(data)}
                  onClearResume={() => setResumeData(null)}
                />
              </div>

              <div className="flex gap-4 pt-4 border-t-[3px] border-[#1b1b1b]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 bg-[#ffffff] text-[#1b1b1b] neo-border neo-shadow neo-btn font-mono text-xs font-bold uppercase cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={() => handleStartSession(activeRole, activeTrack)}
                  className="flex-1 py-3 bg-[#ffd93d] text-[#1b1b1b] neo-border neo-shadow neo-btn font-headline text-base font-black uppercase flex items-center justify-center gap-2 cursor-pointer"
                >
                  INITIALIZE_ROUND
                  <span className="material-symbols-outlined text-xl">bolt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
