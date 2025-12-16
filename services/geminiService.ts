import { GoogleGenAI } from "@google/genai";
import { AuditLog } from '../types';

export const analyzeSecurityLogs = async (logs: AuditLog[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key missing. Unable to generate security insights.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Prepare log data for the model
    const logSummary = logs.slice(0, 20).map(l => 
      `[${l.timestamp}] ${l.event} - Status: ${l.status} - IP: ${l.ip} - Details: ${l.details || 'N/A'}`
    ).join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a cybersecurity expert. Analyze the following authentication audit logs for a user. 
      Provide a brief, professional summary (max 3 sentences) of their security posture. 
      Highlight any suspicious activity or confirm if the account looks secure.
      
      Logs:
      ${logSummary}`
    });

    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "Unable to analyze logs at this time.";
  }
};