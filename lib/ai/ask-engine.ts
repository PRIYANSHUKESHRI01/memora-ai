import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateEmbedding } from "./embedding";
import { queryVectors } from "../vector/vector-client";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function askQuestion(prompt: string, userId: string) {
    console.log("ASK USER ID:", userId);
    console.log("Question:", prompt);

    // 1. Generate embedding for user question
    const embedding = await generateEmbedding(prompt);
    console.log("Embedding length:", embedding.length);

    // 2. Query Supabase for top 5 chunks
    let retrievedChunks;
    try {
        retrievedChunks = await queryVectors(embedding, userId, 5);
    } catch (err) {
        console.error("[ASK_ENGINE] Vector query failed, returning fallback:", err);
        return "I wasn't able to search your documents right now. Please make sure you've uploaded at least one document and try again.";
    }

    console.log("Retrieved Chunks:", retrievedChunks.length);

    // Safe Fallback: If no chunks found (should rarely happen without threshold), handle gracefully
    if (retrievedChunks.length === 0) {
        return "I couldn't find strong matches in your uploaded documents, but here is what exists in your knowledge base: (No documents found)";
    }

    // 3. Build system prompt with context
    const context = retrievedChunks.map((c) => c.content).join("\n\n---\n\n");

    const systemPrompt = `
You are an AI assistant that answers strictly from provided context. If context is limited, still try to summarize available information.

Context:
${context}

Question:
${prompt}

Answer clearly and helpfully.
`;

    // 4. Call Gemini model
    const model = genAI.getGenerativeModel({
        model: "models/gemini-2.5-flash",
        generationConfig: {
            temperature: 0.3,
            topP: 0.9,
        }
    });

    const result = await model.generateContent(systemPrompt);

    const response = await result.response;

    const answer = response.text();

    if (!answer || answer.trim().length === 0) {
        throw new Error("Empty answer from Gemini");
    }

    return answer;
}
