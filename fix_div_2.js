const fs = require('fs');
let code = fs.readFileSync('./app/page.tsx', 'utf8');
code = code.replace(/<div className="flex flex-col gap-2 p-2 border-\[3px\] border-\[#1b1b1b\] bg-\[#f9f9f9\] neo-shadow-static mt-3">\s*<div className="flex items-center gap-3">\s*<div className="w-10 h-10 border-\[3px\] border-\[#1b1b1b\] bg-\[#ffd93d\] flex items-center justify-center shrink-0 font-bold">\s*<span className="material-symbols-outlined text-2xl text-\[#1b1b1b\]">smart_toy<\/span>\s*<\/div>\s*<div className="min-w-0">\s*<div className="font-mono text-xs font-bold truncate text-\[#1b1b1b\]">\{user\.name\}<\/div>\s*<div className="font-mono text-\[10px\] text-\[#705d00\] font-bold uppercase">\{user\.tier\}<\/div>\s*<\/div>\s*<\/div>\s*<div className="flex items-center justify-between border-t-\[2px\] border-dashed border-\[#1b1b1b\] pt-2 mt-1">\s*<span className="font-mono text-\[10px\] font-bold">TOKENS: \{user\.tokenBalance\}<\/span>\s*<button onClick=\{\(\) => setCurrentView\('buy_tokens'\)\} className="font-mono text-\[10px\] bg-\[#ffd93d\] text-\[#1b1b1b\] px-2 py-0\.5 border border-\[#1b1b1b\] hover:bg-\[#e8c426\] font-bold cursor-pointer">BUY<\/button>\s*<\/div>\s*<\/div>\s*<\/div>\s*<nav className="flex-1 flex flex-col space-y-2">/g, 
`<div className="flex flex-col gap-2 p-2 border-[3px] border-[#1b1b1b] bg-[#f9f9f9] neo-shadow-static mt-3">
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
          
          <nav className="flex-1 flex flex-col space-y-2">`);
fs.writeFileSync('./app/page.tsx', code);
