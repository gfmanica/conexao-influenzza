import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { RankingDashboard } from '@/components/dashboard/ranking-dashboard';
import { rankingQueryOptions } from '@/hooks/use-ranking';

export const Route = createFileRoute('/_app/dashboard')({
    loader: ({ context }) => {
        context.queryClient.ensureQueryData(rankingQueryOptions);
    },
    component: RouteComponent
});

function RouteComponent() {
    const { data } = useSuspenseQuery(rankingQueryOptions);

    console.log(data);
    return <RankingDashboard data={data} />;
}
