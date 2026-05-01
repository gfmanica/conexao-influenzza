import { keepPreviousData, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
    createPointEntry,
    deletePointEntry,
    listPointEntries,
    updatePointEntry
} from '@/server/point-entries';
import { type QueryParams } from '@/types/builders';

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
            toast.success('Lançamento salvo com sucesso!');
        },
        onError: (error) => toast.error(error.message)
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
            toast.success('Lançamento salvo com sucesso!');
        },
        onError: (error) => toast.error(error.message)
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
            toast.success('Lançamento excluído com sucesso!');
        },
        onError: (error) => toast.error(error.message)
    });
}
