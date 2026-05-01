import { useEffect, useState } from 'react';

import { PlusIcon } from 'lucide-react';

import { architectColumns } from '@/components/architects/architect-columns';
import { ArchitectForm, type Architect } from '@/components/architects/architect-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { architectsQueryOptions } from '@/hooks/architects/use-architects';
import { useTableQuery } from '@/hooks/use-table-query';

import { DataTable } from '../ui/data-table';

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
                    <div className="flex w-full items-center justify-between gap-3 px-4 lg:px-6">
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
                onOpenChange={(open) => {
                    setOpenDrawer(open);

                    if (!open) setEditingArchitect(null);
                }}
            />
        </>
    );
}
