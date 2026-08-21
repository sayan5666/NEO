'use client';

import React, { useState, useRef } from 'react';

export interface ResumeData {
  resumeUrl?: string | null;
  resumeText?: string | null;
  resumeSummary?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  wordCount?: number | null;
  pageCount?: number | null;
  parsedAt?: string | null;
}

interface ResumeUploadProps {
  resume: ResumeData | null;
  onUploadSuccess: (data: ResumeData) => void;
  onClearResume?: () => void;
  compact?: boolean;
}

export function ResumeUpload({
  resume,
  onUploadSuccess,
  onClearResume,
  compact = false,
}: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setErrorMessage('INVALID_FILE_TYPE: Only PDF documents are accepted.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('FILE_TOO_LARGE: Max PDF size is 10MB.');
      return;
    }

    setErrorMessage(null);
    setIsUploading(true);
    setProgress(15);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          clearInterval(progressInterval);
          return 85;
        }
        return prev + 15;
      });
    }, 150);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const json = await res.json();
      if (res.ok && json.success) {
        setTimeout(() => {
          setIsUploading(false);
          setProgress(0);
          onUploadSuccess({
            resumeUrl: json.data?.resumeUrl,
            resumeText: json.data?.resumeText,
            resumeSummary: json.data?.resumeSummary,
            fileName: json.data?.fileName || file.name,
            fileSize: json.data?.fileSize || file.size,
            wordCount: json.data?.wordCount,
            pageCount: json.data?.pageCount,
            parsedAt: json.data?.parsedAt || new Date().toISOString(),
          });
        }, 400);
      } else {
        setIsUploading(false);
        setProgress(0);
        setErrorMessage(json.message || 'Failed to upload and parse resume.');
      }
    } catch (err: unknown) {
      clearInterval(progressInterval);
      setIsUploading(false);
      setProgress(0);
      setErrorMessage(err instanceof Error ? err.message : 'Network error during upload.');
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Compact Mode (e.g. inside Configure Interview modal)
  if (compact) {
    if (resume?.resumeText) {
      return (
        <div className="bg-[#f0f9ff] neo-border p-3 border-[#1b1b1b]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-[#0284c7] text-xl shrink-0">
                description
              </span>
              <div className="min-w-0">
                <div className="font-mono text-xs font-bold truncate text-[#1b1b1b]">
                  {resume.fileName || 'candidate_resume.pdf'}
                </div>
                <div className="font-mono text-[10px] text-[#0369a1] font-bold">
                  {resume.wordCount || 0} WORDS // READY FOR SCREENING AGENT
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="bg-[#ffffff] neo-border px-2 py-1 font-mono text-[10px] font-bold hover:bg-[#ffd93d] cursor-pointer"
              >
                {showPreview ? 'HIDE' : 'VIEW'}
              </button>
              {onClearResume && (
                <button
                  type="button"
                  onClick={onClearResume}
                  className="bg-[#ffffff] neo-border px-2 py-1 font-mono text-[10px] font-bold hover:bg-[#ff6b6b] hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {showPreview && (
            <div className="mt-2 pt-2 border-t-[2px] border-[#1b1b1b]/30">
              <p className="font-mono text-[11px] text-[#1b1b1b] bg-white p-2 neo-border max-h-28 overflow-y-auto whitespace-pre-wrap">
                {resume.resumeSummary || resume.resumeText}
              </p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div>
        <input
          type="file"
          ref={fileInputRef}
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`neo-border p-4 text-center cursor-pointer transition-all ${
            isDragging ? 'bg-[#ffd93d] border-[#1b1b1b]' : 'bg-[#ffffff] hover:bg-[#f9f9f9]'
          }`}
        >
          {isUploading ? (
            <div className="space-y-2">
              <div className="font-mono text-xs font-bold text-[#1b1b1b]">
                UPLOADING & PARSING PDF... {progress}%
              </div>
              <div className="w-full h-3 neo-border bg-[#e2e2e2] relative overflow-hidden">
                <div
                  className="h-full bg-[#ffd93d] transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-xl text-[#1b1b1b]">upload_file</span>
              <span className="font-mono text-xs font-bold text-[#1b1b1b]">
                ATTACH RESUME PDF (CLOUDINARY + PDF-PARSE)
              </span>
            </div>
          )}
        </div>
        {errorMessage && (
          <div className="mt-1 font-mono text-[11px] text-[#ae2f34] font-bold">
            {errorMessage}
          </div>
        )}
      </div>
    );
  }

  // Full Card Mode (for Dashboard / Onboarding)
  return (
    <div className="bg-[#ffffff] border-[3px] border-[#1b1b1b] p-6 neo-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-[3px] border-[#1b1b1b] pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-[#1b1b1b] bg-[#ffd93d] flex items-center justify-center font-black shrink-0">
            <span className="material-symbols-outlined text-2xl text-[#1b1b1b]">
              assignment_ind
            </span>
          </div>
          <div>
            <h3 className="font-headline text-xl font-black uppercase text-[#1b1b1b]">
              RESUME_CONTEXT // AI_PROFILER
            </h3>
            <p className="font-mono text-xs text-[#4d4633] font-bold">
              Extract background text via pdf-parse & persist in Cloudinary
            </p>
          </div>
        </div>

        {resume?.resumeText && (
          <span className="font-mono text-xs font-bold px-3 py-1 bg-[#dcfce7] text-[#166534] border-[2px] border-[#1b1b1b] inline-flex items-center gap-1.5 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse"></span>
            CONTEXT_ACTIVE
          </span>
        )}
      </div>

      {resume?.resumeText ? (
        <div className="space-y-4">
          <div className="bg-[#f9f9f9] border-[3px] border-[#1b1b1b] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2 border-[2px] border-[#1b1b1b] bg-[#e7deff]">
                <span className="material-symbols-outlined text-2xl text-[#1b1b1b]">
                  picture_as_pdf
                </span>
              </div>
              <div className="min-w-0">
                <div className="font-mono text-sm font-black text-[#1b1b1b] truncate">
                  {resume.fileName || 'candidate_resume.pdf'}
                </div>
                <div className="flex flex-wrap gap-2 mt-1 font-mono text-[11px] text-[#4d4633] font-bold">
                  <span className="bg-[#e2e2e2] px-2 py-0.5 border border-[#1b1b1b]">
                    SIZE: {formatFileSize(resume.fileSize)}
                  </span>
                  <span className="bg-[#ffd93d] px-2 py-0.5 border border-[#1b1b1b] text-[#1b1b1b]">
                    WORDS: {resume.wordCount || 0}
                  </span>
                  <span className="bg-[#dcfce7] px-2 py-0.5 border border-[#1b1b1b] text-[#166534]">
                    CLOUDINARY_HOSTED
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="bg-[#ffffff] text-[#1b1b1b] border-[2px] border-[#1b1b1b] px-3 py-1.5 font-mono text-xs font-bold uppercase hover:bg-[#ffd93d] neo-btn cursor-pointer"
              >
                {showPreview ? 'HIDE EXTRACT' : 'PREVIEW EXTRACT'}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#ffd93d] text-[#1b1b1b] border-[2px] border-[#1b1b1b] px-3 py-1.5 font-mono text-xs font-bold uppercase hover:bg-[#ffe366] neo-btn cursor-pointer"
              >
                RE-UPLOAD
              </button>
              {onClearResume && (
                <button
                  type="button"
                  onClick={onClearResume}
                  className="bg-[#ffffff] text-[#ae2f34] border-[2px] border-[#1b1b1b] px-3 py-1.5 font-mono text-xs font-bold uppercase hover:bg-[#ffdad8] neo-btn cursor-pointer"
                >
                  REMOVE
                </button>
              )}
            </div>
          </div>

          {/* Success Banner */}
          <div className="bg-[#fff9db] border-[2px] border-[#1b1b1b] p-3 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-lg text-[#705d00] shrink-0 mt-0.5">
              verified
            </span>
            <div className="font-mono text-xs text-[#1b1b1b] leading-relaxed">
              <span className="font-bold">Screening Agent Pipeline Armed: </span>
              The <code className="bg-white px-1 border border-[#1b1b1b] font-bold">screening_agent</code>{' '}
              node will initialize interview questions targeting your specific career background,
              tech stack, and accomplishments extracted from this document.
            </div>
          </div>

          {showPreview && (
            <div className="bg-[#1b1b1b] text-[#f9f9f9] border-[3px] border-[#1b1b1b] p-4 font-mono text-xs leading-relaxed max-h-56 overflow-y-auto">
              <div className="text-[#ffd93d] font-bold mb-2 pb-1 border-b border-[#ffd93d]/40 flex justify-between">
                <span>&gt; EXTRACTED_RAW_TEXT (pdf-parse)</span>
                <span>{resume.wordCount || 0} TOTAL WORDS</span>
              </div>
              <p className="whitespace-pre-wrap opacity-90 text-[11px] font-sans">
                {resume.resumeText}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-[3px] border-dashed border-[#1b1b1b] p-8 text-center cursor-pointer transition-all ${
              isDragging ? 'bg-[#ffd93d] border-solid' : 'bg-[#fafafa] hover:bg-[#fff9db]'
            }`}
          >
            {isUploading ? (
              <div className="max-w-md mx-auto space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <span className="material-symbols-outlined text-3xl animate-spin text-[#1b1b1b]">
                    sync
                  </span>
                  <div className="font-headline text-lg font-black uppercase text-[#1b1b1b]">
                    PARSING & UPLOADING TO CLOUDINARY...
                  </div>
                </div>
                <div className="w-full h-6 border-[3px] border-[#1b1b1b] bg-[#e2e2e2] relative overflow-hidden">
                  <div
                    className="h-full bg-[#ffd93d] border-r-[3px] border-[#1b1b1b] transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-xs font-bold text-[#1b1b1b]">
                    {progress}% COMPLETE
                  </div>
                </div>
                <div className="font-mono text-xs text-[#4d4633] font-bold">
                  Extracting textual tokens with pdf-parse and updating agent context...
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 mx-auto border-[3px] border-[#1b1b1b] bg-[#ffd93d] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <span className="material-symbols-outlined text-3xl text-[#1b1b1b]">
                    cloud_upload
                  </span>
                </div>
                <div>
                  <div className="font-headline text-lg font-black uppercase text-[#1b1b1b]">
                    DRAG & DROP RESUME PDF HERE
                  </div>
                  <p className="font-mono text-xs text-[#4d4633] mt-1 font-bold">
                    Or click to browse from your device (PDF up to 10MB)
                  </p>
                </div>
                <div className="inline-block bg-[#1b1b1b] text-white px-4 py-1.5 font-mono text-xs font-bold uppercase neo-shadow-sm">
                  AUTO-PARSE VIA PDF-PARSE + CLOUDINARY
                </div>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="mt-3 p-3 bg-[#ffdad8] border-[2px] border-[#ae2f34] text-[#ae2f34] font-mono text-xs font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
