/**
 * OCR-based PDF text extraction using Gemini inline PDF processing.
 *
 * Used as a fallback when native text extraction yields insufficient
 * text (e.g. scanned / image-based PDFs).
 *
 * Flow:
 *   1. Send entire PDF buffer directly to Gemini as application/pdf
 *   2. Gemini extracts all readable text
 *   3. Validate response (reject apology / empty text)
 *   4. Return extracted text
 *
 * No rendering, no image conversion, no filesystem writes.
 * Fully serverless compatible (Vercel, Cloud Functions, etc.).
 * Uses the same Gemini client pattern as ask-engine.ts / summarizer.ts.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const OCR_PROMPT = `Extract all readable text from this PDF.
Preserve headings, formatting, numbers, and bullet points.
Do NOT summarize.
Return only the extracted text.`;

/** Maximum time (ms) to wait for the entire OCR process. */
const OCR_TIMEOUT_MS = 120_000;

/**
 * Patterns that indicate Gemini returned an apology instead of real text.
 */
const APOLOGY_PATTERNS = [
    "cannot extract",
    "i'm sorry",
    "i cannot",
    "no readable text",
    "unable to extract",
    "unable to read",
    "there is no text",
    "no text found",
];

function isApologyText(text: string): boolean {
    const lower = text.toLowerCase();
    return APOLOGY_PATTERNS.some((p) => lower.includes(p));
}

/**
 * Extract text from a PDF buffer using Gemini inline PDF processing.
 *
 * Sends the raw PDF to Gemini as base64 with mimeType application/pdf.
 * No rendering, no image conversion, no disk writes.
 */
export async function extractOCRText(buffer: Buffer): Promise<string> {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("Missing GEMINI_API_KEY");
    }

    const startTime = Date.now();
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
    });

    console.log(
        `[PDF] Gemini inline PDF OCR starting (${(buffer.length / 1024).toFixed(1)} KB)`,
    );

    const result = await Promise.race([
        (async () => {
            const response = await model.generateContent([
                {
                    inlineData: {
                        mimeType: "application/pdf",
                        data: buffer.toString("base64"),
                    },
                },
                OCR_PROMPT,
            ]);

            return response.response.text().trim();
        })(),
        new Promise<never>((_, reject) => {
            const timer = setTimeout(
                () =>
                    reject(
                        new Error(
                            `Gemini OCR timed out after ${OCR_TIMEOUT_MS / 1000}s`,
                        ),
                    ),
                OCR_TIMEOUT_MS,
            );
            if (timer.unref) timer.unref();
        }),
    ]);

    const duration = Date.now() - startTime;
    console.log(`[PDF] Gemini OCR text length: ${result.length}`);
    console.log(`[PDF] Total extraction time: ${duration}ms`);

    // ── Validation ─────────────────────────────────────────────────
    if (!result || result.length < 20) {
        throw new Error("Gemini OCR returned insufficient text.");
    }

    if (isApologyText(result)) {
        throw new Error("Gemini returned invalid OCR result.");
    }

    return result;
}
