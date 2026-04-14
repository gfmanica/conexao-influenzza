import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';

import { ArchitectSheet } from '@/components/architects/architect-sheet';
import { columns } from '@/components/architects/columns';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { architectsQueryOptions } from '@/hooks/use-architects';

export const Route = createFileRoute('/_app/arquitetos')({
    loader: ({ context }) => {
        context.queryClient.ensureQueryData(architectsQueryOptions);
    },
    component: RouteComponent
});

function RouteComponent() {
    const { data: architects } = useSuspenseQuery(architectsQueryOptions);

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-6 py-6">
            <div className="flex flex-col gap-2 px-4 lg:px-6">
                <h1 className="font-heading text-3xl font-semibold">
                    Arquitetos
                </h1>

                <p className="text-muted-foreground text-sm">
                    Gerencie os arquitetos parceiros e acompanhe suas
                    pontuações.
                </p>
            </div>

            <DataTable
                columns={columns}
                data={architects}
                filterColumn="name"
                filterPlaceholder="Buscar arquiteto..."
                toolbar={
                    <ArchitectSheet
                        trigger={
                            <Button size="sm">
                                <PlusIcon />
                                Novo arquiteto
                            </Button>
                        }
                    />
                }
            />
        </div>
    );
}
