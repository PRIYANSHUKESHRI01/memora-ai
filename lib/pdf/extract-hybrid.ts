/**
 * Hybrid PDF text extraction.
 *
 * Strategy:
 *   1. Validate size and page count.
 *   2. Try native (pdfjs-dist) text extraction first.
 *   3. If the result is too short (< 500 chars) — the PDF is likely
 *      scanned / image-based — fall back to Gemini OCR.
 *   4. Return whichever result has usable text.
 *
 * This module is the single entry-point the upload API should call.
 */

import pdfParse from "pdf-parse";
import { extractNativeText } from "./extract-native";
import { extractOCRText } from "./extract-ocr";

/** Minimum native-text length before we consider it sufficient. */
const MIN_NATIVE_TEXT_LENGTH = 500;

/** Maximum file size we accept (2 MB). */
export const MAX_PDF_SIZE = 2 * 1024 * 1024;

/** Maximum number of pages we accept. */
export const MAX_PDF_PAGES = 10;

/**
 * Extract text from a PDF buffer using the best available method.
 *
 * @throws {Error} If the buffer exceeds `MAX_PDF_SIZE`.
 */
export async function extractPDFText(buffer: Buffer): Promise<string> {
    const startTime = Date.now();
    let ocrTriggered = false;

    // ── Size guard ────────────────────────────────────────────────
    if (buffer.length > MAX_PDF_SIZE) {
        throw new Error(
            `File exceeds ${MAX_PDF_SIZE / 1024 / 1024}MB limit.`,
        );
    }

    // ── Page count guard ──────────────────────────────────────────
    try {
        const pdfInfo = await pdfParse(buffer);
        if (pdfInfo.numpages > MAX_PDF_PAGES) {
            throw new Error(
                `PDF exceeds ${MAX_PDF_PAGES} page limit.`,
            );
        }
        console.log(`[PDF-HYBRID] Page count: ${pdfInfo.numpages}`);
    } catch (err) {
        // Re-throw our own limit errors, swallow pdf-parse failures
        if ((err as Error).message.includes("page limit")) throw err;
        console.warn(`[PDF-HYBRID] Could not determine page count: ${(err as Error).message}`);
    }

    // ── 1. Native text extraction ─────────────────────────────────
    let nativeText = "";
    try {
        nativeText = await extractNativeText(buffer);
        console.log(
            `[PDF-HYBRID] Native extraction: ${nativeText.trim().length} chars (${Date.now() - startTime}ms)`,
        );
    } catch (err) {
        console.warn(
            `[PDF-HYBRID] Native extraction failed, will attempt OCR: ${(err as Error).message}`,
        );
    }

    if (nativeText.trim().length > MIN_NATIVE_TEXT_LENGTH) {
        const duration = Date.now() - startTime;
        console.log(`[PDF] Native text length: ${nativeText.trim().length}`);
        console.log(`[PDF] OCR triggered: false`);
        console.log(`[PDF] Total extraction time: ${duration}ms`);
        return nativeText;
    }

    // ── 2. OCR fallback ───────────────────────────────────────────
    ocrTriggered = true;
    console.log(
        `[PDF-HYBRID] Native text insufficient (${nativeText.trim().length} chars < ${MIN_NATIVE_TEXT_LENGTH}). Triggering OCR…`,
    );

    try {
        const ocrText = await extractOCRText(buffer);
        const duration = Date.now() - startTime;
        console.log(`[PDF] Native text length: ${nativeText.trim().length}`);
        console.log(`[PDF] OCR triggered: ${ocrTriggered}`);
        console.log(`[PDF] Total extraction time: ${duration}ms`);
        return ocrText;
    } catch (err) {
        console.error(
            `[PDF-HYBRID] OCR extraction failed: ${(err as Error).message}`,
        );

        // If native had *some* text, return it as a best-effort result
        if (nativeText.trim().length > 0) {
            const duration = Date.now() - startTime;
            console.log(`[PDF] Native text length: ${nativeText.trim().length}`);
            console.log(`[PDF] OCR triggered: ${ocrTriggered} (failed)`);
            console.log(`[PDF] Total extraction time: ${duration}ms`);
            return nativeText;
        }

        throw new Error(
            "Could not extract text from PDF. Native extraction returned no text and OCR failed.",
        );
    }
}
