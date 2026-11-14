-- IGNIS: columns and search function for the hybrid retrieval pipeline.
--
-- Builds on 0001. Adapted from Member 5's proposal
-- (scripts/sql/evidence_chunks.proposal.sql), keeping 0001's rules:
-- schema only, no vector index yet, browser roles read verified rows only.
--
-- What changes:
--   1. New columns the pipeline writes: investigation_id, chunk_index,
--      search_names, content_hash.
--   2. Full text keeps experiment names. Postgres' 'english' configuration
--      drops "same" as a stop word, so SAME would be unsearchable. Names go into
--      `search_names`, indexed with 'simple' at weight A; section at B; content
--      stays on 'english' for stemming.
--   3. One function, search_evidence_chunks, returns raw vector and lexical
--      scores in a single call. Fusion happens in TypeScript (lib/retrieval/hybrid.ts).
--
-- The table holds only a derived index, rebuilt by `scripts/ingest.ts`.
-- Apply in the Supabase SQL editor after 0001, or with `supabase db push`.
-- Safe to run more than once.

-- 1. New columns. Defaults let this apply to a table that already has rows;
--    the next ingestion run fills real values.
alter table public.evidence_chunks
  add column if not exists investigation_id  text    not null default '',
  add column if not exists chunk_index       integer not null default 0,
  add column if not exists search_names      text    not null default '',
  add column if not exists content_hash      text    not null default '';

-- Allowed values, as written by lib/retrieval/chunker.ts.
alter table public.evidence_chunks drop constraint if exists evidence_chunks_chunk_type_check;
alter table public.evidence_chunks add constraint evidence_chunks_chunk_type_check
  check (chunk_type in
    ('OBJECTIVE','CONDITIONS','VARIABLES','MEASUREMENT','FINDING','LIMITATION','INTERPRETATION'));

alter table public.evidence_chunks drop constraint if exists evidence_chunks_source_class_check;
alter table public.evidence_chunks add constraint evidence_chunks_source_class_check
  check (source_class in ('NASA_SOURCE','TEAM_INTERPRETATION'));

create index if not exists evidence_chunks_investigation_id_idx on public.evidence_chunks (investigation_id);

-- 2. Rebuild the generated full-text column with names, section and content.
--    A generated column cannot be altered in place; dropping it also drops its index.
alter table public.evidence_chunks drop column if exists fts;
alter table public.evidence_chunks add column fts tsvector generated always as (
  setweight(to_tsvector('simple', coalesce(search_names, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(section, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(content, '')), 'D')
) stored;

create index if not exists evidence_chunks_fts_idx
  on public.evidence_chunks using gin (fts);

-- 3. Candidates from both signals in one call.
--    query_terms must be plain [a-z0-9] words; lib/retrieval/text.ts (tsqueryTerms)
--    guarantees that, so no tsquery operator can be injected. Terms are OR-ed:
--    AND-ing every word of a question usually matches nothing.
--    Runs with the caller's rights (security invoker, the default), so row-level
--    security still applies.
create or replace function public.search_evidence_chunks(
  query_terms text[],
  query_embedding vector(384) default null,
  match_count int default 10
)
returns table (chunk_id text, similarity double precision, lexical_rank double precision)
language sql
stable
set search_path = public, extensions
as $$
  with q as (
    select case
      when coalesce(cardinality(query_terms), 0) = 0 then null::tsquery
      else to_tsquery('simple', array_to_string(query_terms, ' | '))
        || to_tsquery('english', array_to_string(query_terms, ' | '))
    end as tsq
  ),
  lexical as (
    select c.chunk_id, ts_rank_cd(c.fts, q.tsq, 32)::double precision as lexical_rank
    from public.evidence_chunks c, q
    where q.tsq is not null and c.human_verified and c.fts @@ q.tsq
    order by lexical_rank desc, c.chunk_id
    limit match_count
  ),
  semantic as (
    select c.chunk_id, (1 - (c.embedding <=> query_embedding))::double precision as similarity
    from public.evidence_chunks c
    where query_embedding is not null and c.human_verified and c.embedding is not null
    order by c.embedding <=> query_embedding, c.chunk_id
    limit match_count
  )
  select coalesce(s.chunk_id, l.chunk_id), s.similarity, l.lexical_rank
  from semantic s
  full outer join lexical l on l.chunk_id = s.chunk_id;
$$;

grant execute on function public.search_evidence_chunks(text[], vector, int) to anon, authenticated;

-- Quick checks after applying (SQL editor):
--   select to_tsvector('english', 'SAME smoke');   -- 'same' is missing: why search_names uses 'simple'
--   select to_tsvector('simple', 'SAME smoke');    -- 'same' and 'smoke' kept
--   select * from public.search_evidence_chunks(array['smoke','detection'], null, 5);
