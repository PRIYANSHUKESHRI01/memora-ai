/**
 * Supabase pgvector client — upsert, query, and delete vector embeddings.
 *
 * Expects a Supabase table `document_embeddings` with schema:
 *   id        uuid PRIMARY KEY DEFAULT gen_random_uuid()
 *   user_id   text NOT NULL
 *   document_id text NOT NULL
 *   chunk_id  text NOT NULL
 *   content   text NOT NULL
 *   embedding vector(1536)
 *   metadata  jsonb
 *   created_at timestamptz DEFAULT now()
 *
 * And an RPC function `match_documents` for similarity search:
 *   CREATE FUNCTION match_documents(
 *     query_embedding vector(1536),
 *     match_count int DEFAULT 5,
 *     filter_user_id text DEFAULT NULL
 *   ) RETURNS TABLE (
 *     id uuid, user_id text, document_id text, chunk_id text,
 *     content text, metadata jsonb, similarity float
 *   )
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
    if (!client) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!url || !key) {
            throw new Error("Missing Supabase environment variables");
        }
        client = createClient(url, key);
    }
    return client;
}

export interface VectorRecord {
    id?: string;
    userId: string;
    documentId: string;
    chunkId: string;
    content: string;
    embedding: number[];
    metadata?: Record<string, unknown>;
}

export interface VectorSearchResult {
    id: string;
    userId: string;
    documentId: string;
    chunkId: string;
    content: string;
    metadata: Record<string, unknown> | null;
    similarity: number;
}

/**
 * Upsert vector records into the document_embeddings table.
 */
export async function upsertVectors(records: VectorRecord[]): Promise<void> {
    const supabase = getClient();

    const rows = records.map((r) => ({
        user_id: r.userId,
        document_id: r.documentId,
        chunk_id: r.chunkId,
        content: r.content,
        embedding: JSON.stringify(r.embedding),
        metadata: r.metadata ?? {},
    }));

    const batchSize = 50;
    for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        const { error } = await supabase.from("document_embeddings").insert(batch);
        if (error) throw new Error(`Vector upsert failed: ${error.message}`);
    }
}

/**
 * Query for similar documents using the match_documents RPC function.
 */
export async function queryVectors(
    embedding: number[],
    userId: string,
    topK: number = 5
): Promise<VectorSearchResult[]> {
    const supabase = getClient();

    const { data, error } = await supabase.rpc("match_documents", {
        query_embedding: JSON.stringify(embedding),
        match_count: topK,
        filter_user_id: userId,
    });

    if (error) throw new Error(`Vector query failed: ${error.message}`);

    return (data ?? []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        userId: row.user_id as string,
        documentId: row.document_id as string,
        chunkId: row.chunk_id as string,
        content: row.content as string,
        metadata: row.metadata as Record<string, unknown> | null,
        similarity: row.similarity as number,
    }));
}

/**
 * Delete all vectors for a given document.
 */
export async function deleteVectorsByDocument(
    documentId: string,
    userId: string
): Promise<void> {
    const supabase = getClient();

    const { error } = await supabase
        .from("document_embeddings")
        .delete()
        .eq("document_id", documentId)
        .eq("user_id", userId);

    if (error) throw new Error(`Vector delete failed: ${error.message}`);
}

/**
 * Delete all vectors for a user.
 */
export async function deleteVectorsByUser(userId: string): Promise<void> {
    const supabase = getClient();

    const { error } = await supabase
        .from("document_embeddings")
        .delete()
        .eq("user_id", userId);

    if (error) throw new Error(`Vector delete failed: ${error.message}`);
}
