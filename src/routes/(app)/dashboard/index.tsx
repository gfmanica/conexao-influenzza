import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { RankingDashboard } from '@/routes/(app)/dashboard/-components/ranking-dashboard';
import { rankingQueryOptions } from '@/routes/(app)/dashboard/-hooks/use-ranking';

export const Route = createFileRoute('/(app)/dashboard/')({
    loader: ({ context }) => {
        context.queryClient.ensureQueryData(rankingQueryOptions);
    },
    component: RouteComponent
});

function RouteComponent() {
    const { data } = useSuspenseQuery(rankingQueryOptions);

    return <RankingDashboard data={data} />;
}
