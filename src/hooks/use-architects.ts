import { keepPreviousData, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { createArchitect, listArchitects, updateArchitect } from '@/server/architects';
import { type QueryParams } from '@/types/builders';

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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['architects'] });

            toast.success('Arquiteto salvo com sucesso!');
        }
    });
}

/**
 * Atualiza um arquiteto.
 */
export function useUpdateArchitect() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateArchitect,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['architects'] });

            toast.success('Arquiteto salvo com sucesso!');
        },
        onError: (error) => {
            console.error(error);
            toast.error(error.message);
        }
    });
}
