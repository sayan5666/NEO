import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopHeader } from '../components/layout/TopHeader';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { NewInterviewModal } from '../components/modals/NewInterviewModal';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="bg-[#FFFDF5] text-on-surface min-h-screen font-sans overflow-x-hidden flex flex-col">
      <TopHeader onStartSession={() => setModalOpen(true)} />

      <main className="w-full flex-1">
        {/* Hero Section */}
        <section className="w-full py-16 md:py-[120px] px-6 md:px-12 border-b-[3px] border-on-surface relative overflow-hidden">
          {/* Asymmetric decorative elements */}
          <div className="absolute top-10 right-10 w-32 h-32 border-[3px] border-on-surface bg-surface-container-low neo-shadow transform rotate-12 hidden md:block z-0 pointer-events-none"></div>
          <div className="absolute bottom-10 left-10 w-24 h-24 border-[3px] border-on-surface bg-tertiary-container neo-shadow transform -rotate-6 hidden md:block z-0 pointer-events-none"></div>

          <div className="max-w-6xl mx-auto flex flex-col items-start gap-6 relative z-10">
            <div className="bg-surface-container-highest border-[3px] border-on-surface px-3 py-1 inline-block mb-2">
              <span className="font-mono text-xs uppercase tracking-widest text-on-surface-variant font-bold">
                SYS_MSG // V_2.4.1
              </span>
            </div>

            <h1 className="font-headline text-4xl sm:text-5xl md:text-[64px] font-black text-on-surface max-w-4xl uppercase leading-none tracking-tight">
              PRACTICE INTERVIEWS. <br />
              GET DESTROYED. <br />
              GET BETTER.
            </h1>

            <p className="font-sans text-lg md:text-xl text-on-surface-variant max-w-2xl mt-4 leading-relaxed font-medium">
              Stop pretending. Our AI agents are designed to expose your weaknesses before the real recruiters do. Prepare for technical, behavioral, and screening rounds with uncompromising feedback.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button
                variant="primary"
                onClick={() => setModalOpen(true)}
                className="px-8 py-4 font-headline text-lg font-black tracking-wide flex items-center justify-center gap-3"
              >
                START FREE INTERVIEW
                <span className="material-symbols-outlined text-2xl font-bold">arrow_forward</span>
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 font-mono text-sm font-bold flex items-center justify-center"
              >
                VIEW DASHBOARD
              </Button>
            </div>
          </div>
        </section>

        {/* Feature Section (Bento Grid) */}
        <section id="squad" className="w-full py-16 px-6 md:px-12 bg-surface-container-low border-b-[3px] border-on-surface">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-end mb-8">
              <h2 className="font-headline text-3xl md:text-5xl font-black text-on-surface uppercase tracking-tight">
                THE SQUAD
              </h2>
              <span className="font-mono text-xs font-bold bg-on-surface text-surface-container-lowest px-3 py-1.5 uppercase hidden sm:block">
                SELECT_AGENT
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Screening Agent */}
              <div className="md:col-span-6 border-[3px] border-on-surface bg-surface-container-lowest neo-shadow p-6 flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 bg-surface-variant border-l-[3px] border-b-[3px] border-on-surface z-10">
                  <span className="font-mono text-xs font-bold">ID: 01</span>
                </div>
                <div className="mb-auto z-10 relative">
                  <span className="material-symbols-outlined text-[48px] mb-3 text-on-surface" style={{ fontVariationSettings: "'FILL' 1" }}>
                    person_search
                  </span>
                  <h3 className="font-headline text-2xl font-bold uppercase mb-2">Screening</h3>
                  <p className="font-sans text-base text-on-surface-variant leading-relaxed">
                    Filters the noise. Asks the standard HR questions to gauge basic fit and red flags.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t-[3px] border-on-surface flex gap-2 flex-wrap z-10 relative">
                  <span className="border-[2px] border-on-surface px-2 py-0.5 font-mono text-xs uppercase bg-surface-variant font-bold">
                    HR_ROUND
                  </span>
                  <span className="border-[2px] border-on-surface px-2 py-0.5 font-mono text-xs uppercase bg-surface-variant font-bold">
                    CULTURE_FIT
                  </span>
                </div>
              </div>

              {/* Technical Agent */}
              <div className="md:col-span-6 border-[3px] border-on-surface bg-primary-container neo-shadow p-6 flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 bg-surface-variant border-l-[3px] border-b-[3px] border-on-surface z-10">
                  <span className="font-mono text-xs font-bold">ID: 02</span>
                </div>
                <div className="mb-auto z-10 relative">
                  <span className="material-symbols-outlined text-[48px] mb-3 text-on-surface" style={{ fontVariationSettings: "'FILL' 1" }}>
                    code
                  </span>
                  <h3 className="font-headline text-2xl font-bold uppercase mb-2">Technical</h3>
                  <p className="font-sans text-base text-on-surface-variant leading-relaxed">
                    Unforgiving coding challenges and system design drills. Prepares you for the worst.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t-[3px] border-on-surface flex gap-2 flex-wrap z-10 relative">
                  <span className="border-[2px] border-on-surface px-2 py-0.5 font-mono text-xs uppercase bg-surface-container-lowest font-bold">
                    ALGO
                  </span>
                  <span className="border-[2px] border-on-surface px-2 py-0.5 font-mono text-xs uppercase bg-surface-container-lowest font-bold">
                    SYS_DESIGN
                  </span>
                </div>
              </div>

              {/* Behavioral Agent */}
              <div className="md:col-span-4 border-[3px] border-on-surface bg-tertiary-container neo-shadow p-6 flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 bg-surface-variant border-l-[3px] border-b-[3px] border-on-surface z-10">
                  <span className="font-mono text-xs font-bold">ID: 03</span>
                </div>
                <div className="mb-auto z-10 relative">
                  <span className="material-symbols-outlined text-[48px] mb-3 text-on-surface" style={{ fontVariationSettings: "'FILL' 1" }}>
                    psychology
                  </span>
                  <h3 className="font-headline text-2xl font-bold uppercase mb-2">Behavioral</h3>
                  <p className="font-sans text-base text-on-surface-variant leading-relaxed">
                    STAR method enforcer. Digs into your past conflicts and leadership scenarios.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t-[3px] border-on-surface flex gap-2 flex-wrap z-10 relative">
                  <span className="border-[2px] border-on-surface px-2 py-0.5 font-mono text-xs uppercase bg-surface-container-lowest font-bold">
                    STAR
                  </span>
                  <span className="border-[2px] border-on-surface px-2 py-0.5 font-mono text-xs uppercase bg-surface-container-lowest font-bold">
                    SOFT_SKILLS
                  </span>
                </div>
              </div>

              {/* Evaluator Agent */}
              <div className="md:col-span-8 border-[3px] border-on-surface bg-surface-container-lowest neo-shadow p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden group items-center">
                <div className="absolute top-0 right-0 p-2 bg-surface-variant border-l-[3px] border-b-[3px] border-on-surface z-10">
                  <span className="font-mono text-xs font-bold">ID: 04</span>
                </div>
                <div className="flex-1 z-10 relative w-full">
                  <span className="material-symbols-outlined text-[48px] mb-3 text-on-surface" style={{ fontVariationSettings: "'FILL' 1" }}>
                    analytics
                  </span>
                  <h3 className="font-headline text-2xl font-bold uppercase mb-2">Evaluator</h3>
                  <p className="font-sans text-base text-on-surface-variant leading-relaxed">
                    The final boss. Reviews your overall performance, provides a score, and pinpoints exact areas for improvement.
                  </p>
                  <div className="mt-6 pt-4 border-t-[3px] border-on-surface flex gap-2 flex-wrap">
                    <span className="border-[2px] border-on-surface px-2 py-0.5 font-mono text-xs uppercase bg-surface-variant font-bold">
                      METRICS
                    </span>
                    <span className="border-[2px] border-on-surface px-2 py-0.5 font-mono text-xs uppercase bg-surface-variant font-bold">
                      FEEDBACK
                    </span>
                  </div>
                </div>
                <div className="hidden md:flex w-32 h-32 border-[3px] border-on-surface bg-surface-variant items-center justify-center neo-shadow shrink-0">
                  <span className="font-headline text-5xl font-black text-on-surface">99</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <NewInterviewModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};
