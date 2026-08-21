'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { FullReport, defaultReport } from '@/lib/reportStore';
import { exportElementToPdf } from '@/lib/pdfExport';

export default function EvaluatorCritiquePage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = (params?.sessionId as string) || '9X-A7B';

  const [report, setReport] = useState<FullReport>(defaultReport);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/reports/${sessionId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && isMounted) {
            setReport(json.data);
          }
        }
      } catch (err) {
        console.warn('Failed to load critique report, using default:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchReport();
    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    try {
      await exportElementToPdf('printable-critique-container', `critique_detail_${sessionId}.pdf`);
    } finally {
      setIsExporting(false);
    }
  };

  const score = report.overallScore ?? 82;
  const isRecommended = score >= 70;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center font-mono text-base font-bold text-[#1b1b1b]">
        <div className="p-8 neo-border bg-[#ffffff] neo-shadow flex items-center gap-3">
          <span className="material-symbols-outlined text-2xl animate-spin text-[#1b1b1b]">sync</span>
          <span>LOADING_CRITIQUE_DRILLDOWN // {sessionId}...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFDF5] text-[#1b1b1b] font-sans min-h-screen flex flex-col md:flex-row selection:bg-[#ffd93d] selection:text-[#1b1b1b]">
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col h-screen w-64 border-r-[3px] border-[#1b1b1b] bg-[#f3f3f3] p-4 space-y-4 shadow-[6px_0px_0px_0px_rgba(0,0,0,1)] sticky top-0 shrink-0 z-20">
        <div className="mb-2">
          <Link
            href={`/report/${sessionId}`}
            className="flex items-center gap-2 font-mono text-xs font-black uppercase text-[#1b1b1b] hover:bg-[#ffd93d] p-2.5 border-[2px] border-[#1b1b1b] bg-[#ffffff] neo-shadow-sm transition-all"
          >
            <span>&larr;</span> BACK_TO_SUMMARY
          </Link>
        </div>

        <div className="border-[3px] border-[#1b1b1b] p-4 bg-[#ffffff] neo-shadow-sm">
          <span className="font-mono text-[10px] uppercase font-bold text-[#4d4633] block mb-1">
            {'// DRILL_DOWN'}
          </span>
          <div className="font-headline text-2xl font-black uppercase text-[#625595]">
            CRITIQUE_DETAIL
          </div>
          <div className="font-mono text-xs text-[#4d4633] mt-2 font-bold">
            ID: <span className="text-[#1b1b1b]">{report.sessionId}</span>
          </div>
          <div className="font-mono text-[11px] text-[#4d4633] uppercase mt-1">
            ROLE: <span className="font-bold text-[#1b1b1b]">{report.role}</span>
          </div>
        </div>

        <nav className="space-y-2 font-mono text-xs font-bold pt-4 border-t-[2px] border-[#1b1b1b]">
          <a
            href="#verdict-sentiment"
            className="block p-2.5 bg-[#ffd93d] border-[2px] border-[#1b1b1b] text-[#1b1b1b] neo-shadow-sm"
          >
            01 // VERDICT & SENTIMENT
          </a>
          <a
            href="#observations"
            className="block p-2.5 bg-[#ffffff] border-[2px] border-[#1b1b1b] text-[#1b1b1b] hover:bg-[#ffd93d] transition-all"
          >
            02 // KEY OBSERVATIONS
          </a>
          <a
            href="#transcript-snippets"
            className="block p-2.5 bg-[#ffffff] border-[2px] border-[#1b1b1b] text-[#1b1b1b] hover:bg-[#ffd93d] transition-all"
          >
            03 // TRANSCRIPT SNIPPETS
          </a>
          <Link
            href="/"
            className="block p-2.5 bg-[#ffffff] border-[2px] border-[#1b1b1b] text-[#1b1b1b] hover:bg-[#ffd93d] transition-all"
          >
            04 // DASHBOARD_HOME
          </Link>
        </nav>

        <div className="mt-auto pt-4 border-t-[2px] border-[#1b1b1b]">
          <Button
            variant="dark"
            size="sm"
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">download</span>
            {isExporting ? 'GENERATING...' : 'EXPORT_PDF'}
          </Button>
        </div>
      </aside>

      {/* Main Printable Content Container */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div id="printable-critique-container" className="p-6 md:p-12 flex-grow max-w-[1440px] w-full mx-auto space-y-8">
          
          {/* Header Section */}
          <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-[3px] border-[#1b1b1b] pb-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2 font-mono text-xs font-bold">
                <Tag variant="pink" size="sm">ID: {report.sessionId}</Tag>
                <Tag variant="yellow" size="sm">ROLE: {report.role}</Tag>
                <Tag variant="gray" size="sm">DATE: {report.date || '2024.10.27'}</Tag>
              </div>
              <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-[#1b1b1b]">
                EVALUATOR_CRITIQUE
              </h1>
              <p className="font-mono text-xs md:text-sm text-[#4d4633] mt-1 font-bold">
                DEEP LINGUISTIC DRILL-DOWN &amp; FLAGGED TRANSCRIPT LOGS
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                onClick={() => router.push(`/report/${sessionId}`)}
                className="px-4 py-2.5 text-xs font-mono font-bold"
              >
                &larr; RETURN TO REPORT
              </Button>
              <Button
                variant="primary"
                onClick={handleDownloadPdf}
                disabled={isExporting}
                className="px-6 py-2.5 text-sm font-black flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                {isExporting ? 'EXPORTING PDF...' : 'DOWNLOAD PDF'}
              </Button>
            </div>
          </section>

          {/* Top Bento Grid: Verdict Card & Sentiment Analysis */}
          <section id="verdict-sentiment" className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* The Verdict Hero Card */}
            <div className="col-span-1 md:col-span-8 bg-[#ffd93d] border-[3px] border-[#1b1b1b] p-6 md:p-8 neo-shadow flex flex-col justify-between min-h-[260px]">
              <h3 className="font-headline text-2xl font-bold uppercase text-[#1b1b1b]">
                The Verdict
              </h3>
              <div className="flex flex-col md:flex-row items-baseline gap-4 mt-auto">
                <span className="text-[90px] md:text-[140px] font-headline font-black leading-none text-[#1b1b1b] tracking-tighter">
                  {score}
                </span>
                <div className="flex flex-col">
                  <span className="text-3xl md:text-4xl font-headline font-black uppercase text-[#1b1b1b]">
                    {report.verdict || (isRecommended ? 'RECOMMENDED' : 'NOT QUALIFIED')}
                  </span>
                  <span className="font-mono text-xs md:text-sm text-[#1b1b1b] mt-1 font-bold">
                    {report.verdictSubtitle || (isRecommended ? '[SYSTEM_PASS_THRESHOLD_MET]' : '[BELOW_BENCHMARK]')}
                  </span>
                </div>
              </div>
            </div>

            {/* Sentiment Analysis Bars */}
            <div className="col-span-1 md:col-span-4 bg-[#ffffff] border-[3px] border-[#1b1b1b] neo-shadow p-6 flex flex-col justify-between">
              <h3 className="font-headline text-xl font-bold uppercase text-[#1b1b1b] mb-3 border-b-[3px] border-[#1b1b1b] pb-2">
                Sentiment
              </h3>
              <div className="space-y-4">
                {/* Confidence */}
                <div>
                  <div className="flex justify-between font-mono text-xs font-bold mb-1 text-[#1b1b1b]">
                    <span>CONFIDENCE</span>
                    <span>{report.sentiment?.confidence || 85}%</span>
                  </div>
                  <div className="w-full h-7 border-[3px] border-[#1b1b1b] bg-[#e2e2e2] relative overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-[#e0d6ff] border-r-[3px] border-[#1b1b1b] transition-all duration-500"
                      style={{ width: `${report.sentiment?.confidence || 85}%` }}
                    />
                  </div>
                </div>

                {/* Aggression */}
                <div>
                  <div className="flex justify-between font-mono text-xs font-bold mb-1 text-[#1b1b1b]">
                    <span>AGGRESSION</span>
                    <span>{report.sentiment?.aggression || 42}%</span>
                  </div>
                  <div className="w-full h-7 border-[3px] border-[#1b1b1b] bg-[#e2e2e2] relative overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-[#ffdad8] border-r-[3px] border-[#1b1b1b] transition-all duration-500"
                      style={{ width: `${report.sentiment?.aggression || 42}%` }}
                    />
                  </div>
                </div>

                {/* Clarity */}
                <div>
                  <div className="flex justify-between font-mono text-xs font-bold mb-1 text-[#1b1b1b]">
                    <span>CLARITY</span>
                    <span>{report.sentiment?.clarity || 91}%</span>
                  </div>
                  <div className="w-full h-7 border-[3px] border-[#1b1b1b] bg-[#e2e2e2] relative overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-[#ffd93d] border-r-[3px] border-[#1b1b1b] transition-all duration-500"
                      style={{ width: `${report.sentiment?.clarity || 91}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Key Observations & Highlighted Transcript Snippets */}
          <section id="observations" className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Key Observations */}
            <div className="md:col-span-6 flex flex-col gap-4">
              <h3 className="font-headline text-2xl font-bold uppercase text-[#1b1b1b]">
                Key Observations
              </h3>
              {(report.observations || []).map((obs, idx) => (
                <div key={idx} className="bg-[#ffffff] border-[3px] border-[#1b1b1b] neo-shadow p-5">
                  <div className="font-mono text-xs text-[#1b1b1b] mb-2 bg-[#ffd93d] inline-block px-2.5 py-0.5 border-[2px] border-[#1b1b1b] font-bold">
                    [{obs.id || `OBS_0${idx + 1}`}]
                  </div>
                  <p className="font-sans text-sm md:text-base leading-relaxed text-[#1b1b1b]">
                    {obs.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Transcript Snippets with Badges */}
            <div id="transcript-snippets" className="md:col-span-6 flex flex-col">
              <h3 className="font-headline text-2xl font-bold uppercase text-[#1b1b1b] mb-4">
                Transcript Snippets
              </h3>
              <div className="bg-[#1b1b1b] text-[#f9f9f9] border-[3px] border-[#1b1b1b] neo-shadow p-6 flex-1 flex flex-col gap-5 font-mono text-xs leading-relaxed">
                {(report.transcriptSnippets || []).map((snip, idx) => {
                  const isExcellent = snip.flag === 'EXCELLENT';
                  const isWeakness = snip.flag === 'WEAKNESS';
                  const flagBadgeBg = isExcellent
                    ? 'bg-[#166534] text-[#dcfce7]'
                    : isWeakness
                    ? 'bg-[#ba1a1a] text-[#ffdad8]'
                    : 'bg-[#4d4633] text-[#ffd93d]';

                  return (
                    <div
                      key={idx}
                      className={`border-l-[4px] pl-3 py-1 ${
                        isExcellent
                          ? 'border-[#16a34a]'
                          : isWeakness
                          ? 'border-[#ba1a1a]'
                          : 'border-[#ffd93d]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[#ffd93d] font-bold">
                          &gt; TIMESTAMP_{snip.timestamp}
                        </span>
                        <span className={`px-2 py-0.5 font-mono text-[10px] font-black border border-current ${flagBadgeBg}`}>
                          FLAG: {snip.flag}
                        </span>
                      </div>
                      <div className="opacity-95 font-sans text-sm text-[#f9f9f9] leading-relaxed">
                        &ldquo;{snip.quote}&rdquo;
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Navigation Action Buttons */}
          <section className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t-[3px] border-[#1b1b1b]">
            <Link href={`/report/${sessionId}`}>
              <Button variant="secondary" size="md" className="font-mono text-xs font-bold">
                &larr; BACK TO SUMMARY REPORT
              </Button>
            </Link>

            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={handleDownloadPdf}
                disabled={isExporting}
                className="font-mono text-xs font-bold flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">download</span>
                {isExporting ? 'GENERATING PDF...' : 'EXPORT CRITIQUE AS PDF'}
              </Button>
              <Link href="/">
                <Button variant="dark" size="md" className="font-mono text-xs font-bold">
                  NEW INTERVIEW &rarr;
                </Button>
              </Link>
            </div>
          </section>

        </div>

        {/* Footer */}
        <footer className="border-t-[3px] border-[#1b1b1b] bg-[#ffffff] p-6 text-center font-mono text-xs text-[#4d4633] font-bold">
          NEO_INTV // EVALUATOR_AGENT ENGINE // DEEP CRITIQUE INSPECTOR
        </footer>
      </main>
    </div>
  );
}
