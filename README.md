# Conexão Influenzza

Plataforma de fidelização para arquitetos parceiros. Stack: TanStack Start, React, TypeScript, Supabase, shadcn/ui.

## Desenvolvimento

```bash
npm install
npm run dev
```

## Variáveis de ambiente

Crie `.env.development` na raiz (veja `.env.example`):

```env
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_KEY=<anon-key>
VITE_SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

As keys estão em **Supabase Dashboard → Settings → API**.  
A `service_role` exige clicar em **"Reveal"** para aparecer.

---

## Supabase CLI — Setup do banco

### 1. Instalar a CLI

```bash
brew install supabase/tap/supabase
```

### 2. Login

```bash
supabase login
```

### 3. Inicializar o projeto (uma vez só)

```bash
supabase init
```

### 4. Linkar ao projeto remoto

```bash
supabase link --project-ref <project-id>
```

O `project-id` está na URL do dashboard: `supabase.com/dashboard/project/<project-id>`.  
Vai pedir a **database password** definida ao criar o projeto.

### 5. Rodar as migrations

```bash
supabase db push
```

Executa todos os arquivos de `supabase/migrations/` no banco remoto.

### 6. Rodar o seed (apenas dev)

```bash
supabase db query --linked -f supabase/seed.sql
```

Ou via **SQL Editor** no dashboard.

### 7. Gerar tipos TypeScript do banco

Após as migrations, substituir o arquivo de tipos manual pelo gerado:

```bash
supabase gen types --linked > src/lib/supabase/types.ts
```

### Produção

Para rodar em produção sem trocar o link:

```bash
supabase db push --project-ref <project-id-prod>
```

### Resumo da ordem

```
1. brew install supabase/tap/supabase
2. supabase login
3. supabase init
4. supabase link --project-ref <project-id>
5. supabase db push
6. supabase db query --linked -f supabase/seed.sql         # apenas dev
7. supabase gen types --linked > src/lib/supabase/types.ts
8. Copiar as keys do Dashboard → .env.development
```

---

## shadcn/ui

Adicionar componentes:

```bash
npx shadcn@latest add button
```

Importar:

```tsx
import { Button } from '@/components/ui/button';
```
