const fs = require('fs');
let code = fs.readFileSync('./app/page.tsx', 'utf8');

// The JSX is just missing a closing tag somewhere around line 750 (the HISTORY PAGE VIEW sidebar). 
// Since we used a regex that was too strict earlier, let's just do a simpler search and replace for the exact area in the HISTORY PAGE VIEW

let lines = code.split('\n');
let modified = false;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('HISTORY PAGE VIEW') || lines[i].includes('REPORTS VIEW') || lines[i].includes('DASHBOARD VIEW') || lines[i].includes('BUY TOKENS VIEW')) {
    // Look ahead to find the sidebar profile box
    for (let j = i; j < i + 50; j++) {
      if (j < lines.length && lines[j].includes('bg-[#f9f9f9] neo-shadow-static mt-3">')) {
         // Check if the next line is the start of the inner flex items-center gap-3
         if (lines[j+1].includes('className="flex items-center gap-3"')) {
            // Check if the closing div for that is missing
            // The structure we WANT is:
            /*
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
            */
            // Notice we need </div></div></div> (three closing divs) for the inner part before the bottom part
            let blockStr = lines.slice(j, j+15).join('\\n');
            console.log("Found block around line " + j + ":\\n" + blockStr);
         }
      }
    }
  }
}
