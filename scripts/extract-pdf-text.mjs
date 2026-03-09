/**
 * Standalone PDF text extraction script.
 * Runs in plain Node.js (outside Next.js bundler) to avoid RSC path mangling.
 *
 * Usage: node scripts/extract-pdf-text.mjs <path-to-pdf>
 * Output: extracted text to stdout
 */
import { createRequire } from "module";
import path from "path";
import { pathToFileURL } from "url";
import fs from "fs";

const require = createRequire(import.meta.url);

// Set up pdfjs-dist worker
const pdfjsPkgDir = path.dirname(require.resolve("pdfjs-dist/package.json"));
const workerPath = path.join(pdfjsPkgDir, "legacy", "build", "pdf.worker.mjs");

const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

// Read PDF from file path passed as argument
const pdfPath = process.argv[2];
if (!pdfPath) {
    process.stderr.write("Usage: node extract-pdf-text.mjs <pdf-path>\n");
    process.exit(1);
}

const data = fs.readFileSync(pdfPath);

try {
    const pdf = await pdfjsLib.getDocument({
        data: new Uint8Array(data),
        isEvalSupported: false,
        useWorkerFetch: false,
    }).promise;

    const pageTexts = [];
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items.map((item) => item.str || "").join(" ");
        pageTexts.push(text);
    }

    // Write result as JSON to stdout
    process.stdout.write(JSON.stringify({ text: pageTexts.join("\n"), pages: pdf.numPages }));
} catch (err) {
    process.stderr.write("PDF parse error: " + err.message + "\n");
    // Output empty text so caller knows extraction failed
    process.stdout.write(JSON.stringify({ text: "", pages: 0, error: err.message }));
}
