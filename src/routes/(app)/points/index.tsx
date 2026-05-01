import { createFileRoute } from '@tanstack/react-router';

import { PointEntriesDataTable } from '@/components/points/point-entries-data-table';

export const Route = createFileRoute('/(app)/points/')({
    component: RouteComponent
});

function RouteComponent() {
    return (
        <div className="flex min-h-0 flex-1 flex-col gap-6 py-6">
            <div className="flex flex-col gap-2 px-4 lg:px-6">
                <h1 className="font-heading text-3xl font-semibold">Pontuações</h1>

                <p className="text-muted-foreground text-sm">
                    Gerencie os lançamentos de pontos dos arquitetos parceiros.
                </p>
            </div>

            <PointEntriesDataTable />
        </div>
    );
}
