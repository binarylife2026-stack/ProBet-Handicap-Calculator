
import { GoogleGenAI } from "@google/genai";
import { BetData, CalculationResult } from "../types";

export const getLogicExplanation = async (data: BetData, result: CalculationResult): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Role: Professional Betting Calculator Engine.
    
    Input Match Data:
    - Handicap Type: ${data.handicapType}
    - Scores: Home ${data.scores.home} - Away ${data.scores.away}
    - Handicap Line: ${data.handicapLine > 0 ? '+' : ''}${data.handicapLine}
    - Selection: ${data.betSelection}
    - Odds: ${data.odds}
    - Stake: ${data.stake}
    
    Calculated Result:
    - Status: ${result.status}
    - Payout: ${result.payout.toFixed(2)}
    - Net Profit: ${result.netProfit.toFixed(2)}
    
    Task: 
    Generate a "Pro Logic Rule" explanation. 
    Be concise, technical, and explain exactly how the handicap line interact with the scores to produce this specific result.
    If it's an Asian Quarter line (e.g., .25 or .75), mention the split bet logic (e.g., "The bet is split into two halves...").
    If it's European, explain the 3-way outcome.
    Use clear, professional formatting.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });

    return response.text || "Could not generate explanation.";
  } catch (error) {
    console.error("Gemini Error:", error);
    if (error instanceof Error && error.message.includes("Requested entity was not found")) {
        throw new Error("API_KEY_NOT_FOUND");
    }
    return "An error occurred while fetching the explanation.";
  }
};
