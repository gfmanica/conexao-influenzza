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
export function applyFilters(query: any, filters: FilterItem[] = []) {
    filters.forEach((f) => {
        if (f.operator === 'in') {
            query = query.in(f.field, f.value as (string | number | boolean)[]);
        } else if (f.operator === 'is') {
            query = query.is(f.field, f.value);
        } else {
            query = query[f.operator](f.field, f.value);
        }
    });

    return query;
}

/**
 * Aplica ordenação a uma query do Supabase.
 */
export function applyOrder(query: any, order: OrderItem[] = []) {
    order.forEach((o) => {
        query = query.order(o.field, {
            ascending: o.direction === 'asc',
            nullsFirst: o.nullsFirst
        });
    });

    return query;
}
