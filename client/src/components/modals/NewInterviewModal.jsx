import React, { useState } from 'react';
import { Button } from '../ui/Button';

export const NewInterviewModal = ({ isOpen, onClose, onStart }) => {
  const [track, setTrack] = useState('SOFTWARE_ENG');
  const [role, setRole] = useState('Frontend Architect');
  const [context, setContext] = useState('');

  if (!isOpen) return null;

  const tracks = [
    { id: 'SOFTWARE_ENG', name: 'Software Engineer', defaultRole: 'Frontend Architect' },
    { id: 'PRODUCT_MGT', name: 'Product Manager', defaultRole: 'Product Manager L4' },
    { id: 'DATA_SCIENCE', name: 'Data & AI', defaultRole: 'Senior Data Scientist' },
  ];

  const handleTrackChange = (newTrack, defaultRole) => {
    setTrack(newTrack);
    setRole(defaultRole);
  };

  const handleStart = () => {
    if (onStart) {
      onStart({ track, role, context });
    } else {
      window.location.href = `/interview/${Math.random().toString(36).substring(2, 7)}`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#FFFDF5] neo-border neo-shadow-static w-full max-w-xl p-6 md:p-8 relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6 border-b-[3px] border-on-surface pb-4">
          <div>
            <span className="bg-primary-container text-on-surface px-2 py-0.5 text-xs font-mono font-bold uppercase neo-border inline-block mb-1">
              SYS_INIT // SESSION_DISPATCH
            </span>
            <h2 className="text-2xl md:text-3xl font-headline font-black uppercase">
              CONFIGURE_INTERVIEW
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 border-[3px] border-on-surface flex items-center justify-center font-black hover:bg-error hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block font-mono text-xs font-bold uppercase mb-2">
              {'// 01. SELECT_INTERVIEW_TRACK:'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {tracks.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTrackChange(t.id, t.defaultRole)}
                  className={`p-3 font-mono text-xs font-bold uppercase neo-border text-center transition-all cursor-pointer ${
                    track === t.id
                      ? 'bg-primary-container text-on-surface neo-shadow-sm'
                      : 'bg-surface text-on-surface-variant hover:bg-surface-variant'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs font-bold uppercase mb-2">
              {'// 02. TARGET_ROLE_SPEC:'}
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3.5 neo-border bg-surface font-mono text-sm font-bold focus:bg-primary-container focus:outline-none"
            >
              {track === 'SOFTWARE_ENG' && (
                <>
                  <option value="Frontend Architect">Frontend Architect</option>
                  <option value="Senior Backend Engineer">Senior Backend Engineer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Systems Engineer">Systems Engineer</option>
                </>
              )}
              {track === 'PRODUCT_MGT' && (
                <>
                  <option value="Product Manager L4">Product Manager L4</option>
                  <option value="Senior Technical PM">Senior Technical PM</option>
                  <option value="Growth Product Manager">Growth Product Manager</option>
                </>
              )}
              {track === 'DATA_SCIENCE' && (
                <>
                  <option value="Senior Data Scientist">Senior Data Scientist</option>
                  <option value="Data Engineer">Data Engineer</option>
                  <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block font-mono text-xs font-bold uppercase mb-2">
              {'// 03. CANDIDATE_CONTEXT (OPTIONAL):'}
            </label>
            <textarea
              rows={3}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Paste background experience, key projects, tech stack (React, Node, Go, Kafka)..."
              className="w-full p-3 neo-border bg-surface font-mono text-xs placeholder:text-on-surface-variant/50 focus:bg-primary-container focus:outline-none resize-none"
            />
          </div>

          <div className="flex gap-4 pt-4 border-t-[3px] border-on-surface">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1 py-3 text-xs uppercase"
            >
              CANCEL
            </Button>
            <Button
              variant="primary"
              onClick={handleStart}
              className="flex-1 py-3 text-base font-black uppercase flex items-center justify-center gap-2"
            >
              INITIALIZE_ROUND
              <span className="material-symbols-outlined text-xl">bolt</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
