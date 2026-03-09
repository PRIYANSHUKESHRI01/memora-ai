/**
 * Animation configuration — centralized timing, easing, and delay constants.
 * All hero sub-components import from here for consistent sequencing.
 */

export const EASING = [0.25, 0.1, 0.25, 1] as const;
export const EASE_OUT = [0, 0, 0.2, 1] as const;

// Phase timings (seconds) — total loop ~10s
export const PHASE = {
    DOCS_FADE_IN: 0,         // Floating docs appear
    TERMINAL_START: 0.6,     // Terminal begins typing
    CHUNKS_APPEAR: 3.8,      // Chunks split out
    EMBEDDINGS_FORM: 5.2,    // Embedding nodes appear
    NETWORK_DRAW: 5.8,       // SVG lines connect
    QUERY_ENTER: 7.0,        // Query bubble slides in
    ANSWER_REVEAL: 8.0,      // Answer fades in
    LOOP_PAUSE: 10.0,        // Pause before restart
    TOTAL: 11.0,             // Full cycle
} as const;

// Terminal typing lines
export const TERMINAL_LINES = [
    "Uploading research.pdf...",
    "Extracting text...",
    "Chunking into semantic blocks...",
    "Generating embeddings...",
    "Indexed successfully ✓",
] as const;

// Duration per character (seconds)
export const CHAR_SPEED = 0.035;

// Chunk labels for the visualization
export const CHUNK_LABELS = [
    "Introduction",
    "Key Findings",
    "Methodology",
    "Conclusions",
] as const;
