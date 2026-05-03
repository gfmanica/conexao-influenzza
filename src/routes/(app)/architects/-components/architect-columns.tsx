import { type ColumnDef } from '@tanstack/react-table';

import { PhotoAvatar } from '@/components/photo-upload/photo-avatar';
import { Badge } from '@/components/ui/badge';
import { DataTableActionCell } from '@/components/ui/data-table-action-cell';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { Architect } from '@/routes/(app)/architects/-types';

type ColumnsOptions = {
    onEdit(architect: Architect): void;
};

export function architectColumns({ onEdit }: ColumnsOptions): ColumnDef<Architect>[] {
    return [
        {
            accessorKey: 'name',
            size: 220,
            header: ({ column }) => <DataTableColumnHeader column={column} title="Arquiteto" />,
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <PhotoAvatar
                        photoUrl={row.original.photoUrl || ''}
                        name={row.original.name}
                        size="lg"
                    />

                    <div className="flex min-w-0 flex-col">
                        <span className="truncate leading-tight font-medium">
                            {row.original.name}
                        </span>
                        <span className="text-muted-foreground truncate text-xs">
                            {row.original.email}
                        </span>
                    </div>
                </div>
            ),
            enableHiding: false
        },
        {
            accessorKey: 'phone',
            size: 140,
            header: 'Telefone',
            cell: ({ row }) => (
                <span className="text-muted-foreground">{row.original.phone ?? '—'}</span>
            )
        },
        {
            accessorKey: 'cauRegister',
            size: 120,
            header: 'CAU',
            cell: ({ row }) => (
                <span className="font-mono text-sm">{row.original.cauRegister ?? '—'}</span>
            )
        },
        {
            accessorKey: 'totalPoints',
            size: 100,
            header: ({ column }) => <DataTableColumnHeader column={column} title="Pontos" />,
            cell: ({ row }) => (
                <div className="text-left">
                    <Badge variant="secondary">
                        {row.original.totalPoints
                            ? Number(row.original.totalPoints).toLocaleString('pt-BR')
                            : 0}
                    </Badge>
                </div>
            )
        },
        {
            accessorKey: 'observation',
            size: 200,
            header: 'Observações',
            cell: ({ row }) => (
                <span className="text-muted-foreground block min-w-0 truncate">
                    {row.original.observation ?? '—'}
                </span>
            )
        },
        {
            id: 'actions',
            size: 60,
            cell: ({ row }) => <DataTableActionCell row={row} onEdit={onEdit} />
        }
    ];
}
