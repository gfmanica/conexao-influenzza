import { createServerFn } from '@tanstack/react-start';
import { and, desc, eq, gte, lte, sum } from 'drizzle-orm';

import { db } from '@/lib/db';
import { points, user as userTable } from '@/lib/db/schema';
import { authMiddleware } from '@/lib/middleware';

/**
 * Lista o ranking de arquitetos com mais pontos (top 10) do ano atual.
 */
export const getRanking = createServerFn({ method: 'GET' })
    .middleware([authMiddleware])
    .inputValidator((data: { month: number }) => data)
    .handler(async ({ data }) => {
        const year = new Date().getFullYear();
        const month = data.month;
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0);

        const ranking = await db
            .select({
                architectId: points.userId,
                name: userTable.name,
                photoUrl: userTable.photoUrl,
                totalPoints: sum(points.amount)
            })
            .from(points)
            .leftJoin(userTable, eq(points.userId, userTable.id))
            .where(and(gte(points.entryDate, startOfMonth), lte(points.entryDate, endOfMonth)))
            .groupBy(points.userId, userTable.id, userTable.name, userTable.photoUrl)
            .orderBy(desc(sum(points.amount)))
            .limit(10);

        return ranking.map((item, i) => ({
            position: i + 1,
            architectId: item.architectId,
            name: item.name ?? '',
            photoUrl: item.photoUrl ?? null,
            totalPoints: Number(item.totalPoints)
        }));
    });

/**
 * Obtém o total de pontos do usuário logado.
 */
export const getTotalPointsUser = createServerFn({ method: 'GET' })
    .middleware([authMiddleware])
    .handler(async ({ context }) => {
        const [result] = await db
            .select({ totalPoints: sum(points.amount) })
            .from(points)
            .where(eq(points.userId, context.session.user.id));

        return Number(result?.totalPoints) || 0;
    });

/**
 * Lista todas as entradas de pontos do user logado.
 */
export const listPointsUser = createServerFn({ method: 'GET' })
    .middleware([authMiddleware])
    .handler(async ({ context }) => {
        return await db
            .select({
                id: points.id,
                pointType: points.pointType,
                amount: points.amount,
                entryDate: points.entryDate,
                createdAt: points.createdAt
            })
            .from(points)
            .where(eq(points.userId, context.session.user.id))
            .orderBy(desc(points.entryDate));
    });
