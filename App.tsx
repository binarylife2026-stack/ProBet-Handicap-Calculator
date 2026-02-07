
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

  const formatLineValue = (line: number) => {
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
      <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8">
        
        {/* Responsive Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center gap-6 bg-slate-900/40 p-6 rounded-3xl border border-slate-800 backdrop-blur-md">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-black tracking-tightest flex items-center justify-center sm:justify-start gap-2">
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">BET</span>
              <span className="text-white">QUANTUM</span>
            </h1>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Professional Yield Matrix</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Stake</span>
              <span className="text-xl font-black text-indigo-400 tabular-nums">${stake}</span>
            </div>
            <button 
              onClick={resetAll}
              className="group flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl transition-all hover:scale-105 active:scale-95"
            >
              <ResetIcon />
              <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Reset Matrix</span>
            </button>
          </div>
        </header>

        {/* Dashboard Control Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Controls Panel */}
          <div className="lg:col-span-5 space-y-6">
            {/* Scoreboard Card */}
            <div className="bg-slate-900/60 p-8 rounded-[2rem] border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[80px] pointer-events-none"></div>
              
              <div className="flex items-center justify-between gap-4">
                {/* Home */}
                <div className="flex-1 flex flex-col items-center gap-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Home</span>
                  <div className="flex flex-col gap-2 w-full max-w-[120px]">
                    <button onClick={() => setHomeScore(s => s + 1)} className="py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-lg font-black text-2xl transition-all active:scale-90">+</button>
                    <div className="text-5xl font-black py-4 bg-slate-950/50 rounded-2xl border border-slate-800 text-center tabular-nums">{homeScore}</div>
                    <button onClick={() => setHomeScore(s => Math.max(0, s - 1))} className="py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-2xl font-black text-2xl transition-all active:scale-90">-</button>
                  </div>
                </div>

                <div className="text-3xl font-black text-slate-700 mb-8 self-end pb-12">:</div>

                {/* Away */}
                <div className="flex-1 flex flex-col items-center gap-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Away</span>
                  <div className="flex flex-col gap-2 w-full max-w-[120px]">
                    <button onClick={() => setAwayScore(s => s + 1)} className="py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-lg font-black text-2xl transition-all active:scale-90">+</button>
                    <div className="text-5xl font-black py-4 bg-slate-950/50 rounded-2xl border border-slate-800 text-center tabular-nums">{awayScore}</div>
                    <button onClick={() => setAwayScore(s => Math.max(0, s - 1))} className="py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-2xl font-black text-2xl transition-all active:scale-90">-</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Market & Parameters Card */}
            <div className="bg-slate-900/60 p-8 rounded-[2rem] border border-slate-800 space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Market Logic</label>
                <div className="flex p-1.5 bg-slate-950/50 rounded-2xl border border-slate-800">
                  {Object.values(HandicapType).map(type => (
                    <button 
                      key={type}
                      onClick={() => setHandicapType(type)}
                      className={`flex-1 py-3.5 rounded-xl font-black text-xs transition-all ${
                        handicapType === type 
                        ? "bg-indigo-600 text-white shadow-xl" 
                        : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase px-2">Decimal Odds</label>
                  <input 
                    type="number" step="0.01" value={odds} 
                    onChange={e => setOdds(Number(e.target.value))} 
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 font-black text-indigo-400 outline-none focus:border-indigo-500 transition-all text-center text-lg"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase px-2">Stake ($)</label>
                  <input 
                    type="number" value={stake} 
                    onChange={e => setStake(Number(e.target.value))} 
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 font-black text-indigo-400 outline-none focus:border-indigo-500 transition-all text-center text-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Outcome Matrix Panel */}
          <div className="lg:col-span-7 h-full flex flex-col">
            <div className="flex-1 bg-slate-900/40 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl flex flex-col min-h-[600px]">
              
              {/* Matrix Table Header - Desktop Only */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-6 bg-slate-950/50 border-b border-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-500 sticky top-0 z-20 backdrop-blur-xl">
                <div className="col-span-2">Line</div>
                <div className="col-span-3 text-center">W1 (Home)</div>
                {handicapType === HandicapType.EUROPEAN && <div className="col-span-2 text-center">X (Draw)</div>}
                <div className={`${handicapType === HandicapType.EUROPEAN ? 'col-span-5' : 'col-span-7'} text-center`}>W2 (Away)</div>
              </div>

              {/* Matrix Body - Scrollable */}
              <div className="flex-1 overflow-y-auto scroller custom-scrollbar max-h-[1000px] p-4 md:p-0">
                {matrixData.map(({ line, homeRes, drawRes, awayRes }, idx) => (
                  <div 
                    key={line} 
                    className={`flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-4 px-0 md:px-8 py-4 md:py-6 border-b border-slate-800/40 transition-all hover:bg-slate-800/20 last:border-0 ${idx % 2 === 0 ? 'bg-transparent' : 'bg-slate-900/20'} md:items-center`}
                  >
                    {/* Line Indicator - Top on mobile, Col 1 on Desktop */}
                    <div className="md:col-span-2 px-4 md:px-0 flex items-center justify-between md:justify-start">
                       <div className={`inline-flex flex-col items-center justify-center min-w-[70px] p-3 rounded-xl border transition-all ${line === 0 ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' : 'bg-slate-950/50 border-slate-800 text-slate-400'}`}>
                          <span className="text-lg font-black tabular-nums leading-none">{formatLineValue(line)}</span>
                          <span className="text-[7px] font-black uppercase opacity-40 mt-1">Market</span>
                       </div>
                       <div className="md:hidden flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-600 uppercase">Analysis Engine</span>
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                       </div>
                    </div>

                    {/* Result Cells Container */}
                    <div className="flex flex-col md:contents gap-2 p-2 md:p-0 rounded-2xl bg-slate-950/20 md:bg-transparent">
                      <MatrixCell result={homeRes} label="Home" scoreDiff={homeScore - awayScore} line={line} />
                      
                      {handicapType === HandicapType.EUROPEAN && drawRes && (
                        <MatrixCell result={drawRes} label="Draw" scoreDiff={homeScore - awayScore} line={line} />
                      )}

                      <MatrixCell 
                        result={awayRes} 
                        label="Away" 
                        scoreDiff={homeScore - awayScore} 
                        line={line} 
                        isFullWidth={handicapType !== HandicapType.EUROPEAN}
                      />
                    </div>

                    {/* Split indicator for Asian quarter lines */}
                    {handicapType === HandicapType.ASIAN && (Math.abs(line % 1) === 0.25 || Math.abs(line % 1) === 0.75) && (
                      <div className="md:col-span-12 flex justify-center py-2 md:py-0 md:-mt-1 mb-2">
                        <div className="px-4 py-1 bg-indigo-950/40 rounded-full border border-indigo-800/30 flex gap-4 text-[8px] font-black text-indigo-500 uppercase tracking-widest">
                           <span>{formatLineValue(line - 0.25)}</span>
                           <div className="w-1 h-1 bg-indigo-800/50 rounded-full my-auto"></div>
                           <span>{formatLineValue(line + 0.25)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <footer className="text-center pt-8 text-slate-700 text-[10px] font-black uppercase tracking-[0.5em]">
          Bet Quantum • Precision Payout Logic • 2025
        </footer>
      </div>

      <style>{`
        .scroller::-webkit-scrollbar { width: 5px; }
        .scroller::-webkit-scrollbar-track { background: transparent; }
        .scroller::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 10px; }
        .scroller::-webkit-scrollbar-thumb:hover { background: #334155; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        @media (max-width: 768px) {
          .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #1E293B transparent; }
        }
      `}</style>
    </div>
  );
};

const MatrixCell: React.FC<{ 
  result: CalculationResult; 
  label: string; 
  scoreDiff: number; 
  line: number; 
  isFullWidth?: boolean;
}> = ({ result, label, scoreDiff, line, isFullWidth }) => {
  const isWin = result.status === ResultStatus.WIN || result.status === ResultStatus.HALF_WIN;
  const isLoss = result.status === ResultStatus.LOSS || result.status === ResultStatus.HALF_LOSS;

  const colorClasses = isWin 
    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
    : isLoss 
    ? "bg-rose-500/10 border-rose-500/20 text-rose-400" 
    : "bg-slate-800/30 border-slate-700/50 text-slate-500";

  const statusBadge = isWin 
    ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/20" 
    : isLoss 
    ? "bg-rose-500/20 text-rose-500 border-rose-500/20" 
    : "bg-slate-700/30 text-slate-400 border-slate-700/30";

  return (
    <div className={`${isFullWidth ? 'md:col-span-7' : 'md:col-span-3'} group/cell w-full`}>
      <div className={`flex items-center md:flex-col justify-between md:justify-center p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all md:hover:scale-105 md:hover:bg-slate-800/40 ${colorClasses}`}>
        
        {/* Mobile View Label */}
        <span className="md:hidden text-[9px] font-black uppercase text-slate-600 tracking-wider">Selection {label}</span>
        
        <div className="flex items-center md:flex-col gap-3 md:gap-2 text-right md:text-center">
          <span className={`px-2 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-tight ${statusBadge}`}>
            {result.status}
          </span>
          
          <div className="flex flex-col items-end md:items-center">
            <span className="text-sm md:text-lg font-black tabular-nums">
              {result.netProfit > 0 ? '+' : ''}${result.netProfit.toFixed(1)}
            </span>
            <span className="hidden md:block text-[8px] font-bold opacity-30 uppercase tracking-widest">Yield</span>
          </div>
        </div>
      </div>
      
      {/* Visual logic peek - Desktop hover only */}
      <div className="hidden md:block absolute mt-2 opacity-0 group-hover/cell:opacity-100 transition-all z-30 pointer-events-none">
         <div className="bg-slate-950 text-[10px] font-black px-3 py-2 rounded-lg border border-slate-800 text-indigo-400 shadow-2xl">
            {scoreDiff} + ({line.toFixed(2)}) = {(scoreDiff + line).toFixed(2)}
         </div>
      </div>
    </div>
  );
};

export default App;
