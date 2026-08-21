import React, { useState, useEffect } from 'react';
import { SidebarNav } from '../components/layout/SidebarNav';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Tag } from '../components/ui/Tag';
import { sessionService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { NewInterviewModal } from '../components/modals/NewInterviewModal';
import { useNavigate } from 'react-router-dom';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackFilter, setTrackFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await sessionService.getSessions();
        setSessions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const filteredSessions = sessions.filter((s) => {
    if (trackFilter === 'ALL') return true;
    return s.track === trackFilter || s.role.toUpperCase().includes(trackFilter.replace('_', ' '));
  });

  const getBadgeColor = (idx) => {
    const colors = [
      'bg-tertiary text-on-tertiary',
      'bg-error text-on-error',
      'bg-primary-container text-on-primary-container',
      'bg-surface-variant text-on-surface',
    ];
    return colors[idx % colors.length];
  };

  const handleStartSession = () => {
    if (user && user.tokenBalance < 1) {
      if (window.confirm('You are out of tokens. Would you like to buy more?')) {
        navigate('/buy-tokens');
      }
    } else {
      setModalOpen(true);
    }
  };

  return (
    <div className="bg-[#FFFDF5] text-on-surface font-sans min-h-screen flex flex-col md:flex-row">
      {/* Mobile Nav */}
      <nav className="md:hidden flex justify-between items-center w-full px-4 py-3 bg-surface border-b-[3px] border-on-surface sticky top-0 z-30">
        <span className="font-headline text-xl font-black">NEO_INTV</span>
        <Button variant="primary" size="sm" onClick={handleStartSession}>
          START_SESSION
        </Button>
      </nav>

      {/* Sidebar */}
      <SidebarNav onStartSession={handleStartSession} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="p-6 md:p-12 flex-grow overflow-y-auto">
          {/* Header */}
          <header className="flex flex-col sm:flex-row justify-between sm:items-end mb-10 pb-4 border-b-[3px] border-on-surface gap-4">
            <div>
              <h1 className="font-headline text-4xl md:text-5xl font-black uppercase tracking-tight">
                DASHBOARD
              </h1>
              <p className="font-mono text-xs md:text-sm text-on-surface-variant mt-1 font-bold">
                {'// SYSTEM_OVERVIEW // USER_STATS'}
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartSession}
              className="text-base font-black px-8 py-3.5"
            >
              START_SESSION
            </Button>
          </header>

          {/* Bento Grid Stats */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
            {/* Stat Card 1 */}
            <div className="md:col-span-8 bg-surface neo-border p-6 neo-shadow flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <h3 className="font-mono text-sm font-bold uppercase text-on-surface">
                  Total_Interviews
                </h3>
                <span className="material-symbols-outlined text-primary-fixed-dim text-2xl font-bold">
                  data_usage
                </span>
              </div>
              <div className="mt-8">
                <span className="font-headline text-5xl md:text-6xl font-black block">
                  {sessions.length * 32 || 128}
                </span>
                <div className="h-[3px] w-full bg-on-surface mt-3 mb-2"></div>
                <span className="font-mono text-xs text-on-surface-variant font-bold">
                  +14% vs last cycle
                </span>
              </div>
            </div>

            {/* Stat Card 2 */}
            <div className="md:col-span-4 bg-tertiary text-on-tertiary neo-border p-6 neo-shadow flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <h3 className="font-mono text-sm font-bold uppercase">Avg_Score</h3>
                <span className="material-symbols-outlined text-2xl">grade</span>
              </div>
              <div className="mt-8">
                <span className="font-headline text-5xl font-black block">8.4</span>
                <div className="flex gap-1 mt-2 text-primary-container">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-[18px] opacity-40">star</span>
                </div>
              </div>
            </div>

            {/* Stat Card 3 */}
            <div className="md:col-span-12 bg-primary-container neo-border p-4 neo-shadow flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-3xl font-black">bolt</span>
                <h3 className="font-headline text-xl md:text-2xl font-black uppercase text-on-surface">
                  SYSTEM_READY
                </h3>
              </div>
              <span className="font-mono text-xs md:text-sm font-bold bg-on-surface text-surface px-3 py-1 border-[2px] border-on-surface">
                STATUS: ONLINE
              </span>
            </div>
          </section>

          {/* Controls: Filter Buttons */}
          <section className="mb-8 flex flex-wrap gap-3 items-center">
            <span className="font-mono text-xs md:text-sm font-bold mr-2 text-on-surface">
              {'// FILTER_BY_TRACK:'}
            </span>
            {['ALL', 'SOFTWARE_ENGINEER', 'PRODUCT_MANAGER', 'DATA_SCIENTIST'].map((track) => (
              <button
                key={track}
                onClick={() => setTrackFilter(track)}
                className={`border-[3px] border-on-surface px-4 py-1.5 font-mono text-xs font-bold transition-all cursor-pointer ${
                  trackFilter === track
                    ? 'bg-on-surface text-surface neo-shadow-sm'
                    : 'bg-surface text-on-surface hover:bg-primary-container'
                }`}
              >
                {track}
              </button>
            ))}
          </section>

          {/* Recent Sessions List */}
          <section>
            <h2 className="font-headline text-2xl font-black uppercase mb-4 border-b-[3px] border-on-surface pb-1 inline-block">
              RECENT_SESSIONS
            </h2>

            {loading ? (
              <div className="p-8 text-center font-mono text-sm bg-surface neo-border">
                FETCHING_TELEMETRY...
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="p-8 text-center font-mono text-sm bg-surface neo-border">
                NO_SESSIONS_FOUND
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSessions.map((session, idx) => {
                  const badgeColor = getBadgeColor(idx);
                  const displayNum = String(idx + 1).padStart(2, '0');
                  const scoreVal = ((session.score || 85) / 10).toFixed(1);

                  return (
                    <div
                      key={session._id || session.id || idx}
                      onClick={() => navigate(`/report/${session._id || session.id}`)}
                      className="bg-surface neo-border p-4 neo-shadow flex flex-col md:flex-row md:items-center justify-between gap-4 hover:-translate-y-0.5 transition-transform cursor-pointer"
                    >
                      <div className="flex items-center gap-4 md:gap-6">
                        <div
                          className={`w-14 h-14 md:w-16 md:h-16 flex items-center justify-center border-[3px] border-on-surface font-headline text-xl md:text-2xl font-black shrink-0 ${badgeColor}`}
                        >
                          {displayNum}
                        </div>
                        <div>
                          <h4 className="font-headline text-lg md:text-xl font-bold uppercase">
                            {session.role.replace(/ /g, '_')}
                          </h4>
                          <div className="flex gap-2 mt-1.5 flex-wrap">
                            {(session.tags || ['REACT', 'SYSTEM_DESIGN']).map((tag) => (
                              <Tag key={tag} variant="neutral" size="sm">
                                {tag}
                              </Tag>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 md:gap-10 pt-3 md:pt-0 border-t md:border-t-0 border-on-surface/20">
                        <div className="text-left md:text-right">
                          <span className="font-mono text-[10px] block text-on-surface-variant font-bold">
                            DATE
                          </span>
                          <span className="font-mono text-xs md:text-sm font-bold">
                            {session.date || '2024.10.24'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-[10px] block text-on-surface-variant font-bold">
                            SCORE
                          </span>
                          <span className="font-headline text-xl md:text-2xl font-black">
                            {scoreVal}
                          </span>
                        </div>
                        <button
                          className="w-10 h-10 border-[3px] border-on-surface flex items-center justify-center hover:bg-primary-container transition-colors shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/report/${session._id || session.id}`);
                          }}
                        >
                          <span className="material-symbols-outlined font-bold">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <Footer />
      </main>

      <NewInterviewModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onStart={(data) => {
          setModalOpen(false);
          navigate(`/interview/9X-A7B`);
        }}
      />
    </div>
  );
};
