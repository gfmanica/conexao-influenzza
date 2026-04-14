import { type ColumnDef } from '@tanstack/react-table';
import { ArrowUpDownIcon, LinkIcon, UnlinkIcon } from 'lucide-react';

import { ArchitectSheet, type Architect } from '@/components/architects/architect-sheet';
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
import { EllipsisVerticalIcon } from 'lucide-react';

function getInitials(name: string) {
    return name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
}

export const columns: ColumnDef<Architect>[] = [
    {
        accessorKey: 'name',
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === 'asc')
                }
            >
                Arquiteto
                <ArrowUpDownIcon className="ml-2 size-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <Avatar>
                    <AvatarImage src={row.original.photo_url} />
                    <AvatarFallback>
                        {getInitials(row.original.name)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="font-medium leading-tight">
                        {row.original.name}
                    </span>
                    <span className="text-muted-foreground text-xs">
                        {row.original.email}
                    </span>
                </div>
            </div>
        ),
        enableHiding: false
    },
    {
        accessorKey: 'phone',
        header: 'Telefone',
        cell: ({ row }) => (
            <span className="text-muted-foreground">
                {row.original.phone ?? '—'}
            </span>
        )
    },
    {
        accessorKey: 'cau_register',
        header: 'CAU',
        cell: ({ row }) => (
            <span className="font-mono text-sm">
                {row.original.cau_register ?? '—'}
            </span>
        )
    },
    {
        accessorKey: 'total_points',
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
                <Badge
                    variant="outline"
                    className="text-muted-foreground gap-1.5"
                >
                    <UnlinkIcon className="size-3" />
                    Pendente
                </Badge>
            )
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const architect = row.original;
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
                        <ArchitectSheet
                            architect={architect}
                            trigger={
                                <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    Editar
                                </DropdownMenuItem>
                            }
                        />
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive">
                            Excluir
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        }
    }
];
