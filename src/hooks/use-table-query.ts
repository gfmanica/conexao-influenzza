import { useState } from 'react';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { type SortingState } from '@tanstack/react-table';

import { type FilterItem, type QueryParams } from '@/types/builders';

export function useTableQuery<
    TQueryFnData extends { data: unknown[]; total: number },
    TError = Error,
    TData extends { data: unknown[]; total: number } = TQueryFnData,
    TQueryKey extends readonly unknown[] = readonly unknown[]
>({
    queryOptions: makeQueryOptions
}: {
    queryOptions: (params: QueryParams) => UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>;
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
        pageIndex,
        pageSize,
        sort,
        isFetching,
        data: (data?.data ?? []) as (TData extends { data: (infer U)[] } ? U : any)[],
        total: data?.total ?? 0,
        resetPage() {
            setPageIndex(0);
        },
        onPageChange(page: number) {
            setPageIndex(page);
        },
        onPageSizeChange(size: number) {
            setPageSize(size);
            setPageIndex(0);
        },
        onSortChange(newSort: SortingState) {
            setSort(newSort);
            setPageIndex(0);
        },
        onFilterChange(newFilter: FilterItem[]) {
            setFilter(newFilter);
            setPageIndex(0);
        }
    };
}
