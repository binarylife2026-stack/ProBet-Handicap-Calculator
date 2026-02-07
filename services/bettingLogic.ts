
import { BetData, CalculationResult, HandicapType, ResultStatus, BetSelection, CalculationPart } from '../types';

export const calculateResult = (data: BetData): CalculationResult => {
  const { handicapType, scores, handicapLine, betSelection, odds, stake } = data;
  const scoreDiff = scores.home - scores.away;

  if (handicapType === HandicapType.EUROPEAN) {
    const adjustedDiff = scoreDiff + handicapLine;
    let winner: BetSelection;

    if (adjustedDiff > 0) winner = BetSelection.HOME;
    else if (adjustedDiff === 0) winner = BetSelection.DRAW;
    else winner = BetSelection.AWAY;

    const isWin = winner === betSelection;
    const status = isWin ? ResultStatus.WIN : ResultStatus.LOSS;
    const payout = isWin ? stake * odds : 0;

    return {
      status,
      payout,
      netProfit: payout - stake
    };
  } else {
    const isHomeBet = betSelection === BetSelection.HOME;
    
    const evaluatePart = (line: number, partStake: number): CalculationPart => {
      const adj = scoreDiff + line;
      let status: 'WIN' | 'LOSS' | 'PUSH';
      
      if (adj > 0) status = 'WIN';
      else if (adj < 0) status = 'LOSS';
      else status = 'PUSH';

      let multiplier = 0;
      if (isHomeBet) {
        multiplier = status === 'WIN' ? odds : (status === 'PUSH' ? 1 : 0);
      } else {
        // From Away perspective, Home 'WIN' is a Loss
        multiplier = status === 'LOSS' ? odds : (status === 'PUSH' ? 1 : 0);
        // Inverse status for the part metadata if needed, but we keep it relative to Home for consistency
      }

      return {
        line,
        status: isHomeBet ? status : (status === 'WIN' ? 'LOSS' : (status === 'LOSS' ? 'WIN' : 'PUSH')),
        payout: partStake * multiplier
      };
    };

    // Split lines logic (0.25, 0.75)
    if (Math.abs(handicapLine % 1) === 0.25 || Math.abs(handicapLine % 1) === 0.75) {
      const line1 = handicapLine - 0.25;
      const line2 = handicapLine + 0.25;
      const part1 = evaluatePart(line1, stake / 2);
      const part2 = evaluatePart(line2, stake / 2);
      
      const payout = part1.payout + part2.payout;
      
      let status: ResultStatus;
      if (part1.status === 'WIN' && part2.status === 'WIN') status = ResultStatus.WIN;
      else if (part1.status === 'LOSS' && part2.status === 'LOSS') status = ResultStatus.LOSS;
      else if (part1.status === 'PUSH' && part2.status === 'PUSH') status = ResultStatus.PUSH;
      else if ((part1.status === 'WIN' && part2.status === 'PUSH') || (part2.status === 'WIN' && part1.status === 'PUSH')) status = ResultStatus.HALF_WIN;
      else if ((part1.status === 'LOSS' && part2.status === 'PUSH') || (part2.status === 'LOSS' && part1.status === 'PUSH')) status = ResultStatus.HALF_LOSS;
      else status = ResultStatus.PUSH; // Should not happen in standard AH

      return {
        status,
        payout,
        netProfit: payout - stake,
        parts: [part1, part2]
      };
    } else {
      const part = evaluatePart(handicapLine, stake);
      const payout = part.payout;
      let status: ResultStatus;
      
      if (part.status === 'WIN') status = ResultStatus.WIN;
      else if (part.status === 'LOSS') status = ResultStatus.LOSS;
      else status = ResultStatus.PUSH;

      return {
        status,
        payout,
        netProfit: payout - stake
      };
    }
  }
};
