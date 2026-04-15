import { createServerFn } from '@tanstack/react-start';

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
            .select('architect_id, amount, architects ( name, photo_url )')
            .gte('entry_date', startOfYear)
            .lte('entry_date', endOfYear);

        if (error) throw new Error(error.message);

        const totals = new Map<
            string,
            { name: string; photo_url: string | null; total: number }
        >();

        for (const entry of data) {
            const current = totals.get(entry.architect_id);
            const arch = entry.architects as {
                name: string;
                photo_url: string | null;
            };
            if (current) {
                current.total += entry.amount;
            } else {
                totals.set(entry.architect_id, {
                    name: arch.name,
                    photo_url: arch.photo_url,
                    total: entry.amount
                });
            }
        }

        const ranking = Array.from(totals.entries())
            .sort((a, b) => b[1].total - a[1].total)
            .slice(0, 10)
            .map(([architect_id, info], i) => ({
                position: i + 1,
                architect_id,
                name: info.name,
                photo_url: info.photo_url,
                total_points: info.total
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
                'id, name, email, photo_url, cau_register, point_entries ( amount )'
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
                    (sum: number, e: { amount: number }) => sum + e.amount,
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
            .select('id, point_type, amount, entry_date, created_at')
            .eq('architect_id', architect!.id)
            .order('entry_date', { ascending: false });

        if (error) throw new Error(error.message);
        return entries;
    }
);
