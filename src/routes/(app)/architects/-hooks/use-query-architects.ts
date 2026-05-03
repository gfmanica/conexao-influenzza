import { keepPreviousData, queryOptions } from '@tanstack/react-query';

import { listArchitects } from '@/routes/(app)/architects/-server';
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
