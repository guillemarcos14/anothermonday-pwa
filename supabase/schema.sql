-- supabase/schema.sql
-- Another Monday — esquema de base de datos
-- Ejecutar en el editor SQL del panel de Supabase

-- ──────────────────────────────────────────────
-- Helper: is_admin() — SECURITY DEFINER bypasses RLS
-- so admin-check subqueries don't self-block on profiles
-- ──────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- ──────────────────────────────────────────────
-- profiles
-- ──────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  poblacion text,
  cumpleanos date,
  points integer not null default 0,
  tier text not null default 'Bronce',
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Admins can read any profile (needed for order management / QR scanner)
drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin" on public.profiles
  for select using (public.is_admin());

-- Admin profile lookup — SECURITY DEFINER bypasses RLS entirely
create or replace function public.admin_get_profile(target_uid uuid)
returns table(id uuid, email text, name text, points integer, tier text)
language plpgsql
stable
security definer
as $$
begin
  -- Only allow admins to call this
  if not public.is_admin() then
    raise exception 'No autorizado';
  end if;

  return query
    select p.id, p.email, p.name, p.points, p.tier
    from public.profiles p
    where p.id = target_uid;
end;
$$;

-- ──────────────────────────────────────────────
-- products
-- ──────────────────────────────────────────────
create table if not exists public.products (
  id integer primary key,
  nombre text not null,
  precio numeric(6,2) not null,
  categoria text not null,
  imagen text,
  descripcion text,
  disponible boolean not null default true
);

alter table public.products enable row level security;

-- Public read access
drop policy if exists "products_select_all" on public.products;
create policy "products_select_all" on public.products
  for select using (true);

-- Admin CRUD on products
drop policy if exists "products_insert_admin" on public.products;
create policy "products_insert_admin" on public.products
  for insert with check (public.is_admin());

drop policy if exists "products_update_admin" on public.products;
create policy "products_update_admin" on public.products
  for update using (public.is_admin());

drop policy if exists "products_delete_admin" on public.products;
create policy "products_delete_admin" on public.products
  for delete using (public.is_admin());

-- ──────────────────────────────────────────────
-- Seed: insert 16 products from static catalog
-- ──────────────────────────────────────────────
insert into public.products (id, nombre, precio, categoria, imagen, descripcion) values
  (1,  'Matcha Latte',      4.50, 'Best Sellers', '/matchalatte.webp',    'Matcha ceremonial batido con leche cremosa'),
  (2,  'Latte',             3.80, 'Best Sellers', '/latte.webp',          'Espresso suave con leche texturizada'),
  (3,  'Cookie Choco',      3.20, 'Best Sellers', '/cookiechoco.webp',    'Crujiente por fuera, fundida por dentro'),
  (4,  'Muffin Choco',      3.50, 'Best Sellers', '/muffinchoco.webp',    'Esponjoso con trozos de chocolate negro'),
  (10, 'Espresso',          2.20, 'Café',         '/Espresso.webp',       'Intenso, con crema dorada perfecta'),
  (11, 'Americano',         2.80, 'Café',         '/americano.webp',      'Espresso largo, limpio y aromático'),
  (13, 'Cappuccino',        3.50, 'Café',         '/capuccino.webp',      'Equilibrio perfecto de espuma y café'),
  (14, 'Latte',             3.80, 'Café',         '/latte.webp',          'Espresso suave con leche texturizada'),
  (20, 'Matcha Latte',      4.50, 'Matcha',       '/matchalatte.webp',    'Matcha ceremonial batido con leche cremosa'),
  (21, 'Iced Matcha Latte', 5.00, 'Matcha',       '/icedmatchalatte.webp','Matcha frío con leche, refrescante y vibrante'),
  (22, 'Chai Latte',        4.80, 'Matcha',       '/chailatte.webp',      'Especias cálidas con leche sedosa'),
  (23, 'Iced Chai Latte',   5.20, 'Matcha',       '/icedchailatte.webp',  'Chai especiado sobre hielo, dulce y fresco'),
  (30, 'Cookie Choco',      3.20, 'Comida',       '/cookiechoco.webp',    'Crujiente por fuera, fundida por dentro'),
  (31, 'Muffin Choco',      3.50, 'Comida',       '/muffinchoco.webp',    'Esponjoso con trozos de chocolate negro'),
  (32, 'Croissant',         2.80, 'Comida',       '/croissant.webp',      'Mantequilla francesa, capas hojaldradas'),
  (33, 'Roll Canela',       3.00, 'Comida',       '/rollcanela.webp',     'Masa tierna con canela y glaseado suave')
on conflict (id) do nothing;

-- ──────────────────────────────────────────────
-- orders
-- ──────────────────────────────────────────────
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  numero text not null,
  total numeric(8,2) not null,
  puntos integer not null default 0,
  estado text not null default 'pendiente',  -- pendiente | completado | entregado
  tienda_nombre text,
  tienda_ciudad text,
  hora_recogida text,
  created_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders(user_id);

alter table public.orders enable row level security;

-- Users see their own orders
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders
  for select using (auth.uid() = user_id);

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own" on public.orders
  for insert with check (auth.uid() = user_id);

drop policy if exists "orders_update_own" on public.orders;
create policy "orders_update_own" on public.orders
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Admins can see and update ALL orders
drop policy if exists "orders_select_admin" on public.orders;
create policy "orders_select_admin" on public.orders
  for select using (public.is_admin());

drop policy if exists "orders_update_admin" on public.orders;
create policy "orders_update_admin" on public.orders
  for update using (public.is_admin());

-- Sequence for order numbers
create sequence if not exists public.orders_numero_seq start 42;

alter table public.orders
  alter column numero set default lpad(nextval('public.orders_numero_seq')::text, 4, '0');

-- ──────────────────────────────────────────────
-- order_items
-- ──────────────────────────────────────────────
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id integer references public.products(id),
  nombre text not null,
  precio numeric(6,2) not null,
  cantidad integer not null check (cantidad > 0),
  tamano text default 'M',                    -- S | M | L
  tipo_leche text default 'normal',           -- normal | avena | soja | almendra
  extras jsonb default '[]'::jsonb            -- [{nombre, precio}]
);

create index if not exists order_items_order_id_idx on public.order_items(order_id);

alter table public.order_items enable row level security;

drop policy if exists "order_items_select_own" on public.order_items;
create policy "order_items_select_own" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists "order_items_insert_own" on public.order_items;
create policy "order_items_insert_own" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

-- Admins can see all order items
drop policy if exists "order_items_select_admin" on public.order_items;
create policy "order_items_select_admin" on public.order_items
  for select using (public.is_admin());

-- ──────────────────────────────────────────────
-- Points functions (1B)
-- ──────────────────────────────────────────────

-- Calculate total points for a user
create or replace function public.calculate_user_points(uid uuid)
returns integer
language sql
stable
as $$
  select coalesce(sum(puntos), 0)::integer
  from public.orders
  where user_id = uid;
$$;

-- Get tier name from points
create or replace function public.get_user_tier(pts integer)
returns text
language sql
immutable
as $$
  select case
    when pts >= 700 then 'Platino'
    when pts >= 300 then 'Oro'
    when pts >= 100 then 'Plata'
    else 'Bronce'
  end;
$$;

-- Trigger: after inserting an order, update profile points and tier
create or replace function public.update_profile_points()
returns trigger
language plpgsql
security definer
as $$
declare
  total_pts integer;
  new_tier text;
begin
  total_pts := public.calculate_user_points(NEW.user_id);
  new_tier := public.get_user_tier(total_pts);
  update public.profiles
  set points = total_pts, tier = new_tier
  where id = NEW.user_id;
  return NEW;
end;
$$;

drop trigger if exists trg_update_profile_points on public.orders;
create trigger trg_update_profile_points
  after insert on public.orders
  for each row
  execute function public.update_profile_points();

-- ──────────────────────────────────────────────
-- rewards  (catálogo de recompensas canjeables)
-- ──────────────────────────────────────────────
create table if not exists public.rewards (
  id serial primary key,
  nombre text not null,
  descripcion text,
  coste_puntos integer not null,
  imagen text,
  disponible boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.rewards enable row level security;

drop policy if exists "rewards_select_all" on public.rewards;
create policy "rewards_select_all" on public.rewards
  for select using (true);

-- Seed rewards
insert into public.rewards (nombre, descripcion, coste_puntos, imagen) values
  ('Café gratis',        'Un café de cualquier tamaño gratis',   50,  '/rewards/cafe.webp'),
  ('Muffin gratis',      'Un muffin de chocolate de regalo',     30,  '/rewards/muffin.webp'),
  ('Descuento 20%',      '20% de descuento en tu próximo pedido', 80, '/rewards/descuento.webp'),
  ('Matcha Latte gratis', 'Un matcha latte de regalo',           60,  '/rewards/matcha.webp'),
  ('Croissant gratis',   'Un croissant de mantequilla de regalo', 25, '/rewards/croissant.webp')
on conflict do nothing;

-- ──────────────────────────────────────────────
-- redemptions  (canjes realizados por usuarios)
-- ──────────────────────────────────────────────
create table if not exists public.redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reward_id integer not null references public.rewards(id),
  created_at timestamptz not null default now()
);

create index if not exists redemptions_user_id_idx on public.redemptions(user_id);

alter table public.redemptions enable row level security;

drop policy if exists "redemptions_select_own" on public.redemptions;
create policy "redemptions_select_own" on public.redemptions
  for select using (auth.uid() = user_id);

drop policy if exists "redemptions_insert_own" on public.redemptions;
create policy "redemptions_insert_own" on public.redemptions
  for insert with check (auth.uid() = user_id);

-- Atomic reward redemption function
create or replace function public.redeem_reward(p_reward_id integer, p_user_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_coste integer;
  v_puntos integer;
  v_new_points integer;
  v_new_tier text;
begin
  -- Get reward cost
  select coste_puntos into v_coste
  from public.rewards
  where id = p_reward_id and disponible = true;

  if v_coste is null then
    return jsonb_build_object('ok', false, 'error', 'Recompensa no disponible');
  end if;

  -- Get user current points
  select points into v_puntos
  from public.profiles
  where id = p_user_id;

  if v_puntos is null or v_puntos < v_coste then
    return jsonb_build_object('ok', false, 'error', 'Puntos insuficientes');
  end if;

  -- Deduct points
  v_new_points := v_puntos - v_coste;
  v_new_tier := public.get_user_tier(v_new_points);

  update public.profiles
  set points = v_new_points, tier = v_new_tier
  where id = p_user_id;

  -- Record the redemption
  insert into public.redemptions (user_id, reward_id) values (p_user_id, p_reward_id);

  return jsonb_build_object('ok', true, 'points', v_new_points, 'tier', v_new_tier);
end;
$$;

-- ──────────────────────────────────────────────
-- user_rewards (achievement-based gifts)
-- ──────────────────────────────────────────────
create table if not exists public.user_rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id integer not null,
  product_id integer not null references public.products(id),
  status text not null default 'pending',  -- pending | redeemed
  created_at timestamptz not null default now(),
  redeemed_at timestamptz,
  unique (user_id, achievement_id)
);

create index if not exists user_rewards_user_id_idx on public.user_rewards(user_id);

alter table public.user_rewards enable row level security;

-- Users see their own rewards
drop policy if exists "user_rewards_select_own" on public.user_rewards;
create policy "user_rewards_select_own" on public.user_rewards
  for select using (auth.uid() = user_id);

-- Users can insert their own rewards (for granting on achievement unlock)
drop policy if exists "user_rewards_insert_own" on public.user_rewards;
create policy "user_rewards_insert_own" on public.user_rewards
  for insert with check (auth.uid() = user_id);

-- Admins can see and update all rewards
drop policy if exists "user_rewards_select_admin" on public.user_rewards;
create policy "user_rewards_select_admin" on public.user_rewards
  for select using (public.is_admin());

drop policy if exists "user_rewards_update_admin" on public.user_rewards;
create policy "user_rewards_update_admin" on public.user_rewards
  for update using (public.is_admin());

-- ──────────────────────────────────────────────
-- Enable Realtime for orders table
-- ──────────────────────────────────────────────
alter publication supabase_realtime add table public.orders;

-- ──────────────────────────────────────────────
-- Migration: en_recogida → pendiente, remove cancelado
-- Run this ONCE on existing databases
-- ──────────────────────────────────────────────
-- update public.orders set estado = 'pendiente' where estado = 'en_recogida';
-- delete from public.orders where estado = 'cancelado';
