'use client';

import React from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { InterviewChat } from '@/components/interview/InterviewChat';

export default function InterviewSessionPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const sessionId = (params?.sessionId as string) || 'SESSION-01';
  const role = searchParams.get('role') || 'Frontend Architect';
  const track = searchParams.get('track') || 'SOFTWARE_ENG';

  return (
    <InterviewChat
      sessionId={sessionId}
      role={role}
      track={track}
      onComplete={(id) => {
        router.push(`/report/${id}`);
      }}
      onAbort={() => {
        router.push('/dashboard');
      }}
    />
  );
}
