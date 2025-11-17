# IT Lernplattform (MVP)

Dieses Projekt enthält zwei React-Apps:

- `app/` – Nutzer-Frontend (ähnlich wie Mimo)
- `admin/` – Admin-Panel mit eigenem Design

Beide Apps sind für Netlify vorbereitet (Vite + React). Supabase wird für Auth, Datenbank und Realtime genutzt.
Siehe `supabase/` für Schema-Vorschläge.

## Deployment grob

1. In Supabase ein neues Projekt anlegen.
2. Tabellen und Policies aus `supabase/schema.sql` ausführen.
3. In Supabase ein Service-Role-Key und ein anonyme Public-API-Key holen.
4. In Netlify zwei Sites anlegen:
   - Site 1: Ordner `app/` bauen und deployen.
   - Site 2: Ordner `admin/` bauen und deployen.
5. In beiden Sites die Environment-Variablen setzen (siehe `.env.example` in beiden Apps).

Danach in beiden Apps:

```bash
npm install
npm run dev   # lokal
npm run build # für Netlify
```
