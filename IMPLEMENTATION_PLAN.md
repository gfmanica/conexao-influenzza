# Plano de Implementação — Supabase + TanStack Start Server Functions

## Visão Geral

Este documento descreve o plano para integrar o Supabase como backend (Auth + PostgreSQL + Storage) ao projeto Conexão Influenzza, substituindo os dados mock atuais por dados reais. O plano cobre:

1. Configuração do banco de dados no Supabase (teste e produção)
2. Integração da SDK do Supabase no projeto
3. Server Functions do TanStack Start para acesso aos dados
4. TanStack Query para gerenciamento de estado e cache no cliente

---

## Fase 1 — Configuração de Ambientes no Supabase

### 1.1 Criar dois projetos no Supabase Dashboard

| Ambiente     | Projeto Supabase         | Finalidade                                  |
| :----------- | :----------------------- | :------------------------------------------ |
| **Teste**    | `conexao-influenzza-dev` | Desenvolvimento local, dados de teste, seed |
| **Produção** | `conexao-influenzza`     | Dados reais, RLS ativo, backups habilitados |

### 1.2 Variáveis de ambiente

Criar dois arquivos na raiz do projeto:

**`.env.development`** — usado com `vite dev`

```env
VITE_SUPABASE_URL=https://<projeto-dev>.supabase.co
VITE_SUPABASE_KEY=<anon-key-dev>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key-dev>
```

**`.env.production`** — usado com `vite build`

```env
VITE_SUPABASE_URL=https://<projeto-prod>.supabase.co
VITE_SUPABASE_KEY=<anon-key-prod>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key-prod>
```

> **Importante:** `SUPABASE_SERVICE_ROLE_KEY` **NÃO** tem prefixo `VITE_` — só é acessível no servidor (server functions). Adicionar ambos os arquivos ao `.gitignore`.

### 1.3 Adicionar `.env*` ao `.gitignore`

```gitignore
.env*
!.env.example
```

Criar um `.env.example` com as variáveis sem valores para referência.

---

## Fase 2 — Schema do Banco de Dados

### 2.1 Migration SQL

Criar o arquivo `supabase/migrations/001_initial_schema.sql` (para uso com Supabase CLI ou execução manual no SQL Editor):

```sql
-- Enum
CREATE TYPE user_role AS ENUM ('admin', 'architect');

-- user_profiles
CREATE TABLE user_profiles (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id  uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role          user_role NOT NULL,
    created_at    timestamptz NOT NULL DEFAULT now()
);

-- architects
CREATE TABLE architects (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid REFERENCES user_profiles(id),
    name            text NOT NULL,
    email           text NOT NULL UNIQUE,
    office_email    text,
    phone           text,
    office_address  text,
    birthdate       date,
    cau_register    text,
    observation     text,
    photo_url       text,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

-- point_entries
CREATE TABLE point_entries (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    architect_id    uuid NOT NULL REFERENCES architects(id) ON DELETE CASCADE,
    point_type      text NOT NULL,
    amount          integer NOT NULL CHECK (amount > 0),
    entry_date      date NOT NULL DEFAULT CURRENT_DATE,
    created_by      uuid REFERENCES auth.users(id),
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_point_entries_architect ON point_entries(architect_id);
CREATE INDEX idx_point_entries_date ON point_entries(entry_date DESC);
CREATE INDEX idx_point_entries_type ON point_entries(point_type);
CREATE INDEX idx_architects_email ON architects(email);
```

### 2.2 Funções auxiliares (Security Definer)

```sql
-- is_admin(): verifica se o usuário logado é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_profiles
        WHERE auth_user_id = auth.uid() AND role = 'admin'
    );
$$;

-- my_architect_id(): retorna o ID do arquiteto do usuário logado
CREATE OR REPLACE FUNCTION my_architect_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT a.id FROM architects a
    JOIN user_profiles up ON up.id = a.user_id
    WHERE up.auth_user_id = auth.uid();
$$;
```

### 2.3 Row Level Security (RLS)

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE architects ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_entries ENABLE ROW LEVEL SECURITY;

-- user_profiles
CREATE POLICY "users_select_own_or_admin" ON user_profiles
    FOR SELECT USING (auth_user_id = auth.uid() OR is_admin());

CREATE POLICY "admins_insert" ON user_profiles
    FOR INSERT WITH CHECK (is_admin());

-- architects
CREATE POLICY "architects_select" ON architects
    FOR SELECT USING (is_admin() OR id = my_architect_id());

CREATE POLICY "architects_insert" ON architects
    FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "architects_update" ON architects
    FOR UPDATE USING (is_admin());

CREATE POLICY "architects_delete" ON architects
    FOR DELETE USING (is_admin());

-- point_entries
CREATE POLICY "point_entries_select" ON point_entries
    FOR SELECT USING (
        is_admin() OR architect_id = my_architect_id()
    );

CREATE POLICY "point_entries_insert" ON point_entries
    FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "point_entries_update" ON point_entries
    FOR UPDATE USING (is_admin());

CREATE POLICY "point_entries_delete" ON point_entries
    FOR DELETE USING (is_admin());
```

### 2.4 Trigger de `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_architects_updated_at
    BEFORE UPDATE ON architects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_point_entries_updated_at
    BEFORE UPDATE ON point_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 2.5 Storage Bucket

```sql
-- Criar bucket para fotos de perfil (via Dashboard ou SQL)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Policy: admin pode fazer upload
CREATE POLICY "admins_upload_avatars" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND is_admin()
    );

-- Policy: qualquer um pode ler (bucket público)
CREATE POLICY "public_read_avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');
```

### 2.6 Seed de teste (apenas ambiente dev)

Criar `supabase/seed.sql` com dados iniciais para desenvolvimento:

```sql
-- Arquitetos de teste
INSERT INTO architects (name, email, phone, office_address, birthdate, cau_register) VALUES
    ('Ana Carolina Mendes', 'ana.mendes@escritorio.com', '(11) 99999-0001',
     'Rua das Flores, 123, São Paulo - SP', '1985-03-15', 'A123456-0'),
    ('Roberto Figueiredo', 'roberto.f@arq.com.br', '(21) 98888-0002',
     'Av. Atlântica, 500, Rio de Janeiro - RJ', '1978-07-22', 'B654321-9'),
    ('Marcos Vinicius Alves', 'marcos.alves@malves.arq.br', '(31) 97777-0004',
     'Rua Sergipe, 890, Belo Horizonte - MG', '1980-04-18', 'C112233-1');
```

---

## Fase 3 — Integração da SDK do Supabase

### 3.1 Instalar dependências

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 3.2 Estrutura de arquivos

```
src/
├── lib/
│   └── supabase/
│       ├── client.ts       # Cliente para o browser (anon key)
│       ├── server.ts       # Cliente para server functions (service role)
│       └── types.ts        # Tipos gerados do banco (Database)
```

### 3.3 `src/lib/supabase/client.ts` — Cliente browser

```ts
import { createBrowserClient } from '@supabase/ssr';

import type { Database } from './types';

export function getSupabaseBrowserClient() {
    return createBrowserClient<Database>(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_KEY
    );
}
```

### 3.4 `src/lib/supabase/server.ts` — Cliente servidor

Usado exclusivamente nas server functions do TanStack Start. Utiliza a `service_role` key para bypass do RLS quando necessário, ou a anon key com o token do usuário para respeitar RLS.

```ts
import { createServerClient } from '@supabase/ssr';
import { getCookie, setCookie } from '@tanstack/react-start/server';

import type { Database } from './types';

/**
 * Cliente autenticado — respeita RLS com o JWT do usuário.
 * Usado nas server functions que precisam respeitar permissões.
 */
export function getSupabaseServerClient() {
    return createServerClient<Database>(
        process.env.VITE_SUPABASE_URL!,
        process.env.VITE_SUPABASE_KEY!,
        {
            cookies: {
                getAll: () => {
                    // Adaptar para ler cookies do request via TanStack Start
                    return getCookie() ?? [];
                },
                setAll: (cookies) => {
                    cookies.forEach(({ name, value, options }) => {
                        setCookie(name, value, options);
                    });
                }
            }
        }
    );
}

/**
 * Cliente admin — bypass de RLS via service_role.
 * Usar apenas para operações que exigem acesso total (ex: vincular user_profile).
 */
export function getSupabaseAdminClient() {
    return createServerClient<Database>(
        process.env.VITE_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                getAll: () => [],
                setAll: () => {}
            }
        }
    );
}
```

### 3.5 `src/lib/supabase/types.ts` — Tipos do banco

Gerar com Supabase CLI:

```bash
npx supabase gen types typescript --project-id <project-id> > src/lib/supabase/types.ts
```

Ou manter manualmente até integrar a CLI:

```ts
export type Database = {
    public: {
        Tables: {
            user_profiles: {
                Row: {
                    id: string;
                    auth_user_id: string;
                    role: 'admin' | 'architect';
                    created_at: string;
                };
                Insert: {
                    auth_user_id: string;
                    role: 'admin' | 'architect';
                };
                Update: Partial<{
                    role: 'admin' | 'architect';
                }>;
            };
            architects: {
                Row: {
                    id: string;
                    user_id: string | null;
                    name: string;
                    email: string;
                    office_email: string | null;
                    phone: string | null;
                    office_address: string | null;
                    birthdate: string | null;
                    cau_register: string | null;
                    observation: string | null;
                    photo_url: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    name: string;
                    email: string;
                    office_email?: string | null;
                    phone?: string | null;
                    office_address?: string | null;
                    birthdate?: string | null;
                    cau_register?: string | null;
                    observation?: string | null;
                    photo_url?: string | null;
                };
                Update: Partial<
                    Omit<
                        Database['public']['Tables']['architects']['Row'],
                        'id' | 'created_at'
                    >
                >;
            };
            /* point_types removida — tipo armazenado como string em point_entries.point_type */
            point_entries: {
                Row: {
                    id: string;
                    architect_id: string;
                    point_type: string;
                    amount: number;
                    entry_date: string;
                    created_by: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    architect_id: string;
                    point_type: string;
                    amount: number;
                    entry_date?: string;
                };
                Update: Partial<
                    Omit<
                        Database['public']['Tables']['point_entries']['Row'],
                        'id' | 'created_at'
                    >
                >;
            };
        };
    };
};
```

---

## Fase 4 — Server Functions (TanStack Start)

As server functions rodam no servidor via Nitro (já configurado no projeto). Cada server function é acessível ao cliente como uma chamada RPC transparente.

### 4.1 Estrutura de arquivos

```
src/
├── server/
│   ├── fn/
│   │   ├── auth.ts           # OTP, verify, logout
│   │   ├── architects.ts     # CRUD de arquitetos
│   │   ├── point-entries.ts  # CRUD de lançamentos
│   │   └── ranking.ts        # Ranking + dashboard
```

### 4.2 Server Functions — Autenticação

**`src/server/fn/auth.ts`**

```ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

import {
    getSupabaseAdminClient,
    getSupabaseServerClient
} from '@/lib/supabase/server';

/**
 * Solicita envio de OTP para o e-mail informado.
 * Valida se o e-mail existe como architect ou admin antes de enviar.
 */
export const requestOtp = createServerFn({ method: 'POST' })
    .validator(z.object({ email: z.string().email() }))
    .handler(async ({ data }) => {
        const supabase = getSupabaseAdminClient();

        // Verificar se é architect
        const { data: architect } = await supabase
            .from('architects')
            .select('id')
            .eq('email', data.email)
            .maybeSingle();

        // Verificar se é admin (via user_profiles + auth.users)
        if (!architect) {
            const { data: authUsers } = await supabase.auth.admin.listUsers();
            const authUser = authUsers?.users.find(
                (u) => u.email === data.email
            );
            if (!authUser) {
                throw new Error('E-mail não cadastrado no sistema.');
            }
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('role')
                .eq('auth_user_id', authUser.id)
                .eq('role', 'admin')
                .maybeSingle();
            if (!profile) {
                throw new Error('E-mail não cadastrado no sistema.');
            }
        }

        // Enviar OTP
        const { error } = await supabase.auth.signInWithOtp({
            email: data.email
        });
        if (error) throw new Error(error.message);

        return { message: 'OTP enviado com sucesso' };
    });

/**
 * Verifica o código OTP e retorna JWT + role.
 * No primeiro login do arquiteto, cria user_profile e vincula.
 */
export const verifyOtp = createServerFn({ method: 'POST' })
    .validator(
        z.object({ email: z.string().email(), token: z.string().length(6) })
    )
    .handler(async ({ data }) => {
        const supabase = getSupabaseServerClient();
        const admin = getSupabaseAdminClient();

        const { data: session, error } = await supabase.auth.verifyOtp({
            email: data.email,
            token: data.token,
            type: 'email'
        });

        if (error || !session.user) throw new Error('Código OTP inválido.');

        const authUserId = session.user.id;

        // Verificar se já existe user_profile
        const { data: profile } = await admin
            .from('user_profiles')
            .select('id, role')
            .eq('auth_user_id', authUserId)
            .maybeSingle();

        if (profile) {
            // Usuário já vinculado
            const architectId =
                profile.role === 'architect'
                    ? (
                          await admin
                              .from('architects')
                              .select('id')
                              .eq('user_id', profile.id)
                              .single()
                      ).data?.id
                    : undefined;

            return {
                access_token: session.session!.access_token,
                refresh_token: session.session!.refresh_token,
                role: profile.role,
                architect_id: architectId
            };
        }

        // Primeiro login — verificar se é arquiteto
        const { data: architect } = await admin
            .from('architects')
            .select('id')
            .eq('email', data.email)
            .maybeSingle();

        if (architect) {
            // Criar user_profile e vincular
            const { data: newProfile } = await admin
                .from('user_profiles')
                .insert({ auth_user_id: authUserId, role: 'architect' })
                .select('id')
                .single();

            await admin
                .from('architects')
                .update({ user_id: newProfile!.id })
                .eq('id', architect.id);

            return {
                access_token: session.session!.access_token,
                refresh_token: session.session!.refresh_token,
                role: 'architect' as const,
                architect_id: architect.id
            };
        }

        throw new Error('E-mail não cadastrado no sistema.');
    });

/**
 * Encerra a sessão do usuário.
 */
export const logout = createServerFn({ method: 'POST' }).handler(async () => {
    const supabase = getSupabaseServerClient();
    await supabase.auth.signOut();
    return { success: true };
});
```

### 4.3 Server Functions — Arquitetos

**`src/server/fn/architects.ts`**

```ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

import { getSupabaseAdminClient } from '@/lib/supabase/server';

/**
 * Lista todos os arquitetos com total de pontos e status de vínculo.
 */
export const listArchitects = createServerFn({ method: 'GET' }).handler(
    async () => {
        const supabase = getSupabaseAdminClient();

        const { data, error } = await supabase
            .from('architects')
            .select(
                `
                *,
                point_entries ( amount )
            `
            )
            .order('name');

        if (error) throw new Error(error.message);

        return data.map((a) => ({
            ...a,
            linked: a.user_id !== null,
            total_points:
                a.point_entries?.reduce((sum, e) => sum + e.amount, 0) ?? 0,
            point_entries: undefined
        }));
    }
);

/**
 * Retorna dados completos de um arquiteto + histórico de pontuações.
 */
export const getArchitect = createServerFn({ method: 'GET' })
    .validator(z.object({ id: z.string().uuid() }))
    .handler(async ({ data }) => {
        const supabase = getSupabaseAdminClient();

        const { data: architect, error } = await supabase
            .from('architects')
            .select(
                `
                *,
                point_entries (
                    id, point_type, amount, entry_date, created_at, updated_at
                )
            `
            )
            .eq('id', data.id)
            .single();

        if (error) throw new Error(error.message);

        return {
            ...architect,
            linked: architect.user_id !== null,
            total_points:
                architect.point_entries?.reduce(
                    (sum, e) => sum + e.amount,
                    0
                ) ?? 0
        };
    });

/**
 * Cadastra novo arquiteto. Recebe dados profissionais; NÃO cria usuário.
 */
export const createArchitect = createServerFn({ method: 'POST' })
    .validator(
        z.object({
            name: z.string().min(1),
            email: z.string().email(),
            office_email: z.string().email().optional(),
            phone: z.string().optional(),
            office_address: z.string().optional(),
            birthdate: z.string().optional(),
            cau_register: z.string().optional(),
            observation: z.string().optional()
        })
    )
    .handler(async ({ data }) => {
        const supabase = getSupabaseAdminClient();

        const { data: architect, error } = await supabase
            .from('architects')
            .insert(data)
            .select()
            .single();

        if (error) {
            if (error.code === '23505')
                throw new Error('E-mail já cadastrado.');
            throw new Error(error.message);
        }

        return { ...architect, linked: false, total_points: 0 };
    });

/**
 * Atualiza dados do arquiteto.
 */
export const updateArchitect = createServerFn({ method: 'POST' })
    .validator(
        z.object({
            id: z.string().uuid(),
            name: z.string().min(1).optional(),
            email: z.string().email().optional(),
            office_email: z.string().email().nullable().optional(),
            phone: z.string().nullable().optional(),
            office_address: z.string().nullable().optional(),
            birthdate: z.string().nullable().optional(),
            cau_register: z.string().nullable().optional(),
            observation: z.string().nullable().optional(),
            photo_url: z.string().nullable().optional()
        })
    )
    .handler(async ({ data }) => {
        const { id, ...updates } = data;
        const supabase = getSupabaseAdminClient();

        const { data: architect, error } = await supabase
            .from('architects')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return architect;
    });
```

### 4.4 Server Functions — Lançamentos de Pontos

**`src/server/fn/point-entries.ts`**

```ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

import { getSupabaseAdminClient } from '@/lib/supabase/server';

export const listPointEntries = createServerFn({ method: 'GET' })
    .validator(
        z
            .object({
                architect_id: z.string().uuid().optional(),
                from: z.string().optional(),
                to: z.string().optional()
            })
            .optional()
    )
    .handler(async ({ data }) => {
        const supabase = getSupabaseAdminClient();

        let query = supabase
            .from('point_entries')
            .select(
                `
                *,
                architects ( id, name, photo_url )
            `
            )
            .order('entry_date', { ascending: false });

        if (data?.architect_id)
            query = query.eq('architect_id', data.architect_id);
        if (data?.from) query = query.gte('entry_date', data.from);
        if (data?.to) query = query.lte('entry_date', data.to);

        const { data: entries, error } = await query;
        if (error) throw new Error(error.message);
        return entries;
    });

export const createPointEntry = createServerFn({ method: 'POST' })
    .validator(
        z.object({
            architect_id: z.string().uuid(),
            point_type: z.string().min(1),
            amount: z.number().int().positive(),
            entry_date: z.string()
        })
    )
    .handler(async ({ data }) => {
        const supabase = getSupabaseAdminClient();

        const { data: entry, error } = await supabase
            .from('point_entries')
            .insert(data)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return entry;
    });

export const updatePointEntry = createServerFn({ method: 'POST' })
    .validator(
        z.object({
            id: z.string().uuid(),
            architect_id: z.string().uuid().optional(),
            point_type: z.string().min(1).optional(),
            amount: z.number().int().positive().optional(),
            entry_date: z.string().optional()
        })
    )
    .handler(async ({ data }) => {
        const { id, ...updates } = data;
        const supabase = getSupabaseAdminClient();

        const { data: entry, error } = await supabase
            .from('point_entries')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return entry;
    });

export const deletePointEntry = createServerFn({ method: 'POST' })
    .validator(z.object({ id: z.string().uuid() }))
    .handler(async ({ data }) => {
        const supabase = getSupabaseAdminClient();
        const { error } = await supabase
            .from('point_entries')
            .delete()
            .eq('id', data.id);

        if (error) throw new Error(error.message);
        return { success: true };
    });
```

### 4.6 Server Functions — Ranking e Portal do Arquiteto

**`src/server/fn/ranking.ts`**

```ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

import {
    getSupabaseAdminClient,
    getSupabaseServerClient
} from '@/lib/supabase/server';

/**
 * Top 10 arquitetos por pontuação no ano vigente.
 */
export const getRanking = createServerFn({ method: 'GET' }).handler(
    async () => {
        const supabase = getSupabaseAdminClient();
        const year = new Date().getFullYear();
        const startOfYear = `${year}-01-01`;
        const endOfYear = `${year}-12-31`;

        const { data, error } = await supabase
            .from('point_entries')
            .select(
                `
                architect_id,
                amount,
                architects ( name, photo_url )
            `
            )
            .gte('entry_date', startOfYear)
            .lte('entry_date', endOfYear);

        if (error) throw new Error(error.message);

        // Agregar por arquiteto
        const totals = new Map<
            string,
            { name: string; photo_url: string | null; total: number }
        >();
        for (const entry of data) {
            const current = totals.get(entry.architect_id);
            if (current) {
                current.total += entry.amount;
            } else {
                totals.set(entry.architect_id, {
                    name: (entry.architects as any).name,
                    photo_url: (entry.architects as any).photo_url,
                    total: entry.amount
                });
            }
        }

        const ranking = Array.from(totals.entries())
            .sort((a, b) => b[1].total - a[1].total)
            .slice(0, 10)
            .map(([architect_id, data], i) => ({
                position: i + 1,
                architect_id,
                name: data.name,
                photo_url: data.photo_url,
                total_points: data.total
            }));

        return { ranking, year };
    }
);

/**
 * Perfil do arquiteto logado + saldo total de pontos.
 */
export const getMyProfile = createServerFn({ method: 'GET' }).handler(
    async () => {
        const supabase = getSupabaseServerClient();

        const {
            data: { user }
        } = await supabase.auth.getUser();
        if (!user) throw new Error('Não autenticado.');

        const admin = getSupabaseAdminClient();

        const { data: profile } = await admin
            .from('user_profiles')
            .select('id')
            .eq('auth_user_id', user.id)
            .single();

        if (!profile) throw new Error('Perfil não encontrado.');

        const { data: architect } = await admin
            .from('architects')
            .select(
                `
                id, name, email, photo_url, cau_register,
                point_entries ( amount )
            `
            )
            .eq('user_id', profile.id)
            .single();

        if (!architect) throw new Error('Arquiteto não encontrado.');

        return {
            id: architect.id,
            name: architect.name,
            email: architect.email,
            photo_url: architect.photo_url,
            cau_register: architect.cau_register,
            total_points:
                architect.point_entries?.reduce(
                    (sum, e) => sum + e.amount,
                    0
                ) ?? 0
        };
    }
);

/**
 * Histórico de lançamentos do próprio arquiteto.
 */
export const getMyEntries = createServerFn({ method: 'GET' }).handler(
    async () => {
        const supabase = getSupabaseServerClient();

        const {
            data: { user }
        } = await supabase.auth.getUser();
        if (!user) throw new Error('Não autenticado.');

        const admin = getSupabaseAdminClient();

        const { data: profile } = await admin
            .from('user_profiles')
            .select('id')
            .eq('auth_user_id', user.id)
            .single();

        const { data: architect } = await admin
            .from('architects')
            .select('id')
            .eq('user_id', profile!.id)
            .single();

        const { data: entries, error } = await admin
            .from('point_entries')
            .select(
                `
                id, point_type, amount, entry_date, created_at
            `
            )
            .eq('architect_id', architect!.id)
            .order('entry_date', { ascending: false });

        if (error) throw new Error(error.message);
        return entries;
    }
);
```

---

## Fase 5 — TanStack Query (Hooks do Cliente)

### 5.1 Instalar dependência

```bash
npm install @tanstack/react-query
```

> **Nota:** O projeto já possui `@tanstack/react-router-ssr-query` que integra React Query com SSR do TanStack Start.

### 5.2 Configurar QueryClient no router

**Atualizar `src/router.tsx`**

```ts
import { QueryClient } from '@tanstack/react-query';
import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { routerWithQueryClient } from '@tanstack/react-router-ssr-query';

import { routeTree } from './routeTree.gen';

export function getRouter() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60, // 1 minuto
                refetchOnWindowFocus: false
            }
        }
    });

    const router = routerWithQueryClient(
        createTanStackRouter({
            routeTree,
            scrollRestoration: true,
            defaultPreload: 'intent',
            defaultPreloadStaleTime: 0,
            context: { queryClient }
        }),
        queryClient
    );

    return router;
}
```

### 5.3 Estrutura de arquivos dos hooks

```
src/
├── hooks/
│   ├── use-architects.ts
│   ├── use-point-entries.ts
│   ├── use-ranking.ts
│   └── use-auth.ts
```

### 5.4 Query Key Factory

**`src/hooks/query-keys.ts`**

```ts
export const queryKeys = {
    architects: {
        all: ['architects'] as const,
        detail: (id: string) => ['architects', id] as const
    },
    pointEntries: {
        all: ['point-entries'] as const,
        filtered: (filters: Record<string, string | undefined>) =>
            ['point-entries', filters] as const
    },
    ranking: {
        current: ['ranking'] as const
    },
    me: {
        profile: ['me'] as const,
        entries: ['me', 'entries'] as const
    }
} as const;
```

### 5.5 Hook — Arquitetos

**`src/hooks/use-architects.ts`**

```ts
import {
    queryOptions,
    useMutation,
    useQueryClient
} from '@tanstack/react-query';

import {
    createArchitect,
    listArchitects,
    updateArchitect
} from '@/server/fn/architects';

import { queryKeys } from './query-keys';

export const architectsQueryOptions = queryOptions({
    queryKey: queryKeys.architects.all,
    queryFn: () => listArchitects()
});

export function useCreateArchitect() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createArchitect,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.architects.all
            });
        }
    });
}

export function useUpdateArchitect() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateArchitect,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.architects.all
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.architects.detail(variables.data.id)
            });
        }
    });
}
```

### 5.6 Hook — Lançamentos de Pontos

**`src/hooks/use-point-entries.ts`**

```ts
import {
    queryOptions,
    useMutation,
    useQueryClient
} from '@tanstack/react-query';

import {
    createPointEntry,
    deletePointEntry,
    listPointEntries,
    updatePointEntry
} from '@/server/fn/point-entries';

import { queryKeys } from './query-keys';

export function pointEntriesQueryOptions(filters?: {
    architect_id?: string;
    from?: string;
    to?: string;
}) {
    return queryOptions({
        queryKey: queryKeys.pointEntries.filtered(filters ?? {}),
        queryFn: () => listPointEntries({ data: filters })
    });
}

export function useCreatePointEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createPointEntry,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.pointEntries.all
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.architects.all
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.ranking.current
            });
        }
    });
}

export function useUpdatePointEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updatePointEntry,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.pointEntries.all
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.architects.all
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.ranking.current
            });
        }
    });
}

export function useDeletePointEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deletePointEntry,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.pointEntries.all
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.architects.all
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.ranking.current
            });
        }
    });
}
```

### 5.7 Hook — Ranking

**`src/hooks/use-ranking.ts`**

```ts
import { queryOptions } from '@tanstack/react-query';

import { getRanking } from '@/server/fn/ranking';

import { queryKeys } from './query-keys';

export const rankingQueryOptions = queryOptions({
    queryKey: queryKeys.ranking.current,
    queryFn: () => getRanking(),
    staleTime: 1000 * 60 * 5 // 5 minutos
});
```

---

## Fase 6 — Integração nas Rotas (substituir mocks)

### 6.1 Rota `_app.arquitetos.tsx`

```ts
// Remover mockArchitects e usar query
import { useSuspenseQuery } from '@tanstack/react-query';

import { architectsQueryOptions } from '@/hooks/use-architects';

export const Route = createFileRoute('/_app/arquitetos')({
    loader: ({ context }) => {
        context.queryClient.ensureQueryData(architectsQueryOptions);
    },
    component: RouteComponent
});

function RouteComponent() {
    const { data: architects } = useSuspenseQuery(architectsQueryOptions);
    // ... usar architects em vez de mockArchitects
}
```

### 6.2 Rota `_app.pontuacoes.tsx`

```ts
import { useSuspenseQuery } from '@tanstack/react-query';

import { architectsQueryOptions } from '@/hooks/use-architects';
import { pointEntriesQueryOptions } from '@/hooks/use-point-entries';

export const Route = createFileRoute('/_app/pontuacoes')({
    loader: ({ context }) => {
        context.queryClient.ensureQueryData(pointEntriesQueryOptions());
        context.queryClient.ensureQueryData(architectsQueryOptions);
    },
    component: RouteComponent
});

function RouteComponent() {
    const { data: entries } = useSuspenseQuery(pointEntriesQueryOptions());
    const { data: architects } = useSuspenseQuery(architectsQueryOptions);
    // ... usar dados reais
}
```

### 6.3 Rota `_app.dashboard.tsx`

```ts
import { useSuspenseQuery } from '@tanstack/react-query';

import { rankingQueryOptions } from '@/hooks/use-ranking';

export const Route = createFileRoute('/_app/dashboard')({
    loader: ({ context }) => {
        context.queryClient.ensureQueryData(rankingQueryOptions);
    },
    component: RouteComponent
});
```

---

## Fase 7 — Upload de Foto (Supabase Storage)

### 7.1 Server function para upload

**`src/server/fn/storage.ts`**

```ts
import { createServerFn } from '@tanstack/react-start';

import { getSupabaseAdminClient } from '@/lib/supabase/server';

export const uploadAvatar = createServerFn({ method: 'POST' })
    .validator((data: FormData) => data)
    .handler(async ({ data }) => {
        const file = data.get('file') as File;
        const architectId = data.get('architect_id') as string;

        if (!file || !architectId)
            throw new Error('Arquivo e ID do arquiteto são obrigatórios.');

        const supabase = getSupabaseAdminClient();
        const ext = file.name.split('.').pop();
        const path = `${architectId}/avatar.${ext}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(path, file, { upsert: true });

        if (uploadError) throw new Error(uploadError.message);

        const {
            data: { publicUrl }
        } = supabase.storage.from('avatars').getPublicUrl(path);

        // Atualizar photo_url no registro do arquiteto
        await supabase
            .from('architects')
            .update({ photo_url: publicUrl })
            .eq('id', architectId);

        return { photo_url: publicUrl };
    });
```

---

## Fase 8 — Autenticação no Supabase Dashboard

### 8.1 Configurações obrigatórias

1. **Authentication > Providers > Email:**
    - Habilitar "Email OTP"
    - Desabilitar "Confirm email"
    - Desabilitar "Magic Link"

2. **Authentication > Email Templates:**
    - Personalizar template do OTP com a marca Influenzza

3. **Authentication > URL Configuration:**
    - Site URL: `http://localhost:3000` (dev) / URL de produção

4. **Settings > API:**
    - Copiar `anon key` e `service_role key` para os respectivos `.env`

---

## Ordem de Execução

| Etapa | Fase                         | Dependências | Estimativa |
| :---- | :--------------------------- | :----------- | :--------- |
| 1     | Criar projetos no Supabase   | —            | Setup      |
| 2     | Executar migrations (Fase 2) | Etapa 1      | SQL        |
| 3     | Configurar Auth (Fase 8)     | Etapa 1      | Dashboard  |
| 4     | Instalar SDK (Fase 3.1)      | —            | npm        |
| 5     | Criar clientes (Fase 3)      | Etapa 4      | Código     |
| 6     | Server Functions (Fase 4)    | Etapa 5      | Código     |
| 7     | QueryClient + hooks (Fase 5) | Etapa 6      | Código     |
| 8     | Integrar nas rotas (Fase 6)  | Etapa 7      | Código     |
| 9     | Upload de fotos (Fase 7)     | Etapa 5      | Código     |
| 10    | Seed de teste (Fase 2.6)     | Etapa 2      | SQL        |
| 11    | Testes end-to-end            | Etapa 8      | QA         |

---

## Checklist Final

- [ ] Projetos Supabase criados (dev + prod)
- [ ] Variáveis de ambiente configuradas (`.env.development`, `.env.production`)
- [ ] `.env*` no `.gitignore`
- [ ] Migrations executadas em ambos os ambientes
- [ ] RLS habilitado e policies aplicadas
- [ ] Funções `is_admin()` e `my_architect_id()` criadas
- [ ] Storage bucket `avatars` criado
- [ ] SDK Supabase instalada (`@supabase/supabase-js`, `@supabase/ssr`)
- [ ] Clientes browser e servidor configurados
- [ ] Tipos do banco gerados/definidos
- [ ] Server functions implementadas (auth, architects, point-entries, ranking)
- [ ] TanStack Query configurado com SSR
- [ ] Hooks de query/mutation criados
- [ ] Rotas atualizadas para usar dados reais (mocks removidos)
- [ ] Upload de fotos funcionando
- [ ] OTP configurado no Supabase Dashboard (dev + prod)
- [ ] Seed de teste executado no ambiente dev
- [ ] Fluxo completo testado: login OTP → dashboard → CRUD
