import { execFile } from "child_process";
import { writeFileSync, unlinkSync, mkdirSync, existsSync } from "fs";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";

/**
 * Extract text from a PDF using pdfjs-dist v5 in a child process.
 *
 * Why a child process? pdfjs-dist is an ESM package that dynamically imports
 * its worker. Next.js's RSC webpack bundler rewrites import paths (inserting
 * "(rsc)") which breaks the worker resolution at runtime. By running text
 * extraction in a standalone Node.js process we bypass webpack entirely.
 */
export async function extractTextWithPdfjs(pdfBuffer: Buffer): Promise<string> {
    // Write buffer to a temp file so the child process can read it
    const tmpDir = path.join(os.tmpdir(), "memora-pdf");
    mkdirSync(tmpDir, { recursive: true });
    const tmpFile = path.join(tmpDir, `${randomUUID()}.pdf`);
    writeFileSync(tmpFile, pdfBuffer);

    // Resolve script path — try multiple strategies
    let scriptPath = path.resolve(process.cwd(), "scripts", "extract-pdf-text.mjs");
    if (!existsSync(scriptPath)) {
        // Fallback: resolve relative to this source file's directory
        scriptPath = path.resolve(__dirname, "..", "..", "scripts", "extract-pdf-text.mjs");
    }
    console.log("[PDF-TEXT] Script path:", scriptPath, "exists:", existsSync(scriptPath));
    console.log("[PDF-TEXT] Temp file:", tmpFile);

    try {
        const result = await new Promise<string>((resolve, reject) => {
            execFile(
                "node",
                [scriptPath, tmpFile],
                { timeout: 30_000, maxBuffer: 50 * 1024 * 1024 },
                (error, stdout, stderr) => {
                    if (stderr) {
                        console.warn("[PDF-TEXT] stderr:", stderr.substring(0, 500));
                    }
                    if (error) {
                        console.error("[PDF-TEXT] execFile error:", error.message);
                        reject(new Error(`PDF extraction failed: ${error.message}`));
                        return;
                    }
                    console.log("[PDF-TEXT] stdout length:", stdout.length);
                    try {
                        const parsed = JSON.parse(stdout);
                        if (parsed.error) {
                            console.warn("[PDF-TEXT] Extraction error from script:", parsed.error);
                        }
                        resolve(parsed.text || "");
                    } catch {
                        reject(new Error(`Failed to parse extraction output: ${stdout.substring(0, 200)}`));
                    }
                }
            );
        });

        return result;
    } finally {
        // Clean up temp file
        try { unlinkSync(tmpFile); } catch { /* ignore */ }
    }
}

