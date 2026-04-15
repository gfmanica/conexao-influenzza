import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod/v4';

import { createPointEntrySchema, updatePointEntrySchema } from '@/lib/schemas/point-entry';
import { queryParamsSchema } from '@/lib/schemas/query';
import {
    applyFilters,
    applyOrder,
    buildPagedResponse,
    getPaginationRange
} from '@/lib/supabase/query-helpers';
import { getSupabaseAdminClient } from '@/lib/supabase/server';

/**
 * Lista lançamentos de pontos com paginação, filtros dinâmicos e ordenação.
 */
export const listPointEntries = createServerFn({ method: 'GET' })
    .inputValidator(queryParamsSchema)
    .handler(async ({ data }) => {
        const supabase = getSupabaseAdminClient();
        const { from, to } = getPaginationRange(data?.page, data?.pageSize);

        let query = supabase
            .from('point_entries')
            .select('*, architects ( id, name, photo_url )', { count: 'exact' })
            .range(from, to);

        query = applyFilters(query, data?.filter);
        query = applyOrder(query, data?.order);

        const { data: rows, count, error } = await query;

        if (error) throw new Error(error.message);

        return buildPagedResponse(rows, count, to);
    });

/**
 * Cria um novo lançamento de pontos.
 */
export const createPointEntry = createServerFn({ method: 'POST' })
    .inputValidator(createPointEntrySchema)
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

/**
 * Atualiza um lançamento de pontos.
 */
export const updatePointEntry = createServerFn({ method: 'POST' })
    .inputValidator(updatePointEntrySchema)
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

/**
 * Deleta um lançamento de pontos.
 */
export const deletePointEntry = createServerFn({ method: 'POST' })
    .inputValidator(z.object({ id: z.string().uuid() }))
    .handler(async ({ data }) => {
        const supabase = getSupabaseAdminClient();

        const { error } = await supabase.from('point_entries').delete().eq('id', data.id);

        if (error) throw new Error(error.message);

        return { success: true };
    });
