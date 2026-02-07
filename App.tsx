
import React, { useState, useMemo, useEffect } from 'react';
import { 
  HandicapType, 
  BetSelection, 
  BetData, 
  CalculationResult, 
  ResultStatus,
  HistoryItem
} from './types';
import { 
  ASIAN_HANDICAP_LINES, 
  EUROPEAN_HANDICAP_LINES, 
  DEFAULT_STAKE, 
  DEFAULT_ODDS 
} from './constants';
import { calculateResult } from './services/bettingLogic';
import { getLogicExplanation } from './services/geminiService';

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
  </svg>
);

const ResetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
  </svg>
);

const App: React.FC = () => {
  const [handicapType, setHandicapType] = useState<HandicapType>(HandicapType.ASIAN);
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [handicapLine, setHandicapLine] = useState<number>(0);
  const [betSelection, setBetSelection] = useState<BetSelection>(BetSelection.HOME);
  const [odds, setOdds] = useState<number>(DEFAULT_ODDS);
  const [stake, setStake] = useState<number>(DEFAULT_STAKE);
  
  const [explanation, setExplanation] = useState<string>("");
  const [isExplaining, setIsExplaining] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (handicapType === HandicapType.ASIAN && betSelection === BetSelection.DRAW) {
      setBetSelection(BetSelection.HOME);
    }
  }, [handicapType, betSelection]);

  const result = useMemo<CalculationResult>(() => {
    return calculateResult({
      handicapType,
      scores: { home: homeScore, away: awayScore },
      handicapLine,
      betSelection,
      odds,
      stake
    });
  }, [handicapType, homeScore, awayScore, handicapLine, betSelection, odds, stake]);

  const impliedProbability = useMemo(() => odds > 0 ? (1 / odds) * 100 : 0, [odds]);

  const currentEHWinner = useMemo(() => {
    if (handicapType !== HandicapType.EUROPEAN) return null;
    const diff = homeScore - awayScore + handicapLine;
    if (diff > 0) return BetSelection.HOME;
    if (diff === 0) return BetSelection.DRAW;
    return BetSelection.AWAY;
  }, [handicapType, homeScore, awayScore, handicapLine]);

  const asianLineAnalysis = useMemo(() => {
    if (handicapType !== HandicapType.ASIAN) return [];
    const startIndex = ASIAN_HANDICAP_LINES.findIndex(l => l === handicapLine);
    const range = ASIAN_HANDICAP_LINES.slice(
      Math.max(0, startIndex - 2),
      Math.min(ASIAN_HANDICAP_LINES.length, startIndex + 3)
    );
    
    return range.map(line => {
      const res = calculateResult({
        handicapType: HandicapType.ASIAN,
        scores: { home: homeScore, away: awayScore },
        handicapLine: line,
        betSelection,
        odds,
        stake
      });
      return { line, status: res.status };
    });
  }, [handicapType, homeScore, awayScore, handicapLine, betSelection, odds, stake]);

  const resetCalculator = () => {
    setHomeScore(0);
    setAwayScore(0);
    setHandicapLine(0);
    setBetSelection(BetSelection.HOME);
    setOdds(DEFAULT_ODDS);
    setStake(DEFAULT_STAKE);
    setExplanation("");
    setError(null);
  };

  const saveToHistory = () => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      handicapType,
      scores: { home: homeScore, away: awayScore },
      handicapLine,
      betSelection,
      odds,
      stake,
      result
    };
    setHistory([newItem, ...history].slice(0, 10));
  };

  const handleExplain = async () => {
    setIsExplaining(true);
    setError(null);
    try {
      const betData: BetData = {
        handicapType,
        scores: { home: homeScore, away: awayScore },
        handicapLine,
        betSelection,
        odds,
        stake
      };
      const text = await getLogicExplanation(betData, result);
      setExplanation(text);
    } catch (err: any) {
      if (err.message === "API_KEY_NOT_FOUND") {
        setError("AI Explanation requires a valid API key setup in the environment.");
      } else {
        setError("Failed to fetch logic explanation.");
      }
    } finally {
      setIsExplaining(false);
    }
  };

  const formatLine = (line: number) => {
    if (handicapType === HandicapType.ASIAN) {
      const isSplit = Math.abs(line % 1) === 0.25 || Math.abs(line % 1) === 0.75;
      const prefix = line > 0 ? '+' : '';
      if (isSplit) {
        return `${prefix}${line} (${prefix}${line - 0.25}, ${prefix}${line + 0.25})`;
      }
      return `${prefix}${line}`;
    }
    if (line === 0) return "(0:0)";
    if (line > 0) return `(${line}:0)`;
    return `(0:${Math.abs(line)})`;
  };

  const getStatusColor = (status: ResultStatus | 'WIN' | 'LOSS' | 'PUSH') => {
    switch (status) {
      case ResultStatus.WIN:
      case 'WIN': return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case ResultStatus.HALF_WIN: return "text-emerald-500 bg-emerald-50/50 border-emerald-100";
      case ResultStatus.PUSH:
      case 'PUSH': return "text-slate-500 bg-slate-100 border-slate-200";
      case ResultStatus.HALF_LOSS: return "text-rose-400 bg-rose-50/50 border-rose-100";
      case ResultStatus.LOSS:
      case 'LOSS': return "text-rose-600 bg-rose-50 border-rose-200";
      default: return "text-slate-400";
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center max-w-7xl mx-auto overflow-x-hidden">
      <header className="mb-8 text-center w-full px-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center justify-center gap-2">
          <span className="bg-indigo-600 text-white p-2 rounded-lg shadow-md">ProBet</span>
          Calculator
        </h1>
        <p className="text-slate-500 mt-2 text-sm md:text-base">Professional Asian & European Handicap Analysis</p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 w-full">
        
        {/* Left Column: Input Form */}
        <section className="lg:col-span-7 space-y-6 px-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex bg-slate-100 p-1 m-4 rounded-xl">
              {Object.values(HandicapType).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setHandicapType(type);
                    setHandicapLine(0);
                    setExplanation("");
                  }}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                    handicapType === type 
                    ? "bg-white text-indigo-600 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="p-4 md:p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Home Score</label>
                  <input type="number" min="0" value={homeScore} onChange={(e) => setHomeScore(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-semibold focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Away Score</label>
                  <input type="number" min="0" value={awayScore} onChange={(e) => setAwayScore(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-semibold focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Handicap Line</label>
                <div className="relative">
                  <select
                    value={handicapLine}
                    onChange={(e) => setHandicapLine(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-base md:text-lg font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                  >
                    {EUROPEAN_HANDICAP_LINES.concat(handicapType === HandicapType.ASIAN ? ASIAN_HANDICAP_LINES.filter(l => !EUROPEAN_HANDICAP_LINES.includes(l)) : []).sort((a,b) => a-b).filter(l => (handicapType === HandicapType.EUROPEAN && Number.isInteger(l)) || handicapType === HandicapType.ASIAN).map(line => (
                      <option key={line} value={line}>
                        {formatLine(line)}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Market Selection</label>
                <div className="grid grid-cols-3 gap-2">
                  {[BetSelection.HOME, BetSelection.DRAW, BetSelection.AWAY]
                    .filter(sel => handicapType === HandicapType.EUROPEAN || sel !== BetSelection.DRAW)
                    .map((sel) => {
                      const isWinner = handicapType === HandicapType.EUROPEAN && currentEHWinner === sel;
                      const isSelected = betSelection === sel;
                      return (
                        <button
                          key={sel}
                          onClick={() => setBetSelection(sel)}
                          className={`relative py-3 md:py-4 rounded-xl border-2 font-bold transition-all flex flex-col items-center justify-center text-sm md:text-base ${
                            isSelected ? "bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm" : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                          }`}
                        >
                          <span>{sel === BetSelection.HOME ? 'W1' : sel === BetSelection.AWAY ? 'W2' : 'X'}</span>
                          {handicapType === HandicapType.EUROPEAN && isWinner && (
                             <span className="text-[8px] md:text-[10px] text-emerald-600 font-bold uppercase mt-1">Winning</span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Odds</label>
                  <input type="number" step="0.01" value={odds} onChange={(e) => setOdds(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Stake</label>
                  <input type="number" value={stake} onChange={(e) => setStake(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={resetCalculator}
                  className="w-full md:w-auto px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                >
                  <ResetIcon />
                  Reset Inputs
                </button>
              </div>
            </div>
          </div>

          {handicapType === HandicapType.ASIAN && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-in fade-in slide-in-from-top-2 duration-500">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-4 block">Asian Line Matrix (W1 Outcome)</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {asianLineAnalysis.map(({ line, status }) => (
                  <div key={line} className={`p-2 rounded-lg border text-center transition-all text-[10px] font-bold ${getStatusColor(status)} ${line === handicapLine ? 'ring-2 ring-indigo-500 ring-offset-2 scale-105 shadow-sm' : ''}`}>
                    <div>{line > 0 ? `+${line}` : line}</div>
                    <div className="uppercase opacity-70 mt-1 leading-none text-[8px]">{status}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Right Column: Results & AI */}
        <section className="lg:col-span-5 space-y-6 px-1">
          <div className={`p-6 md:p-8 rounded-2xl shadow-lg border-2 transition-all duration-500 relative overflow-hidden ${
            result.status === ResultStatus.WIN || result.status === ResultStatus.HALF_WIN ? "bg-emerald-50 border-emerald-500" : result.status === ResultStatus.PUSH ? "bg-slate-50 border-slate-400" : "bg-rose-50 border-rose-500"
          }`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Analysis Result</span>
                <h2 className={`text-3xl md:text-4xl font-black mt-1 ${result.status === ResultStatus.WIN || result.status === ResultStatus.HALF_WIN ? "text-emerald-700" : result.status === ResultStatus.PUSH ? "text-slate-600" : "text-rose-700"}`}>
                  {result.status}
                </h2>
              </div>
              <div className="bg-white/50 backdrop-blur-sm p-3 rounded-xl border border-white/40 text-center">
                <span className="block text-[10px] font-bold text-slate-500">PAYOUT</span>
                <span className="text-xl md:text-2xl font-bold">${result.payout.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Split Details Section */}
            {result.parts && (
              <div className="mb-6 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">Split Bet Breakdown</span>
                <div className="grid grid-cols-2 gap-2">
                  {result.parts.map((p, idx) => (
                    <div key={idx} className={`p-2 rounded-lg border bg-white/40 backdrop-blur-sm flex flex-col items-center ${getStatusColor(p.status)}`}>
                      <span className="text-[10px] font-bold">Line {p.line > 0 ? '+' : ''}{p.line}</span>
                      <span className="text-[9px] font-black uppercase mb-1">{p.status}</span>
                      <span className="text-[10px] font-bold opacity-80">${p.payout.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/40 p-4 rounded-xl">
                <span className="block text-[10px] font-bold text-slate-500 uppercase">Implied Prob.</span>
                <span className="text-lg md:text-xl font-bold text-slate-700">{impliedProbability.toFixed(1)}%</span>
              </div>
              <div className="bg-white/40 p-4 rounded-xl">
                <span className="block text-[10px] font-bold text-slate-500 uppercase">Net Profit</span>
                <span className={`text-lg md:text-xl font-bold ${result.netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {result.netProfit >= 0 ? '+' : ''}${result.netProfit.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-2">
              <button onClick={handleExplain} disabled={isExplaining} className="flex-[2] bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50">
                {isExplaining ? <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <><InfoIcon /> Explain</>}
              </button>
              <button onClick={saveToHistory} className="flex-1 bg-white border border-slate-200 text-slate-600 hover:border-indigo-500 hover:text-indigo-600 font-bold py-4 rounded-xl transition-all shadow-sm">
                Save
              </button>
            </div>
          </div>

          {(explanation || error) && (
            <div className="bg-indigo-950 text-indigo-100 p-6 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                </div>
                <h3 className="font-bold text-[10px] uppercase tracking-wider">Logic Breakdown</h3>
              </div>
              {error ? <div className="text-rose-300 text-xs bg-rose-900/20 p-4 rounded-xl border border-rose-800/50">{error}</div> : <p className="whitespace-pre-wrap leading-relaxed opacity-90 text-[11px] md:text-xs font-medium">{explanation}</p>}
            </div>
          )}

          {history.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 overflow-hidden">
              <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-4">Scenario Log</h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {history.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700">{item.scores.home}:{item.scores.away} @ {item.handicapLine > 0 ? '+' : ''}{item.handicapLine}</span>
                      <span className="text-[9px] text-slate-400 uppercase">{item.handicapType} • {item.betSelection}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase ${getStatusColor(item.result.status)}`}>{item.result.status}</span>
                      <span className="font-bold text-slate-600">${item.result.payout.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="mt-auto py-8 text-center text-slate-400 text-[10px] font-medium px-4">
        <p>© 2024 ProBet Betting Analytics. Professional handicap modeling engine.</p>
      </footer>
    </div>
  );
};

export default App;
