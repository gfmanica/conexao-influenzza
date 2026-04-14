import { type ColumnDef } from '@tanstack/react-table';
import { ArrowUpDownIcon, EllipsisVerticalIcon } from 'lucide-react';

import { type Architect } from '@/components/architects/architect-sheet';
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

import { PointEntrySheet } from './point-entry-sheet';
import { type PointEntry, type PointEntryFormData } from './types';

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
    architects: Architect[];
    onEdit: (id: string, data: PointEntryFormData) => void;
    onDelete: (id: string) => void;
};

export function buildColumns({
    architects,
    onEdit,
    onDelete
}: ColumnsOptions): ColumnDef<PointEntry>[] {
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
            accessorKey: 'architect_name',
            header: 'Arquiteto',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={row.original.architect_photo_url} />
                        <AvatarFallback>
                            {getInitials(row.original.architect_name)}
                        </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                        {row.original.architect_name}
                    </span>
                </div>
            )
        },
        {
            accessorKey: 'point_type_name',
            header: 'Tipo',
            cell: ({ row }) => (
                <Badge variant="outline">{row.original.point_type_name}</Badge>
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
                            <PointEntrySheet
                                entry={entry}
                                architects={architects}
                                onSubmit={(data) => onEdit(entry.id, data)}
                                trigger={
                                    <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                    >
                                        Editar
                                    </DropdownMenuItem>
                                }
                            />
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
