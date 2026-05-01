import { queryOptions } from '@tanstack/react-query';

import { getRanking } from '@/routes/(app)/dashboard/-server';

/**
 * Query options para buscar o ranking.
 */
export const rankingQueryOptions = queryOptions({
    queryKey: ['ranking'],
    queryFn: getRanking,
    staleTime: 1000 * 60 * 5 // 5 minutos
});
