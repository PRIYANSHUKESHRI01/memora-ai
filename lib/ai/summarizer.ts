/**
 * Summarizer — generate document summaries using Google Gemini.
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function summarizeText(text: string): Promise<string> {
    const truncated = text.slice(0, 30000); // Gemini has larger context window, but being safe

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    try {
        const prompt = "You are a concise summarizer. Summarize the following text in 2-3 sentences, capturing the key points:\n\n" + truncated;
        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text();
    } catch (e) {
        console.error("Gemini summary failed:", e);
        return "Summary not available.";
    }
}
