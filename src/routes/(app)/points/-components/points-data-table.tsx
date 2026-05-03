import { useState } from 'react';

import { PlusIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { useTableQuery } from '@/hooks/use-table-query';
import { ArchitectCombobox } from '@/routes/(app)/architects/-components/architect-combobox';
import type { Architect } from '@/routes/(app)/architects/-types';
import { pointsColumns } from '@/routes/(app)/points/-components/points-columns';
import { PointForm } from '@/routes/(app)/points/-components/points-form';
import { pointsQueryOptions, useDeletePoint } from '@/routes/(app)/points/-hooks/use-query-points';
import type { Point } from '@/routes/(app)/points/-types';
import { type FilterItem } from '@/types/builders';

export function PointsDataTable() {
    const [filterArchitect, setFilterArchitect] = useState<Architect | null>(null);
    const [filterFrom, setFilterFrom] = useState('');
    const [filterTo, setFilterTo] = useState('');
    const [editingEntry, setEditingEntry] = useState<Point | null>(null);
    const [openDrawer, setOpenDrawer] = useState(false);

    const { onFilterChange, ...tableQuery } = useTableQuery({
        queryOptions: pointsQueryOptions
    });

    const deleteEntry = useDeletePoint();

    function applyFilters(overrides?: { architectId?: string; from?: string; to?: string }) {
        const architectId = overrides?.architectId ?? filterArchitect?.id ?? '';
        const from = overrides?.from ?? filterFrom;
        const to = overrides?.to ?? filterTo;

        const items: FilterItem[] = [];
        if (architectId) items.push({ field: 'userId', operator: 'eq', value: architectId });
        if (from) items.push({ field: 'entryDate', operator: 'gte', value: from });
        if (to) items.push({ field: 'entryDate', operator: 'lte', value: to });

        onFilterChange(items);
    }

    const columns = pointsColumns({
        onEdit: (entry) => {
            setEditingEntry(entry);
            setOpenDrawer(true);
        },
        onDelete: (entry) => deleteEntry.mutate({ data: { id: entry.id } })
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
                    <div className="flex w-full flex-col gap-3 px-4 lg:px-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-xs">Arquiteto</Label>

                                <ArchitectCombobox
                                    value={filterArchitect}
                                    onChange={(architect) => {
                                        setFilterArchitect(architect);
                                        applyFilters({ architectId: architect?.id ?? '' });
                                    }}
                                    placeholder="Todos"
                                    searchPlaceholder="Buscar arquiteto..."
                                    emptyText="Nenhum arquiteto encontrado."
                                    className="h-8 w-full text-sm sm:w-48"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label className="text-xs">De</Label>
                                <DatePicker
                                    value={filterFrom}
                                    onChange={(value) => {
                                        setFilterFrom(value);
                                        applyFilters({ from: value });
                                    }}
                                    placeholder="Data inicial"
                                    className="h-8 w-full text-sm sm:w-44"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label className="text-xs">Até</Label>
                                <DatePicker
                                    value={filterTo}
                                    onChange={(value) => {
                                        setFilterTo(value);
                                        applyFilters({ to: value });
                                    }}
                                    placeholder="Data final"
                                    className="h-8 w-full text-sm sm:w-44"
                                />
                            </div>
                        </div>

                        <Button
                            size="sm"
                            className="h-8 w-full sm:w-auto sm:self-end"
                            onClick={() => setOpenDrawer(true)}
                        >
                            <PlusIcon />
                            Novo lançamento
                        </Button>
                    </div>
                }
            />

            <PointForm
                entry={editingEntry ?? undefined}
                open={openDrawer}
                onOpenChange={(open) => {
                    setOpenDrawer(open);

                    if (!open) setEditingEntry(null);
                }}
            />
        </>
    );
}
