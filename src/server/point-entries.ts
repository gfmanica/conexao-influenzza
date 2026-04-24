import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { count, eq } from 'drizzle-orm';
import { z } from 'zod/v4';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import {
    buildOrderByClause,
    buildPagedResponse,
    buildWhereConditions,
    getPaginationRange
} from '@/lib/db/builders';
import { pointEntries, user } from '@/lib/db/schema';
import { queryParamsSchema } from '@/types/builders';
import { createPointEntrySchema, updatePointEntrySchema } from '@/types/point-entry';

const pointEntryColumns = {
    id: pointEntries.id,
    userId: pointEntries.userId,
    point_type: pointEntries.pointType,
    amount: pointEntries.amount,
    entry_date: pointEntries.entryDate,
    created_by: pointEntries.createdBy,
    created_at: pointEntries.createdAt,
    updated_at: pointEntries.updatedAt
};

/**
 * Faz um findAll dos lançamentos de pontos.
 */
export const listPointEntries = createServerFn({ method: 'GET' })
    .inputValidator(queryParamsSchema)
    .handler(async ({ data }) => {
        const { offset, limit } = getPaginationRange(data?.page, data?.pageSize);
        const where = buildWhereConditions(data?.filter, pointEntryColumns);
        const orderBy = buildOrderByClause(data?.order ?? [], pointEntryColumns);

        const [{ total }] = await db.select({ total: count() }).from(pointEntries).where(where);

        const rows = await db
            .select({
                ...pointEntryColumns,
                architects: {
                    id: user.id,
                    name: user.name,
                    photo_url: user.photoUrl
                }
            })
            .from(pointEntries)
            .leftJoin(user, eq(pointEntries.userId, user.id))
            .where(where)
            .orderBy(...(orderBy.length ? orderBy : [pointEntries.entryDate]))
            .limit(limit)
            .offset(offset);

        return buildPagedResponse(rows, total, offset, limit);
    });

/**
 * Faz um insert de um novo lançamento de pontos.
 */
export const createPointEntry = createServerFn({ method: 'POST' })
    .inputValidator(createPointEntrySchema)
    .handler(async ({ data }) => {
        const session = await auth.api.getSession({ headers: getRequest().headers });

        if (!session) throw new Error('Não autenticado.');

        const [entry] = await db
            .insert(pointEntries)
            .values({
                id: crypto.randomUUID(),
                userId: data.user_id,
                pointType: data.point_type,
                amount: data.amount,
                entryDate: new Date(data.entry_date),
                createdBy: session.user.id
            })
            .returning(pointEntryColumns);

        return entry;
    });

/**
 * Faz um update de um lançamento de pontos.
 */
export const updatePointEntry = createServerFn({ method: 'POST' })
    .inputValidator(updatePointEntrySchema)
    .handler(async ({ data }) => {
        const [entry] = await db
            .update(pointEntries)
            .set({
                userId: data.user_id,
                pointType: data.point_type,
                amount: data.amount,
                entryDate: new Date(data.entry_date)
            })
            .where(eq(pointEntries.id, data.id))
            .returning(pointEntryColumns);

        if (!entry) throw new Error('Lançamento não encontrado.');

        return entry;
    });

/**
 * Faz um delete de um lançamento de pontos.
 */
export const deletePointEntry = createServerFn({ method: 'POST' })
    .inputValidator(z.object({ id: z.uuid() }))
    .handler(async ({ data }) => {
        await db.delete(pointEntries).where(eq(pointEntries.id, data.id));

        return { success: true };
    });
