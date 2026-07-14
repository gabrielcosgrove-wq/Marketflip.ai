-- ============================================================================
-- MarketFlip AI — Supabase Schema
-- ============================================================================
-- Source-agnostic: `listings.source` can be facebook_marketplace, craigslist,
-- ebay, offerup, or any future source. `analyses` stores computed AI output
-- separately from raw listing data so re-scoring never mutates source data.
-- ============================================================================

create extension if not exists "uuid-ossp";

create type listing_source as enum ('facebook_marketplace', 'craigslist', 'ebay', 'offerup');
create type listing_condition as enum ('new', 'like_new', 'excellent', 'good', 'fair', 'poor');
create type category as enum (
  'electronics', 'gaming', 'furniture', 'bikes', 'watches',
  'tools', 'appliances', 'sporting_goods', 'collectibles', 'vehicles'
);
create type demand_rating as enum ('low', 'medium', 'high', 'very_high');
create type risk_rating as enum ('low', 'medium', 'high');
create type confidence_rating as enum ('low', 'medium', 'high');
create type user_listing_relation as enum ('saved', 'favorited', 'viewed', 'watchlist');

create table listings (
  id uuid primary key default uuid_generate_v4(),
  source listing_source not null,
  external_id text, -- id on the source platform, for de-duping ingested listings
  title text not null,
  description text not null default '',
  price numeric(12,2) not null,
  currency text not null default 'USD',
  city text not null,
  state text not null,
  distance_miles numeric(6,2),
  photos text[] not null default '{}',
  condition listing_condition not null,
  category category not null,
  listed_at timestamptz not null default now(),
  seller_name text,
  url text,
  created_at timestamptz not null default now(),
  unique (source, external_id)
);

create index idx_listings_category on listings(category);
create index idx_listings_listed_at on listings(listed_at desc);

-- One-to-one computed analysis per listing. Recomputable without touching listings.
create table analyses (
  listing_id uuid primary key references listings(id) on delete cascade,
  deal_score smallint not null check (deal_score between 0 and 100),
  estimated_market_value numeric(12,2) not null,
  estimated_profit numeric(12,2) not null,
  roi_percent numeric(6,2) not null,
  confidence confidence_rating not null,
  reasons text[] not null default '{}',
  demand_rating demand_rating not null,
  risk_rating risk_rating not null,
  estimated_sell_time_days smallint not null,
  generated_at timestamptz not null default now()
);

-- Deep-dive report, generated on-demand when a user opens a listing.
create table ai_reports (
  listing_id uuid primary key references listings(id) on delete cascade,
  worth_buying boolean not null,
  verdict_summary text not null,
  resale_price_low numeric(12,2) not null,
  resale_price_high numeric(12,2) not null,
  best_resale_platforms jsonb not null default '[]',
  estimated_selling_time_days smallint not null,
  risks text[] not null default '{}',
  negotiation_suggestions text[] not null default '{}',
  suggested_max_offer numeric(12,2) not null,
  similar_sold_items jsonb not null default '[]',
  generated_at timestamptz not null default now()
);

-- User relation to a listing: saved / favorited / viewed / watchlist.
create table user_listing_records (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references listings(id) on delete cascade,
  relation user_listing_relation not null,
  created_at timestamptz not null default now(),
  unique (user_id, listing_id, relation)
);

create index idx_ulr_user on user_listing_records(user_id);
create index idx_ulr_listing on user_listing_records(listing_id);

-- Row Level Security: users only see/manage their own records.
alter table user_listing_records enable row level security;

create policy "Users manage their own listing records"
  on user_listing_records
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Listings & analyses are public read (marketplace data), writes via service role only.
alter table listings enable row level security;
alter table analyses enable row level security;
alter table ai_reports enable row level security;

create policy "Anyone can read listings" on listings for select using (true);
create policy "Anyone can read analyses" on analyses for select using (true);
create policy "Anyone can read ai_reports" on ai_reports for select using (true);
