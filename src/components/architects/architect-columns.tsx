import { type ColumnDef } from '@tanstack/react-table';
import { LinkIcon, UnlinkIcon } from 'lucide-react';

import { type Architect } from '@/components/architects/architect-form';
import { Badge } from '@/components/ui/badge';

import { DataTableActionCell } from '../ui/data-table-action-cell';
import { DataTableColumnHeader } from '../ui/data-table-column-header';
import { ArchitectAvatar } from './architect-avatar';

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
                        photoUrl={row.original.photo_url || ''}
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
            accessorKey: 'cau_register',
            header: 'CAU',
            cell: ({ row }) => (
                <span className="font-mono text-sm">{row.original.cau_register ?? '—'}</span>
            )
        },
        {
            accessorKey: 'total_points',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Pontos" />,
            cell: ({ row }) => (
                <div className="text-right">
                    <Badge variant="secondary">
                        {row.original.total_points.toLocaleString('pt-BR')}
                    </Badge>
                </div>
            )
        },
        {
            accessorKey: 'linked',
            header: 'Vínculo',
            cell: ({ row }) =>
                row.original.linked ? (
                    <Badge className="gap-1.5">
                        <LinkIcon className="size-3" />
                        Vinculado
                    </Badge>
                ) : (
                    <Badge variant="outline" className="text-muted-foreground gap-1.5">
                        <UnlinkIcon className="size-3" />
                        Pendente
                    </Badge>
                )
        },
        {
            id: 'actions',
            cell: ({ row }) => <DataTableActionCell row={row} onEdit={onEdit} />
        }
    ];
}
