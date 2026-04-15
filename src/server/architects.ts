import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod/v4';

import { createArchitectSchema, updateArchitectSchema } from '@/lib/schemas/architect';
import { queryParamsSchema } from '@/lib/schemas/query';
import {
    applyFilters,
    applyOrder,
    buildPagedResponse,
    getPaginationRange
} from '@/lib/supabase/query-helpers';
import { getSupabaseAdminClient } from '@/lib/supabase/server';

/**
 * Lista arquitetos com paginação, filtros dinâmicos e ordenação.
 */
export const listArchitects = createServerFn({ method: 'GET' })
    .inputValidator(queryParamsSchema)
    .handler(async ({ data }) => {
        const supabase = getSupabaseAdminClient();
        const { from, to } = getPaginationRange(data?.page, data?.pageSize);

        let query = supabase
            .from('architects')
            .select('*, point_entries ( amount )', { count: 'exact' })
            .range(from, to);

        query = applyFilters(query, data?.filter);
        query = applyOrder(query, data?.order);

        const { data: rows, count, error } = await query;

        if (error) throw new Error(error.message);

        return buildPagedResponse(
            rows.map((a) => ({
                ...a,
                linked: a.user_id !== null,
                total_points:
                    a.point_entries?.reduce(
                        (sum: number, e: { amount: number }) => sum + e.amount,
                        0
                    ) ?? 0,
                point_entries: undefined
            })),
            count,
            to
        );
    });

/**
 * Retorna dados completos de um arquiteto + histórico de pontuações.
 */
export const getArchitect = createServerFn({ method: 'GET' })
    .inputValidator(z.object({ id: z.uuid() }))
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
                    (sum: number, e: { amount: number }) => sum + e.amount,
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { photo: _photo, ...insertData } = data;

        const { data: architect, error } = await supabase
            .from('architects')
            .insert(insertData)
            .select()
            .single();

        if (error) {
            if (error.code === '23505') throw new Error('E-mail já cadastrado.');

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
        const { id, photo: _photo, ...updates } = data;
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
