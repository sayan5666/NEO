import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarNav } from '../components/layout/SidebarNav';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { sessionService } from '../services/api';
import { NewInterviewModal } from '../components/modals/NewInterviewModal';

export const HistoryPage = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [track, setTrack] = useState('ALL_TRACKS');
  const [scoreFilter, setScoreFilter] = useState('SCORE: ALL');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        let scoreRange = null;
        if (scoreFilter === 'SCORE: >90') scoreRange = '>90';
        else if (scoreFilter === 'SCORE: 70-89') scoreRange = '70-89';
        else if (scoreFilter === 'SCORE: <70') scoreRange = '<70';

        const data = await sessionService.getSessions({
          track: track === 'ALL_TRACKS' ? undefined : track,
          scoreRange,
          search: search.trim() || undefined,
        });
        setSessions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [search, track, scoreFilter]);

  // Determine card style dynamically based on actual score
  const getCardStyle = (score) => {
    if (score >= 90) {
      return {
        cardBg: 'bg-background',
        scoreBg: 'bg-primary-container text-on-primary-container',
      };
    } else if (score >= 70) {
      return {
        cardBg: 'bg-surface-variant',
        scoreBg: 'bg-primary-fixed-dim text-on-primary-fixed-variant',
      };
    } else {
      return {
        cardBg: 'bg-secondary-fixed',
        scoreBg: 'bg-error text-on-error',
      };
    }
  };

  return (
    <div className="bg-[#FFFDF5] text-on-surface font-sans min-h-screen flex flex-col md:flex-row">
      {/* Mobile TopNav */}
      <nav className="md:hidden flex justify-between items-center w-full px-4 py-3 bg-surface border-b-[3px] border-on-surface sticky top-0 z-30">
        <span className="font-headline text-xl font-black">NEO_INTV</span>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
          START_SESSION
        </Button>
      </nav>

      {/* SidebarNav */}
      <SidebarNav onStartSession={() => setModalOpen(true)} />

      {/* Main History Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="p-6 md:p-12 flex-grow">
          {/* Header */}
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight">
                INTERVIEW_HISTORY
              </h1>
              <p className="font-mono text-xs md:text-sm text-on-surface-variant mt-2 max-w-2xl font-bold">
                Log of past AI-driven technical evaluations and candidate assessments.
              </p>
            </div>
          </header>

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-10 bg-surface p-4 neo-border neo-shadow-static items-center">
            <div className="relative flex-grow w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface text-xl">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="SEARCH_BY_ID_OR_ROLE..."
                className="w-full pl-10 pr-4 py-3 neo-border bg-background focus:ring-0 focus:outline-none focus:bg-primary-container font-mono text-xs md:text-sm placeholder-on-surface-variant font-bold uppercase"
              />
            </div>

            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative w-1/2 md:w-48">
                <select
                  value={track}
                  onChange={(e) => setTrack(e.target.value)}
                  className="w-full p-3 neo-border bg-background appearance-none font-mono text-xs font-bold focus:ring-0 focus:outline-none focus:bg-primary-container cursor-pointer uppercase pr-8"
                >
                  <option value="ALL_TRACKS">ALL_TRACKS</option>
                  <option value="SOFTWARE_ENG">SOFTWARE_ENG</option>
                  <option value="PRODUCT_MGT">PRODUCT_MGT</option>
                  <option value="DATA_SCIENCE">DATA_SCIENCE</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface">
                  arrow_drop_down
                </span>
              </div>

              <div className="relative w-1/2 md:w-48">
                <select
                  value={scoreFilter}
                  onChange={(e) => setScoreFilter(e.target.value)}
                  className="w-full p-3 neo-border bg-background appearance-none font-mono text-xs font-bold focus:ring-0 focus:outline-none focus:bg-primary-container cursor-pointer uppercase pr-8"
                >
                  <option value="SCORE: ALL">SCORE: ALL</option>
                  <option value="SCORE: >90">SCORE: &gt;90</option>
                  <option value="SCORE: 70-89">SCORE: 70-89</option>
                  <option value="SCORE: <70">SCORE: &lt;70</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface">
                  arrow_drop_down
                </span>
              </div>
            </div>
          </div>

          {/* Bento Grid of History Cards */}
          {loading ? (
            <div className="p-12 text-center font-mono text-sm bg-surface-container-lowest neo-border">
              SEARCHING_DATABASE...
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-12 text-center font-mono text-sm bg-surface-container-lowest neo-border">
              NO MATCHING ASSESSMENTS RECORDED.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((s, idx) => {
                const scoreVal = s.score != null ? s.score : 85;
                const { cardBg, scoreBg } = getCardStyle(scoreVal);
                const displayId = s.id || (s._id ? s._id.slice(-6).toUpperCase() : `9X-A7${idx}`);

                return (
                  <article
                    key={s._id || s.id || idx}
                    className={`${cardBg} neo-border p-6 flex flex-col neo-shadow-static justify-between`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4 border-b-[3px] border-on-surface pb-3">
                        <div className="font-mono text-xs md:text-sm font-bold">
                          [ID: {displayId}]
                        </div>
                        <div className="font-mono text-xs">
                          {s.date || '2024-10-24'}
                        </div>
                      </div>

                      <h2 className="font-headline text-xl md:text-2xl font-bold mb-4">
                        {s.role}
                      </h2>

                      <div className="flex gap-2 mb-6 flex-wrap">
                        {(s.topics || s.tags || ['Screening', 'Technical']).map((t) => (
                          <span
                            key={t}
                            className="bg-tertiary-container text-on-tertiary-container neo-border px-2 py-0.5 font-mono text-xs uppercase font-bold"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 flex justify-between items-end pt-4 border-t-[3px] border-on-surface/20">
                      <div>
                        <div className="font-mono text-[10px] uppercase font-bold mb-1">
                          Overall Score
                        </div>
                        <div
                          className={`${scoreBg} neo-border px-4 py-2 font-headline text-2xl md:text-3xl font-black inline-block neo-shadow-static`}
                        >
                          {scoreVal}
                        </div>
                      </div>
                      <Button
                        variant="dark"
                        size="sm"
                        onClick={() => navigate(`/report/${s._id || s.id}`)}
                        className="px-4 py-2 text-xs"
                      >
                        VIEW REPORT
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <Footer />
      </main>

      <NewInterviewModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};
