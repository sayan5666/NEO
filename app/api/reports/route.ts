import { NextRequest, NextResponse } from 'next/server';
import { saveReport, FullReport, defaultReport } from '@/lib/reportStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sessionId = body.sessionId || `SESSION-${Date.now()}`;
    const gatewayUrl = process.env.GATEWAY_URL || 'http://localhost:5000';

    // 1. Forward to gateway / interview-service if online
    try {
      const authHeader = req.headers.get('authorization') || '';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      const proxyRes = await fetch(`${gatewayUrl}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (proxyRes.ok) {
        const json = await proxyRes.json();
        if (json.data) {
          saveReport(json.data);
          return NextResponse.json({ success: true, data: json.data });
        }
      }
    } catch {
      // Gateway offline; proceed to local store
    }

    // 2. Build full report
    const overallScore = typeof body.overallScore === 'number' ? body.overallScore : 82;
    const isRecommended = overallScore >= 70;

    const report: FullReport = {
      sessionId,
      role: body.role || defaultReport.role,
      date: body.date || new Date().toISOString().split('T')[0].replace(/-/g, '.'),
      overallScore,
      verdict: body.verdict || (isRecommended ? 'RECOMMENDED' : 'NOT QUALIFIED'),
      verdictSubtitle: body.verdictSubtitle || (isRecommended ? '[SYSTEM_PASS_THRESHOLD_MET]' : '[BELOW_BENCHMARK]'),
      scores: body.scores || defaultReport.scores,
      categoryMetrics: body.categoryMetrics || defaultReport.categoryMetrics,
      sentiment: body.sentiment || defaultReport.sentiment,
      strengths: body.strengths || defaultReport.strengths,
      weaknesses: body.weaknesses || defaultReport.weaknesses,
      suggestions: body.suggestions || defaultReport.suggestions,
      observations: body.observations || defaultReport.observations,
      transcriptSnippets: body.transcriptSnippets || defaultReport.transcriptSnippets,
      createdAt: new Date().toISOString(),
    };

    saveReport(report);

    return NextResponse.json({
      success: true,
      message: 'Report saved and session completed',
      data: report,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, message: 'Failed to create report', error: errorMsg },
      { status: 500 }
    );
  }
}
