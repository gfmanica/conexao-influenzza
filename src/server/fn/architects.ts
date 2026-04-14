import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod/v4';

import { getSupabaseAdminClient } from '@/lib/supabase/server';
import {
    createArchitectSchema,
    updateArchitectSchema
} from '@/lib/schemas/architect';

/**
 * Lista todos os arquitetos com total de pontos e status de vínculo.
 */
export const listArchitects = createServerFn({ method: 'GET' }).handler(
    async () => {
        const supabase = getSupabaseAdminClient();

        const { data, error } = await supabase
            .from('architects')
            .select('*, point_entries ( amount )')
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
    .inputValidator(z.object({ id: z.string().uuid() }))
    .handler(async ({ data }) => {
        const supabase = getSupabaseAdminClient();

        const { data: architect, error } = await supabase
            .from('architects')
            .select(
                '*, point_entries ( id, point_type, amount, entry_date, created_at, updated_at )'
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
 * Cadastra novo arquiteto. Cria apenas o registro profissional, sem criar usuário.
 */
export const createArchitect = createServerFn({ method: 'POST' })
    .inputValidator(createArchitectSchema)
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
    .inputValidator(updateArchitectSchema)
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
