-- Erlaube Nutzern, ihre eigenen Rollen zu lesen (für Admin-Check im Frontend)
alter table public.user_roles enable row level security;

create policy "Users can see own roles"
  on public.user_roles
  for select
  using (auth.uid() = user_id);
