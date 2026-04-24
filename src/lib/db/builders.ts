import {
    and,
    asc,
    desc,
    eq,
    gt,
    gte,
    ilike,
    inArray,
    isNotNull,
    isNull,
    like,
    lt,
    lte,
    ne,
    type Column
} from 'drizzle-orm';

import type { FilterItem, OrderItem } from '@/types/builders';

export type ColumnMap = Record<string, Column>;

/**
 * Calcula o offset e o limit para a paginação.
 */
export function getPaginationRange(page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;

    return { offset, limit: pageSize };
}

/**
 * Constrói a resposta paginada para uma query.
 */
export function buildPagedResponse<T>(rows: T[], total: number, offset: number, limit: number) {
    return {
        data: rows,
        total,
        hasNext: offset + limit < total
    };
}

/**
 * Constrói as condições de filtro dinamicamente para uma query.
 */
export function buildWhereConditions(filters: FilterItem[] = [], columnMap: ColumnMap) {
    const conditions = filters
        .map((f) => {
            const col = columnMap[f.field];

            if (!col) return undefined;
            if (f.operator === 'eq') return eq(col, f.value);
            if (f.operator === 'neq') return ne(col, f.value);
            if (f.operator === 'lt') return lt(col, f.value);
            if (f.operator === 'lte') return lte(col, f.value);
            if (f.operator === 'gt') return gt(col, f.value);
            if (f.operator === 'gte') return gte(col, f.value);
            if (f.operator === 'like') return like(col, `%${f.value}%`);
            if (f.operator === 'ilike') return ilike(col, `%${f.value}%`);
            if (f.operator === 'in') {
                const arr = f.value;

                if (!Array.isArray(arr) || arr.length === 0) return undefined;

                return inArray(col, arr);
            }
            if (f.operator === 'is') return f.value === null ? isNull(col) : isNotNull(col);

            return undefined;
        })
        .filter((c) => c !== undefined);

    return conditions.length ? and(...conditions) : undefined;
}

/**
 * Constrói as instruções de ordenação dinamicamente para uma query.
 */
export function buildOrderByClause(order: OrderItem[] = [], columnMap: ColumnMap) {
    return order
        .map((o) => {
            const col = columnMap[o.field];

            if (!col) return undefined;

            return o.direction === 'desc' ? desc(col) : asc(col);
        })
        .filter((o) => o !== undefined);
}
