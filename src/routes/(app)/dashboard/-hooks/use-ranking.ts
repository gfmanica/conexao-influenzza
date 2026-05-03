import { queryOptions } from '@tanstack/react-query';

import { getRanking } from '@/routes/(app)/dashboard/-server';

export const rankingQueryOptions = (month: number) =>
    queryOptions({
        queryKey: ['ranking', month],
        queryFn: () => getRanking({ data: { month } }),
        staleTime: 1000 * 60 * 5
    });
