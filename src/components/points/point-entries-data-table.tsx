import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { PlusIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { DataTable } from '@/components/ui/data-table';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { architectsQueryOptions } from '@/hooks/use-architects';
import { pointEntriesQueryOptions, useDeletePointEntry } from '@/hooks/use-point-entries';
import { useTableQuery } from '@/hooks/use-table-query';
import { type FilterItem } from '@/types/builders';
import type { PointEntry } from '@/types/point-entry';

import { pointEntriesColumns } from './point-entries-columns';
import { PointEntryForm } from './point-entry-form';

export function PointEntriesDataTable() {
    const [filterArchitectId, setFilterArchitectId] = useState('');
    const [filterFrom, setFilterFrom] = useState('');
    const [filterTo, setFilterTo] = useState('');
    const [editingEntry, setEditingEntry] = useState<PointEntry | null>(null);
    const [openDrawer, setOpenDrawer] = useState(false);

    const { onFilterChange, ...tableQuery } = useTableQuery({
        queryOptions: pointEntriesQueryOptions
    });

    const { data: architectsData } = useQuery(architectsQueryOptions());
    const architects = architectsData?.data ?? [];

    const deleteEntry = useDeletePointEntry();

    function applyFilters(overrides?: { architectId?: string; from?: string; to?: string }) {
        const architectId = overrides?.architectId ?? filterArchitectId;
        const from = overrides?.from ?? filterFrom;
        const to = overrides?.to ?? filterTo;

        const items: FilterItem[] = [];
        if (architectId) items.push({ field: 'architect_id', operator: 'eq', value: architectId });
        if (from) items.push({ field: 'entry_date', operator: 'gte', value: from });
        if (to) items.push({ field: 'entry_date', operator: 'lte', value: to });

        onFilterChange(items);
    }

    const columns = pointEntriesColumns({
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
                    <div className="flex w-full flex-wrap justify-between items-end gap-3 px-4 lg:px-6">
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-xs">Arquiteto</Label>
                                <Combobox
                                    value={filterArchitectId}
                                    onChange={(value) => {
                                        setFilterArchitectId(value);
                                        applyFilters({ architectId: value });
                                    }}
                                    placeholder="Todos"
                                    searchPlaceholder="Buscar arquiteto..."
                                    emptyText="Nenhum arquiteto encontrado."
                                    className="h-8 w-48 text-sm"
                                    options={architects.map((a) => ({
                                        value: a.id,
                                        label: a.name
                                    }))}
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
                                    className="h-8 w-44 text-sm"
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
                                    className="h-8 w-44 text-sm"
                                />
                            </div>
                        </div>

                        <Button
                            size="sm"
                            className="h-8 self-end"
                            onClick={() => setOpenDrawer(true)}
                        >
                            <PlusIcon />
                            Novo lançamento
                        </Button>
                    </div>
                }
            />

            <PointEntryForm
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
