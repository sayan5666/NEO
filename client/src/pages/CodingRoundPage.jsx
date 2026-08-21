import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { sessionService, codeService } from '../services/api';
import { Footer } from '../components/layout/Footer';
import { VoiceInteraction } from '../components/VoiceInteraction';

const STARTER_TEMPLATES = {
  javascript: `/**
 * @param {number} capacity
 * @param {number} refillRatePerSec
 */
class TokenBucket {
  constructor(capacity, refillRatePerSec) {
    this.capacity = capacity;
    this.refillRate = refillRatePerSec;
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  /**
   * Consumes n tokens if available.
   * @param {number} tokensRequired
   * @returns {boolean}
   */
  consume(tokensRequired = 1) {
    const now = Date.now();
    const elapsedSecs = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsedSecs * this.refillRate);
    this.lastRefill = now;

    if (this.tokens >= tokensRequired) {
      this.tokens -= tokensRequired;
      return true;
    }
    return false;
  }
}

// Test harness execution
const bucket = new TokenBucket(5, 2);
console.log("Consume 3 tokens:", bucket.consume(3)); // true
console.log("Consume 3 tokens (burst check):", bucket.consume(3)); // false (insufficient)
console.log("Tokens remaining:", bucket.tokens.toFixed(2));
`,
  typescript: `interface RateLimiter {
  consume(tokens: number): boolean;
}

class TokenBucket implements RateLimiter {
  private capacity: number;
  private refillRate: number;
  private tokens: number;
  private lastRefill: number;

  constructor(capacity: number, refillRatePerSec: number) {
    this.capacity = capacity;
    this.refillRate = refillRatePerSec;
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  consume(tokensRequired: number = 1): boolean {
    const now = Date.now();
    const elapsedSecs = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsedSecs * this.refillRate);
    this.lastRefill = now;

    if (this.tokens >= tokensRequired) {
      this.tokens -= tokensRequired;
      return true;
    }
    return false;
  }
}

const limiter = new TokenBucket(10, 5);
console.log("TS TokenBucket initialized. Consume 4:", limiter.consume(4));
`,
  python: `import time

class TokenBucket:
    def __init__(self, capacity: int, refill_rate_per_sec: float):
        self.capacity = capacity
        self.refill_rate = refill_rate_per_sec
        self.tokens = float(capacity)
        self.last_refill = time.time()

    def consume(self, tokens_required: int = 1) -> bool:
        now = time.time()
        elapsed = now - self.last_refill
        self.tokens = min(float(self.capacity), self.tokens + elapsed * self.refill_rate)
        self.last_refill = now

        if self.tokens >= tokens_required:
            self.tokens -= tokens_required
            return True
        return False

if __name__ == "__main__":
    bucket = TokenBucket(capacity=5, refill_rate_per_sec=2.0)
    print("Consume 2 tokens:", bucket.consume(2))
    print("Consume 4 tokens:", bucket.consume(4))
    print("Current tokens:", round(bucket.tokens, 2))
`,
  golang: `package main

import (
	"fmt"
	"math"
	"time"
)

type TokenBucket struct {
	capacity   float64
	refillRate float64
	tokens     float64
	lastRefill time.Time
}

func NewTokenBucket(capacity, refillRate float64) *TokenBucket {
	return &TokenBucket{
		capacity:   capacity,
		refillRate: refillRate,
		tokens:     capacity,
		lastRefill: time.Now(),
	}
}

func (tb *TokenBucket) Consume(tokens float64) bool {
	now := time.Now()
	elapsed := now.Sub(tb.lastRefill).Seconds()
	tb.tokens = math.Min(tb.capacity, tb.tokens+(elapsed*tb.refillRate))
	tb.lastRefill = now

	if tb.tokens >= tokens {
		tb.tokens -= tokens
		return true
	}
	return false
}

func main() {
	tb := NewTokenBucket(5, 2)
	fmt.Printf("Consume 3: %v\\n", tb.Consume(3))
	fmt.Printf("Consume 3 (overflow check): %v\\n", tb.Consume(3))
}
`
};

export const CodingRoundPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(STARTER_TEMPLATES.javascript);
  const [stdin, setStdin] = useState('');
  const [activeTab, setActiveTab] = useState('output'); // 'output' | 'stdin' | 'notes'
  const [executionResult, setExecutionResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeInSeconds, setTimeInSeconds] = useState(15 * 60);
  const [problemDescription, setProblemDescription] = useState(
    '### 💻 Live Coding Challenge: Token Bucket Rate Limiter\n\n' +
    '**Scenario**: Implement a thread-safe and resilient `TokenBucket` algorithm for an API gateway handling high-throughput bursts.\n\n' +
    '**Requirements & Constraints**:\n' +
    '1. `capacity`: Maximum number of tokens the bucket can hold.\n' +
    '2. `refillRatePerSec`: Rate at which tokens are added to the bucket per second.\n' +
    '3. `consume(tokensRequired)`: Decrements token count and returns `true` if available; returns `false` without modifying state if insufficient tokens exist.\n' +
    '4. Must handle arbitrary sub-millisecond precision without timer drift.\n\n' +
    '**Expected Time Complexity**: $O(1)$ per consume call.\n' +
    '**Expected Space Complexity**: $O(1)$ memory allocation.'
  );

  useEffect(() => {
    const init = async () => {
      if (sessionId) {
        try {
          const s = await sessionService.getSessionById(sessionId);
          setSession(s);
          if (s?.transcript && s.transcript.length > 0) {
            const codingTurn = s.transcript.find(
              (t) => t.agent && t.agent.toLowerCase().includes('coding')
            );
            if (codingTurn && codingTurn.question) {
              setProblemDescription(codingTurn.question);
            }
          }
        } catch (e) {
          console.error(e);
        }
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

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (STARTER_TEMPLATES[newLang]) {
      setCode(STARTER_TEMPLATES[newLang]);
    }
  };

  const handleRunCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setActiveTab('output');
    try {
      const res = await codeService.executeCode({
        code,
        language,
        stdin,
      });
      setExecutionResult(res);
    } catch (err) {
      setExecutionResult({
        success: false,
        stdout: '',
        stderr: err.message || 'Execution failed',
        status: { id: 11, description: 'Runtime Error' },
        time: '0.00s',
        memory: '0 KB',
        exitCode: 1,
        engine: 'error_fallback',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async (skip = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const submissionContent = skip
        ? '[CANDIDATE SKIPPED LIVE CODING ROUND - REQUESTED HIGH-LEVEL ARCHITECTURE DISCUSSION]'
        : `\`\`\`${language}\n${code}\n\`\`\`\n\nExecution Status: ${
            executionResult?.status?.description || 'Tested via live runner'
          }\nCaptured Stdout:\n${executionResult?.stdout || 'Execution complete.'}`;

      const res = await sessionService.askAgent({
        sessionId,
        role: session?.role || 'Senior Software Engineer',
        transcript: [
          ...(session?.transcript || []),
          {
            agent: 'CODING_AGENT',
            question: problemDescription,
            answer: submissionContent,
          },
        ],
        candidateAnswer: submissionContent,
      });

      if (res.isComplete) {
        navigate(`/report/${sessionId}`);
      } else {
        // Return to standard interview view for behavioral agent round
        navigate(`/interview/${sessionId}`);
      }
    } catch (err) {
      console.error('Failed to submit coding solution:', err);
      navigate(`/interview/${sessionId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FFFDF5] text-on-surface font-sans min-h-screen flex flex-col grid-bg selection:bg-primary-container selection:text-on-surface">
      {/* Top Header Navigation */}
      <header className="w-full border-b-[3px] border-on-surface bg-surface-container-lowest px-6 py-4 flex flex-wrap justify-between items-center neo-shadow relative z-10 gap-4">
        <div className="flex items-center gap-4">
          <span
            onClick={() => navigate('/dashboard')}
            className="font-headline text-2xl font-black tracking-tighter cursor-pointer"
          >
            NEO_INTV
          </span>
          <div className="h-6 w-[3px] bg-on-surface mx-1 hidden sm:block"></div>
          <span className="font-mono text-xs md:text-sm bg-secondary text-on-secondary px-3 py-1 font-bold">
            &gt; CODING_ROUND: CODING_AGENT
          </span>
          <span className="font-mono text-xs bg-primary-container px-2.5 py-0.5 border border-on-surface font-bold hidden md:inline">
            ROLE: {session?.role || 'Senior Software Engineer'}
          </span>
        </div>

        <div className="flex items-center gap-4 font-mono text-xs md:text-sm">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="material-symbols-outlined text-[18px]">timer</span>
            ROUND_TIMER:{' '}
            <span className="text-secondary font-black font-mono">
              {formatTimer(timeInSeconds)}
            </span>
          </span>
          <button
            onClick={() => handleSubmitCode(true)}
            className="border-[3px] border-on-surface bg-surface-container-highest px-3 py-1.5 font-bold hover:bg-surface-variant transition-colors cursor-pointer text-xs"
            title="Skip coding submission and proceed to behavioral discussion"
          >
            SKIP_ROUND
          </button>
        </div>
      </header>

      {/* Main Split Grid: Problem Specification on Left, Live Monaco on Right */}
      <main className="flex-grow p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-0">
        {/* Left Column: Problem Brief & Constraints */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-surface-container-lowest neo-border neo-shadow p-6 relative flex flex-col h-full">
            <div className="flex justify-between items-center border-b-[3px] border-on-surface pb-3 mb-4">
              <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
                <span className="w-3 h-3 bg-secondary inline-block"></span>
                <span>PROBLEM_SPECIFICATION</span>
              </div>
              <VoiceInteraction
                currentQuestionText={problemDescription}
                onTranscriptUpdate={(transcriptText) => {
                  setCode((prev) => prev + `\n// Voice Note: ${transcriptText}\n`);
                }}
              />
            </div>

            <div className="overflow-y-auto max-h-[calc(100vh-280px)] pr-2 space-y-4 font-sans text-sm md:text-base leading-relaxed">
              <div className="prose prose-neutral max-w-none">
                {problemDescription.split('\n\n').map((para, i) => {
                  if (para.startsWith('###')) {
                    return (
                      <h3
                        key={i}
                        className="font-headline text-lg md:text-xl font-black text-on-surface uppercase tracking-tight mt-2 mb-3"
                      >
                        {para.replace('###', '').trim()}
                      </h3>
                    );
                  }
                  if (para.startsWith('```')) {
                    const cleanCode = para.replace(/```[a-z]*/g, '').trim();
                    return (
                      <pre
                        key={i}
                        className="bg-surface-container neo-border p-4 font-mono text-xs overflow-x-auto text-on-surface my-2"
                      >
                        <code>{cleanCode}</code>
                      </pre>
                    );
                  }
                  return (
                    <p key={i} className="text-on-surface-variant font-medium">
                      {para}
                    </p>
                  );
                })}
              </div>

              {/* Evaluation Criteria Checklist */}
              <div className="mt-6 border-t-[3px] border-on-surface pt-4">
                <span className="font-mono text-xs font-bold uppercase tracking-wider block mb-2 text-on-surface">
                  EVALUATOR_RUBRIC:
                </span>
                <ul className="space-y-1.5 font-mono text-xs text-on-surface-variant">
                  <li className="flex items-center gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span>Correctness & Handling Edge Cases (Nulls, Zeroes, Bursts)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span>Time & Space Complexity Verification (Big-O)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span>Code Modularity & Clean Structural Design</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Monaco Code Editor + Output Console */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-surface-container-lowest neo-border neo-shadow flex flex-col flex-grow">
            {/* Editor Toolbar */}
            <div className="border-b-[3px] border-on-surface p-3 bg-surface-container-low flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center gap-3">
                <label className="font-mono text-xs font-bold">LANGUAGE:</label>
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-surface-container-lowest neo-border px-3 py-1 font-mono text-xs font-bold focus:outline-none cursor-pointer"
                >
                  <option value="javascript">JavaScript (Node.js)</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python 3</option>
                  <option value="golang">Go (Golang)</option>
                </select>
                <button
                  onClick={() => setCode(STARTER_TEMPLATES[language] || '')}
                  className="font-mono text-xs font-bold px-2 py-1 neo-border bg-surface-container hover:bg-surface-variant cursor-pointer"
                  title="Reset to boilerplate code"
                >
                  RESET_CODE
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-tertiary-container neo-border font-headline text-sm uppercase text-on-surface neo-shadow font-black hover:bg-tertiary hover:text-on-tertiary transition-all cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isRunning ? 'sync' : 'play_arrow'}
                  </span>
                  <span>{isRunning ? 'RUNNING...' : 'RUN_CODE'}</span>
                </button>

                <button
                  onClick={() => handleSubmitCode(false)}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-5 py-1.5 bg-primary-container neo-border font-headline text-sm uppercase text-on-surface neo-shadow font-black hover:bg-primary hover:text-on-primary transition-all cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>{isSubmitting ? 'SUBMITTING...' : 'SUBMIT_SOLUTION'}</span>
                </button>
              </div>
            </div>

            {/* Monaco Editor Container */}
            <div className="h-[380px] w-full border-b-[3px] border-on-surface relative">
              <Editor
                height="100%"
                language={language === 'golang' ? 'go' : language}
                value={code}
                onChange={(newVal) => setCode(newVal || '')}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  fontFamily: 'JetBrains Mono, Menlo, monospace',
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                }}
              />
            </div>

            {/* Bottom Panel: Execution Output & Console */}
            <div className="flex flex-col bg-surface-container-lowest p-4">
              <div className="flex justify-between items-center border-b-[2px] border-on-surface pb-2 mb-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('output')}
                    className={`font-mono text-xs font-bold px-3 py-1 neo-border cursor-pointer transition-colors ${
                      activeTab === 'output'
                        ? 'bg-on-surface text-surface-container-lowest'
                        : 'bg-surface-container hover:bg-surface-variant'
                    }`}
                  >
                    TERMINAL_OUTPUT
                  </button>
                  <button
                    onClick={() => setActiveTab('stdin')}
                    className={`font-mono text-xs font-bold px-3 py-1 neo-border cursor-pointer transition-colors ${
                      activeTab === 'stdin'
                        ? 'bg-on-surface text-surface-container-lowest'
                        : 'bg-surface-container hover:bg-surface-variant'
                    }`}
                  >
                    CUSTOM_STDIN
                  </button>
                </div>

                {executionResult && (
                  <div className="flex items-center gap-3 font-mono text-xs font-bold">
                    <span
                      className={`px-2 py-0.5 border border-on-surface ${
                        executionResult.success
                          ? 'bg-primary-container text-on-surface'
                          : 'bg-error-container text-error'
                      }`}
                    >
                      {executionResult.status?.description?.toUpperCase() || 'ACCEPTED'}
                    </span>
                    <span className="text-on-surface-variant hidden sm:inline">
                      TIME: {executionResult.time || '0.04s'}
                    </span>
                    <span className="text-on-surface-variant hidden md:inline">
                      ENGINE: {executionResult.engine || 'sandbox'}
                    </span>
                  </div>
                )}
              </div>

              {activeTab === 'output' ? (
                <div className="bg-[#1e1e1e] text-[#d4d4d4] font-mono text-xs p-4 rounded-none h-36 overflow-y-auto neo-border select-text">
                  {executionResult ? (
                    <>
                      {executionResult.stdout && (
                        <div className="whitespace-pre-wrap text-emerald-400">
                          {executionResult.stdout}
                        </div>
                      )}
                      {executionResult.stderr && (
                        <div className="whitespace-pre-wrap text-rose-400 mt-2">
                          {executionResult.stderr}
                        </div>
                      )}
                      {!executionResult.stdout && !executionResult.stderr && (
                        <div className="text-neutral-500">[Program finished with exit code 0]</div>
                      )}
                    </>
                  ) : (
                    <div className="text-neutral-500">
                      &gt; Press &quot;RUN_CODE&quot; to execute your program against the sandbox runner.
                    </div>
                  )}
                </div>
              ) : (
                <textarea
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  placeholder="Enter custom standard input values passed to stdin..."
                  className="w-full h-36 p-3 bg-surface-container neo-border font-mono text-xs focus:outline-none resize-none"
                />
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
