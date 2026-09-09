# Discovery Tool

A lightweight CRM for tracking networking and sales discovery: organizations,
the people at them, notes from discovery calls, and the pain points those
calls surface — with pain points linkable back to the specific note they came
from.

**[Live demo →](#) <!-- TODO: replace with deployed URL --></br>**
Try it with the seeded demo account: `demo@example.com` / `demo-password-123`
<!-- TODO: replace with real demo credentials once seeded -->

## Why this exists

Most CRMs are overkill for early-stage relationship tracking — this is the
minimum schema and UI needed to answer three questions: *Who have I talked
to? What did they tell me? What problems are worth following up on?*

## Features

- **Organizations** — the companies/orgs you're in discovery with
- **Contacts** — people at each org, scoped to that organization
- **Discovery notes** — free-form notes from calls, optionally tied to a
  specific contact and meeting date
- **Pain points** — problems surfaced during discovery, optionally linked to
  the discovery note they came from, with category + severity tagging
- **Per-user data isolation** — Supabase Row Level Security scopes every row
  to the signed-in user via `owner_id = auth.uid()`
- An organization's detail page rolls up its contacts, notes, and pain points
  in one view; each entity also has its own global list/search page

## Tech stack

| Layer      | Choice                                      |
|------------|----------------------------------------------|
| Frontend   | React 19 + TypeScript, [Vite](https://vitejs.dev/) |
| Styling    | [Tailwind CSS v4](https://tailwindcss.com/)  |
| Backend    | [Supabase](https://supabase.com/) (Postgres, Auth, Row Level Security) |
| Routing    | react-router-dom                             |
| Deployment | Vercel                                       |

## Schema

```
organizations ──┬─< contacts
                ├─< discovery_notes ──< pain_points
                └─< pain_points
```

- `contacts.organization_id → organizations.id`
- `discovery_notes.organization_id → organizations.id`
- `discovery_notes.contact_id → contacts.id` (nullable)
- `pain_points.organization_id → organizations.id`
- `pain_points.contact_id → contacts.id` (nullable)
- `pain_points.discovery_note_id → discovery_notes.id` (nullable) — the link
  that lets a pain point trace back to the specific call it surfaced in

Every table has `created_at`/`updated_at` timestamps and an `owner_id` used
by RLS policies. Full DDL is in [`supabase/schema.sql`](supabase/schema.sql).

## Project structure

```
src/
  lib/supabase.ts          Supabase client (reads VITE_ env vars)
  types/database.ts        Types mirroring the SQL schema
  context/AuthContext.tsx  Session state + sign in/up/out
  components/
    forms/                 One form component per entity
    Layout.tsx             Top nav + outlet
    Modal.tsx, ui.tsx      Shared modal + form primitives
  pages/
    Login.tsx
    OrganizationsPage.tsx        List/add/edit/delete organizations
    OrganizationDetailPage.tsx   One org's contacts, notes, and pain points together
    ContactsPage.tsx
    DiscoveryNotesPage.tsx
    PainPointsPage.tsx
```

Each page fetches its own data directly from Supabase and refetches after
mutations — no client-side cache layer. Simple to read; would reach for
[TanStack Query](https://tanstack.com/query) if this grew past a handful of
pages.

## Running it locally

**1. Create a Supabase project**, then run [`supabase/schema.sql`](supabase/schema.sql)
in its SQL editor — creates all four tables plus RLS policies and
`updated_at` triggers in one shot.

**2. Configure environment variables**

```bash
cp .env.example .env
```

Fill in your project's values from **Supabase → Project Settings → API**:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

**3. Install and run**

```bash
npm install
npm run dev
```

Open http://localhost:5173, sign up for an account, and start adding data.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — typecheck (`tsc -b`) and build for production
- `npm run preview` — preview the production build locally
- `npm run lint` — lint with oxlint

## Keeping types in sync with the schema

`src/types/database.ts` is hand-written to match the SQL. If you change the
schema, either update it by hand or generate it from Supabase:

```bash
npx supabase gen types typescript --project-id <your-project-ref> > src/types/database.ts
```

(Reconcile the generated export names with what the app imports —
`Organization`, `Contact`, `DiscoveryNote`, `PainPoint`, and their
`*Insert`/`*Update` variants.)
