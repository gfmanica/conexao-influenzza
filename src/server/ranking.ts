import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { and, desc, eq, gte, lte, sum } from 'drizzle-orm';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { pointEntries, user as userTable } from '@/lib/db/schema';

/**
 * Lista o ranking de arquitetos com mais pontos (top 10) do ano atual.
 */
export const getRanking = createServerFn({ method: 'GET' }).handler(async () => {
    const year = new Date().getFullYear();
    const startOfYear = new Date(`${year}-01-01`);
    const endOfYear = new Date(`${year}-12-31`);

    const ranking = await db
        .select({
            architect_id: pointEntries.userId,
            name: userTable.name,
            photo_url: userTable.photoUrl,
            total_points: sum(pointEntries.amount)
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
        architect_id: item.architect_id,
        name: item.name ?? '',
        photo_url: item.photo_url ?? null,
        total_points: Number(item.total_points)
    }));
});

/**
 * Obtém o total de pontos do usuário logado.
 */
export const getTotalPointsUser = createServerFn({ method: 'GET' }).handler(async () => {
    const session = await auth.api.getSession({ headers: getRequest().headers });

    if (!session) throw new Error('Não autenticado.');

    const [result] = await db
        .select({ total_points: sum(pointEntries.amount) })
        .from(pointEntries)
        .where(eq(pointEntries.userId, session.user.id));

    return Number(result?.total_points) || 0;
});

/**
 * Lista todas as entradas de pontos do user logado.
 */
export const listPointsUser = createServerFn({ method: 'GET' }).handler(async () => {
    const session = await auth.api.getSession({ headers: getRequest().headers });

    if (!session) throw new Error('Não autenticado.');

    return await db
        .select({
            id: pointEntries.id,
            point_type: pointEntries.pointType,
            amount: pointEntries.amount,
            entry_date: pointEntries.entryDate,
            created_at: pointEntries.createdAt
        })
        .from(pointEntries)
        .where(eq(pointEntries.userId, session.user.id))
        .orderBy(desc(pointEntries.entryDate));
});
