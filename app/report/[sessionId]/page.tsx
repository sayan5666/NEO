'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { FullReport, defaultReport } from '@/lib/reportStore';
import { exportElementToPdf } from '@/lib/pdfExport';

export default function ReportPage() {
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
        console.warn('Failed to load report from API, using store default:', err);
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
      await exportElementToPdf('printable-report-container', `interview_report_${sessionId}.pdf`);
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
          <span>COMPILING_EVALUATOR_REPORT // {sessionId}...</span>
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
            href="/"
            className="flex items-center gap-2 font-mono text-xs font-black uppercase text-[#1b1b1b] hover:bg-[#ffd93d] p-2.5 border-[2px] border-[#1b1b1b] bg-[#ffffff] neo-shadow-sm transition-all"
          >
            <span>&larr;</span> DASHBOARD_HOME
          </Link>
        </div>

        <div className="border-[3px] border-[#1b1b1b] p-4 bg-[#ffffff] neo-shadow-sm">
          <span className="font-mono text-[10px] uppercase font-bold text-[#4d4633] block mb-1">
            {'// REPORT_STATUS'}
          </span>
          <div className="font-headline text-2xl font-black uppercase text-[#166534] flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a] animate-pulse"></span>
            FINALIZED
          </div>
          <div className="font-mono text-xs text-[#4d4633] mt-2 font-bold">
            SESSION: <span className="text-[#1b1b1b]">{report.sessionId}</span>
          </div>
          <div className="font-mono text-[11px] text-[#4d4633] uppercase mt-1">
            ROLE: <span className="font-bold text-[#1b1b1b]">{report.role}</span>
          </div>
        </div>

        <nav className="space-y-2 font-mono text-xs font-bold pt-4 border-t-[2px] border-[#1b1b1b]">
          <a
            href="#metrics"
            className="block p-2.5 bg-[#ffd93d] border-[2px] border-[#1b1b1b] text-[#1b1b1b] neo-shadow-sm"
          >
            01 // SCORING_SUMMARY
          </a>
          <a
            href="#strengths-weaknesses"
            className="block p-2.5 bg-[#ffffff] border-[2px] border-[#1b1b1b] text-[#1b1b1b] hover:bg-[#ffd93d] transition-all"
          >
            02 // STRENGTHS & WEAKNESSES
          </a>
          <a
            href="#category-metrics"
            className="block p-2.5 bg-[#ffffff] border-[2px] border-[#1b1b1b] text-[#1b1b1b] hover:bg-[#ffd93d] transition-all"
          >
            03 // CATEGORY_METRICS
          </a>
          <Link
            href={`/report/${sessionId}/critique`}
            className="block p-2.5 bg-[#e0d6ff] border-[2px] border-[#1b1b1b] text-[#625595] font-black hover:bg-[#d0c2ff] transition-all"
          >
            04 // CRITIQUE_DETAIL &rarr;
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
        <div id="printable-report-container" className="p-6 md:p-12 flex-grow max-w-[1440px] w-full mx-auto space-y-8">
          
          {/* Header Section */}
          <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-[3px] border-[#1b1b1b] pb-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Tag variant="yellow" size="sm">EVALUATION_REPORT</Tag>
                <Tag variant="pink" size="sm">SESSION: {report.sessionId}</Tag>
                <Tag variant="gray" size="sm">DATE: {report.date || '2024.10.27'}</Tag>
              </div>
              <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-[#1b1b1b]">
                INTERVIEW_REPORT
              </h1>
              <p className="font-mono text-xs md:text-sm text-[#4d4633] mt-1 font-bold">
                CANDIDATE BENCHMARK ASSESSMENT // {report.role}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href={`/report/${sessionId}/critique`}>
                <Button
                  variant="secondary"
                  className="px-5 py-2.5 text-xs font-mono font-bold hover:bg-[#e0d6ff]"
                >
                  VIEW CRITIQUE DETAIL &rarr;
                </Button>
              </Link>
              <Button
                variant="primary"
                onClick={handleDownloadPdf}
                disabled={isExporting}
                className="px-6 py-2.5 text-sm font-black flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                {isExporting ? 'EXPORTING PDF...' : 'DOWNLOAD AS PDF'}
              </Button>
            </div>
          </section>

          {/* Top Score Block / Hero Verdict */}
          <section id="metrics" className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Score Block */}
            <div className="col-span-1 md:col-span-7 bg-[#ffd93d] border-[3px] border-[#1b1b1b] p-6 md:p-8 neo-shadow flex flex-col justify-between min-h-[240px]">
              <div className="flex items-center justify-between border-b-[3px] border-[#1b1b1b] pb-3 mb-4">
                <span className="font-mono text-xs font-black uppercase text-[#1b1b1b]">
                  {'// OVERALL_CANDIDATE_RATING'}
                </span>
                <span className="font-mono text-xs font-black px-2 py-0.5 bg-[#1b1b1b] text-white">
                  TARGET: 70+
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-4 my-auto">
                <span className="text-[85px] sm:text-[110px] md:text-[130px] font-headline font-black leading-none text-[#1b1b1b] tracking-tighter">
                  {score}
                </span>
                <div className="flex flex-col">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-headline font-black uppercase text-[#1b1b1b]">
                    {report.verdict || (isRecommended ? 'RECOMMENDED' : 'NOT QUALIFIED')}
                  </span>
                  <span className="font-mono text-xs sm:text-sm text-[#1b1b1b] mt-1 font-bold">
                    {report.verdictSubtitle || (isRecommended ? '[SYSTEM_PASS_THRESHOLD_MET]' : '[BELOW_BENCHMARK]')}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t-[3px] border-[#1b1b1b] flex items-center justify-between font-mono text-xs font-bold text-[#1b1b1b]">
                <span>CONFIDENCE: {report.sentiment?.confidence || 85}%</span>
                <span>CLARITY: {report.sentiment?.clarity || 91}%</span>
              </div>
            </div>

            {/* Competency Score Pills */}
            <div className="col-span-1 md:col-span-5 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-4">
              {[
                {
                  label: 'TECHNICAL DEPTH',
                  val: report.scores?.technical || 88,
                  bg: 'bg-[#e0d6ff]',
                  sub: 'Architecture & Scalability',
                },
                {
                  label: 'PROBLEM SOLVING',
                  val: report.scores?.problemSolving || 87,
                  bg: 'bg-[#ffffff]',
                  sub: 'Analytical Reasoning',
                },
                {
                  label: 'COMMUNICATION',
                  val: report.scores?.communication || 85,
                  bg: 'bg-[#ffdad8]',
                  sub: 'Structure & Articulation',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 border-[3px] border-[#1b1b1b] ${item.bg} neo-shadow flex items-center justify-between`}
                >
                  <div>
                    <div className="font-mono text-xs font-bold text-[#4d4633]">
                      {item.label}
                    </div>
                    <div className="font-mono text-[11px] text-[#1b1b1b] font-bold mt-0.5">
                      {item.sub}
                    </div>
                  </div>
                  <div className="font-headline text-3xl font-black text-[#1b1b1b]">
                    {item.val}<span className="text-base text-[#4d4633]">/100</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Strengths & Weaknesses Columns */}
          <section id="strengths-weaknesses" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card bg="bg-[#ffffff]" className="p-6">
              <h3 className="font-headline text-xl font-black uppercase text-[#1b1b1b] border-b-[3px] border-[#1b1b1b] pb-3 mb-4 flex items-center justify-between">
                <span>KEY_STRENGTHS</span>
                <span className="w-7 h-7 bg-[#ffd93d] border-[2px] border-[#1b1b1b] flex items-center justify-center text-sm font-black">
                  +
                </span>
              </h3>
              <ul className="space-y-4">
                {(report.strengths || []).map((strength, idx) => (
                  <li key={idx} className="pb-3 border-b-[2px] border-[#1b1b1b]/15 last:border-b-0 flex items-start gap-3">
                    <span className="font-mono text-xs font-black px-2 py-0.5 bg-[#e0d6ff] border border-[#1b1b1b] shrink-0 mt-0.5">
                      0{idx + 1}
                    </span>
                    <span className="font-sans text-sm md:text-base leading-relaxed text-[#1b1b1b]">
                      {strength}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Weaknesses */}
            <Card bg="bg-[#fafafa]" className="p-6">
              <h3 className="font-headline text-xl font-black uppercase text-[#1b1b1b] border-b-[3px] border-[#1b1b1b] pb-3 mb-4 flex items-center justify-between">
                <span>AREAS_FOR_GROWTH</span>
                <span className="w-7 h-7 bg-[#ffdad8] border-[2px] border-[#1b1b1b] flex items-center justify-center text-sm font-black text-[#ba1a1a]">
                  -
                </span>
              </h3>
              <ul className="space-y-4">
                {(report.weaknesses || []).map((weakness, idx) => (
                  <li key={idx} className="pb-3 border-b-[2px] border-[#1b1b1b]/15 last:border-b-0 flex items-start gap-3">
                    <span className="font-mono text-xs font-black px-2 py-0.5 bg-[#ffdad8] text-[#ba1a1a] border border-[#1b1b1b] shrink-0 mt-0.5">
                      0{idx + 1}
                    </span>
                    <span className="font-sans text-sm md:text-base leading-relaxed text-[#1b1b1b]">
                      {weakness}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </section>

          {/* Category Metrics Progress Bars */}
          <section id="category-metrics" className="bg-[#ffffff] border-[3px] border-[#1b1b1b] neo-shadow p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-[3px] border-[#1b1b1b] pb-4 mb-6">
              <div>
                <h3 className="font-headline text-2xl font-black uppercase text-[#1b1b1b]">
                  CATEGORY_METRICS
                </h3>
                <p className="font-mono text-xs text-[#4d4633] font-bold">
                  Normalized competency distribution generated by Multi-Agent Evaluator
                </p>
              </div>
              <Tag variant="yellow" size="sm">BENCHMARK_ANALYSIS</Tag>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
              {[
                {
                  label: 'PROBLEM_SOLVING',
                  val: report.categoryMetrics?.problemSolving || 90,
                  barColor: 'bg-[#ffd93d]',
                },
                {
                  label: 'COMMUNICATION',
                  val: report.categoryMetrics?.communication || 75,
                  barColor: 'bg-[#e0d6ff]',
                },
                {
                  label: 'SYSTEM_DESIGN',
                  val: report.categoryMetrics?.systemDesign || 85,
                  barColor: 'bg-[#ffd93d]',
                },
                {
                  label: 'CODE_QUALITY',
                  val: report.categoryMetrics?.codeQuality || 60,
                  barColor: 'bg-[#ffdad8]',
                },
              ].map((metric, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between font-mono text-xs font-black text-[#1b1b1b]">
                    <span>{metric.label}</span>
                    <span>{metric.val}%</span>
                  </div>
                  <div className="w-full h-7 border-[3px] border-[#1b1b1b] bg-[#e2e2e2] relative overflow-hidden">
                    <div
                      className={`h-full ${metric.barColor} border-r-[3px] border-[#1b1b1b] transition-all duration-500`}
                      style={{ width: `${metric.val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Actionable Suggestions */}
          <section className="bg-[#f0f9ff] border-[3px] border-[#1b1b1b] p-6 neo-shadow">
            <h3 className="font-headline text-xl font-black uppercase text-[#1b1b1b] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-[#0284c7]">lightbulb</span>
              ACTIONABLE_SUGGESTIONS // PREPARATION_ROADMAP
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(report.suggestions || []).map((sug, idx) => (
                <div key={idx} className="bg-white p-4 border-[2px] border-[#1b1b1b] flex items-start gap-3">
                  <span className="font-mono text-xs font-black px-2 py-1 bg-[#ffd93d] border border-[#1b1b1b] shrink-0">
                    TIP_{idx + 1}
                  </span>
                  <p className="font-sans text-sm text-[#1b1b1b] leading-relaxed">
                    {sug}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Bottom CTA Banner */}
          <section className="bg-[#1b1b1b] text-white p-6 md:p-8 border-[3px] border-[#1b1b1b] neo-shadow flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-headline text-2xl font-black uppercase text-[#ffd93d]">
                WANT DEEP LINGUISTIC &amp; TRANSCRIPT CRITIQUE?
              </h4>
              <p className="font-mono text-xs text-[#e2e2e2] mt-1 font-bold">
                Inspect candidate sentiment bars, evaluator observations, and highlighted transcript snippet tags.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link href={`/report/${sessionId}/critique`}>
                <Button variant="primary" size="md" className="font-black">
                  OPEN CRITIQUE DRILL-DOWN &rarr;
                </Button>
              </Link>
            </div>
          </section>

        </div>

        {/* Footer */}
        <footer className="border-t-[3px] border-[#1b1b1b] bg-[#ffffff] p-6 text-center font-mono text-xs text-[#4d4633] font-bold">
          NEO_INTV // EVALUATOR_AGENT ENGINE // REAL-TIME LANGGRAPH STATE
        </footer>
      </main>
    </div>
  );
}
