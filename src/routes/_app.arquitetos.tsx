import { useEffect, useState } from 'react';

import { createFileRoute } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';

import { architectColumns } from '@/components/architects/architect-columns';
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
    const [nameFilter, setNameFilter] = useState('');
    const [editingArchitect, setEditingArchitect] = useState<Architect | null>(null);
    const [openDrawer, setOpenDrawer] = useState(false);

    const tableQuery = useTableQuery({
        queryOptions: architectsQueryOptions
    });

    useEffect(() => {
        const t = setTimeout(
            () =>
                tableQuery.onFilterChange([
                    { field: 'name', operator: 'ilike', value: `%${nameFilter}%` }
                ]),
            300
        );
        return () => clearTimeout(t);
    }, [nameFilter]);

    const columns = architectColumns({
        onEdit: (architect) => {
            setEditingArchitect(architect);
            setOpenDrawer(true);
        }
    });

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-6 py-6">
            <div className="flex flex-col gap-2 px-4 lg:px-6">
                <h1 className="font-heading text-3xl font-semibold">Arquitetos</h1>

                <p className="text-muted-foreground text-sm">
                    Gerencie os arquitetos parceiros e acompanhe suas pontuações.
                </p>
            </div>

            <DataTable
                columns={columns}
                data={tableQuery.data}
                total={tableQuery.total}
                pageIndex={tableQuery.pageIndex}
                pageSize={tableQuery.pageSize}
                onPageChange={tableQuery.onPageChange}
                onPageSizeChange={tableQuery.onPageSizeChange}
                sort={tableQuery.sort}
                onSortChange={tableQuery.onSortChange}
                isLoading={tableQuery.isFetching}
                toolbar={
                    <div className="flex items-center gap-3 px-4 lg:px-6">
                        <Input
                            className="max-w-xs"
                            placeholder="Buscar arquiteto..."
                            value={nameFilter}
                            onChange={(e) => setNameFilter(e.target.value)}
                        />

                        <Button size="sm" onClick={() => setOpenDrawer(true)}>
                            <PlusIcon />
                            Novo arquiteto
                        </Button>
                    </div>
                }
            />

            <ArchitectForm
                architect={editingArchitect ?? undefined}
                open={openDrawer}
                onOpenChange={setOpenDrawer}
            />
        </div>
    );
}
