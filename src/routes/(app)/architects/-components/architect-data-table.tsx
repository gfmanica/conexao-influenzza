import { useEffect, useState } from 'react';

import { PlusIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { useTableQuery } from '@/hooks/use-table-query';
import { architectColumns } from '@/routes/(app)/architects/-components/architect-columns';
import { ArchitectForm } from '@/routes/(app)/architects/-components/architect-form';
import { architectsQueryOptions } from '@/routes/(app)/architects/-hooks/use-query-architects';
import type { Architect } from '@/routes/(app)/architects/-types';

export function ArchitectDataTable() {
    const [nameFilter, setNameFilter] = useState('');
    const [editingArchitect, setEditingArchitect] = useState<Architect | null>(null);
    const [openDrawer, setOpenDrawer] = useState(false);

    const tableQuery = useTableQuery({ queryOptions: architectsQueryOptions });

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
        <>
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
                    <div className="flex w-full flex-col gap-3 px-4 lg:px-6 sm:flex-row sm:items-center sm:justify-between">
                        <Input
                            className="w-full sm:max-w-xs"
                            placeholder="Buscar arquiteto..."
                            value={nameFilter}
                            onChange={(e) => setNameFilter(e.target.value)}
                        />

                        <Button size="sm" className="w-full sm:w-auto" onClick={() => setOpenDrawer(true)}>
                            <PlusIcon />
                            Novo arquiteto
                        </Button>
                    </div>
                }
            />

            <ArchitectForm
                architect={editingArchitect ?? undefined}
                open={openDrawer}
                onOpenChange={(open) => {
                    setOpenDrawer(open);

                    if (!open) setEditingArchitect(null);
                }}
            />
        </>
    );
}
