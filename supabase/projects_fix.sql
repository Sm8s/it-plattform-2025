
-- Fix für Projects-Tabelle, passend zur React-Projekt-Galerie

-- optional: neue Spalten nur anlegen, wenn sie noch nicht existieren
alter table public.projects
  add column if not exists demo_url text;

alter table public.projects
  add column if not exists is_public boolean not null default true;

alter table public.projects
  add column if not exists created_at timestamptz not null default now();

alter table public.projects
  add column if not exists updated_at timestamptz;

-- (optional) einfacher Trigger für updated_at
do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_projects_updated_at'
  ) then
    create or replace function public.set_projects_updated_at()
    returns trigger as $func$
    begin
      new.updated_at = now();
      return new;
    end;
    $func$ language plpgsql;

    create trigger set_projects_updated_at
    before update on public.projects
    for each row
    execute function public.set_projects_updated_at();
  end if;
end;
$$;
