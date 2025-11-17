-- Rolle 'owner' mit allen Rechten (logisch höchste Rolle)
insert into public.roles (key, label)
values ('owner', 'Owner / Plattform-Besitzer')
on conflict (key) do nothing;

-- WICHTIG:
-- 1. Lege in Supabase unter Authentication -> Users einen User an:
--    Email z.B. banje@example.com
--    Passwort: Pablokino1!
-- 2. Nutze dann die Email hier im SQL:

-- Beispiel (Email anpassen!):
insert into public.user_roles (user_id, role_id)
select u.id, r.id
from auth.users u
join public.roles r on r.key = 'owner'
where u.email = 'banje@example.com'
on conflict (user_id, role_id) do nothing;
