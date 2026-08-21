import React, { useEffect } from 'react';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  tag?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'danger' | 'dark';
  onConfirm?: () => void;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  tag = 'SYSTEM_ALERT',
  confirmLabel,
  cancelLabel = 'CANCEL',
  confirmVariant = 'primary',
  onConfirm,
  isLoading = false,
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1b1b1b]/80 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-[#ffffff] neo-border shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8 relative animate-in fade-in zoom-in-95 duration-100"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex justify-between items-start mb-4 border-b-[3px] border-[#1b1b1b] pb-3">
          <div>
            <span className="bg-[#ffd93d] text-[#1b1b1b] px-2 py-0.5 font-mono text-xs font-bold border-[2px] border-[#1b1b1b] inline-block mb-2">
              {tag}
            </span>
            <h2 className="font-headline text-2xl md:text-3xl font-black uppercase text-[#1b1b1b]">
              {title}
            </h2>
            {subtitle && (
              <p className="font-mono text-xs text-[#4d4633] mt-1 font-bold">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 neo-border bg-[#e2e2e2] hover:bg-[#ffd93d] flex items-center justify-center font-bold text-[#1b1b1b] cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="py-2 text-[#1b1b1b]">{children}</div>

        <div className="mt-6 pt-4 border-t-[3px] border-[#1b1b1b] flex justify-end gap-3 flex-wrap">
          <Button variant="secondary" size="md" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          {onConfirm && (
            <Button
              variant={confirmVariant}
              size="md"
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? 'PROCESSING...' : confirmLabel || 'CONFIRM'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
