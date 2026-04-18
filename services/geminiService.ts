
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateGamePrompts = async (metaPrompt: string): Promise<string[]> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: metaPrompt,
        });
        
        const textResponse = response.text;

        if (!textResponse) {
             throw new Error("AI returned an empty response.");
        }

        const prompts = textResponse.split('---PROMPT-SEPARATOR---').filter(p => p.trim() !== '');
        
        if (prompts.length === 0) {
            throw new Error("AI did not return prompts in the expected format.");
        }
        
        return prompts;

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Gemini API Error:", error);
            throw new Error(`Failed to generate prompts: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the Gemini API.");
    }
};
