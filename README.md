# Academia Miau&Bits — Bootstrap

> Monorepo app **Next.js 14 + Tailwind + Supabase + GraphQL + Cloudinary + Mercado Pago**

---
## 1) Requisitos
- Node 20+
- pnpm (recomendado) o npm
- Cuenta Supabase + proyecto creado
- Cloudinary (opcional para imágenes/OG)
- Cuenta Mercado Pago (Checkout Pro)

---
## 2) Estructura del proyecto (MVP)
```
Academia-miaubits-IA/
├─ app/
│  ├─ (public)/
│  │  ├─ about/page.tsx
│  │  ├─ cursos/page.tsx
│  │  ├─ retos/page.tsx
│  │  └─ suscripciones/page.tsx
│  ├─ dashboard/page.tsx
│  ├─ api/
│  │  ├─ graphql/route.ts
│  │  └─ webhooks/mercadopago/route.ts
│  ├─ layout.tsx
│  └─ page.tsx
├─ components/
│  ├─ ui/*
│  ├─ about/TeamCard.tsx
│  └─ code/Editor.tsx
├─ lib/
│  ├─ supabase.ts
│  ├─ auth.ts
│  ├─ gql/schema.ts
│  ├─ gql/resolvers.ts
│  ├─ payments/mercadopago.ts
│  └─ seo.ts
├─ public/
│  └─ avatars/
│     ├─ karen.png
│     └─ rios.png
├─ scripts/
│  ├─ migrate.sql
│  └─ seed.sql
├─ .env.example
├─ next.config.mjs
├─ package.json
└─ tsconfig.json
```

---
## 3) Variables de entorno
Copia `.env.example` a `.env.local` y rellena.

```ini
# Supabase
NEXT_PUBLIC_SUPABASE_URL=<https://xxx.supabase.co>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE=<service_role_key>   # solo en server (Vercel)

# Cloudinary (opcional)
NEXT_PUBLIC_CLOUDINARY_CLOUD=<cloud_name>
CLOUDINARY_SECRET=<api_secret>

# PostHog (telemetría)
POSTHOG_KEY=<ph_project_key>
POSTHOG_HOST=https://app.posthog.com

# Mercado Pago
MP_ACCESS_TOKEN=<access_token>
MP_WEBHOOK_SECRET=<random-string>          # para firmar/validar

# App
SITE_URL=https://academia.miaubits.dev
JWT_SECRET=<rotated_jwt_secret>
```

> **Producción:** configura variables en Vercel → Project → Settings → Environment Variables.

---
## 4) Instalación rápida
```bash
# 1) Crea el proyecto Next con Tailwind
npx create-next-app@latest academia-miaubits-ia \
  --ts --tailwind --eslint --app --import-alias "@/*"
cd academia-miaubits-ia

# 2) Instala dependencias adicionales
pnpm add @supabase/supabase-js graphql graphql-yoga next-seo \
  zod posthog-js

# 3) Dev
pnpm dev
```

---
## 5) Base de datos (Supabase)
> Ejecuta `scripts/migrate.sql` en el **SQL Editor** de Supabase o con supabase-cli. Incluye **tipos**, **tablas** y **RLS** base.

**`scripts/migrate.sql` (extracto; versión completa en archivo):**
```sql
-- tipos
create type role as enum ('admin','instructor','reviewer','student');
create type interval as enum ('month','year');
create type sub_status as enum ('trial','active','past_due','canceled');
create type lesson_type as enum ('theory','quiz','exercise','video','project','final_project');
create type progress_status as enum ('started','completed');

-- perfiles
create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  handle text unique,
  role role default 'student',
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- planes y suscripciones
create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price_cents int not null,
  currency text default 'MXN',
  interval interval not null,
  features jsonb default '{}'::jsonb,
  is_active bool default true
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  plan_id uuid references plans(id),
  status sub_status not null default 'trial',
  renews_at timestamptz,
  canceled_at timestamptz,
  grace_period_end timestamptz,
  provider text,
  ext_customer_id text,
  ext_subscription_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_type text not null,
  signature_valid bool default false,
  dedupe_key text unique,
  payload jsonb not null,
  processed_at timestamptz
);

-- cursos
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  level text,
  tags text[] default '{}',
  cover_image text,
  description text,
  version int default 1,
  draft_of uuid references courses(id),
  published_at timestamptz
);

create table if not exists modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  title text not null,
  summary text,
  "order" int not null,
  unique(course_id, "order")
);

create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references modules(id) on delete cascade,
  title text not null,
  type lesson_type not null,
  "order" int not null,
  content jsonb default '{}'::jsonb,
  unique(module_id, "order")
);

create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references lessons(id) on delete cascade,
  runtime text,
  instructions text,
  starter_code text,
  test_cases jsonb default '[]'::jsonb,
  time_limit_ms int default 5000,
  memory_limit_mb int default 128
);

create table if not exists exercise_attempts (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid references exercises(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  score int default 0,
  passed bool default false,
  stdout text,
  stderr text,
  duration_ms int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists ix_attempt_user_ex on exercise_attempts(user_id, exercise_id);

create table if not exists user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  module_id uuid references modules(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete cascade,
  status progress_status default 'started',
  last_code text,
  updated_at timestamptz default now()
);
create index if not exists ix_progress_user_course on user_progress(user_id, course_id);

create table if not exists challenge_submissions (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null,
  user_id uuid references auth.users(id) on delete cascade,
  code text,
  score int default 0,
  is_public bool default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  issued_at timestamptz default now(),
  certificate_url text,
  sha256_hash text unique
);

-- RLS
alter table profiles enable row level security;
create policy "read own or admin" on profiles
  for select using (auth.uid() = user_id or exists(select 1 from profiles p where p.user_id = auth.uid() and p.role in ('admin')));
create policy "update own" on profiles for update using (auth.uid() = user_id);

alter table user_progress enable row level security;
create policy "own progress" on user_progress for select using (auth.uid() = user_id);
create policy "upsert own" on user_progress for insert with check (auth.uid() = user_id);

alter table challenge_submissions enable row level security;
create policy "view public or own" on challenge_submissions for select using (is_public OR auth.uid() = user_id);
create policy "insert own" on challenge_submissions for insert with check (auth.uid() = user_id);

alter table subscriptions enable row level security;
create policy "read own or admin" on subscriptions
  for select using (auth.uid() = user_id or exists(select 1 from profiles p where p.user_id = auth.uid() and p.role='admin'));
```

---
## 6) Webhook de Mercado Pago (esqueleto)
Ruta: `/app/api/webhooks/mercadopago/route.ts`.
```ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-signature');
  const body = await req.json();

  // TODO: validar firma según MP y dedupe por event id
  // guardar en webhook_events y procesar por tipo

  return NextResponse.json({ ok: true });
}
```

Configura en MP la URL: `https://academia.miaubits.dev/api/webhooks/mercadopago`.

---
## 7) Página About y avatares
Coloca tus imágenes como:
```
/public/avatars/karen.png
/public/avatars/rios.png
```
Snippet de uso (Next Image):
```tsx
<Image src="/avatars/karen.png" alt="Karen (Data/BI) con Minina" width={480} height={720} />
```

---
## 8) Scripts recomendados
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:migrate": "echo 'Run scripts/migrate.sql in Supabase'"
  }
}
```

---
## 9) Roadmap inmediato
1. Scaffold Next + Tailwind + rutas base.  
2. Subir `scripts/migrate.sql` y ejecutar en Supabase.  
3. Implementar `/api/graphql` con esquema base.  
4. Catálogo de cursos + progreso.  
5. Checkout y webhooks de Mercado Pago.  
6. Certificados + verificación.  
7. SEO/OG + PostHog.

---
## 10) GitHub
```bash
git init
git add .
git commit -m "chore: bootstrap academia"
git branch -M main
git remote add origin git@github.com:<usuario>/Academia-miaubits-IA.git
git push -u origin main
```

Listo. Cuando confirmes que el repo está creado, te paso los **archivos iniciales** (pages, components, lib) para pegarlos tal cual y abrir el PR #1.

