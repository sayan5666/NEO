import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionService } from '../services/api';
import { Footer } from '../components/layout/Footer';
import { VoiceInteraction } from '../components/VoiceInteraction';

export const InterviewPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [currentAgent, setCurrentAgent] = useState('TECHNICAL_AGENT');
  const [currentQuestion, setCurrentQuestion] = useState(
    'Please explain the conceptual differences between a microservices architecture and a monolithic architecture, specifically detailing the trade-offs regarding deployment complexity and inter-service communication latency in high-throughput environments.'
  );
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [transcript, setTranscript] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeInSeconds, setTimeInSeconds] = useState(12 * 60 + 45);
  const [statusMsg, setStatusMsg] = useState('TYPING...');

  useEffect(() => {
    const init = async () => {
      if (sessionId) {
        const s = await sessionService.getSessionById(sessionId);
        setSession(s);
      }
    };
    init();
  }, [sessionId]);

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeInSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder.toString().padStart(2, '0')}`;
  };

  const wordCount = candidateAnswer.trim() ? candidateAnswer.trim().split(/\s+/).length : 0;

  const isCodingAgent = currentAgent.includes('CODING') || currentQuestion.toLowerCase().includes('live coding challenge');

  const handleSubmitAnswer = async () => {
    if (!candidateAnswer.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setStatusMsg('SUBMITTING TO EVALUATOR...');

    try {
      const updatedTranscript = [
        ...transcript,
        {
          agent: currentAgent,
          question: currentQuestion,
          answer: candidateAnswer.trim(),
        },
      ];
      setTranscript(updatedTranscript);

      const res = await sessionService.askAgent({
        sessionId,
        role: session?.role || 'Senior Backend Engineer',
        transcript: updatedTranscript,
        candidateAnswer: candidateAnswer.trim(),
      });

      if (res.isComplete) {
        navigate(`/report/${sessionId}`);
      } else {
        if (res.agent && res.agent.toLowerCase().includes('coding')) {
          navigate(`/interview/${sessionId}/code`);
          return;
        }

        setCurrentQuestion(res.nextQuestion || 'How would you architect circuit breakers and cache invalidation strategies in this topology?');
        if (res.agent) {
          setCurrentAgent(res.agent.toUpperCase().replace('AGENT', '_AGENT'));
        }
        setCandidateAnswer('');
        setStatusMsg('AWAITING CANDIDATE INPUT');
      }
    } catch (err) {
      console.error(err);
      setStatusMsg('ERROR SUBMITTING. RETRY.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FFFDF5] text-on-surface font-sans min-h-screen flex flex-col grid-bg selection:bg-primary-container selection:text-on-surface">
      {/* Top Navigation */}
      <header className="w-full border-b-[3px] border-on-surface bg-surface-container-lowest px-6 py-4 flex flex-wrap justify-between items-center neo-shadow relative z-10 gap-3">
        <div className="flex items-center gap-4">
          <span
            onClick={() => navigate('/dashboard')}
            className="font-headline text-2xl font-black tracking-tighter cursor-pointer"
          >
            NEO_INTV
          </span>
          <div className="h-6 w-[3px] bg-on-surface mx-2 hidden sm:block"></div>
          <span className="font-mono text-xs md:text-sm bg-on-surface text-surface-container-lowest px-3 py-1 font-bold">
            &gt; {currentAgent}
          </span>
        </div>
        <div className="flex gap-4 font-mono text-xs md:text-sm items-center">
          <button
            onClick={() => navigate(`/interview/${sessionId}/code`)}
            className="border-[3px] border-on-surface bg-primary-container px-3 py-1 font-headline text-xs font-black hover:bg-primary hover:text-on-primary transition-colors cursor-pointer flex items-center gap-1.5"
            title="Open Monaco In-Browser Code Editor"
          >
            <span className="material-symbols-outlined text-[16px]">code</span>
            <span>OPEN_CODE_IDE</span>
          </button>
          <span className="flex items-center gap-1.5 font-bold">
            <span className="material-symbols-outlined text-[18px]">timer</span>
            TIME_REMAINING:{' '}
            <span className="text-secondary font-black font-mono">
              {formatTimer(timeInSeconds)}
            </span>
          </span>
          <button
            onClick={() => navigate('/dashboard')}
            className="border-[3px] border-on-surface bg-surface-container-lowest px-4 py-1.5 font-bold hover:bg-surface-variant transition-colors cursor-pointer"
          >
            ABORT
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 md:p-12 relative z-0">
        <div className="w-full max-w-4xl flex flex-col gap-8">
          {/* Coding Challenge Banner Alert if Active */}
          {isCodingAgent && (
            <div className="bg-secondary-container neo-border neo-shadow p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-secondary">terminal</span>
                <div>
                  <span className="font-headline font-black text-sm block">
                    STAGE: LIVE CODING CHALLENGE
                  </span>
                  <span className="font-sans text-xs text-on-surface-variant">
                    You have been assigned an algorithmic & systems implementation challenge.
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate(`/interview/${sessionId}/code`)}
                className="px-4 py-2 bg-on-surface text-surface-container-lowest font-headline text-xs uppercase font-black hover:bg-surface-variant hover:text-on-surface transition-colors neo-shadow cursor-pointer"
              >
                LAUNCH MONACO IDE &gt;
              </button>
            </div>
          )}

          {/* AI Question Block */}
          <div className="w-full relative">
            <div className="absolute -top-3 -left-3 font-mono text-xs bg-tertiary text-on-tertiary px-2.5 py-1 neo-border z-10 uppercase font-bold">
              System Output
            </div>
            <div className="bg-surface-container-lowest neo-border neo-shadow p-6 md:p-8 relative mt-3">
              <p className="font-sans text-lg md:text-xl font-medium leading-relaxed mb-6 whitespace-pre-wrap">
                {currentQuestion}
              </p>
              <div className="flex justify-between items-center border-t-[3px] border-on-surface pt-4 flex-wrap gap-2">
                <span className="font-mono text-xs text-on-surface-variant font-bold">
                  ACTIVE_INTERVIEWER: {currentAgent}
                </span>
                <VoiceInteraction
                  currentQuestionText={currentQuestion}
                  onTranscriptUpdate={(newVoiceText) => {
                    setCandidateAnswer((prev) => (prev ? prev + ' ' + newVoiceText : newVoiceText));
                    setStatusMsg('VOICE_RECORDING_CAPTURED');
                  }}
                />
              </div>
            </div>
          </div>

          {/* User Answer Block */}
          <div className="w-full relative">
            <div className="absolute -top-3 -left-3 font-mono text-xs bg-primary-container text-on-surface px-2.5 py-1 neo-border z-10 uppercase font-bold">
              User Input
            </div>
            <div className="bg-surface-container-lowest neo-border neo-shadow relative mt-3 flex flex-col">
              <textarea
                value={candidateAnswer}
                onChange={(e) => {
                  setCandidateAnswer(e.target.value);
                  setStatusMsg('TYPING...');
                }}
                className="w-full min-h-[220px] p-6 md:p-8 bg-transparent font-sans text-base md:text-lg resize-y focus:outline-none focus:ring-0 border-none placeholder:text-on-surface-variant/50 leading-relaxed"
                placeholder="Type your answer here, or click VOICE_DICTATE to speak your answer with your microphone..."
              />
              <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t-[3px] border-on-surface bg-surface-container-low gap-3">
                <div className="flex gap-3 text-on-surface-variant font-mono text-xs font-bold">
                  <span>WORDS: {wordCount}</span>
                  <span>|</span>
                  <span>STATUS: {statusMsg}</span>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setStatusMsg('DRAFT_SAVED')}
                    className="px-4 py-2 bg-surface-container-highest neo-border font-mono text-xs font-bold hover:bg-surface-variant transition-colors hidden sm:block cursor-pointer"
                  >
                    SAVE_DRAFT
                  </button>
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={isSubmitting || !candidateAnswer.trim()}
                    className="flex-1 sm:flex-none px-6 py-2.5 bg-primary-container neo-border font-headline text-base md:text-lg uppercase text-on-surface neo-shadow neo-btn font-black transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'PROCESSING...' : 'SUBMIT ANSWER'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

