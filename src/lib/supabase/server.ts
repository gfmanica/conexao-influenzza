import { createServerClient } from '@supabase/ssr';
import { getCookies, setCookie } from '@tanstack/react-start/server';

import type { Database } from './types';

function getAllCookies(): { name: string; value: string }[] {
    return Object.entries(getCookies()).map(([name, value]) => ({
        name,
        value
    }));
}

/**
 * Cliente autenticado — respeita RLS com o JWT do usuário.
 * Usar nas server functions que precisam de permissões por usuário.
 */
export function getSupabaseServerClient() {
    return createServerClient<Database>(
        process.env['VITE_SUPABASE_URL']!,
        process.env['VITE_SUPABASE_KEY']!,
        {
            cookies: {
                getAll: getAllCookies,
                setAll(cookies) {
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
 * Usar apenas nas server functions que exigem acesso total.
 */
export function getSupabaseAdminClient() {
    return createServerClient<Database>(
        process.env['VITE_SUPABASE_URL']!,
        process.env['SUPABASE_SERVICE_ROLE_KEY']!,
        {
            cookies: {
                getAll: () => [],
                setAll: () => {}
            }
        }
    );
}
