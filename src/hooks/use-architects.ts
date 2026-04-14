import { keepPreviousData, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';

import { type QueryParams } from '@/lib/schemas/query';
import { createArchitect, listArchitects, updateArchitect } from '@/server/fn/architects';

/**
 * Query options para buscar arquitetos.
 */
export function architectsQueryOptions(params: QueryParams = {}) {
    return queryOptions({
        queryKey: ['architects', 'list', params],
        queryFn: () => listArchitects({ data: params }),
        placeholderData: keepPreviousData
    });
}

/**
 * Cria um novo arquiteto.
 */
export function useCreateArchitect() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createArchitect,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['architects'] })
    });
}

/**
 * Atualiza um arquiteto.
 */
export function useUpdateArchitect() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateArchitect,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['architects'] })
    });
}
