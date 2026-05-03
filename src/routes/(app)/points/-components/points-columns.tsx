import { type ColumnDef } from '@tanstack/react-table';

import { PhotoAvatar } from '@/components/photo-upload/photo-avatar';
import { Badge } from '@/components/ui/badge';
import { DataTableActionCell } from '@/components/ui/data-table-action-cell';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { Point } from '@/routes/(app)/points/-types';

type ColumnsOptions = {
    onEdit(entry: Point): void;
    onDelete(entry: Point): void;
};

export function pointsColumns({ onEdit, onDelete }: ColumnsOptions): ColumnDef<Point>[] {
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
                        <PhotoAvatar
                            photoUrl={arch?.photoUrl || ''}
                            name={arch?.name || ''}
                            size="lg"
                        />

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
                <Badge variant="secondary">{row.original.amount.toLocaleString('pt-BR')}</Badge>
            )
        },
        {
            id: 'actions',
            cell: ({ row }) => <DataTableActionCell row={row} onEdit={onEdit} onDelete={onDelete} />
        }
    ];
}
