const fs = require('fs');
let code = fs.readFileSync('./app/page.tsx', 'utf8');

const buyTokensCode = `
      {/* -------------------- BUY TOKENS VIEW -------------------- */}
      {currentView === 'buy_tokens' && (
        <div className="flex-1 flex flex-col md:flex-row">
          {/* Sidebar */}
          <aside className="hidden md:flex flex-col h-screen w-64 border-r-[3px] border-[#1b1b1b] bg-[#f3f3f3] p-4 space-y-4 shadow-[6px_0px_0px_0px_rgba(0,0,0,1)] sticky top-0 shrink-0 z-20">
            <div className="mb-4">
              <button
                onClick={() => setCurrentView('landing')}
                className="font-headline text-xl font-black text-[#1b1b1b] mb-2 block tracking-tight uppercase cursor-pointer text-left"
              >
                NEO_INTV
              </button>
              <div className="flex flex-col gap-2 p-2 border-[3px] border-[#1b1b1b] bg-[#f9f9f9] neo-shadow-static mt-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border-[3px] border-[#1b1b1b] bg-[#ffd93d] flex items-center justify-center shrink-0 font-bold">
                    <span className="material-symbols-outlined text-2xl text-[#1b1b1b]">smart_toy</span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-mono text-xs font-bold truncate text-[#1b1b1b]">{user.name}</div>
                    <div className="font-mono text-[10px] text-[#705d00] font-bold uppercase">{user.tier}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t-[2px] border-dashed border-[#1b1b1b] pt-2 mt-1">
                  <span className="font-mono text-[10px] font-bold">TOKENS: {user.tokenBalance}</span>
                  <button onClick={() => setCurrentView('buy_tokens')} className="font-mono text-[10px] bg-[#ffd93d] text-[#1b1b1b] px-2 py-0.5 border border-[#1b1b1b] hover:bg-[#e8c426] font-bold cursor-pointer">BUY</button>
                </div>
              </div>
            </div>

            <nav className="flex-1 flex flex-col space-y-2">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="flex items-center gap-3 p-3 font-mono text-sm text-[#4d4633] hover:bg-[#e2e2e2] border-[3px] border-transparent hover:border-[#1b1b1b] transition-all cursor-pointer text-left"
              >
                <span className="material-symbols-outlined text-xl">grid_view</span>
                <span>DASHBOARD</span>
              </button>
              <button
                onClick={() => setCurrentView('history')}
                className="flex items-center gap-3 p-3 font-mono text-sm text-[#4d4633] hover:bg-[#e2e2e2] border-[3px] border-transparent hover:border-[#1b1b1b] transition-all cursor-pointer text-left"
              >
                <span className="material-symbols-outlined text-xl">forum</span>
                <span>INTERVIEWS</span>
              </button>
              <button
                onClick={() => setCurrentView('history')}
                className="flex items-center gap-3 p-3 font-mono text-sm text-[#4d4633] hover:bg-[#e2e2e2] border-[3px] border-transparent hover:border-[#1b1b1b] transition-all cursor-pointer text-left"
              >
                <span className="material-symbols-outlined text-xl">analytics</span>
                <span>REPORTS</span>
              </button>
            </nav>

            <div className="mt-auto pt-4 border-t-[3px] border-[#1b1b1b]">
              <button
                onClick={handleOpenModal}
                className="w-full py-3 mb-3 font-mono text-sm bg-[#ffd93d] text-[#1b1b1b] border-[3px] border-[#1b1b1b] neo-shadow neo-btn font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">add</span>
                NEW_INTERVIEW
              </button>
              <button
                onClick={() => setCurrentView('landing')}
                className="flex items-center gap-3 p-3 w-full text-[#4d4633] hover:bg-[#e2e2e2] hover:text-[#ae2f34] font-mono text-sm border-[3px] border-transparent hover:border-[#1b1b1b] transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
                <span>EXIT_SESSION</span>
              </button>
            </div>
          </aside>

          {/* Main Area */}
          <main className="flex-1 overflow-y-auto p-6 md:p-12 relative min-w-0">
            <header className="flex flex-col sm:flex-row justify-between sm:items-end mb-10 pb-4 border-b-[3px] border-[#1b1b1b] gap-4">
              <div>
                <h1 className="font-headline text-4xl md:text-5xl font-black uppercase tracking-tight">
                  BUY TOKENS
                </h1>
                <p className="font-mono text-xs md:text-sm text-[#4d4633] mt-1 font-bold">
                  {'// ADD CREDITS // UNLOCK SESSIONS'}
                </p>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { id: 'starter', name: 'Starter', tokens: 5, label: '₹199' },
                { id: 'pro', name: 'Pro', tokens: 15, label: '₹499' },
                { id: 'power', name: 'Power', tokens: 40, label: '₹999' }
              ].map(pkg => (
                <div key={pkg.id} className="bg-[#ffffff] border-[3px] border-[#1b1b1b] p-6 flex flex-col items-center justify-between min-h-[300px] neo-shadow transition-transform hover:-translate-y-1">
                  <div className="text-center w-full">
                    <h2 className="text-2xl font-black font-headline uppercase border-b-[2px] border-dashed border-[#1b1b1b] pb-2 mb-4">
                      {pkg.name}
                    </h2>
                    <p className="font-mono text-4xl font-black mb-2">{pkg.tokens}</p>
                    <p className="font-mono text-sm font-bold text-[#4d4633] uppercase">Tokens</p>
                  </div>
                  <div className="text-center w-full mt-6">
                    <p className="font-headline text-3xl font-black mb-4">{pkg.label}</p>
                    <button 
                      onClick={() => {
                        // Mock payment for standalone UI
                        if(window.confirm('Simulate Razorpay payment success for ' + pkg.name + '?')) {
                          setUser(u => ({...u, tokenBalance: u.tokenBalance + pkg.tokens}));
                          setCurrentView('dashboard');
                        }
                      }}
                      className="w-full py-3 bg-[#ffd93d] text-[#1b1b1b] border-[3px] border-[#1b1b1b] neo-shadow neo-btn font-bold cursor-pointer uppercase"
                    >
                      BUY NOW
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      )}
`;

code = code.replace("{/* -------------------- 3. HISTORY & REPORTS VIEW -------------------- */}", buyTokensCode + "\n\n      {/* -------------------- 3. HISTORY & REPORTS VIEW -------------------- */}");

fs.writeFileSync('./app/page.tsx', code);
