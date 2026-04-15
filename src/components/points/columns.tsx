import { type ColumnDef } from '@tanstack/react-table';
import { ArrowUpDownIcon, EllipsisVerticalIcon } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import { ArchitectAvatar } from '../architects/architect-avatar';
import { DataTableActionCell } from '../ui/data-table-action-cell';
import { DataTableColumnHeader } from '../ui/data-table-column-header';
import { type PointEntry } from './types';

function formatDate(dateStr: string) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

type ColumnsOptions = {
    onEdit: (entry: PointEntry) => void;
    onDelete: (id: string) => void;
};

export function buildColumns({ onEdit, onDelete }: ColumnsOptions): ColumnDef<PointEntry>[] {
    return [
        {
            accessorKey: 'entry_date',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Data" />,
            cell: ({ row }) => (
                <span className="text-muted-foreground tabular-nums">
                    {formatDate(row.original.entry_date)}
                </span>
            )
        },
        {
            accessorKey: 'architect_id',
            header: 'Arquiteto',
            cell: ({ row }) => {
                const arch = row.original.architects;

                return (
                    <div className="flex items-center gap-3">
                        <ArchitectAvatar name={arch?.name || ''} photoUrl={arch?.photo_url || ''} />

                        <span className="font-medium">{arch?.name}</span>
                    </div>
                );
            }
        },
        {
            accessorKey: 'point_type',
            header: 'Tipo',
            cell: ({ row }) => <Badge variant="outline">{row.original.point_type}</Badge>
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
            cell: ({ row }) => (
                <DataTableActionCell
                    row={row}
                    onEdit={() => onEdit(row.original)}
                    onDelete={() => onDelete(row.original.id)}
                />
            )
        }
    ];
}
