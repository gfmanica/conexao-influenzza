import { type ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import type { PointEntry } from '@/types/point-entry';

import { ArchitectAvatar } from '../architects/architect-avatar';
import { DataTableActionCell } from '../ui/data-table-action-cell';
import { DataTableColumnHeader } from '../ui/data-table-column-header';

type ColumnsOptions = {
    onEdit(entry: PointEntry): void;
    onDelete(entry: PointEntry): void;
};

export function pointEntriesColumns({ onEdit, onDelete }: ColumnsOptions): ColumnDef<PointEntry>[] {
    return [
        {
            accessorKey: 'entryDate',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Data" />,
            cell: ({ row }) => (
                <span className="text-muted-foreground tabular-nums">
                    {row.original.entryDate.toLocaleDateString('pt-BR')}
                </span>
            )
        },
        {
            accessorKey: 'userId',
            header: 'Arquiteto',
            cell: ({ row }) => {
                const arch = row.original.architect;

                return (
                    <div className="flex items-center gap-3">
                        <ArchitectAvatar name={arch?.name || ''} photoUrl={arch?.photoUrl || ''} />

                        <span className="font-medium">{arch?.name}</span>
                    </div>
                );
            }
        },
        {
            accessorKey: 'pointType',
            header: 'Tipo',
            cell: ({ row }) => <Badge variant="outline">{row.original.pointType}</Badge>
        },
        {
            accessorKey: 'amount',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Pontos" />,
            cell: ({ row }) => (
                // <div className="text-right">
                <Badge variant="secondary">{row.original.amount.toLocaleString('pt-BR')}</Badge>
                // </div>
            )
        },
        {
            id: 'actions',
            cell: ({ row }) => <DataTableActionCell row={row} onEdit={onEdit} onDelete={onDelete} />
        }
    ];
}
