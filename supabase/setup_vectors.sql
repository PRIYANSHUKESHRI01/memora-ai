-- Enable pgvector extension
create extension if not exists vector;

-- Create document_embeddings table
-- Note: using text for document_id and user_id to support CUIDs/UUIDs from Prisma
create table if not exists public.document_embeddings (
  id uuid primary key default gen_random_uuid(),
  document_id text not null references public.documents(id) on delete cascade,
  user_id text not null references public.users(id) on delete cascade,
  chunk_id text not null,
  content text not null,
  embedding vector(768) not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Associate the table with the extension to ensure it's tracked? No, standard create is fine.

-- Create index for performance
create index if not exists document_embeddings_embedding_idx
on public.document_embeddings
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- RPC function for similarity search
-- Updated to accept vector(768) for Gemini
create or replace function match_documents(
  query_embedding vector(768),
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
