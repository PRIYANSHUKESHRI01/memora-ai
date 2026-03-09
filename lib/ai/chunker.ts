/**
 * Text Chunker — splits text into overlapping chunks of ~500-1000 tokens.
 * Uses a simple character-based approach (1 token ≈ 4 chars).
 */

export interface TextChunk {
    content: string;
    index: number;
    metadata?: Record<string, unknown>;
}

interface ChunkerOptions {
    /** Target chunk size in characters (default 2000 ≈ 500 tokens) */
    chunkSize?: number;
    /** Overlap between chunks in characters (default 200 ≈ 50 tokens) */
    overlap?: number;
}

export function chunkText(
    text: string,
    options: ChunkerOptions = {}
): TextChunk[] {
    const { chunkSize = 2000, overlap = 200 } = options;

    // Clean text
    const cleaned = text
        .replace(/\r\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/\s{2,}/g, " ")
        .trim();

    if (!cleaned) return [];

    const chunks: TextChunk[] = [];
    let start = 0;
    let index = 0;

    while (start < cleaned.length) {
        let end = Math.min(start + chunkSize, cleaned.length);

        // Try to break at a sentence boundary (only if not at end)
        if (end < cleaned.length) {
            const slice = cleaned.slice(start, end);
            const lastPeriod = slice.lastIndexOf(". ");
            const lastNewline = slice.lastIndexOf("\n");
            const breakPoint = Math.max(lastPeriod, lastNewline);

            if (breakPoint > chunkSize * 0.5) {
                end = start + breakPoint + 1;
            }
        }

        const content = cleaned.slice(start, end).trim();
        if (content.length > 0) {
            chunks.push({ content, index });
            index++;
        }

        // If we've reached the end, stop
        if (end >= cleaned.length) break;

        // Advance start with overlap, but always move forward
        const nextStart = end - overlap;
        if (nextStart <= start) {
            // Safety: ensure we always advance at least 1 char
            start = start + 1;
        } else {
            start = nextStart;
        }
    }

    console.log("[CHUNKER] Generated", chunks.length, "chunks from", cleaned.length, "chars");
    return chunks;
}

/** Estimate token count (rough: 1 token ≈ 4 chars) */
export function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}
