
import React, { useState, useMemo } from 'react';
import { 
  HandicapType, 
  BetSelection, 
  ResultStatus,
  CalculationResult
} from './types';
import { 
  ASIAN_HANDICAP_LINES, 
  EUROPEAN_HANDICAP_LINES, 
  DEFAULT_STAKE, 
  DEFAULT_ODDS 
} from './constants';
import { calculateResult } from './services/bettingLogic';

const ResetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
  </svg>
);

const App: React.FC = () => {
  const [handicapType, setHandicapType] = useState<HandicapType>(HandicapType.ASIAN);
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [odds, setOdds] = useState<number>(DEFAULT_ODDS);
  const [stake, setStake] = useState<number>(DEFAULT_STAKE);

  const handicapLines = handicapType === HandicapType.ASIAN ? ASIAN_HANDICAP_LINES : EUROPEAN_HANDICAP_LINES;

  const matrixData = useMemo(() => {
    return handicapLines.map(line => {
      const homeRes = calculateResult({
        handicapType,
        scores: { home: homeScore, away: awayScore },
        handicapLine: line,
        betSelection: BetSelection.HOME,
        odds,
        stake
      });

      const drawRes = handicapType === HandicapType.EUROPEAN ? calculateResult({
        handicapType,
        scores: { home: homeScore, away: awayScore },
        handicapLine: line,
        betSelection: BetSelection.DRAW,
        odds,
        stake
      }) : null;

      const awayRes = calculateResult({
        handicapType,
        scores: { home: homeScore, away: awayScore },
        handicapLine: line,
        betSelection: BetSelection.AWAY,
        odds,
        stake
      });

      return { line, homeRes, drawRes, awayRes };
    });
  }, [handicapType, homeScore, awayScore, odds, stake]);

  const formatEHLine = (line: number) => {
    if (line < 0) return `(0:${Math.abs(line)})`;
    if (line > 0) return `(${line}:0)`;
    return `(0:0)`;
  };

  const formatAHLine = (line: number) => {
    const prefix = line > 0 ? '+' : '';
    return `${prefix}${line.toFixed(2).replace(/\.00$/, '')}`;
  };

  const resetAll = () => {
    setHomeScore(0);
    setAwayScore(0);
    setOdds(DEFAULT_ODDS);
    setStake(DEFAULT_STAKE);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 font-sans selection:bg-indigo-500 pb-12">
      <div className="max-w-[1200px] mx-auto p-4 md:p-8 space-y-6">
        
        {/* Responsive Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/60 p-5 rounded-3xl border border-slate-800 backdrop-blur-md">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-black tracking-tightest flex items-center justify-center sm:justify-start gap-2">
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent uppercase tracking-tighter">Handicap</span>
              <span className="text-white uppercase tracking-tighter">Pro</span>
            </h1>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-1">Analytical Calculation Matrix</p>
          </div>

          <button 
            onClick={resetAll}
            className="group flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all active:scale-95"
          >
            <ResetIcon />
            <span className="text-[10px] font-black uppercase tracking-widest">Clear Matrix</span>
          </button>
        </header>

        {/* Control Center */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Controls Panel */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900/80 p-6 rounded-[2rem] border border-slate-800 shadow-xl space-y-6">
              {/* Score Adjuster */}
              <div className="flex items-center justify-between gap-4 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50">
                <ScoreControl label="Home" score={homeScore} setScore={setHomeScore} />
                <div className="text-xl font-black text-slate-700">:</div>
                <ScoreControl label="Away" score={awayScore} setScore={setAwayScore} />
              </div>

              {/* Format Switcher */}
              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Betting Logic</label>
                <div className="flex p-1 bg-slate-950/80 rounded-xl border border-slate-800">
                  {Object.values(HandicapType).map(type => (
                    <button 
                      key={type}
                      onClick={() => setHandicapType(type)}
                      className={`flex-1 py-2.5 rounded-lg font-black text-[10px] transition-all uppercase tracking-widest ${
                        handicapType === type 
                        ? "bg-indigo-600 text-white shadow-lg" 
                        : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Grid */}
              <div className="grid grid-cols-2 gap-3">
                <InputGroup label="Odds" value={odds} onChange={setOdds} step={0.01} />
                <InputGroup label="Stake ($)" value={stake} onChange={setStake} />
              </div>
            </div>
          </div>

          {/* Outcome Grid */}
          <div className="lg:col-span-8">
            <div className="bg-slate-900/40 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
              
              <div className="px-8 py-5 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  {handicapType} Handicap
                </h2>
                <div className="hidden sm:flex gap-4">
                  <StatusLegend color="emerald" label="Yield" />
                  <StatusLegend color="rose" label="Deficit" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scroller custom-scrollbar max-h-[800px] p-4 sm:p-8">
                {handicapType === HandicapType.EUROPEAN ? (
                  /* EUROPEAN HANDICAP GRID FORMAT (IMAGE MATCH) */
                  <div className="grid grid-cols-1 gap-2.5 sm:gap-4">
                    {matrixData.map(({ line, homeRes, drawRes, awayRes }) => (
                      <div key={line} className="grid grid-cols-3 gap-2 sm:gap-4">
                        <EHCard lineStr={formatEHLine(line)} selection="W1" result={homeRes} />
                        <EHCard lineStr={formatEHLine(line)} selection="X" result={drawRes!} />
                        <EHCard lineStr={formatEHLine(line)} selection="W2" result={awayRes} />
                      </div>
                    ))}
                  </div>
                ) : (
                  /* ASIAN HANDICAP ROW FORMAT */
                  <div className="space-y-4">
                    {matrixData.map(({ line, homeRes, awayRes }, idx) => (
                      <div key={line} className={`flex flex-col gap-4 p-5 rounded-2xl border border-slate-800/60 transition-all hover:bg-slate-800/20 ${idx % 2 === 0 ? 'bg-slate-900/30' : 'bg-transparent'}`}>
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                            Spread: {formatAHLine(line)}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <AHCell label="Home" result={homeRes} />
                          <AHCell label="Away" result={awayRes} />
                        </div>
                        
                        {/* Split Indicator for AH */}
                        {(Math.abs(line % 1) === 0.25 || Math.abs(line % 1) === 0.75) && (
                           <div className="flex justify-center -mt-2">
                             <div className="px-3 py-1 bg-indigo-500/5 rounded-lg border border-indigo-500/10 text-[7px] font-black text-slate-600 uppercase tracking-widest">
                                Split: {formatAHLine(line - 0.25)} & {formatAHLine(line + 0.25)}
                             </div>
                           </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .scroller::-webkit-scrollbar { width: 3px; }
        .scroller::-webkit-scrollbar-track { background: transparent; }
        .scroller::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        @media (max-width: 640px) {
          .tabular-nums { font-variant-numeric: tabular-nums; }
        }
      `}</style>
    </div>
  );
};

const EHCard: React.FC<{ lineStr: string; selection: string; result: CalculationResult }> = ({ lineStr, selection, result }) => {
  const isWin = result.status === ResultStatus.WIN;
  const isLoss = result.status === ResultStatus.LOSS;
  
  // Design matching user image (dark grey/blue cards)
  const baseBg = isWin ? "bg-emerald-600/20" : "bg-[#1E293B]";
  const borderCol = isWin ? "border-emerald-500/40 shadow-lg shadow-emerald-500/5" : "border-slate-800";
  const valCol = isWin ? "text-emerald-400" : isLoss ? "text-rose-400" : "text-white";

  return (
    <div className={`flex flex-col items-center justify-center p-3 sm:p-5 rounded-2xl border transition-all hover:scale-[1.02] cursor-default ${baseBg} ${borderCol}`}>
      <span className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-tight whitespace-nowrap">
        {lineStr} {selection}
      </span>
      <span className={`text-sm sm:text-base font-black mt-1 tabular-nums ${valCol}`}>
        {result.netProfit >= 0 ? `+$${result.netProfit.toFixed(1)}` : `-$${Math.abs(result.netProfit).toFixed(0)}`}
      </span>
    </div>
  );
};

const AHCell: React.FC<{ label: string; result: CalculationResult }> = ({ label, result }) => {
  const isWin = result.status === ResultStatus.WIN || result.status === ResultStatus.HALF_WIN;
  const isLoss = result.status === ResultStatus.LOSS || result.status === ResultStatus.HALF_LOSS;
  
  const profitColor = isWin ? "text-emerald-400" : isLoss ? "text-rose-400" : "text-slate-500";
  const badgeColor = 
    result.status === ResultStatus.WIN ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20" :
    result.status === ResultStatus.HALF_WIN ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/10" :
    result.status === ResultStatus.LOSS ? "bg-rose-500/20 text-rose-400 border-rose-500/20" :
    result.status === ResultStatus.HALF_LOSS ? "bg-rose-500/10 text-rose-500 border-rose-500/10" :
    "bg-slate-800 text-slate-500 border-slate-700";

  return (
    <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/40">
      <div className="flex flex-col">
        <span className="text-[8px] font-black uppercase text-slate-600 tracking-wider mb-1">{label} Result</span>
        <span className={`w-fit px-1.5 py-0.5 rounded border text-[7px] font-black uppercase tracking-tighter ${badgeColor}`}>
          {result.status}
        </span>
      </div>
      <div className="text-right">
        <span className={`text-base font-black tabular-nums block leading-tight ${profitColor}`}>
          {result.netProfit > 0 ? '+' : ''}${result.netProfit.toFixed(1)}
        </span>
        <span className="text-[7px] font-black uppercase text-slate-700 tracking-widest">Yield</span>
      </div>
    </div>
  );
};

const ScoreControl: React.FC<{ label: string; score: number; setScore: (n: number) => void }> = ({ label, score, setScore }) => (
  <div className="flex-1 flex flex-col items-center gap-3">
    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    <div className="flex items-center gap-2 w-full justify-center">
      <button onClick={() => setScore(Math.max(0, score - 1))} className="w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg font-black transition-all active:scale-90">-</button>
      <div className="text-3xl font-black tabular-nums w-12 text-center text-white">{score}</div>
      <button onClick={() => setScore(score + 1)} className="w-8 h-8 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg font-black transition-all active:scale-90">+</button>
    </div>
  </div>
);

const InputGroup: React.FC<{ label: string; value: number; onChange: (n: number) => void; step?: number }> = ({ label, value, onChange, step = 1 }) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black text-slate-500 uppercase px-1 tracking-widest">{label}</label>
    <input 
      type="number" step={step} value={value} 
      onChange={e => onChange(Number(e.target.value))} 
      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 font-black text-indigo-400 outline-none focus:border-indigo-600 transition-all text-center text-sm"
    />
  </div>
);

const StatusLegend: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-1.5">
    <div className={`w-1.5 h-1.5 bg-${color}-500 rounded-full shadow-sm shadow-${color}-500/50`}></div>
    <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">{label}</span>
  </div>
);

export default App;
