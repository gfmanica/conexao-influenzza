import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';

import { type Architect } from '@/components/architects/architect-sheet';
import { buildColumns } from '@/components/points/columns';
import { PointEntrySheet } from '@/components/points/point-entry-sheet';
import { type PointEntry, type PointEntryFormData } from '@/components/points/types';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { DataTable } from '@/components/ui/data-table';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/_app/pontuacoes')({
    component: RouteComponent
});

// ── Mock data ──────────────────────────────────────────────────────────────

const MOCK_ARCHITECTS: Architect[] = [
    {
        id: '1',
        name: 'Ana Carolina Mendes',
        email: 'ana.mendes@escritorio.com',
        phone: '(11) 99999-0001',
        office_address: 'Rua das Flores, 123, São Paulo - SP',
        birthdate: '1985-03-15',
        cau_register: 'A123456-0',
        linked: true,
        total_points: 1250,
        created_at: '2025-01-10T10:00:00Z',
        updated_at: '2025-03-20T14:00:00Z'
    },
    {
        id: '2',
        name: 'Roberto Figueiredo',
        email: 'roberto.f@arq.com.br',
        phone: '(21) 98888-0002',
        linked: true,
        total_points: 980,
        created_at: '2025-01-15T09:00:00Z',
        updated_at: '2025-04-01T11:00:00Z'
    },
    {
        id: '4',
        name: 'Marcos Vinicius Alves',
        email: 'marcos.alves@malves.arq.br',
        phone: '(31) 97777-0004',
        cau_register: 'C112233-1',
        linked: true,
        total_points: 2100,
        created_at: '2024-12-05T07:00:00Z',
        updated_at: '2026-02-10T16:00:00Z'
    }
];

const INITIAL_ENTRIES: PointEntry[] = [
    {
        id: 'e1',
        architect_id: '4',
        architect_name: 'Marcos Vinicius Alves',
        point_type_name: 'Venda de Rack',
        amount: 500,
        entry_date: '2026-04-10',
        created_at: '2026-04-10T10:00:00Z',
        updated_at: '2026-04-10T10:00:00Z'
    },
    {
        id: 'e2',
        architect_id: '1',
        architect_name: 'Ana Carolina Mendes',
        point_type_name: 'Indicação',
        amount: 200,
        entry_date: '2026-04-08',
        created_at: '2026-04-08T09:00:00Z',
        updated_at: '2026-04-08T09:00:00Z'
    },
    {
        id: 'e3',
        architect_id: '2',
        architect_name: 'Roberto Figueiredo',
        point_type_name: 'Venda de Sofá',
        amount: 350,
        entry_date: '2026-04-05',
        created_at: '2026-04-05T14:00:00Z',
        updated_at: '2026-04-05T14:00:00Z'
    },
    {
        id: 'e4',
        architect_id: '4',
        architect_name: 'Marcos Vinicius Alves',
        point_type_name: 'Indicação',
        amount: 150,
        entry_date: '2026-03-28',
        created_at: '2026-03-28T11:00:00Z',
        updated_at: '2026-03-28T11:00:00Z'
    },
    {
        id: 'e5',
        architect_id: '1',
        architect_name: 'Ana Carolina Mendes',
        point_type_name: 'Venda de Rack',
        amount: 500,
        entry_date: '2026-03-15',
        created_at: '2026-03-15T08:00:00Z',
        updated_at: '2026-03-15T08:00:00Z'
    }
];

// ── Component ──────────────────────────────────────────────────────────────

function RouteComponent() {
    const [entries, setEntries] = React.useState<PointEntry[]>(INITIAL_ENTRIES);

    const [filterArchitectId, setFilterArchitectId] = React.useState('');
    const [filterFrom, setFilterFrom] = React.useState('');
    const [filterTo, setFilterTo] = React.useState('');

    function handleCreate(data: PointEntryFormData) {
        const architect = MOCK_ARCHITECTS.find((a) => a.id === data.architect_id);
        if (!architect) return;
        const newEntry: PointEntry = {
            id: `e${Date.now()}`,
            architect_id: data.architect_id,
            architect_name: architect.name,
            architect_photo_url: architect.photo_url,
            point_type_name: data.point_type_name,
            amount: data.amount,
            entry_date: data.entry_date,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        setEntries((prev) =>
            [newEntry, ...prev].sort((a, b) =>
                b.entry_date.localeCompare(a.entry_date)
            )
        );
    }

    function handleEdit(id: string, data: PointEntryFormData) {
        const architect = MOCK_ARCHITECTS.find((a) => a.id === data.architect_id);
        if (!architect) return;
        setEntries((prev) =>
            prev
                .map((e) =>
                    e.id === id
                        ? {
                              ...e,
                              architect_id: data.architect_id,
                              architect_name: architect.name,
                              architect_photo_url: architect.photo_url,
                              point_type_name: data.point_type_name,
                              amount: data.amount,
                              entry_date: data.entry_date,
                              updated_at: new Date().toISOString()
                          }
                        : e
                )
                .sort((a, b) => b.entry_date.localeCompare(a.entry_date))
        );
    }

    function handleDelete(id: string) {
        setEntries((prev) => prev.filter((e) => e.id !== id));
    }

    const filtered = entries.filter((e) => {
        if (filterArchitectId && e.architect_id !== filterArchitectId) return false;
        if (filterFrom && e.entry_date < filterFrom) return false;
        if (filterTo && e.entry_date > filterTo) return false;
        return true;
    });

    const columns = buildColumns({
        architects: MOCK_ARCHITECTS,
        onEdit: handleEdit,
        onDelete: handleDelete
    });

    const hasFilters = !!(filterArchitectId || filterFrom || filterTo);

    return (
        <div className="flex flex-1 flex-col gap-6 py-6 min-h-0">
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
                        options={MOCK_ARCHITECTS.map((a) => ({
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
                data={filtered}
                toolbar={
                    <PointEntrySheet
                        architects={MOCK_ARCHITECTS}
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
