import { keepPreviousData, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
    createPoint,
    deletePoint,
    listPoints,
    updatePoint
} from '@/routes/(app)/points/-server';
import { type QueryParams } from '@/types/builders';

/**
 * Query options para buscar lançamentos de pontos.
 */
export function pointsQueryOptions(params: QueryParams = {}) {
    return queryOptions({
        queryKey: ['points', 'list', params],
        queryFn: () => listPoints({ data: params }),
        placeholderData: keepPreviousData
    });
}

/**
 * Cria um novo lançamento de pontos.
 */
export function useCreatePoint() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createPoint,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['points'] });
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
export function useUpdatePoint() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updatePoint,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['points'] });
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
export function useDeletePoint() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deletePoint,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['points'] });
            queryClient.invalidateQueries({ queryKey: ['architects'] });
            queryClient.invalidateQueries({ queryKey: ['ranking'] });
            toast.success('Lançamento excluído com sucesso!');
        },
        onError: (error) => toast.error(error.message)
    });
}
