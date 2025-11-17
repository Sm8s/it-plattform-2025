-- Grobes Schema für die IT-Lernplattform

-- USERS werden von Supabase Auth verwaltet.
-- Zusätzliche Profildaten:
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  locale text default 'de',
  xp integer default 0,
  level integer default 1,
  created_at timestamp with time zone default now()
);

-- Kurse (HTML, CSS, JS, Git, Python)
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_de text not null,
  title_en text not null,
  description_de text,
  description_en text,
  difficulty text check (difficulty in ('beginner','intermediate','advanced')) default 'beginner',
  created_at timestamp with time zone default now(),
  is_published boolean default true
);

-- Lektionen
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  order_index integer not null,
  title_de text not null,
  title_en text not null,
  content_md_de text,
  content_md_en text,
  exercise_type text check (exercise_type in ('code','quiz','reading')) default 'reading',
  created_at timestamp with time zone default now()
);

-- Quiz-Fragen
create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete cascade,
  question_de text not null,
  question_en text not null,
  options jsonb not null,         -- [{ "id": "a", "text_de": "...", "text_en": "..."}, ...]
  correct_option_id text not null,
  explanation_de text,
  explanation_en text
);

-- Fortschritt
create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  status text check (status in ('not_started','in_progress','completed')) default 'in_progress',
  score integer,
  completed_at timestamp with time zone,
  unique (user_id, lesson_id)
);

-- Zertifikate pro Kurs
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  issued_at timestamp with time zone default now(),
  certificate_code text unique not null
);

-- Gamification Events (XP, Badges etc.)
create table if not exists public.gamification_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  type text not null, -- e.g. 'lesson_completed', 'quiz_perfect', 'streak'
  meta jsonb,
  xp_delta integer default 0,
  created_at timestamp with time zone default now()
);

-- Forum: Threads
create table if not exists public.forum_threads (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete set null,
  title text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- Forum: Posts
create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references public.forum_threads(id) on delete cascade,
  content text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- Audit Log (Admin Aktionen usw.)
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  action text not null,
  entity_type text,
  entity_id text,
  meta jsonb,
  created_at timestamp with time zone default now()
);

-- Rollen & Rechte (vereinfachtes RBAC)
create table if not exists public.roles (
  id serial primary key,
  key text unique not null, -- 'admin', 'editor', 'support', 'user'
  label text not null
);

create table if not exists public.user_roles (
  id serial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  role_id integer references public.roles(id) on delete cascade,
  unique (user_id, role_id)
);

-- Basic Policies (vereinfachtes Beispiel, bitte im Dashboard anpassen)
-- Achtung: In echt feiner granulieren!

alter table public.profiles enable row level security;
create policy "Public profiles are readable"
  on public.profiles for select
  using ( true );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

alter table public.lesson_progress enable row level security;
create policy "Users see own progress"
  on public.lesson_progress for select
  using ( auth.uid() = user_id );

create policy "Users modify own progress"
  on public.lesson_progress for insert with check (auth.uid() = user_id);
create policy "Users modify own progress upd"
  on public.lesson_progress for update using (auth.uid() = user_id);
