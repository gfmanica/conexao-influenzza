import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod/v4';

import { getSupabaseAdminClient } from '@/lib/supabase/server';
import {
    createPointEntrySchema,
    updatePointEntrySchema
} from '@/lib/schemas/point-entry';

export const listPointEntries = createServerFn({ method: 'GET' })
    .inputValidator(
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
            .select('*, architects ( id, name, photo_url )')
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

export const deletePointEntry = createServerFn({ method: 'POST' })
    .inputValidator(z.object({ id: z.string().uuid() }))
    .handler(async ({ data }) => {
        const supabase = getSupabaseAdminClient();

        const { error } = await supabase
            .from('point_entries')
            .delete()
            .eq('id', data.id);

        if (error) throw new Error(error.message);
        return { success: true };
    });
