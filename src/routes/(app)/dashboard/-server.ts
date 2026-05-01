import { createServerFn } from '@tanstack/react-start';
import { and, desc, eq, gte, lte, sum } from 'drizzle-orm';

import { db } from '@/lib/db';
import { pointEntries, user as userTable } from '@/lib/db/schema';
import { authMiddleware } from '@/lib/middleware';

/**
 * Lista o ranking de arquitetos com mais pontos (top 10) do ano atual.
 */
export const getRanking = createServerFn({ method: 'GET' })
    .middleware([authMiddleware])
    .handler(async () => {
    const year = new Date().getFullYear();
    const startOfYear = new Date(`${year}-01-01`);
    const endOfYear = new Date(`${year}-12-31`);

    const ranking = await db
        .select({
            architectId: pointEntries.userId,
            name: userTable.name,
            photoUrl: userTable.photoUrl,
            totalPoints: sum(pointEntries.amount)
        })
        .from(pointEntries)
        .leftJoin(userTable, eq(pointEntries.userId, userTable.id))
        .where(
            and(gte(pointEntries.entryDate, startOfYear), lte(pointEntries.entryDate, endOfYear))
        )
        .groupBy(pointEntries.userId, userTable.id, userTable.name, userTable.photoUrl)
        .orderBy(desc(sum(pointEntries.amount)))
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
            .select({ totalPoints: sum(pointEntries.amount) })
            .from(pointEntries)
            .where(eq(pointEntries.userId, context.session.user.id));

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
                id: pointEntries.id,
                pointType: pointEntries.pointType,
                amount: pointEntries.amount,
                entryDate: pointEntries.entryDate,
                createdAt: pointEntries.createdAt
            })
            .from(pointEntries)
            .where(eq(pointEntries.userId, context.session.user.id))
            .orderBy(desc(pointEntries.entryDate));
    });
