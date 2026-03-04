# v0 Nano Banana Template

AI image generation playground powered by [Vercel AI Gateway](https://vercel.com/ai-gateway) and Google Gemini.

## Setup (local)

1. **Clone and install**

   ```bash
   git clone https://github.com/vercel/v0-nanobanana-template.git
   cd v0-nanobanana-template
   pnpm install
   ```

2. **Configure environment variables**

   Copy `.env.example` to `.env.local` and fill in the values:

   ```bash
   cp .env.example .env.local
   ```

   | Variable | Required | Description |
   |----------|----------|-------------|
   | `AI_GATEWAY_API_KEY` | Yes | Vercel AI Gateway API key |
   | `SESSION_SECRET` | Yes | Random string, min 32 chars |
   | `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-only) |
   | `BLOB_READ_WRITE_TOKEN` | Yes | Vercel Blob storage token |
   | `VERCEL_OAUTH_CLIENT_ID` | No | Vercel OAuth app client ID |
   | `VERCEL_OAUTH_CLIENT_SECRET` | No | Vercel OAuth app secret |

3. **Run**

   ```bash
   pnpm dev
   ```

## Auth

Sign in with Vercel is optional. Without OAuth configured, the app shows a setup banner and operates in anonymous mode with rate limiting (1 generation/day per IP). With OAuth, authenticated users get unlimited generations.

To set up OAuth, create an app at [vercel.com/account/oauth-apps](https://vercel.com/account/oauth-apps) and add the client ID and secret to your environment.

## Deploy on Vercel

No es solo “mandar a Vercel y poner variables”. Necesitas **configurar los servicios** y luego **crear las tablas en Supabase**. Pasos:

### 1. Conectar el repo e instalar

- [Deploy with Vercel](https://vercel.com/new/clone?repository-url=https://github.com/vercel/v0-nanobanana-template) (o conecta tu fork).
- Vercel detecta Next.js y hace el build; no hace falta `vercel.json`.

### 2. Variables de entorno en Vercel

En el proyecto de Vercel: **Settings → Environment Variables**. Añade:

| Variable | Dónde obtenerla |
|----------|------------------|
| `AI_GATEWAY_API_KEY` | [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) |
| `SESSION_SECRET` | Genera una cadena aleatoria de al menos 32 caracteres |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (no la expongas en el cliente) |
| `BLOB_READ_WRITE_TOKEN` | Vercel → Storage → Blob → crear store y copiar token |
| `VERCEL_OAUTH_CLIENT_ID` / `VERCEL_OAUTH_CLIENT_SECRET` | Opcional: [OAuth Apps](https://vercel.com/account/oauth-apps) |

Sin estas variables la app arranca pero muestra el banner de “Setup required” y la generación de imágenes no funcionará hasta que estén todas (salvo OAuth, que es opcional).

### 3. Base de datos en Supabase

La app usa **Supabase** (no solo una URL de Postgres). Necesitas:

1. Crear un proyecto en [Supabase](https://supabase.com).
2. En **SQL Editor** ejecutar el SQL del repo (`supabase-schema.sql`) o el siguiente:

```sql
-- Usuarios (para Sign in with Vercel)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Uso / historial de generaciones
create table if not exists public.usage (
  id uuid primary key default gen_random_uuid(),
  user_email text,
  credit_cost text not null,
  tokens integer not null,
  action text not null,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Límite de solicitudes por IP/día (modo anónimo)
create table if not exists public.rate_limits (
  id uuid primary key default gen_random_uuid(),
  ip text not null,
  date text not null,
  count integer not null default 0,
  reset_time timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(ip, date)
);
```

3. En **Settings → API** copiar URL, `anon` key y `service_role` key a las variables de Vercel.

### 4. Redeploy

Después de guardar las variables en Vercel, haz un **Redeploy** (Deployments → ⋮ → Redeploy) para que el build use las nuevas env.

Resumen: **Sí puedes “mandar a Vercel y poner variables”**, pero además debes **crear el proyecto en Supabase, ejecutar el SQL de las tablas y configurar AI Gateway y Blob**. Con eso la app queda lista.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vercel/v0-nanobanana-template)
