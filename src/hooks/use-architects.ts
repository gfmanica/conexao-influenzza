import {
    queryOptions,
    useMutation,
    useQueryClient
} from '@tanstack/react-query';

import {
    createArchitect,
    listArchitects,
    updateArchitect
} from '@/server/fn/architects';

import { queryKeys } from './query-keys';

export const architectsQueryOptions = queryOptions({
    queryKey: queryKeys.architects.all,
    queryFn: () => listArchitects()
});

export function useCreateArchitect() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createArchitect,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.architects.all
            });
        }
    });
}

export function useUpdateArchitect() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateArchitect,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.architects.all
            });
        }
    });
}
