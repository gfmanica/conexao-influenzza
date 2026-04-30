import { useEffect, useRef, useState } from 'react';

import { useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';

import { type FilterItem, type QueryParams } from '@/types/builders';

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 300;

export type ComboboxQueryResult<T = unknown> = {
    items: T[];
    isFetching: boolean;
    search: string;
    onSearchChange: (value: string) => void;
    pageIndex: number;
    pageCount: number;
    canPreviousPage: boolean;
    canNextPage: boolean;
    goToFirstPage: () => void;
    goToPreviousPage: () => void;
    goToNextPage: () => void;
    refetch: () => void;
    reset: () => void;
};

export function useComboboxQuery<
    TQueryFnData extends { data: unknown[]; total: number },
    TError = Error,
    TData extends { data: unknown[]; total: number } = TQueryFnData,
    TQueryKey extends readonly unknown[] = readonly unknown[]
>({
    queryOptions: makeQueryOptions,
    displayField
}: {
    queryOptions: (params: QueryParams) => UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>;
    displayField: string;
}): ComboboxQueryResult<TData extends { data: (infer U)[] } ? U : unknown> {
    const queryClient = useQueryClient();

    const [pageIndex, setPageIndex] = useState(0);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

    useEffect(() => {
        timerRef.current = setTimeout(() => {
            setDebouncedSearch(search);
            setPageIndex(0);
        }, DEBOUNCE_MS);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [search]);

    const filter: FilterItem[] = debouncedSearch
        ? [{ field: displayField, operator: 'ilike', value: `%${debouncedSearch}%` }]
        : [];

    const queryOpts = makeQueryOptions({
        page: pageIndex + 1,
        pageSize: PAGE_SIZE,
        filter
    });

    const { data, isFetching } = useQuery(queryOpts);

    const total = data?.total ?? 0;
    const pageCount = Math.max(Math.ceil(total / PAGE_SIZE), 1);

    return {
        items: (data?.data ?? []) as (TData extends { data: (infer U)[] } ? U : unknown)[],
        isFetching,
        search,
        onSearchChange: setSearch,
        pageIndex,
        pageCount,
        canPreviousPage: pageIndex > 0,
        canNextPage: pageIndex < pageCount - 1,
        goToFirstPage: () => setPageIndex(0),
        goToPreviousPage: () => setPageIndex((p) => Math.max(0, p - 1)),
        goToNextPage: () => setPageIndex((p) => Math.min(pageCount - 1, p + 1)),
        refetch: () => queryClient.invalidateQueries({ queryKey: queryOpts.queryKey }),
        reset: () => {
            setSearch('');
            setDebouncedSearch('');
            setPageIndex(0);
        }
    };
}
