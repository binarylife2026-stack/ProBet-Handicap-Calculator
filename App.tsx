
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
      <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8">
        
        {/* Responsive Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center gap-6 bg-slate-900/40 p-6 rounded-3xl border border-slate-800 backdrop-blur-md">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-black tracking-tightest flex items-center justify-center sm:justify-start gap-2">
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent uppercase">Quantum</span>
              <span className="text-white uppercase">Bet</span>
            </h1>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Professional Payout Engine</p>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={resetAll}
              className="group flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl transition-all active:scale-95"
            >
              <ResetIcon />
              <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Reset System</span>
            </button>
          </div>
        </header>

        {/* Dashboard Control Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Controls Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900/60 p-8 rounded-[2rem] border border-slate-800 shadow-2xl space-y-8">
              <div className="flex items-center justify-between gap-4">
                <ScoreControl label="Home" score={homeScore} setScore={setHomeScore} />
                <div className="text-2xl font-black text-slate-700 mt-8">:</div>
                <ScoreControl label="Away" score={awayScore} setScore={setAwayScore} />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Handicap Format</label>
                <div className="flex p-1.5 bg-slate-950/50 rounded-2xl border border-slate-800">
                  {Object.values(HandicapType).map(type => (
                    <button 
                      key={type}
                      onClick={() => setHandicapType(type)}
                      className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${
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
                <InputGroup label="Decimal Odds" value={odds} onChange={setOdds} step={0.01} />
                <InputGroup label="Stake ($)" value={stake} onChange={setStake} />
              </div>
            </div>
          </div>

          {/* Outcome Matrix Panel */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="flex-1 bg-slate-900/40 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl flex flex-col min-h-[600px]">
              
              <div className="px-10 py-6 border-b border-slate-800 bg-slate-950/20 flex justify-between items-center">
                <h2 className="text-lg font-black uppercase tracking-widest text-slate-400">
                  {handicapType} Outcome Matrix
                </h2>
                <div className="flex gap-4">
                  <StatusLegend color="emerald" label="Win" />
                  <StatusLegend color="rose" label="Loss" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scroller custom-scrollbar max-h-[1000px] p-6 md:p-10">
                {handicapType === HandicapType.EUROPEAN ? (
                  /* EUROPEAN HANDICAP GRID FORMAT */
                  <div className="grid grid-cols-1 gap-4">
                    {matrixData.map(({ line, homeRes, drawRes, awayRes }) => (
                      <div key={line} className="grid grid-cols-3 gap-3 sm:gap-4">
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
                      <div key={line} className={`flex flex-col gap-4 p-6 rounded-3xl border border-slate-800/60 transition-all hover:bg-slate-800/20 ${idx % 2 === 0 ? 'bg-slate-900/20' : 'bg-transparent'}`}>
                        <div className="flex items-center justify-between">
                          <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400 font-black text-sm">
                            Line {formatAHLine(line)}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <AHCell label="Home" result={homeRes} />
                          <AHCell label="Away" result={awayRes} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <footer className="text-center pt-8 text-slate-700 text-[10px] font-black uppercase tracking-[0.5em]">
          Quantum Matrix Analysis • 2025 • High Fidelity Logic
        </footer>
      </div>

      <style>{`
        .scroller::-webkit-scrollbar { width: 4px; }
        .scroller::-webkit-scrollbar-track { background: transparent; }
        .scroller::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 10px; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </div>
  );
};

const EHCard: React.FC<{ lineStr: string; selection: string; result: CalculationResult }> = ({ lineStr, selection, result }) => {
  const isWin = result.status === ResultStatus.WIN;
  const colorClass = isWin 
    ? "bg-emerald-500 text-emerald-950 border-emerald-400" 
    : "bg-slate-800/60 text-slate-400 border-slate-700/50 hover:bg-slate-800";

  return (
    <div className={`flex flex-col items-center justify-center p-5 rounded-[1.5rem] border-2 transition-all cursor-default ${colorClass}`}>
      <span className="text-[10px] sm:text-xs font-black uppercase opacity-60 tracking-tighter">
        {lineStr} {selection}
      </span>
      <span className="text-lg sm:text-xl font-black mt-1 tabular-nums">
        {result.status === ResultStatus.WIN ? `+$${result.netProfit.toFixed(1)}` : `-$${Math.abs(result.netProfit).toFixed(0)}`}
      </span>
    </div>
  );
};

const AHCell: React.FC<{ label: string; result: CalculationResult }> = ({ label, result }) => {
  const isWin = result.status === ResultStatus.WIN || result.status === ResultStatus.HALF_WIN;
  const isLoss = result.status === ResultStatus.LOSS || result.status === ResultStatus.HALF_LOSS;
  
  const statusColor = isWin ? "text-emerald-400" : isLoss ? "text-rose-400" : "text-slate-500";
  const badgeColor = isWin ? "bg-emerald-500/20 text-emerald-400" : isLoss ? "bg-rose-500/20 text-rose-400" : "bg-slate-800 text-slate-500";

  return (
    <div className="flex items-center justify-between p-4 bg-slate-950/40 rounded-2xl border border-slate-800/50">
      <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{label}</span>
      <div className="flex items-center gap-4">
        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${badgeColor}`}>
          {result.status}
        </span>
        <span className={`text-sm font-black tabular-nums ${statusColor}`}>
          {result.netProfit > 0 ? '+' : ''}${result.netProfit.toFixed(1)}
        </span>
      </div>
    </div>
  );
};

const ScoreControl: React.FC<{ label: string; score: number; setScore: (n: number) => void }> = ({ label, score, setScore }) => (
  <div className="flex-1 flex flex-col items-center gap-4">
    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    <div className="flex flex-col gap-2 w-full max-w-[100px]">
      <button onClick={() => setScore(score + 1)} className="py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-lg font-black text-xl transition-all active:scale-90">+</button>
      <div className="text-4xl font-black py-4 bg-slate-950/50 rounded-2xl border border-slate-800 text-center tabular-nums">{score}</div>
      <button onClick={() => setScore(Math.max(0, score - 1))} className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-2xl font-black text-xl transition-all active:scale-90">-</button>
    </div>
  </div>
);

const InputGroup: React.FC<{ label: string; value: number; onChange: (n: number) => void; step?: number }> = ({ label, value, onChange, step = 1 }) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-slate-500 uppercase px-2">{label}</label>
    <input 
      type="number" step={step} value={value} 
      onChange={e => onChange(Number(e.target.value))} 
      className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 font-black text-indigo-400 outline-none focus:border-indigo-500 transition-all text-center text-lg"
    />
  </div>
);

const StatusLegend: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <div className={`w-2 h-2 bg-${color}-500 rounded-full`}></div>
    <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{label}</span>
  </div>
);

export default App;
