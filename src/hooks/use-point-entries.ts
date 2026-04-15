import { keepPreviousData, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';

import { type QueryParams } from '@/lib/schemas/query';
import {
    createPointEntry,
    deletePointEntry,
    listPointEntries,
    updatePointEntry
} from '@/server/point-entries';

/**
 * Query options para buscar lançamentos de pontos.
 */
export function pointEntriesQueryOptions(params: QueryParams = {}) {
    return queryOptions({
        queryKey: ['point-entries', 'list', params],
        queryFn: () => listPointEntries({ data: params }),
        placeholderData: keepPreviousData
    });
}

/**
 * Cria um novo lançamento de pontos.
 */
export function useCreatePointEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createPointEntry,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['point-entries'] });
            queryClient.invalidateQueries({ queryKey: ['architects'] });
            queryClient.invalidateQueries({ queryKey: ['ranking'] });
        }
    });
}

/**
 * Atualiza um lançamento de pontos.
 */
export function useUpdatePointEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updatePointEntry,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['point-entries'] });
            queryClient.invalidateQueries({ queryKey: ['architects'] });
            queryClient.invalidateQueries({ queryKey: ['ranking'] });
        }
    });
}

/**
 * Deleta um lançamento de pontos.
 */
export function useDeletePointEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deletePointEntry,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['point-entries'] });
            queryClient.invalidateQueries({ queryKey: ['architects'] });
            queryClient.invalidateQueries({ queryKey: ['ranking'] });
        }
    });
}
