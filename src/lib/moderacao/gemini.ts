import { GoogleGenAI } from "@google/genai";

let cliente: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!cliente) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY não configurada.");
    }
    cliente = new GoogleGenAI({ apiKey });
  }
  return cliente;
}
