import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SidebarNav } from '../components/layout/SidebarNav';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { sessionService } from '../services/api';
import { NewInterviewModal } from '../components/modals/NewInterviewModal';

export const ReportPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const data = await sessionService.getReport(sessionId || '9X-A7B');
        setReport(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [sessionId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center font-mono text-base font-bold">
        GENERATING_CRITIQUE_REPORT...
      </div>
    );
  }

  const score = report?.score || 82;
  const isRecommended = score >= 70;

  return (
    <div className="bg-[#FFFDF5] text-on-surface font-sans min-h-screen flex flex-col md:flex-row selection:bg-primary-container selection:text-on-surface">
      {/* Mobile Nav */}
      <nav className="md:hidden flex justify-between items-center w-full px-4 py-3 bg-surface border-b-[3px] border-on-surface sticky top-0 z-30">
        <span className="font-headline text-xl font-black">NEO_INTV</span>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
          NEW_INTERVIEW
        </Button>
      </nav>

      <SidebarNav onStartSession={() => setModalOpen(true)} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-6 md:p-12 flex-grow max-w-[1440px] w-full mx-auto">
          {/* Header Section */}
          <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-[3px] border-on-surface pb-6 mb-8">
            <div>
              <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-on-surface mb-2">
                EVALUATOR_CRITIQUE
              </h1>
              <div className="flex flex-wrap gap-2 font-mono text-xs font-bold">
                <span className="neo-border px-2.5 py-1 bg-tertiary-fixed">
                  ID: {report?.sessionId || '9X-A7B'}
                </span>
                <span className="neo-border px-2.5 py-1 bg-surface-variant uppercase">
                  ROLE: {report?.role || 'SENIOR_ENGINEER'}
                </span>
                <span className="neo-border px-2.5 py-1 bg-secondary-fixed">
                  DATE: {report?.date || '2024.10.27'}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => navigate(`/report/${sessionId || '9X-A7B'}/critique`)}
                className="px-4 py-2.5 text-xs font-mono font-bold"
              >
                VIEW CRITIQUE DETAIL &rarr;
              </Button>
              <Button
                variant="primary"
                onClick={handlePrint}
                className="px-6 py-2.5 text-sm font-black flex items-center gap-2"
              >
                DOWNLOAD PDF
                <span className="material-symbols-outlined text-base">download</span>
              </Button>
            </div>
          </section>

          {/* Top Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
            {/* Verdict Card (Hero) */}
            <div className="col-span-1 md:col-span-8 bg-primary-container neo-border neo-shadow p-6 md:p-8 flex flex-col justify-between min-h-[260px]">
              <h3 className="font-headline text-2xl font-bold uppercase text-on-surface">
                The Verdict
              </h3>
              <div className="flex flex-col md:flex-row items-baseline gap-4 mt-auto">
                <span className="text-[90px] md:text-[140px] font-headline font-black leading-none text-on-surface tracking-tighter">
                  {score}
                </span>
                <div className="flex flex-col">
                  <span className="text-3xl md:text-4xl font-headline font-black uppercase text-on-surface">
                    {isRecommended ? 'RECOMMENDED' : 'NOT QUALIFIED'}
                  </span>
                  <span className="font-mono text-xs md:text-sm text-on-surface mt-1 font-bold">
                    {isRecommended ? '[SYSTEM_PASS_THRESHOLD_MET]' : '[BELOW_BENCHMARK]'}
                  </span>
                </div>
              </div>
            </div>

            {/* Sentiment Analysis */}
            <div className="col-span-1 md:col-span-4 bg-surface-container-lowest neo-border neo-shadow p-6 flex flex-col justify-between">
              <h3 className="font-headline text-xl font-bold uppercase text-on-surface mb-3 border-b-[3px] border-on-surface pb-2">
                Sentiment
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between font-mono text-xs font-bold mb-1">
                    <span>CONFIDENCE</span>
                    <span>85%</span>
                  </div>
                  <div className="w-full h-7 neo-border bg-surface-variant relative">
                    <div
                      className="absolute top-0 left-0 h-full bg-secondary-fixed border-r-[3px] border-on-surface"
                      style={{ width: '85%' }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-mono text-xs font-bold mb-1">
                    <span>AGGRESSION</span>
                    <span>42%</span>
                  </div>
                  <div className="w-full h-7 neo-border bg-surface-variant relative">
                    <div
                      className="absolute top-0 left-0 h-full bg-secondary-container border-r-[3px] border-on-surface"
                      style={{ width: '42%' }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-mono text-xs font-bold mb-1">
                    <span>CLARITY</span>
                    <span>91%</span>
                  </div>
                  <div className="w-full h-7 neo-border bg-surface-variant relative">
                    <div
                      className="absolute top-0 left-0 h-full bg-tertiary-fixed border-r-[3px] border-on-surface"
                      style={{ width: '91%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Strengths */}
            <div className="bg-surface-container-lowest neo-border neo-shadow p-6">
              <h3 className="font-headline text-xl font-bold uppercase text-on-surface border-b-[3px] border-on-surface pb-2 mb-4 flex items-center justify-between">
                STRENGTHS
                <span className="material-symbols-outlined text-primary-container bg-on-surface p-1 text-sm font-bold">
                  add
                </span>
              </h3>
              <ul className="space-y-3">
                {(report?.strengths || []).map((s, idx) => (
                  <li key={idx} className="pb-3 border-b-[2px] border-on-surface/20 last:border-b-0 flex items-start gap-3">
                    <span className="font-mono text-xs font-bold text-on-surface mt-0.5">
                      0{idx + 1}
                    </span>
                    <span className="font-sans text-sm md:text-base leading-relaxed text-on-surface">
                      {s}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-surface-container-low neo-border neo-shadow p-6">
              <h3 className="font-headline text-xl font-bold uppercase text-on-surface border-b-[3px] border-on-surface pb-2 mb-4 flex items-center justify-between">
                WEAKNESSES
                <span className="material-symbols-outlined text-secondary-container bg-on-surface p-1 text-sm font-bold">
                  remove
                </span>
              </h3>
              <ul className="space-y-3">
                {(report?.weaknesses || []).map((w, idx) => (
                  <li key={idx} className="pb-3 border-b-[2px] border-on-surface/20 last:border-b-0 flex items-start gap-3">
                    <span className="font-mono text-xs font-bold text-on-surface mt-0.5">
                      0{idx + 1}
                    </span>
                    <span className="font-sans text-sm md:text-base leading-relaxed text-on-surface">
                      {w}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Category Metrics */}
          <div className="bg-surface-container-lowest neo-border neo-shadow p-6 mb-8">
            <h3 className="font-headline text-2xl font-bold uppercase text-on-surface border-b-[3px] border-on-surface pb-2 mb-6">
              CATEGORY_METRICS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <div className="flex justify-between font-mono text-xs font-bold mb-1.5">
                  <span>PROBLEM_SOLVING</span>
                  <span>90%</span>
                </div>
                <div className="w-full h-8 neo-border bg-surface-dim relative">
                  <div className="h-full bg-primary-container border-r-[3px] border-on-surface" style={{ width: '90%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-mono text-xs font-bold mb-1.5">
                  <span>COMMUNICATION</span>
                  <span>75%</span>
                </div>
                <div className="w-full h-8 neo-border bg-surface-dim relative">
                  <div className="h-full bg-tertiary-container border-r-[3px] border-on-surface" style={{ width: '75%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-mono text-xs font-bold mb-1.5">
                  <span>SYSTEM_DESIGN</span>
                  <span>85%</span>
                </div>
                <div className="w-full h-8 neo-border bg-surface-dim relative">
                  <div className="h-full bg-primary-container border-r-[3px] border-on-surface" style={{ width: '85%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-mono text-xs font-bold mb-1.5">
                  <span>CODE_QUALITY</span>
                  <span>60%</span>
                </div>
                <div className="w-full h-8 neo-border bg-surface-dim relative">
                  <div className="h-full bg-secondary-container border-r-[3px] border-on-surface" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Observations & Transcript Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
            <div className="md:col-span-6 flex flex-col gap-4">
              <h3 className="font-headline text-2xl font-bold uppercase text-on-surface">
                Key Observations
              </h3>
              {(report?.observations || []).map((obs, idx) => (
                <div key={idx} className="bg-surface-bright neo-border neo-shadow p-4">
                  <div className={`font-mono text-xs text-on-surface mb-2 ${obs.tagBg} inline-block px-2 py-0.5 neo-border font-bold`}>
                    [{obs.id}]
                  </div>
                  <p className="font-sans text-sm md:text-base leading-relaxed text-on-surface">
                    {obs.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="md:col-span-6 flex flex-col">
              <h3 className="font-headline text-2xl font-bold uppercase text-on-surface mb-4">
                Transcript Snippets
              </h3>
              <div className="bg-[#1b1b1b] text-[#f9f9f9] neo-border neo-shadow p-6 flex-1 flex flex-col gap-5 font-mono text-xs leading-relaxed">
                {(report?.transcriptSnippets || []).map((snip, idx) => (
                  <div key={idx} className={`border-l-[3px] border-${snip.color} pl-3`}>
                    <div className="text-primary-container mb-1 font-bold">
                      &gt; TIMESTAMP_{snip.timestamp} [FLAG: {snip.flag}]
                    </div>
                    <div className="opacity-90 font-sans text-sm">
                      &ldquo;{snip.quote}&rdquo;
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </main>

      <NewInterviewModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};
