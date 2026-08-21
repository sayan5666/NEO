import { NextRequest, NextResponse } from 'next/server';
import { getReport, saveReport } from '@/lib/reportStore';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params;
    const gatewayUrl = process.env.GATEWAY_URL || 'http://localhost:5000';

    // 1. Try fetching from gateway / interview-service
    try {
      const authHeader = req.headers.get('authorization') || '';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      const proxyRes = await fetch(`${gatewayUrl}/api/reports/${sessionId}`, {
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
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

    // 2. Return from structured report store
    const report = getReport(sessionId);
    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve report', error: errorMsg },
      { status: 500 }
    );
  }
}
