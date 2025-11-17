-- Phase 2: Beispielkurs "HTML Grundlagen" + Lektionen + Quiz + Starter-Code

-- optional: Starter-Code-Spalte für Code-Übungen
alter table public.lessons
  add column if not exists starter_code text;

-- Kurs anlegen, falls nicht vorhanden
insert into public.courses (slug, title_de, title_en, description_de, description_en, difficulty)
values (
  'html-basics',
  'HTML Grundlagen',
  'HTML Basics',
  'Lerne, wie du mit HTML das Grundgerüst jeder Webseite aufbaust.',
  'Learn how to build the basic structure of every website with HTML.',
  'beginner'
)
on conflict (slug) do nothing;

-- Kurs-ID holen
with c as (
  select id from public.courses where slug = 'html-basics' limit 1
)
insert into public.lessons (course_id, order_index, title_de, title_en, content_md_de, content_md_en, exercise_type, starter_code)
select
  c.id,
  1,
  'Was ist HTML?',
  'What is HTML?',
  'HTML ist die Auszeichnungssprache, mit der du die Struktur einer Webseite beschreibst.

In dieser Lektion lernst du:
- Was ein Tag ist
- Wie ein einfaches HTML-Dokument aussieht
- Welche Grundstruktur jede Seite haben sollte.',
  'HTML is the markup language used to describe the structure of a web page.

In this lesson you will learn:
- What a tag is
- What a simple HTML document looks like
- Which basic structure every page should have.',
  'reading',
  null
from c
on conflict do nothing;

with c as (
  select id from public.courses where slug = 'html-basics' limit 1
)
insert into public.lessons (course_id, order_index, title_de, title_en, content_md_de, content_md_en, exercise_type, starter_code)
select
  c.id,
  2,
  'Dein erstes HTML-Dokument',
  'Your first HTML document',
  'Schreibe dein erstes vollständiges HTML-Dokument.

Aufgabe:
Erstelle eine Seite mit:
- einem Titel "Meine erste Seite"
- einer Überschrift h1 im Body
- einem Absatz mit einem kurzen Text.',
  'Write your first complete HTML document.

Task:
Create a page with:
- a title "My first page"
- a h1 heading in the body
- a paragraph with some text.',
  'code',
  '<!doctype html>\n<html>\n  <head>\n    <meta charset="UTF-8" />\n    <title>Meine erste Seite</title>\n  </head>\n  <body>\n    <h1>Hallo Welt</h1>\n    <p>Das ist meine erste HTML-Seite.</p>\n  </body>\n</html>'
from c
on conflict do nothing;

-- Quizfrage zur ersten Lektion
with l as (
  select id from public.lessons
  where title_de = 'Was ist HTML?'
  limit 1
)
insert into public.quiz_questions (lesson_id, question_de, question_en, options, correct_option_id, explanation_de, explanation_en)
select
  l.id,
  'Wofür wird HTML hauptsächlich verwendet?',
  'What is HTML mainly used for?',
  '[
    {"id":"a","text_de":"Um die Struktur einer Webseite zu beschreiben.","text_en":"To describe the structure of a webpage."},
    {"id":"b","text_de":"Um Datenbanken zu verwalten.","text_en":"To manage databases."},
    {"id":"c","text_de":"Um Bilder zu bearbeiten.","text_en":"To edit images."}
  ]'::jsonb,
  'a',
  'HTML beschreibt die Struktur (Überschriften, Absätze, Listen, ...), nicht Design oder Logik.',
  'HTML describes the structure (headings, paragraphs, lists, ...), not design or logic.'
from l
on conflict do nothing;
