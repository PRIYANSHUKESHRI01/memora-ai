-- Recreate document_embeddings table (dropped by Prisma migration reset)
-- Enable pgvector extension
create extension if not exists vector;

-- Create document_embeddings table with 3072 dimensions for Gemini embeddings
create table if not exists public.document_embeddings (
  id uuid primary key default gen_random_uuid(),
  document_id text not null references public.documents(id) on delete cascade,
  user_id text not null references public.users(id) on delete cascade,
  chunk_id text not null,
  content text not null,
  embedding vector(3072) not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Note: ivfflat index requires data to exist. Skip for now, add after first upload.
-- Alternatively you can add an HNSW index later:
-- CREATE INDEX document_embeddings_embedding_idx ON public.document_embeddings USING hnsw (embedding vector_cosine_ops);

-- RPC function for similarity search (3072 dimensions)
drop function if exists match_documents(vector(768), int, text);
drop function if exists match_documents(vector(3072), int, text);

create or replace function match_documents(
  query_embedding vector(3072),
  match_count int default 5,
  filter_user_id text default null
) returns table (
  id uuid,
  user_id text,
  document_id text,
  chunk_id text,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    document_embeddings.id,
    document_embeddings.user_id,
    document_embeddings.document_id,
    document_embeddings.chunk_id,
    document_embeddings.content,
    document_embeddings.metadata,
    1 - (document_embeddings.embedding <=> query_embedding) as similarity
  from document_embeddings
  where (filter_user_id is null or document_embeddings.user_id = filter_user_id)
  order by document_embeddings.embedding <=> query_embedding
  limit match_count;
end;
$$;
