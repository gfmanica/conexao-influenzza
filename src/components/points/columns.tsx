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

import { type PointEntry } from './types';

function getInitials(name: string) {
    return name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
}

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
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    Data
                    <ArrowUpDownIcon className="ml-2 size-4" />
                </Button>
            ),
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
                const name = arch?.name ?? '—';
                return (
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={arch?.photo_url ?? undefined} />
                            <AvatarFallback>{getInitials(name)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{name}</span>
                    </div>
                );
            }
        },
        {
            accessorKey: 'point_type',
            header: 'Tipo',
            cell: ({ row }) => (
                <Badge variant="outline">{row.original.point_type}</Badge>
            )
        },
        {
            accessorKey: 'amount',
            header: ({ column }) => (
                <div className="flex justify-end">
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                    >
                        Pontos
                        <ArrowUpDownIcon className="ml-2 size-4" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => (
                <div className="text-right">
                    <Badge variant="secondary">
                        {row.original.amount.toLocaleString('pt-BR')}
                    </Badge>
                </div>
            )
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const entry = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button
                                    variant="ghost"
                                    className="text-muted-foreground data-open:bg-muted size-8"
                                    size="icon"
                                />
                            }
                        >
                            <EllipsisVerticalIcon />
                            <span className="sr-only">Abrir menu</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem onSelect={() => onEdit(entry)}>
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => onDelete(entry.id)}
                            >
                                Excluir
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            }
        }
    ];
}
