-- Revert table to 768 dimensions
-- Drop index first
drop index if exists document_embeddings_embedding_idx;

-- Alter column type
alter table public.document_embeddings
alter column embedding type vector(768);

-- Recreate index
create index if not exists document_embeddings_embedding_idx
on public.document_embeddings
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Update function to use 768 dimensions and remove any threshold logic (if it existed)
-- Also ensure it uses proper ordering for cosine distance (<=>)
drop function if exists match_documents(vector(3072), int, text);
drop function if exists match_documents(vector(768), int, text);

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
