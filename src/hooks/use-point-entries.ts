import {
    queryOptions,
    useMutation,
    useQueryClient
} from '@tanstack/react-query';

import {
    createPointEntry,
    deletePointEntry,
    listPointEntries,
    updatePointEntry
} from '@/server/fn/point-entries';

import { queryKeys } from './query-keys';

export function pointEntriesQueryOptions(filters?: {
    architect_id?: string;
    from?: string;
    to?: string;
}) {
    return queryOptions({
        queryKey: queryKeys.pointEntries.filtered(filters ?? {}),
        queryFn: () => listPointEntries({ data: filters })
    });
}

export function useCreatePointEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createPointEntry,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.pointEntries.all
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.architects.all
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.ranking.current
            });
        }
    });
}

export function useUpdatePointEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updatePointEntry,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.pointEntries.all
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.architects.all
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.ranking.current
            });
        }
    });
}

export function useDeletePointEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deletePointEntry,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.pointEntries.all
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.architects.all
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.ranking.current
            });
        }
    });
}
