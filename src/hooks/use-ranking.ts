import { queryOptions } from '@tanstack/react-query';

import { getRanking } from '@/server/fn/ranking';

import { queryKeys } from './query-keys';

export const rankingQueryOptions = queryOptions({
    queryKey: queryKeys.ranking.current,
    queryFn: () => getRanking(),
    staleTime: 1000 * 60 * 5 // 5 minutos
});
