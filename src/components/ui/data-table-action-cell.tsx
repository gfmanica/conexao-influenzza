import { useState } from 'react';

import type { Row } from '@tanstack/react-table';
import { EllipsisVerticalIcon } from 'lucide-react';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

type DataTableActionCell<TData> = {
    onEdit(data: TData): void;
    onDelete?(data: TData): void;
    row: Row<TData>;
};

export function DataTableActionCell<TData>({ onEdit, onDelete, row }: DataTableActionCell<TData>) {
    const [confirmOpen, setConfirmOpen] = useState(false);

    return (
        <>
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
                    <DropdownMenuItem onClick={() => onEdit(row.original)}>Editar</DropdownMenuItem>

                    {onDelete && (
                        <>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                onClick={() => setConfirmOpen(true)}
                                variant="destructive"
                            >
                                Excluir
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>

                        <AlertDialogDescription>
                            Essa ação não pode ser desfeita. O registro será excluído
                            permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>

                        <AlertDialogAction
                            variant="destructive"
                            onClick={() => {
                                onDelete?.(row.original);
                                setConfirmOpen(false);
                            }}
                        >
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
