const fs = require('fs');
let code = fs.readFileSync('./app/page.tsx', 'utf8');
code = code.replace(/<div className="flex items-center justify-between border-t-\[2px\] border-dashed border-\[#1b1b1b\] pt-2 mt-1">\s*<span className="font-mono text-\[10px\] font-bold">TOKENS: \{user\.tokenBalance\}<\/span>\s*<button onClick=\{\(\) => setCurrentView\('buy_tokens'\)\} className="font-mono text-\[10px\] bg-\[#ffd93d\] text-\[#1b1b1b\] px-2 py\.0\.5 border border-\[#1b1b1b\] hover:bg-\[#e8c426\] font-bold cursor-pointer">BUY<\/button>\s*<\/div>\s*<\/div>\s*<nav className="flex-1 flex flex-col space-y-2">/g, 
`<div className="flex items-center justify-between border-t-[2px] border-dashed border-[#1b1b1b] pt-2 mt-1">
                  <span className="font-mono text-[10px] font-bold">TOKENS: {user.tokenBalance}</span>
                  <button onClick={() => setCurrentView('buy_tokens')} className="font-mono text-[10px] bg-[#ffd93d] text-[#1b1b1b] px-2 py-0.5 border border-[#1b1b1b] hover:bg-[#e8c426] font-bold cursor-pointer">BUY</button>
                </div>
              </div>
            </div>
            
            <nav className="flex-1 flex flex-col space-y-2">`);
fs.writeFileSync('./app/page.tsx', code);
