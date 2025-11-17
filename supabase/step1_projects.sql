-- Schritt 1: Projektgalerie für Nutzer

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  tech_stack text,
  github_url text,
  demo_url text,
  is_public boolean default true,
  created_at timestamp with time zone default now()
);

alter table public.projects enable row level security;

-- Alle können öffentliche Projekte sehen, eigene immer
create policy "Projects are readable if public or own"
  on public.projects
  for select
  using (
    is_public = true
    or auth.uid() = user_id
  );

-- Nur Besitzer darf eigene Projekte anlegen/ändern/löschen
create policy "Users insert own projects"
  on public.projects
  for insert
  with check (auth.uid() = user_id);

create policy "Users update own projects"
  on public.projects
  for update
  using (auth.uid() = user_id);

create policy "Users delete own projects"
  on public.projects
  for delete
  using (auth.uid() = user_id);
