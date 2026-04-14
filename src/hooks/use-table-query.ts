import { useState } from 'react';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { type SortingState } from '@tanstack/react-table';

import { type FilterItem, type QueryParams } from '@/lib/schemas/query';

export function useTableQuery<
    TQueryFnData extends { data: unknown[]; total: number },
    TError = Error,
    TData extends { data: unknown[]; total: number } = TQueryFnData,
    TQueryKey extends readonly unknown[] = readonly unknown[]
>({
    queryOptions: makeQueryOptions
}: {
    queryOptions: (
        params: QueryParams
    ) => UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>;
}) {
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [sort, setSort] = useState<SortingState>([]);
    const [filter, setFilter] = useState<FilterItem[]>([]);

    const { data, isFetching } = useQuery(
        makeQueryOptions({
            page: pageIndex + 1,
            pageSize,
            filter,
            order: sort.map((s) => ({
                field: s.id,
                direction: (s.desc ? 'desc' : 'asc') as 'asc' | 'desc'
            }))
        })
    );

    return {
        /** Índice da página atual (base 0). */
        pageIndex,
        /** Número de itens por página. */
        pageSize,
        /** Estado de sorting no formato do TanStack Table. */
        sort,
        /** `true` enquanto qualquer requisição estiver em andamento. */
        isFetching,
        /** Lista de itens da página atual. Sempre um array (nunca `undefined`). */
        data: (data?.data ?? []) as (TData extends { data: (infer U)[] } ? U : any)[],
        /** Total de registros do servidor para cálculo de páginas. Padrão: `0`. */
        total: data?.total ?? 0,
        /**
         * Volta `pageIndex` para `0`.
         * Deve ser chamado sempre que um filtro externo for alterado.
         */
        resetPage() {
            setPageIndex(0);
        },
        /** Navega para a página informada (base 0). */
        onPageChange(page: number) {
            setPageIndex(page);
        },
        /** Altera o tamanho da página e reseta para a primeira automaticamente. */
        onPageSizeChange(size: number) {
            setPageSize(size);
            setPageIndex(0);
        },
        /** Atualiza o sorting e reseta para a primeira página automaticamente. */
        onSortChange(newSort: SortingState) {
            setSort(newSort);
            setPageIndex(0);
        },
        /** Filtros externos gerenciados pela rota. */
        onFilterChange(newFilter: FilterItem[]) {
            setFilter(newFilter);
            setPageIndex(0);
        }
    };
}
