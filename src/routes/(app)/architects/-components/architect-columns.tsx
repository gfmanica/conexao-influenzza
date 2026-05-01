import { type ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { DataTableActionCell } from '@/components/ui/data-table-action-cell';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ArchitectAvatar } from '@/routes/(app)/architects/-components/architect-avatar';
import type { Architect } from '@/routes/(app)/architects/-types';

type ColumnsOptions = {
    onEdit(architect: Architect): void;
};

export function architectColumns({ onEdit }: ColumnsOptions): ColumnDef<Architect>[] {
    return [
        {
            accessorKey: 'name',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Arquiteto" />,
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <ArchitectAvatar
                        photoUrl={row.original.photoUrl || ''}
                        name={row.original.name}
                    />

                    <div className="flex flex-col">
                        <span className="leading-tight font-medium">{row.original.name}</span>
                        <span className="text-muted-foreground text-xs">{row.original.email}</span>
                    </div>
                </div>
            ),
            enableHiding: false
        },
        {
            accessorKey: 'phone',
            header: 'Telefone',
            cell: ({ row }) => (
                <span className="text-muted-foreground">{row.original.phone ?? '—'}</span>
            )
        },
        {
            accessorKey: 'cauRegister',
            header: 'CAU',
            cell: ({ row }) => (
                <span className="font-mono text-sm">{row.original.cauRegister ?? '—'}</span>
            )
        },
        {
            accessorKey: 'totalPoints',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Pontos" />,
            cell: ({ row }) => (
                <div className="text-right">
                    <Badge variant="secondary">
                        {row.original.totalPoints
                            ? Number(row.original.totalPoints).toLocaleString('pt-BR')
                            : 0}
                    </Badge>
                </div>
            )
        },
        {
            id: 'actions',
            cell: ({ row }) => <DataTableActionCell row={row} onEdit={onEdit} />
        }
    ];
}
