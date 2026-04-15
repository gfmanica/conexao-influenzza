import { type FilterItem, type OrderItem } from '@/lib/schemas/query';

/**
 * Calcula o range de paginação com base na página atual e tamanho da página.
 */
export function getPaginationRange(page = 1, pageSize = 10) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    return { from, to };
}

/**
 * Constrói uma resposta paginada com base nas linhas, contagem total e range.
 */
export function buildPagedResponse<T>(rows: T[], count: number | null, to: number) {
    const total = count ?? 0;

    return {
        data: rows,
        total,
        hasNext: to + 1 < total
    };
}

/**
 * Aplica filtros a uma query do Supabase.
 */
export function applyFilters<T>(query: T, filters: FilterItem[] = []): T {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any = query;

    filters.forEach((f) => {
        if (f.operator === 'in') {
            q = q.in(f.field, f.value as (string | number | boolean)[]);
        } else if (f.operator === 'is') {
            q = q.is(f.field, f.value);
        } else {
            q = q[f.operator](f.field, f.value);
        }
    });

    return q as T;
}

/**
 * Aplica ordenação a uma query do Supabase.
 */
export function applyOrder<T>(query: T, order: OrderItem[] = []): T {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any = query;

    order.forEach((o) => {
        q = q.order(o.field, {
            ascending: o.direction === 'asc',
            nullsFirst: o.nullsFirst
        });
    });

    return q as T;
}
