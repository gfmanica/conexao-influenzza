import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';

import { buildColumns } from '@/components/points/columns';
import { PointEntrySheet } from '@/components/points/point-entry-sheet';
import { type PointEntry, type PointEntryFormData } from '@/components/points/types';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { DataTable } from '@/components/ui/data-table';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { architectsQueryOptions } from '@/hooks/use-architects';
import {
    pointEntriesQueryOptions,
    useCreatePointEntry,
    useDeletePointEntry,
    useUpdatePointEntry
} from '@/hooks/use-point-entries';
import { useTableQuery } from '@/hooks/use-table-query';
import { type FilterItem } from '@/lib/schemas/query';

export const Route = createFileRoute('/_app/pontuacoes')({
    component: RouteComponent
});

function RouteComponent() {
    const [filterArchitectId, setFilterArchitectId] = useState('');
    const [filterFrom, setFilterFrom] = useState('');
    const [filterTo, setFilterTo] = useState('');
    const [editingEntry, setEditingEntry] = useState<PointEntry | null>(null);
    const [editSheetOpen, setEditSheetOpen] = useState(false);
    const [createSheetOpen, setCreateSheetOpen] = useState(false);

    const { onFilterChange, ...tableQuery } = useTableQuery({
        queryOptions: pointEntriesQueryOptions
    });

    const { data: architectsData } = useQuery(architectsQueryOptions());

    const architects = architectsData?.data ?? [];

    const createEntry = useCreatePointEntry();
    const updateEntry = useUpdatePointEntry();
    const deleteEntry = useDeletePointEntry();

    function handleCreate(formData: PointEntryFormData) {
        createEntry.mutate({ data: formData });
    }

    function handleEdit(id: string, formData: PointEntryFormData) {
        updateEntry.mutate({ data: { id, ...formData } });
    }

    function handleDelete(id: string) {
        deleteEntry.mutate({ data: { id } });
    }

    function handleFilterChange(overrides?: {
        architectId?: string;
        from?: string;
        to?: string;
    }) {
        const architectId = overrides?.architectId ?? filterArchitectId;
        const from = overrides?.from ?? filterFrom;
        const to = overrides?.to ?? filterTo;

        const items: FilterItem[] = [];

        if (architectId)
            items.push({ field: 'architect_id', operator: 'eq', value: architectId });

        if (from) items.push({ field: 'entry_date', operator: 'gte', value: from });

        if (to) items.push({ field: 'entry_date', operator: 'lte', value: to });

        onFilterChange(items);
    }

    function clearFilters() {
        setFilterArchitectId('');
        setFilterFrom('');
        setFilterTo('');
        onFilterChange([]);
    }

    const columns = buildColumns({
        onEdit: (entry) => {
            setEditingEntry(entry);
            setEditSheetOpen(true);
        },
        onDelete: handleDelete
    });

    const hasFilters = !!(filterArchitectId || filterFrom || filterTo);

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-6 py-6">
            <div className="flex flex-col gap-2 px-4 lg:px-6">
                <h1 className="font-heading text-3xl font-semibold">Pontuações</h1>
                <p className="text-muted-foreground text-sm">
                    Gerencie os lançamentos de pontos dos arquitetos parceiros.
                </p>
            </div>

            <div className="flex flex-wrap items-end gap-3 px-4 lg:px-6">
                <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Arquiteto</Label>

                    <Combobox
                        value={filterArchitectId}
                        onChange={(value) => {
                            setFilterArchitectId(value);
                            handleFilterChange({ architectId: value });
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
                            handleFilterChange({ from: value });
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
                            handleFilterChange({ to: value });
                        }}
                        placeholder="Data final"
                        className="h-8 w-44 text-sm"
                    />
                </div>

                {hasFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 self-end"
                        onClick={clearFilters}
                    >
                        Limpar filtros
                    </Button>
                )}
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
                    <Button size="sm" onClick={() => setCreateSheetOpen(true)}>
                        <PlusIcon />
                        Novo lançamento
                    </Button>
                }
            />

            <PointEntrySheet
                architects={architects}
                onSubmit={handleCreate}
                open={createSheetOpen}
                onOpenChange={setCreateSheetOpen}
            />

            <PointEntrySheet
                entry={editingEntry ?? undefined}
                architects={architects}
                onSubmit={(data) => {
                    if (editingEntry) handleEdit(editingEntry.id, data);
                }}
                open={editSheetOpen}
                onOpenChange={(open) => {
                    setEditSheetOpen(open);
                    if (!open) setEditingEntry(null);
                }}
            />
        </div>
    );
}
