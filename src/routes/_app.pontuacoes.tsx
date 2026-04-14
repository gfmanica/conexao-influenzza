import * as React from 'react';

import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';

import { buildColumns } from '@/components/points/columns';
import { PointEntrySheet } from '@/components/points/point-entry-sheet';
import { type PointEntryFormData } from '@/components/points/types';
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

export const Route = createFileRoute('/_app/pontuacoes')({
    loader: ({ context }) => {
        context.queryClient.ensureQueryData(pointEntriesQueryOptions());
        context.queryClient.ensureQueryData(architectsQueryOptions);
    },
    component: RouteComponent
});

function RouteComponent() {
    const [filterArchitectId, setFilterArchitectId] = React.useState('');
    const [filterFrom, setFilterFrom] = React.useState('');
    const [filterTo, setFilterTo] = React.useState('');

    const filters = {
        architect_id: filterArchitectId || undefined,
        from: filterFrom || undefined,
        to: filterTo || undefined
    };

    const { data: entries } = useSuspenseQuery(
        pointEntriesQueryOptions(filters)
    );
    const { data: architects } = useSuspenseQuery(architectsQueryOptions);

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

    const columns = buildColumns({
        architects,
        onEdit: handleEdit,
        onDelete: handleDelete
    });

    const hasFilters = !!(filterArchitectId || filterFrom || filterTo);

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-6 py-6">
            <div className="flex flex-col gap-2 px-4 lg:px-6">
                <h1 className="font-heading text-3xl font-semibold">
                    Pontuações
                </h1>
                <p className="text-muted-foreground text-sm">
                    Gerencie os lançamentos de pontos dos arquitetos parceiros.
                </p>
            </div>

            <div className="flex flex-wrap items-end gap-3 px-4 lg:px-6">
                <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Arquiteto</Label>
                    <Combobox
                        value={filterArchitectId}
                        onChange={setFilterArchitectId}
                        options={architects.map((a) => ({
                            value: a.id,
                            label: a.name
                        }))}
                        placeholder="Todos"
                        searchPlaceholder="Buscar arquiteto..."
                        emptyText="Nenhum arquiteto encontrado."
                        className="h-8 w-48 text-sm"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">De</Label>
                    <DatePicker
                        value={filterFrom}
                        onChange={setFilterFrom}
                        placeholder="Data inicial"
                        className="h-8 w-44 text-sm"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Até</Label>
                    <DatePicker
                        value={filterTo}
                        onChange={setFilterTo}
                        placeholder="Data final"
                        className="h-8 w-44 text-sm"
                    />
                </div>

                {hasFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 self-end"
                        onClick={() => {
                            setFilterArchitectId('');
                            setFilterFrom('');
                            setFilterTo('');
                        }}
                    >
                        Limpar filtros
                    </Button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={entries}
                toolbar={
                    <PointEntrySheet
                        architects={architects}
                        onSubmit={handleCreate}
                        trigger={
                            <Button size="sm">
                                <PlusIcon />
                                Novo lançamento
                            </Button>
                        }
                    />
                }
            />
        </div>
    );
}
