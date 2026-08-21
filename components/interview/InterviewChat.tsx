'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';
import { Modal } from '../ui/Modal';

export interface TranscriptEntry {
  agent: string;
  question: string;
  answer: string;
  timestamp?: string;
}

export interface InterviewChatProps {
  sessionId: string;
  role: string;
  track?: string;
  resumeText?: string;
  onComplete?: (reportId: string, transcript: TranscriptEntry[]) => void;
  onAbort?: () => void;
}

export const InterviewChat: React.FC<InterviewChatProps> = ({
  sessionId,
  role,
  track = 'SOFTWARE_ENG',
  resumeText,
  onComplete,
  onAbort,
}) => {
  const [currentAgent, setCurrentAgent] = useState<string>('SCREENING_AGENT');
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [candidateAnswer, setCandidateAnswer] = useState<string>('');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [totalRounds, setTotalRounds] = useState<number>(4);

  const [isLoadingQuestion, setIsLoadingQuestion] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('INITIALIZING...');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Timer state (15 minutes default countdown)
  const [timerSeconds, setTimerSeconds] = useState<number>(15 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Abort confirmation modal
  const [isAbortModalOpen, setIsAbortModalOpen] = useState<boolean>(false);
  const [saveDraftNotice, setSaveDraftNotice] = useState<boolean>(false);

  // Active typing token buffer ref
  const receivedStreamRef = useRef<boolean>(false);

  // Calculate live word count
  const wordCount = candidateAnswer.trim()
    ? candidateAnswer.trim().split(/\s+/).filter(Boolean).length
    : 0;

  // Format timer into mm:ss
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer countdown effect
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // -------------------------------------------------------------------------
  // Real-Time Socket.io Connection & Redis Pub/Sub Token Streaming
  // -------------------------------------------------------------------------
  useEffect(() => {
    let socket: Socket | null = null;

    try {
      // Connect to Socket.io server (proxied via Gateway or local dev)
      socket = io({
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 4,
        timeout: 4000,
      });

      socket.on('connect', () => {
        setSocketConnected(true);
        // Join session-specific socket room
        socket?.emit('join_session', { sessionId });
      });

      socket.on('disconnect', () => {
        setSocketConnected(false);
      });

      socket.on('question_start', (payload) => {
        receivedStreamRef.current = true;
        setIsLoadingQuestion(false);
        setIsStreaming(true);
        setCurrentQuestion('');
        if (payload?.agent) {
          setCurrentAgent(payload.agent.toUpperCase().replace(/AGENT$/, '_AGENT'));
        }
        setStatusMsg('STREAMING QUESTION TOKENS...');
      });

      socket.on('token', (payload) => {
        receivedStreamRef.current = true;
        setIsLoadingQuestion(false);
        setIsStreaming(true);
        if (payload?.token) {
          setCurrentQuestion((prev) => prev + payload.token);
        }
      });

      socket.on('interview_stream', (payload) => {
        receivedStreamRef.current = true;
        if (payload?.type === 'token' && payload?.token) {
          setIsLoadingQuestion(false);
          setIsStreaming(true);
          setCurrentQuestion((prev) => prev + payload.token);
        } else if (payload?.type === 'done') {
          setIsStreaming(false);
          if (payload.nextQuestion) {
            setCurrentQuestion(payload.nextQuestion);
          }
          if (payload.agent) {
            setCurrentAgent(payload.agent.toUpperCase().replace(/AGENT$/, '_AGENT'));
          }
          setStatusMsg('AWAITING CANDIDATE INPUT');
        }
      });

      socket.on('question_complete', (payload) => {
        setIsStreaming(false);
        if (payload?.nextQuestion) {
          setCurrentQuestion(payload.nextQuestion);
        }
        if (payload?.agent) {
          setCurrentAgent(payload.agent.toUpperCase().replace(/AGENT$/, '_AGENT'));
        }
        setStatusMsg('AWAITING CANDIDATE INPUT');
      });
    } catch (err) {
      console.warn('[Socket.io Client Warning]', err);
    }

    return () => {
      if (socket) {
        socket.emit('leave_session', { sessionId });
        socket.disconnect();
      }
    };
  }, [sessionId]);

  // Smooth typing effect helper for HTTP / non-socket fallbacks
  const animateTextTyping = (fullText: string, onDone?: () => void) => {
    setIsStreaming(true);
    let index = 0;
    setCurrentQuestion('');
    const stepSize = Math.max(1, Math.floor(fullText.length / 35));

    const interval = setInterval(() => {
      index += stepSize;
      if (index >= fullText.length) {
        setCurrentQuestion(fullText);
        setIsStreaming(false);
        clearInterval(interval);
        if (onDone) onDone();
      } else {
        setCurrentQuestion(fullText.slice(0, index));
      }
    }, 25);
  };

  // Initial Question Fetch
  useEffect(() => {
    let isMounted = true;

    async function loadQuestion() {
      setStatusMsg('CONNECTING TO MULTI-AGENT ENGINE...');
      try {
        if (typeof window !== 'undefined') {
          const savedDraft = sessionStorage.getItem(`draft_${sessionId}`);
          if (savedDraft && isMounted) {
            setCandidateAnswer(savedDraft);
          }
        }

        const res = await fetch('/api/interview/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            role,
            track,
            resumeText,
            transcript: [],
          }),
        });

        if (!res.ok) {
          throw new Error(`API error: ${res.statusText}`);
        }

        const data = await res.json();
        if (isMounted) {
          if (data.agent) setCurrentAgent(data.agent);
          if (data.round) setRoundNumber(data.round);
          if (data.totalRounds) setTotalRounds(data.totalRounds);

          // If socket already streamed the question, avoid duplicate typing animation
          if (!receivedStreamRef.current && data.nextQuestion) {
            animateTextTyping(data.nextQuestion, () => {
              if (isMounted) setStatusMsg('AWAITING CANDIDATE INPUT');
            });
          } else {
            if (data.nextQuestion) setCurrentQuestion(data.nextQuestion);
            setStatusMsg('AWAITING CANDIDATE INPUT');
          }
        }
      } catch (err) {
        console.warn('Fallback question on load error:', err);
        if (isMounted) {
          const fallbackQ = `Welcome to your technical evaluation for the ${role} position. To start, could you summarize your background and core technical competencies?`;
          animateTextTyping(fallbackQ, () => {
            if (isMounted) {
              setCurrentAgent('SCREENING_AGENT');
              setStatusMsg('AWAITING CANDIDATE INPUT');
            }
          });
        }
      } finally {
        if (isMounted) {
          setIsLoadingQuestion(false);
        }
      }
    }

    loadQuestion();

    return () => {
      isMounted = false;
    };
  }, [sessionId, role, track, resumeText]);

  // Handle TTS speech synthesis
  const handleReadAloud = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentQuestion);
    utterance.rate = 1.0;
    utterance.pitch = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Handle SpeechRecognition Voice Input
  const handleToggleVoiceInput = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice dictation is not supported in this browser. Please use keyboard text input.');
      return;
    }

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setStatusMsg('LISTENING (SPEAK NOW)...');
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setCandidateAnswer((prev) => (prev ? prev + ' ' + finalTranscript.trim() : finalTranscript.trim()));
          setStatusMsg('VOICE_TRANSCRIPT_CAPTURED');
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Failed to start SpeechRecognition:', err);
      setIsListening(false);
    }
  };

  // Save draft
  const handleSaveDraft = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`draft_${sessionId}`, candidateAnswer);
      setSaveDraftNotice(true);
      setStatusMsg('DRAFT_SAVED');
      setTimeout(() => setSaveDraftNotice(false), 2500);
    }
  };

  // Submit Answer
  const handleSubmitAnswer = async () => {
    if (!candidateAnswer.trim() || isSubmitting) return;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    setIsSubmitting(true);
    receivedStreamRef.current = false;
    setStatusMsg('EVALUATING & ROUTING TO NEXT AGENT...');

    const updatedTranscript: TranscriptEntry[] = [
      ...transcript,
      {
        agent: currentAgent,
        question: currentQuestion,
        answer: candidateAnswer.trim(),
        timestamp: new Date().toISOString(),
      },
    ];
    setTranscript(updatedTranscript);

    // Clear saved draft
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(`draft_${sessionId}`);
    }

    try {
      const res = await fetch('/api/interview/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          role,
          track,
          resumeText,
          transcript: updatedTranscript,
          candidateAnswer: candidateAnswer.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error(`Submission error: ${res.statusText}`);
      }

      const data = await res.json();

      if (data.isComplete || updatedTranscript.length >= 4) {
        setIsTimerRunning(false);
        setStatusMsg('INTERVIEW_COMPLETE');
        if (onComplete) {
          onComplete(sessionId, updatedTranscript);
        } else {
          window.location.href = `/report/${sessionId}`;
        }
        return;
      }

      // Next Question
      if (data.agent) {
        setCurrentAgent(data.agent);
      }
      if (data.round) setRoundNumber(data.round);

      if (!receivedStreamRef.current && data.nextQuestion) {
        animateTextTyping(data.nextQuestion, () => {
          setStatusMsg('AWAITING CANDIDATE INPUT');
        });
      } else if (data.nextQuestion) {
        setCurrentQuestion(data.nextQuestion);
        setStatusMsg('AWAITING CANDIDATE INPUT');
      }

      setCandidateAnswer('');
    } catch (err) {
      console.warn('API error, falling back locally:', err);
      if (updatedTranscript.length >= 4) {
        setIsTimerRunning(false);
        if (onComplete) {
          onComplete(sessionId, updatedTranscript);
        } else {
          window.location.href = `/report/${sessionId}`;
        }
      } else {
        const nextAgentTag =
          updatedTranscript.length === 1
            ? 'TECHNICAL_AGENT'
            : updatedTranscript.length === 2
            ? 'TECHNICAL_AGENT'
            : 'BEHAVIORAL_AGENT';
        setCurrentAgent(nextAgentTag);
        
        const fallbackNextQ =
          'How do you manage eventual consistency, distributed tracing, and automated transaction rollbacks across microservice boundaries?';
        
        animateTextTyping(fallbackNextQ, () => {
          setStatusMsg('AWAITING CANDIDATE INPUT');
        });
        setCandidateAnswer('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmAbort = () => {
    setIsTimerRunning(false);
    setIsAbortModalOpen(false);
    if (onAbort) {
      onAbort();
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="flex-1 flex flex-col grid-bg min-h-screen bg-[#FFFDF5] text-[#1b1b1b]">
      {/* ----------------- Header ----------------- */}
      <header className="w-full border-b-[3px] border-[#1b1b1b] bg-[#ffffff] px-6 py-4 flex justify-between items-center neo-shadow relative z-20 sticky top-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="font-headline text-2xl md:text-3xl font-black tracking-tighter uppercase text-[#1b1b1b]">
            NEO_INTV
          </span>
          <div className="h-6 w-[3px] bg-[#1b1b1b] hidden sm:block"></div>
          
          {/* Agent Tag & Real-Time Sync Indicator */}
          <div className="flex items-center gap-2">
            <span
              id="header-agent-badge"
              className="font-mono text-xs md:text-sm bg-[#1b1b1b] text-[#ffd93d] px-3 py-1 font-black border-[2px] border-[#1b1b1b] uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]"
            >
              <span className="text-[#ffd93d]">&gt;</span> {currentAgent}
            </span>
            <Tag variant="gray" size="xs" className="hidden lg:inline-flex">
              ROUND {roundNumber}/{totalRounds}
            </Tag>
            {socketConnected && (
              <span
                id="realtime-stream-indicator"
                className="hidden xl:inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-[#e0d6ff] text-[#1b1b1b] px-2 py-0.5 border border-[#1b1b1b]"
                title="Connected to Redis Pub/Sub WebSocket stream"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#625595] animate-pulse"></span>
                STREAM_ACTIVE
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-4 font-mono text-xs md:text-sm items-center">
          {/* Timer Display */}
          <div
            id="interview-timer"
            className={`flex items-center gap-1.5 font-bold px-3 py-1 border-[2px] border-[#1b1b1b] ${
              timerSeconds < 180 ? 'bg-[#ffdad8] text-[#ba1a1a]' : 'bg-[#f9f9f9]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              timer
            </span>
            <span className="hidden sm:inline">TIME_REMAINING:</span>
            <span
              className={`font-black font-mono tracking-wider ${
                timerSeconds < 180 ? 'text-[#ba1a1a]' : 'text-[#1b1b1b]'
              }`}
            >
              {formatTimer(timerSeconds)}
            </span>
          </div>

          {/* Abort Button */}
          <Button
            id="abort-session-btn"
            variant="secondary"
            size="sm"
            onClick={() => setIsAbortModalOpen(true)}
            className="hover:bg-[#ffdad8] hover:text-[#ba1a1a]"
          >
            ABORT
          </Button>
        </div>
      </header>

      {/* ----------------- Main Chat Stage ----------------- */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 md:p-12 relative z-10 max-w-5xl mx-auto w-full">
        <div className="w-full flex flex-col gap-8 md:gap-10">
          {/* 1. System Output Block */}
          <div className="w-full">
            <Card
              id="system-output-card"
              shadow="md"
              bg="bg-[#ffffff]"
              badge={{
                text: 'System Output',
                variant: 'purple',
              }}
              className="p-6 md:p-8"
            >
              {/* Agent persona header bar */}
              <div className="flex justify-between items-center mb-4 pb-3 border-b-[2px] border-[#1b1b1b]/10">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#4d4633]">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isStreaming ? 'bg-[#ffd93d] animate-ping' : 'bg-[#625595] animate-pulse'
                    }`}
                  ></span>
                  <span>DISPATCHED_AGENT:</span>
                  <span className="text-[#1b1b1b] uppercase bg-[#e0d6ff] px-2 py-0.5 border border-[#1b1b1b]">
                    {currentAgent}
                  </span>
                </div>
                <div className="font-mono text-xs text-[#705d00] font-bold">
                  SESSION: [{sessionId}]
                </div>
              </div>

              {/* Question Body with Real-Time Typing Cursor */}
              {isLoadingQuestion && !currentQuestion ? (
                <div className="py-8 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-[3px] border-[#1b1b1b] border-t-transparent animate-spin"></div>
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#4d4633]">
                    {'>'} INITIALIZING MULTI-AGENT PIPELINE...
                  </span>
                </div>
              ) : (
                <p
                  id="system-question-text"
                  className="font-sans text-lg md:text-xl font-medium leading-relaxed mb-6 text-[#1b1b1b]"
                >
                  {currentQuestion}
                  {isStreaming && (
                    <span className="inline-block w-2.5 h-5 bg-[#1b1b1b] ml-1 align-middle animate-pulse"></span>
                  )}
                </p>
              )}

              {/* Question Footer Toolbar */}
              <div className="flex justify-between items-center border-t-[3px] border-[#1b1b1b] pt-4 mt-2">
                <div className="font-mono text-[11px] text-[#4d4633] font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-[#705d00]">
                    terminal
                  </span>
                  <span>TARGET ROLE: {role.toUpperCase()}</span>
                </div>

                <div className="flex gap-2">
                  <a
                    href={`/interview/${sessionId}/code?role=${encodeURIComponent(role)}&track=${encodeURIComponent(track)}`}
                    className="p-2 border-[3px] border-[#1b1b1b] font-bold transition-colors cursor-pointer flex items-center gap-1.5 bg-[#d4e3ff] hover:bg-[#b0ccff] text-[#1b1b1b] text-xs font-mono no-underline"
                    title="Open in-browser Monaco live coding IDE"
                  >
                    <span className="material-symbols-outlined text-base">code</span>
                    <span className="hidden sm:inline">LIVE_CODE_IDE</span>
                  </a>

                  <button
                    id="read-aloud-btn"
                    onClick={handleReadAloud}
                    className={`p-2 border-[3px] border-[#1b1b1b] font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                      isSpeaking
                        ? 'bg-[#ffd93d] text-[#1b1b1b]'
                        : 'bg-[#ffffff] hover:bg-[#ffd93d]'
                    }`}
                    title={isSpeaking ? 'Stop audio playback' : 'Read question aloud'}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {isSpeaking ? 'volume_off' : 'volume_up'}
                    </span>
                    <span className="font-mono text-xs hidden sm:inline">
                      {isSpeaking ? 'STOP AUDIO' : 'READ ALOUD'}
                    </span>
                  </button>
                </div>
              </div>
            </Card>
          </div>

          {/* Live Coding Round Alert Banner if agent is CODING */}
          {currentAgent.includes('CODING') && (
            <div className="bg-[#ffdad8] border-[3px] border-[#1b1b1b] p-4 flex flex-col sm:flex-row justify-between items-center gap-4 neo-shadow">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-[#ba1a1a]">terminal</span>
                <div>
                  <span className="font-headline font-black text-sm block text-[#1b1b1b]">
                    STAGE: LIVE CODING CHALLENGE
                  </span>
                  <span className="font-sans text-xs text-[#4d4633]">
                    The Coding Agent has assigned an algorithmic & systems implementation problem.
                  </span>
                </div>
              </div>
              <a
                href={`/interview/${sessionId}/code?role=${encodeURIComponent(role)}&track=${encodeURIComponent(track)}`}
                className="px-4 py-2 bg-[#1b1b1b] text-[#ffd93d] font-headline text-xs uppercase font-black hover:bg-[#ffd93d] hover:text-[#1b1b1b] transition-colors border-[2px] border-[#1b1b1b] cursor-pointer no-underline"
              >
                LAUNCH MONACO IDE &gt;
              </a>
            </div>
          )}

          {/* 2. User Input Block */}
          <div className="w-full">
            <Card
              id="user-input-card"
              shadow="md"
              bg="bg-[#ffffff]"
              badge={{
                text: 'User Input',
                variant: 'yellow',
              }}
              className="flex flex-col p-0 overflow-hidden"
            >
              {/* Textarea */}
              <div className="p-6 md:p-8 pb-4">
                <textarea
                  id="candidate-answer-input"
                  value={candidateAnswer}
                  onChange={(e) => {
                    setCandidateAnswer(e.target.value);
                    setStatusMsg('TYPING...');
                  }}
                  disabled={isSubmitting || isLoadingQuestion || isStreaming}
                  rows={7}
                  className="w-full min-h-[220px] bg-transparent font-sans text-base md:text-lg resize-y focus:outline-none focus:ring-0 border-none placeholder:text-[#4d4633]/50 leading-relaxed text-[#1b1b1b]"
                  placeholder="Type your answer here, or click VOICE_DICTATE to speak with your microphone... Use markdown if necessary."
                />
              </div>

              {/* Status and Toolbar */}
              <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t-[3px] border-[#1b1b1b] bg-[#f3f3f3] gap-3">
                {/* Word Counter & Status */}
                <div className="flex items-center gap-3 text-[#4d4633] font-mono text-xs font-bold w-full sm:w-auto justify-between sm:justify-start">
                  <span
                    id="word-count-indicator"
                    className="bg-[#ffffff] px-2.5 py-1 border-[2px] border-[#1b1b1b] text-[#1b1b1b]"
                  >
                    WORDS: {wordCount}
                  </span>
                  <span className="text-[#1b1b1b]/40">|</span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSubmitting || isStreaming
                          ? 'bg-[#ffd93d] animate-ping'
                          : 'bg-[#1b1b1b]'
                      }`}
                    ></span>
                    STATUS: {statusMsg}
                  </span>
                  {saveDraftNotice && (
                    <span className="text-[#705d00] bg-[#ffd93d] px-2 py-0.5 border border-[#1b1b1b] animate-bounce">
                      SAVED!
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 sm:gap-3 w-full sm:w-auto justify-end flex-wrap items-center">
                  <button
                    type="button"
                    onClick={handleToggleVoiceInput}
                    className={`px-3 py-1.5 border-[2px] border-[#1b1b1b] font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isListening
                        ? 'bg-[#ba1a1a] text-[#ffffff] animate-pulse'
                        : 'bg-[#ffffff] text-[#1b1b1b] hover:bg-[#ffd93d]'
                    }`}
                    title={isListening ? 'Stop voice recording' : 'Dictate answer with your voice'}
                  >
                    <span className="material-symbols-outlined text-base">
                      {isListening ? 'mic' : 'mic_none'}
                    </span>
                    <span>{isListening ? 'RECORDING...' : 'VOICE_DICTATE'}</span>
                  </button>

                  <Button
                    id="save-draft-btn"
                    variant="secondary"
                    size="sm"
                    onClick={handleSaveDraft}
                    disabled={!candidateAnswer.trim() || isSubmitting}
                    className="hidden sm:inline-flex"
                  >
                    SAVE_DRAFT
                  </Button>

                  <Button
                    id="submit-answer-btn"
                    variant="primary"
                    size="md"
                    onClick={handleSubmitAnswer}
                    disabled={!candidateAnswer.trim() || isSubmitting || isLoadingQuestion || isStreaming}
                    className="flex-1 sm:flex-none"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-[#1b1b1b] border-t-transparent animate-spin inline-block"></span>
                        PROCESSING...
                      </>
                    ) : (
                      <>
                        SUBMIT ANSWER
                        <span className="material-symbols-outlined text-base">
                          arrow_forward
                        </span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* ----------------- Abort Confirmation Modal ----------------- */}
      <Modal
        isOpen={isAbortModalOpen}
        onClose={() => setIsAbortModalOpen(false)}
        title="ABORT SESSION?"
        subtitle={`SESSION ID: ${sessionId} // ROLE: ${role}`}
        tag="SECURITY_ABORT"
        confirmLabel="CONFIRM ABORT"
        confirmVariant="danger"
        onConfirm={handleConfirmAbort}
      >
        <div className="space-y-3 font-sans text-sm text-[#4d4633] leading-relaxed">
          <p>
            Are you sure you want to abort this evaluation session early?
          </p>
          <div className="p-3 border-[2px] border-[#ba1a1a] bg-[#ffdad8] font-mono text-xs text-[#ba1a1a] font-bold">
            {'WARNING: Your current unanswered prompt will be marked incomplete.'}
          </div>
          <p className="text-xs font-mono text-[#1b1b1b]">
            Any answered rounds ({transcript.length} completed) will be preserved in your session history logs.
          </p>
        </div>
      </Modal>
    </div>
  );
};
