import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateEmbedding(text: string) {
    const model = genAI.getGenerativeModel({
        model: "gemini-embedding-001",
    });

    const result = await model.embedContent({
        content: {
            parts: [{ text }],
            role: "user"
        },
        taskType: TaskType.RETRIEVAL_DOCUMENT
    });

    return result.embedding.values;
}
