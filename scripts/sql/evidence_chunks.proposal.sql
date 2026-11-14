-- PROPOSAL from Member 5 for Member 1's migration supabase/migrations/0001_evidence_chunks.sql.
-- Member 1 owns and applies the migration. This file is not run by any script.
--
-- Starts from the table in the team workflow (section 6, task 3) with three changes:
--   1. Full-text search that keeps experiment names. Postgres' 'english' configuration
--      drops "same" as a stop word, so SAME would be unsearchable. Names, tags and hardware
--      go into `search_names`, indexed with the 'simple' configuration at weight A; content
--      stays on 'english' for stemming.
--   2. A `metadata jsonb` column for record facts (oxygen, pressure and airflow ranges,
--      platform, hardware, full source list), so new fields need no new migration.
--   3. One search function returning raw vector and lexical scores for both signals in a
--      single call. Terms are OR-ed: websearch_to_tsquery would AND every word of a question
--      and usually match nothing. Fusion happens in TypeScript (lib/retrieval/hybrid.ts).
--
-- Also adds: investigation_id, chunk_index, content_hash (skip re-embedding unchanged chunks).
-- Untested against a live project until Member 1's keys arrive; `npx tsx scripts/ingest.ts --selftest`
-- checks it end to end.

create extension if not exists vector;

create table if not exists evidence_chunks (
  chunk_id          text primary key,              -- e.g. bass-ii.conditions.01
  concept_id        text not null,                 -- e.g. investigations/bass-ii
  investigation     text not null,                 -- display name, e.g. BASS-II
  investigation_id  text not null,                 -- record id, e.g. bass-ii
  title             text not null,
  section           text not null,
  chunk_type        text not null check (chunk_type in
                      ('OBJECTIVE','CONDITIONS','VARIABLES','MEASUREMENT','FINDING','LIMITATION','INTERPRETATION')),
  chunk_index       integer not null,
  content           text not null,
  search_names      text not null default '',
  source_class      text not null check (source_class in ('NASA_SOURCE','TEAM_INTERPRETATION')),
  source_url        text,
  safety_category   text[] not null default '{}',
  fuel_type         text,
  material          text,
  gravity_condition text,
  tags              text[] not null default '{}',
  human_verified    boolean not null default false,
  previous_chunk_id text,
  next_chunk_id     text,
  embedding_version text not null,
  content_hash      text not null,
  metadata          jsonb not null default '{}'::jsonb,
  embedding         vector(384),
  updated_at        timestamptz not null default now(),
  fts               tsvector generated always as (
                      setweight(to_tsvector('simple', coalesce(search_names, '')), 'A') ||
                      setweight(to_tsvector('simple', coalesce(section, '')), 'B') ||
                      setweight(to_tsvector('english', coalesce(content, '')), 'D')
                    ) stored
);

create index if not exists evidence_chunks_embedding_idx on evidence_chunks using hnsw (embedding vector_cosine_ops);
create index if not exists evidence_chunks_fts_idx on evidence_chunks using gin (fts);
create index if not exists evidence_chunks_safety_idx on evidence_chunks using gin (safety_category);
create index if not exists evidence_chunks_investigation_idx on evidence_chunks (investigation_id);

alter table evidence_chunks enable row level security;
drop policy if exists "read verified chunks" on evidence_chunks;
create policy "read verified chunks" on evidence_chunks for select using (human_verified);

-- One call returns candidates from both signals. query_terms must be plain [a-z0-9] words;
-- lib/retrieval/text.ts (tsqueryTerms) guarantees that, so no tsquery operator can be injected.
create or replace function search_evidence_chunks(
  query_terms text[],
  query_embedding vector(384) default null,
  match_count int default 10
)
returns table (chunk_id text, similarity double precision, lexical_rank double precision)
language sql stable
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
    from evidence_chunks c, q
    where q.tsq is not null and c.human_verified and c.fts @@ q.tsq
    order by lexical_rank desc, c.chunk_id
    limit match_count
  ),
  semantic as (
    select c.chunk_id, (1 - (c.embedding <=> query_embedding))::double precision as similarity
    from evidence_chunks c
    where query_embedding is not null and c.human_verified and c.embedding is not null
    order by c.embedding <=> query_embedding, c.chunk_id
    limit match_count
  )
  select coalesce(s.chunk_id, l.chunk_id), s.similarity, l.lexical_rank
  from semantic s
  full outer join lexical l on l.chunk_id = s.chunk_id;
$$;

-- Quick checks after applying (run in the SQL editor):
--   select to_tsvector('english', 'SAME smoke');   -- 'same' is missing: why search_names uses 'simple'
--   select to_tsvector('simple', 'SAME smoke');    -- 'same' and 'smoke' kept
--   select * from search_evidence_chunks(array['smoke','detection'], null, 5);
