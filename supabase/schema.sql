-- =====================================================================
-- ATELIER GALLERY — full database schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Helper: updated_at trigger
-- ---------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Helper: admin check (SECURITY DEFINER so RLS can't recurse)
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- =====================================================================
-- TABLES
-- =====================================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  cover_image text,
  featured boolean not null default false,
  sort_order int not null default 0
);

create table public.artworks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  story text,
  category_id uuid not null references public.categories (id) on delete restrict,
  collection_id uuid references public.collections (id) on delete set null,
  price_cents int not null check (price_cents >= 0),
  currency text not null default 'USD',
  edition_type text not null default 'one_of_one'
    check (edition_type in ('one_of_one', 'limited', 'open')),
  edition_total int check (edition_total is null or edition_total > 0),
  edition_available int check (edition_available is null or edition_available >= 0),
  stock int not null default 1 check (stock >= 0),
  status text not null default 'available'
    check (status in ('available', 'reserved', 'sold', 'archived')),
  materials text[] not null default '{}',
  dimensions jsonb,
  weight_grams int,
  year int not null,
  featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.artwork_images (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  url text not null,
  alt text,
  position int not null default 0,
  is_primary boolean not null default false
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  email text not null,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled')),
  subtotal_cents int not null default 0 check (subtotal_cents >= 0),
  shipping_cents int not null default 0 check (shipping_cents >= 0),
  total_cents int not null default 0 check (total_cents >= 0),
  currency text not null default 'USD',
  stripe_session_id text unique,
  stripe_payment_intent text,
  shipping_address jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  artwork_id uuid references public.artworks (id) on delete set null,
  title text not null,
  unit_price_cents int not null check (unit_price_cents >= 0),
  quantity int not null check (quantity > 0)
);

create table public.commissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  commission_type text not null,
  budget_range text not null,
  timeline text not null,
  description text not null,
  reference_images text[] not null default '{}',
  status text not null default 'new'
    check (status in ('new', 'in_discussion', 'accepted', 'in_progress', 'completed', 'declined')),
  created_at timestamptz not null default now()
);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  inquiry_type text not null default 'general',
  status text not null default 'new'
    check (status in ('new', 'replied', 'archived')),
  created_at timestamptz not null default now()
);

create table public.journal_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null,
  content text not null,
  cover_image text,
  published boolean not null default false,
  published_at timestamptz,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  quote text not null,
  featured boolean not null default false,
  sort_order int not null default 0
);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  subscribed_at timestamptz not null default now()
);

-- =====================================================================
-- INDEXES
-- =====================================================================
create index idx_artworks_slug on public.artworks (slug);
create index idx_artworks_status on public.artworks (status);
create index idx_artworks_published on public.artworks (published);
create index idx_artworks_category on public.artworks (category_id);
create index idx_artworks_collection on public.artworks (collection_id);
create index idx_artworks_featured on public.artworks (featured) where featured = true;
create index idx_artwork_images_artwork on public.artwork_images (artwork_id);
create index idx_orders_status on public.orders (status);
create index idx_orders_user on public.orders (user_id);
create index idx_order_items_order on public.order_items (order_id);
create index idx_commissions_status on public.commissions (status);
create index idx_inquiries_status on public.inquiries (status);
create index idx_journal_slug on public.journal_posts (slug);
create index idx_journal_published on public.journal_posts (published) where published = true;
create index idx_categories_slug on public.categories (slug);
create index idx_collections_slug on public.collections (slug);

-- =====================================================================
-- TRIGGERS
-- =====================================================================
create trigger trg_artworks_updated_at
  before update on public.artworks
  for each row execute function public.handle_updated_at();

create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.handle_updated_at();

-- Auto-create a profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

drop trigger if exists trg_new_user on auth.users;
create trigger trg_new_user
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.collections enable row level security;
alter table public.artworks enable row level security;
alter table public.artwork_images enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.commissions enable row level security;
alter table public.inquiries enable row level security;
alter table public.journal_posts enable row level security;
alter table public.testimonials enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- ---- public read: catalogue, journal, testimonials ----
create policy "public read categories" on public.categories
  for select using (true);

create policy "public read collections" on public.collections
  for select using (true);

create policy "public read published artworks" on public.artworks
  for select using (published = true);

create policy "public read artwork images of published artworks" on public.artwork_images
  for select using (
    exists (select 1 from public.artworks a where a.id = artwork_id and a.published = true)
  );

create policy "public read published journal" on public.journal_posts
  for select using (published = true);

create policy "public read testimonials" on public.testimonials
  for select using (true);

-- ---- profiles ----
create policy "users read own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "users update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ---- orders: read own only; writes go through the service-role API ----
create policy "users read own orders" on public.orders
  for select using (auth.uid() = user_id);

create policy "users read own order items" on public.order_items
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

-- ---- public insert: commissions, inquiries, newsletter ----
create policy "public insert commissions" on public.commissions
  for insert with check (true);

create policy "public insert inquiries" on public.inquiries
  for insert with check (true);

create policy "public insert newsletter" on public.newsletter_subscribers
  for insert with check (true);

-- ---- admin: full access ----
create policy "admin all profiles" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

create policy "admin all categories" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

create policy "admin all collections" on public.collections
  for all using (public.is_admin()) with check (public.is_admin());

create policy "admin all artworks" on public.artworks
  for all using (public.is_admin()) with check (public.is_admin());

create policy "admin all artwork images" on public.artwork_images
  for all using (public.is_admin()) with check (public.is_admin());

create policy "admin all orders" on public.orders
  for all using (public.is_admin()) with check (public.is_admin());

create policy "admin all order items" on public.order_items
  for all using (public.is_admin()) with check (public.is_admin());

create policy "admin all commissions" on public.commissions
  for all using (public.is_admin()) with check (public.is_admin());

create policy "admin all inquiries" on public.inquiries
  for all using (public.is_admin()) with check (public.is_admin());

create policy "admin all journal" on public.journal_posts
  for all using (public.is_admin()) with check (public.is_admin());

create policy "admin all testimonials" on public.testimonials
  for all using (public.is_admin()) with check (public.is_admin());

create policy "admin all newsletter" on public.newsletter_subscribers
  for all using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- STORAGE
-- =====================================================================
insert into storage.buckets (id, name, public)
values
  ('artworks', 'artworks', true),
  ('journal', 'journal', true),
  ('commission-references', 'commission-references', false)
on conflict (id) do nothing;

-- public buckets: anyone can read
create policy "public read artworks bucket" on storage.objects
  for select using (bucket_id = 'artworks');
create policy "public read journal bucket" on storage.objects
  for select using (bucket_id = 'journal');

-- admin can manage all buckets
create policy "admin manage artworks bucket" on storage.objects
  for all using (bucket_id = 'artworks' and public.is_admin())
  with check (bucket_id = 'artworks' and public.is_admin());
create policy "admin manage journal bucket" on storage.objects
  for all using (bucket_id = 'journal' and public.is_admin())
  with check (bucket_id = 'journal' and public.is_admin());
create policy "admin manage commission refs" on storage.objects
  for all using (bucket_id = 'commission-references' and public.is_admin())
  with check (bucket_id = 'commission-references' and public.is_admin());

-- customers can upload commission reference images to their own folder
create policy "users upload commission references" on storage.objects
  for insert with check (
    bucket_id = 'commission-references'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "users read own commission references" on storage.objects
  for select using (
    bucket_id = 'commission-references'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
