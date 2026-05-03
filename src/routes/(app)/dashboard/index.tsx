import { createFileRoute } from '@tanstack/react-router';

import { RankingDashboard } from '@/routes/(app)/dashboard/-components/ranking-dashboard';

export const Route = createFileRoute('/(app)/dashboard/')({
    component: RouteComponent
});

function RouteComponent() {
    return <RankingDashboard />;
}
