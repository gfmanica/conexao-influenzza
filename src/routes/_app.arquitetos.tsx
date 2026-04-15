import { useEffect, useState } from 'react';

import { createFileRoute } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';

import { architectColumns } from '@/components/architects/architect-columns';
import { ArchitectDataTable } from '@/components/architects/architect-data-table';
import { ArchitectForm, type Architect } from '@/components/architects/architect-form';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { architectsQueryOptions } from '@/hooks/use-architects';
import { useTableQuery } from '@/hooks/use-table-query';

export const Route = createFileRoute('/_app/arquitetos')({
    component: RouteComponent
});

function RouteComponent() {
    return (
        <div className="flex min-h-0 flex-1 flex-col gap-6 py-6">
            <div className="flex flex-col gap-2 px-4 lg:px-6">
                <h1 className="font-heading text-3xl font-semibold">Arquitetos</h1>

                <p className="text-muted-foreground text-sm">
                    Gerencie os arquitetos parceiros e acompanhe suas pontuações.
                </p>
            </div>

            <ArchitectDataTable />
        </div>
    );
}
