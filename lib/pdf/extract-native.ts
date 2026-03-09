/**
 * Native PDF text extraction.
 *
 * Delegates to the existing pdfjs-dist child-process extractor in
 * lib/ai/pdf-text.ts. This wrapper exists to provide a clean module
 * boundary within lib/pdf/.
 */

import { extractTextWithPdfjs } from "@/lib/ai/pdf-text";

/**
 * Extract selectable text from a PDF buffer using pdfjs-dist.
 * Returns an empty string if no text layer is found.
 */
export async function extractNativeText(buffer: Buffer): Promise<string> {
    return extractTextWithPdfjs(buffer);
}
