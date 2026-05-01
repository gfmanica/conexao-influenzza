import { createServerFn } from '@tanstack/react-start';
import { count, eq } from 'drizzle-orm';
import { z } from 'zod/v4';

import { db } from '@/lib/db';
import {
    buildOrderByClause,
    buildPagedResponse,
    buildWhereConditions,
    getPaginationRange
} from '@/lib/db/builders';
import { pointEntries, user } from '@/lib/db/schema';
import { adminMiddleware } from '@/lib/middleware';
import { createPointEntrySchema, updatePointEntrySchema } from '@/routes/(app)/points/-types';
import { queryParamsSchema } from '@/types/builders';

const pointEntryColumns = {
    id: pointEntries.id,
    userId: pointEntries.userId,
    pointType: pointEntries.pointType,
    amount: pointEntries.amount,
    entryDate: pointEntries.entryDate,
    createdBy: pointEntries.createdBy,
    createdAt: pointEntries.createdAt,
    updatedAt: pointEntries.updatedAt
};

/**
 * Faz um findAll dos lançamentos de pontos.
 */
export const listPointEntries = createServerFn({ method: 'GET' })
    .middleware([adminMiddleware])
    .inputValidator(queryParamsSchema)
    .handler(async ({ data }) => {
        const { offset, limit } = getPaginationRange(data?.page, data?.pageSize);
        const where = buildWhereConditions(data?.filter, pointEntryColumns);
        const orderBy = buildOrderByClause(data?.order ?? [], pointEntryColumns);

        const [{ total }] = await db.select({ total: count() }).from(pointEntries).where(where);

        const rows = await db
            .select({
                ...pointEntryColumns,
                architect: {
                    id: user.id,
                    name: user.name,
                    photoUrl: user.photoUrl
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
    .middleware([adminMiddleware])
    .inputValidator(createPointEntrySchema)
    .handler(async ({ data }) => {
        const [entry] = await db
            .insert(pointEntries)
            .values({
                pointType: data.pointType,
                amount: data.amount,
                entryDate: new Date(data.entryDate)
            })
            .returning(pointEntryColumns);

        return entry;
    });

/**
 * Faz um update de um lançamento de pontos.
 */
export const updatePointEntry = createServerFn({ method: 'POST' })
    .middleware([adminMiddleware])
    .inputValidator(updatePointEntrySchema)
    .handler(async ({ data }) => {
        const [entry] = await db
            .update(pointEntries)
            .set({
                userId: data.architect?.id,
                pointType: data.pointType,
                amount: data.amount,
                entryDate: new Date(data.entryDate)
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
    .middleware([adminMiddleware])
    .inputValidator(z.object({ id: z.uuid() }))
    .handler(async ({ data }) => {
        await db.delete(pointEntries).where(eq(pointEntries.id, data.id));

        return { success: true };
    });
