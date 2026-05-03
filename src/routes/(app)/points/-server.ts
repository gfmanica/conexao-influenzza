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
import { points, user } from '@/lib/db/schema';
import { adminMiddleware } from '@/lib/middleware';
import { createPointSchema, updatePointSchema } from '@/routes/(app)/points/-types';
import { queryParamsSchema } from '@/types/builders';

const pointColumns = {
    id: points.id,
    userId: points.userId,
    pointType: points.pointType,
    amount: points.amount,
    entryDate: points.entryDate,
    createdBy: points.createdBy,
    createdAt: points.createdAt,
    updatedAt: points.updatedAt
};

/**
 * Faz um findAll dos lançamentos de pontos.
 */
export const listPoints = createServerFn({ method: 'GET' })
    .middleware([adminMiddleware])
    .inputValidator(queryParamsSchema)
    .handler(async ({ data }) => {
        const { offset, limit } = getPaginationRange(data?.page, data?.pageSize);
        const where = buildWhereConditions(data?.filter, pointColumns);
        const orderBy = buildOrderByClause(data?.order ?? [], pointColumns);

        const [{ total }] = await db.select({ total: count() }).from(points).where(where);

        const rows = await db
            .select({
                ...pointColumns,
                architect: {
                    id: user.id,
                    name: user.name,
                    photoUrl: user.photoUrl
                }
            })
            .from(points)
            .leftJoin(user, eq(points.userId, user.id))
            .where(where)
            .orderBy(...(orderBy.length ? orderBy : [points.entryDate]))
            .limit(limit)
            .offset(offset);

        return buildPagedResponse(rows, total, offset, limit);
    });

/**
 * Faz um insert de um novo lançamento de pontos.
 */
export const createPoint = createServerFn({ method: 'POST' })
    .middleware([adminMiddleware])
    .inputValidator(createPointSchema)
    .handler(async ({ data, context }) => {
        const [entry] = await db
            .insert(points)
            .values({
                userId: data.architect!.id,
                pointType: data.pointType,
                amount: data.amount,
                entryDate: new Date(data.entryDate),
                createdBy: context.session.user.name
            })
            .returning(pointColumns);

        return entry;
    });

/**
 * Faz um update de um lançamento de pontos.
 */
export const updatePoint = createServerFn({ method: 'POST' })
    .middleware([adminMiddleware])
    .inputValidator(updatePointSchema)
    .handler(async ({ data }) => {
        const [entry] = await db
            .update(points)
            .set({
                userId: data.architect?.id,
                pointType: data.pointType,
                amount: data.amount,
                entryDate: new Date(data.entryDate)
            })
            .where(eq(points.id, data.id))
            .returning(pointColumns);

        if (!entry) throw new Error('Lançamento não encontrado.');

        return entry;
    });

/**
 * Faz um delete de um lançamento de pontos.
 */
export const deletePoint = createServerFn({ method: 'POST' })
    .middleware([adminMiddleware])
    .inputValidator(z.object({ id: z.uuid() }))
    .handler(async ({ data }) => {
        await db.delete(points).where(eq(points.id, data.id));

        return { success: true };
    });
