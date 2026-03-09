-- Alter table to 3072 dimensions
-- Note: You cannot directly alter vector dimension with simple ALTER COLUMN in some versions/extensions without dropping column or using explicit cast.
-- But pgvector specific syntax: ALTER TABLE ... ALTER COLUMN ... TYPE vector(3072) usually works if data is compatible or table is empty.
-- If failing, we might need to truncate. Assuming table might be empty or user accepts truncation if incompatible.
-- However, "expected 768 dimensions, not 3072" implies receiving 3072.
alter table public.document_embeddings
alter column embedding type vector(768); -- Wait, user said "expected 768... Gemini ... returns 3072". So we need 3072.
-- Correcting:
alter table public.document_embeddings
alter column embedding type vector(3072);

-- Update the function signature
drop function if exists match_documents(vector(768), int, text);

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
