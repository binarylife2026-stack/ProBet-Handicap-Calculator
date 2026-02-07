
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

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 p-4 lg:p-10 font-sans selection:bg-indigo-500">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Simplified Premium Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tightest flex items-center gap-3">
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">BET</span>
              <span className="text-slate-500 font-light">/</span>
              <span className="text-white">QUANTUM</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-1">Real-Time Payout Analysis</p>
          </div>

          <div className="flex items-center gap-6 bg-slate-800/50 p-2 pl-6 rounded-2xl border border-slate-700/50 backdrop-blur-md">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-500 uppercase">Odds</span>
              <span className="text-xl font-black text-indigo-400 tabular-nums">{odds.toFixed(2)}</span>
            </div>
            <div className="h-10 w-px bg-slate-700"></div>
            <div className="flex flex-col mr-4">
              <span className="text-[9px] font-black text-slate-500 uppercase">Stake</span>
              <span className="text-xl font-black text-indigo-400 tabular-nums">${stake}</span>
            </div>
            <button 
              onClick={() => { setHomeScore(0); setAwayScore(0); }}
              className="p-4 bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
            >
              <ResetIcon />
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Controls Panel */}
          <div className="xl:col-span-4 space-y-8">
            {/* Scoreboard Card */}
            <div className="bg-slate-800/40 p-10 rounded-[2.5rem] border border-slate-700/50 shadow-2xl space-y-10">
              <div className="flex justify-between items-center px-4">
                <div className="flex flex-col items-center gap-6">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Home Side</span>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => setHomeScore(s => s+1)} className="w-16 h-16 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-900/40 font-black text-2xl transition-all active:scale-95">+</button>
                    <div className="text-6xl font-black py-4 text-center tabular-nums">{homeScore}</div>
                    <button onClick={() => setHomeScore(s => Math.max(0, s-1))} className="w-16 h-16 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-2xl font-black text-2xl transition-all active:scale-95">-</button>
                  </div>
                </div>

                <div className="text-4xl font-black text-slate-700">:</div>

                <div className="flex flex-col items-center gap-6">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Away Side</span>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => setAwayScore(s => s+1)} className="w-16 h-16 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-900/40 font-black text-2xl transition-all active:scale-95">+</button>
                    <div className="text-6xl font-black py-4 text-center tabular-nums">{awayScore}</div>
                    <button onClick={() => setAwayScore(s => Math.max(0, s-1))} className="w-16 h-16 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-2xl font-black text-2xl transition-all active:scale-95">-</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Params Card */}
            <div className="bg-slate-800/40 p-10 rounded-[2.5rem] border border-slate-700/50 space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Market Selection</label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(HandicapType).map(type => (
                    <button 
                      key={type}
                      onClick={() => setHandicapType(type)}
                      className={`py-4 rounded-2xl font-black text-sm transition-all border-2 ${
                        handicapType === type 
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-900/20" 
                        : "bg-slate-900/50 border-slate-700 text-slate-500 hover:border-slate-600"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase px-2">Global Odds</label>
                  <input 
                    type="number" step="0.01" value={odds} 
                    onChange={e => setOdds(Number(e.target.value))} 
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-6 py-4 font-black text-indigo-400 outline-none focus:border-indigo-500 transition-all text-center"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase px-2">Stake Unit</label>
                  <input 
                    type="number" value={stake} 
                    onChange={e => setStake(Number(e.target.value))} 
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-6 py-4 font-black text-indigo-400 outline-none focus:border-indigo-500 transition-all text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Matrix Panel */}
          <div className="xl:col-span-8">
            <div className="bg-slate-800/40 rounded-[3rem] border border-slate-700/50 overflow-hidden shadow-2xl flex flex-col h-full">
              {/* Matrix Header */}
              <div className="grid grid-cols-12 gap-4 px-12 py-8 bg-slate-900/80 border-b border-slate-700/50 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 sticky top-0 z-20 backdrop-blur-lg">
                <div className="col-span-2">Market Line</div>
                <div className="col-span-3 text-center">W1 (Home)</div>
                {handicapType === HandicapType.EUROPEAN && <div className="col-span-2 text-center">X (Draw)</div>}
                <div className={`${handicapType === HandicapType.EUROPEAN ? 'col-span-5' : 'col-span-7'} text-center`}>W2 (Away)</div>
              </div>

              {/* Rows Container */}
              <div className="flex-1 overflow-y-auto scroller custom-scrollbar max-h-[1200px]">
                {matrixData.map(({ line, homeRes, drawRes, awayRes }, idx) => (
                  <div key={line} className={`grid grid-cols-12 gap-4 px-12 py-8 items-center border-b border-slate-700/30 group transition-all hover:bg-slate-700/20 ${idx % 2 === 0 ? 'bg-transparent' : 'bg-slate-800/20'}`}>
                    
                    {/* Line Branding */}
                    <div className="col-span-2">
                       <div className={`inline-flex flex-col items-center justify-center min-w-[80px] p-4 rounded-2xl border-2 transition-all ${line === 0 ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : 'bg-slate-900/50 border-slate-700 text-slate-300'}`}>
                          <span className="text-xl font-black tabular-nums">{formatLineValue(line)}</span>
                          <span className="text-[8px] font-black uppercase opacity-50 mt-1">{line === 0 ? 'NEUTRAL' : 'SPREAD'}</span>
                       </div>
                    </div>

                    {/* Result Columns */}
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

                    {/* Split Line Indicator (Sub-row) */}
                    {handicapType === HandicapType.ASIAN && (Math.abs(line % 1) === 0.25 || Math.abs(line % 1) === 0.75) && (
                      <div className="col-span-12 flex justify-center -mt-2">
                         <div className="px-6 py-1.5 bg-slate-900/50 rounded-full border border-slate-700/50 flex gap-6 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            <span className="text-slate-400">PART 1: <span className="text-indigo-400">{formatLineValue(line - 0.25)}</span></span>
                            <div className="w-1 h-1 bg-slate-700 rounded-full my-auto"></div>
                            <span className="text-slate-400">PART 2: <span className="text-indigo-400">{formatLineValue(line + 0.25)}</span></span>
                         </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <footer className="text-center py-12 text-slate-600 text-[10px] font-black uppercase tracking-[0.8em]">
          Analytical Matrix Engine • Pure Calculation Unit
        </footer>
      </div>

      <style>{`
        .scroller::-webkit-scrollbar { width: 6px; }
        .scroller::-webkit-scrollbar-track { background: transparent; }
        .scroller::-webkit-scrollbar-thumb { background: #334155; border-radius: 20px; }
        .scroller::-webkit-scrollbar-thumb:hover { background: #475569; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </div>
  );
};

// Simplified High-Performance Result Cell
const MatrixCell: React.FC<{ 
  result: CalculationResult; 
  label: string; 
  scoreDiff: number; 
  line: number; 
  isFullWidth?: boolean;
}> = ({ result, label, scoreDiff, line, isFullWidth }) => {
  const isWin = result.status === ResultStatus.WIN || result.status === ResultStatus.HALF_WIN;
  const isLoss = result.status === ResultStatus.LOSS || result.status === ResultStatus.HALF_LOSS;
  const isPush = result.status === ResultStatus.PUSH;

  const colorClasses = isWin 
    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
    : isLoss 
    ? "bg-rose-500/10 border-rose-500/30 text-rose-400" 
    : "bg-slate-700/20 border-slate-700/50 text-slate-400";

  const statusBadgeClasses = isWin 
    ? "bg-emerald-500 text-emerald-950" 
    : isLoss 
    ? "bg-rose-500 text-rose-950" 
    : "bg-slate-600 text-slate-100";

  return (
    <div className={`${isFullWidth ? 'col-span-7' : 'col-span-3'} flex flex-col items-center gap-3 group/cell`}>
      <div className={`w-full max-w-[180px] p-5 rounded-[1.5rem] border-2 transition-all group-hover/cell:scale-105 group-hover/cell:shadow-xl ${colorClasses}`}>
        <div className="flex flex-col items-center gap-2">
          <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${statusBadgeClasses}`}>
            {result.status}
          </span>
          
          <div className="flex flex-col items-center">
            <span className="text-xl font-black tabular-nums">
              {result.netProfit > 0 ? '+' : ''}${result.netProfit.toFixed(1)}
            </span>
            <span className="text-[9px] font-bold opacity-50 uppercase tracking-widest mt-0.5">Net Profit</span>
          </div>
        </div>
      </div>
      
      {/* Inline Logic Peek */}
      <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest opacity-0 group-hover/cell:opacity-100 transition-opacity">
        {scoreDiff} + ({line.toFixed(2)}) = <span className="text-indigo-500">{(scoreDiff + line).toFixed(2)}</span>
      </div>
    </div>
  );
};

export default App;
