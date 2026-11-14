-- IGNIS: evidence chunk storage for hybrid retrieval.
--
-- Schema only. This migration creates no rows and no embeddings; ingestion is
-- a separate script that runs from main after records are verified.
--
-- The OKF Markdown files remain the source of truth. This table is a derived
-- index and can be dropped and rebuilt from them at any time.
--
-- Apply in the Supabase SQL editor, or with `supabase db push`.
-- Safe to run more than once.

create extension if not exists vector;

create table if not exists public.evidence_chunks (
  chunk_id          text primary key,              -- deterministic, e.g. bass-ii.conditions.01
  concept_id        text not null,                 -- <folder>/<record-id>, e.g. investigations/bass-ii
  investigation     text not null,                 -- display name of the parent record
  title             text not null,
  section           text not null,                 -- Markdown heading the chunk came from
  chunk_type        text not null,                 -- OBJECTIVE | CONDITIONS | VARIABLES | MEASUREMENT | FINDING | LIMITATION | INTERPRETATION
  content           text not null,
  source_class      text not null,                 -- NASA_SOURCE | TEAM_INTERPRETATION
  source_url        text,
  safety_category   text[] not null default '{}',  -- prevention | detection | suppression
  fuel_type         text,
  material          text,
  gravity_condition text,
  tags              text[] not null default '{}',
  human_verified    boolean not null default false,
  previous_chunk_id text,
  next_chunk_id     text,
  embedding_version text not null,                 -- model + chunker version that produced `embedding`
  embedding         vector(384),                   -- BAAI/bge-small-en-v1.5
  fts               tsvector generated always as (to_tsvector('english', content)) stored,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.evidence_chunks is
  'Derived retrieval index built from human-reviewed OKF records. Not the scientific record.';

-- Vector similarity (cosine).
create index if not exists evidence_chunks_embedding_idx
  on public.evidence_chunks using hnsw (embedding vector_cosine_ops);

-- Lexical search.
create index if not exists evidence_chunks_fts_idx
  on public.evidence_chunks using gin (fts);

-- Metadata filters and boosts.
create index if not exists evidence_chunks_concept_idx       on public.evidence_chunks (concept_id);
create index if not exists evidence_chunks_investigation_idx on public.evidence_chunks (investigation);
create index if not exists evidence_chunks_verified_idx      on public.evidence_chunks (human_verified);
create index if not exists evidence_chunks_chunk_type_idx    on public.evidence_chunks (chunk_type);
create index if not exists evidence_chunks_safety_idx        on public.evidence_chunks using gin (safety_category);
create index if not exists evidence_chunks_tags_idx          on public.evidence_chunks using gin (tags);

-- The anon key can read verified chunks only. Writes need the service-role key,
-- which bypasses row-level security and is used by the ingestion script alone.
alter table public.evidence_chunks enable row level security;

drop policy if exists "read verified chunks" on public.evidence_chunks;
create policy "read verified chunks"
  on public.evidence_chunks for select
  using (human_verified);

-- Health check helper: is pgvector installed?
create or replace function public.ignis_vector_available()
returns boolean
language sql
stable
as $$
  select exists (select 1 from pg_extension where extname = 'vector');
$$;

-- Minimal nearest-neighbour lookup, enough to prove the schema works.
-- The hybrid search (metadata + lexical + vector fusion) is built separately.
create or replace function public.match_evidence_chunks(
  query_embedding vector(384),
  match_count int default 10
)
returns table (chunk_id text, similarity double precision)
language sql
stable
as $$
  select c.chunk_id, 1 - (c.embedding <=> query_embedding) as similarity
  from public.evidence_chunks c
  where c.human_verified and c.embedding is not null
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

grant execute on function public.ignis_vector_available() to anon, authenticated;
grant execute on function public.match_evidence_chunks(vector, int) to anon, authenticated;
