# Lawstack

AI for real-world litigation. Turn facts into evidence-backed pleadings that survive motions to dismiss and demurrers.

## Features

- **Case Setup** — Enter key details, choose jurisdiction (state/federal), and define claims from pre-built legal element templates
- **Facts & Evidence** — Organize facts, incident timeline, documents, witnesses, damages, and legal element checklists
- **AI Legal Analysis** — Map facts to legal elements, assess claim strength, identify vulnerabilities, evaluate dismissal risk (Iqbal/Twombly), and find supporting precedent
- **Complaint Draft Generator** — Generate structured, court-ready complaints with proper caption, jurisdiction, factual allegations, causes of action, and prayer for relief
- **Review & File** — Collaborate with inline comments, resolve threads, export to PDF/DOCX/TXT, and track filing readiness
- **Multi-Tenant** — Organization-based with roles (Owner, Admin, Attorney, Paralegal, Viewer)
- **Pluggable AI** — Switch between OpenAI, Anthropic Claude, and AWS Bedrock with per-task model routing

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Next.js Route Handlers + Server Actions
- **Database**: Supabase (PostgreSQL) + Prisma ORM
- **Auth**: Supabase Auth with Row-Level Security
- **Storage**: Supabase Storage for document uploads
- **AI**: Pluggable provider abstraction (OpenAI / Anthropic / Bedrock)
- **Deploy**: Vercel + Supabase

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` and fill in your Supabase and AI provider credentials.

**Important:** Prisma reads **`.env`**, not `.env.local`. Next.js uses both. Copy to both files (or put `DATABASE_URL` / `DIRECT_URL` in `.env`):

```bash
cp .env.example .env
cp .env.example .env.local
```

`DATABASE_URL` and `DIRECT_URL` must use the **`postgresql://`** scheme from Supabase **Database → Connection string → URI**. Do not use the HTTPS project URL (`https://….supabase.co`) or API keys as the database URL. URL-encode special characters in your database password.

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your Project URL and anon key from Settings > API
3. Get your database connection string from Settings > Database
4. **Authentication → URL Configuration**
   - **Site URL**: your app origin (e.g. `https://your-app.vercel.app` or `http://localhost:3000` for local dev). Do **not** use the `*.supabase.co` project URL here.
   - **Redirect URLs**: add `http://localhost:3000/auth/callback` and `https://your-app.vercel.app/auth/callback` (and any preview domains you use).
5. Set `NEXT_PUBLIC_SITE_URL` in Vercel to the same origin as Site URL (used when building email confirmation links).
6. Create a storage bucket named `evidence` (public)
7. Run the Prisma migration:

```bash
npx prisma db push
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Build for production

```bash
npm run build
```

## Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. In **Project → Settings → Environment Variables**, add the variables from `.env.example` (at minimum `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, plus your AI provider keys). Missing Supabase vars cause every page to fail in middleware until they are set.
4. Deploy

## Project Structure

```
src/
├── app/
│   ├── (landing)          # Marketing page replicating pleading.ai
│   ├── login/             # Auth pages
│   ├── signup/
│   ├── dashboard/         # Case list + new case wizard
│   ├── cases/[id]/        # Case workflow (5 steps)
│   │   ├── setup/         # Step 1: Case details + claims
│   │   ├── facts/         # Step 2: Facts & evidence
│   │   ├── analysis/      # Step 3: AI legal analysis
│   │   ├── draft/         # Step 4: Complaint draft generator
│   │   └── review/        # Step 5: Review, collaborate, export
│   ├── settings/          # Org + AI provider settings
│   └── api/               # API routes
├── components/
│   ├── landing/           # Marketing page components
│   ├── dashboard/         # Dashboard layout + sidebar
│   ├── cases/             # Case workflow components
│   └── settings/          # Settings forms
└── lib/
    ├── ai/                # AI provider abstraction + prompts
    ├── auth/              # Session management
    ├── legal/             # Claim templates + jurisdictions
    ├── supabase/          # Supabase clients
    └── types/             # TypeScript types
```

## License

Proprietary. All rights reserved.
