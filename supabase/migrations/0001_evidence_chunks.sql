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
  embedding         vector(384),                   -- BAAI/bge-small-en-v1.5; null until ingestion fills it
  metadata          jsonb not null default '{}'::jsonb, -- extra provenance for ingestion (never scientific values)
  fts               tsvector generated always as (to_tsvector('english', content)) stored,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.evidence_chunks is
  'Derived retrieval index built from human-reviewed OKF records. Not the scientific record.';

-- Vector similarity: deliberately NO vector index yet.
-- The expected corpus is a few hundred chunks. An exact scan over that many
-- 384-dimension vectors takes milliseconds, gives perfect recall, and needs no
-- tuning. Approximate indexes (HNSW) only pay off past roughly 10^4-10^5 rows,
-- and they trade recall for speed, which is the wrong trade for safety evidence.
-- If the corpus grows that far, add, in a new migration:
--   create index evidence_chunks_embedding_idx
--     on public.evidence_chunks using hnsw (embedding vector_cosine_ops);

-- Lexical search.
create index if not exists evidence_chunks_fts_idx
  on public.evidence_chunks using gin (fts);

-- Metadata filters and boosts.
create index if not exists evidence_chunks_concept_idx       on public.evidence_chunks (concept_id);
create index if not exists evidence_chunks_investigation_idx on public.evidence_chunks (investigation);
create index if not exists evidence_chunks_verified_idx      on public.evidence_chunks (human_verified);
create index if not exists evidence_chunks_source_class_idx  on public.evidence_chunks (source_class);
create index if not exists evidence_chunks_chunk_type_idx    on public.evidence_chunks (chunk_type);
create index if not exists evidence_chunks_safety_idx        on public.evidence_chunks using gin (safety_category);
create index if not exists evidence_chunks_tags_idx          on public.evidence_chunks using gin (tags);

-- Keep updated_at honest when ingestion re-writes a row.
create or replace function public.ignis_touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists evidence_chunks_touch_updated_at on public.evidence_chunks;
create trigger evidence_chunks_touch_updated_at
  before update on public.evidence_chunks
  for each row execute function public.ignis_touch_updated_at();

-- The anon key can read verified chunks only. Writes need the service-role key,
-- which bypasses row-level security and is used by the ingestion script alone.
alter table public.evidence_chunks enable row level security;

-- Defence in depth: even if a write policy is ever added by mistake, the
-- browser-facing roles hold no write privileges on this table.
revoke insert, update, delete, truncate on public.evidence_chunks from anon, authenticated;
grant select on public.evidence_chunks to anon, authenticated;

drop policy if exists "read verified chunks" on public.evidence_chunks;
create policy "read verified chunks"
  on public.evidence_chunks for select
  using (human_verified);

-- Health check helper: is pgvector installed?
create or replace function public.ignis_vector_available()
returns boolean
language sql
stable
set search_path = public, extensions
as $$
  select exists (select 1 from pg_extension where extname = 'vector');
$$;

-- Health check helper: the declared size of the embedding column, or null when
-- the table or column is missing. Must equal 384 (BAAI/bge-small-en-v1.5).
create or replace function public.ignis_embedding_dimension()
returns integer
language sql
stable
set search_path = public
as $$
  select a.atttypmod
  from pg_attribute a
  where a.attrelid = to_regclass('public.evidence_chunks')
    and a.attname = 'embedding'
    and not a.attisdropped
    and a.atttypmod > 0;
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
set search_path = public, extensions
as $$
  select c.chunk_id, 1 - (c.embedding <=> query_embedding) as similarity
  from public.evidence_chunks c
  where c.human_verified and c.embedding is not null
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

grant execute on function public.ignis_vector_available() to anon, authenticated;
grant execute on function public.ignis_embedding_dimension() to anon, authenticated;
grant execute on function public.match_evidence_chunks(vector, int) to anon, authenticated;
