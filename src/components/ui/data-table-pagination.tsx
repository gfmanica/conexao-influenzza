import { type Table } from '@tanstack/react-table';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsLeftIcon,
    ChevronsRightIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

export function DataTablePagination<TData>({ table }: { table: Table<TData> }) {
    return (
        <div className="flex items-center justify-between px-4 lg:px-6">
            <p className="text-muted-foreground text-sm">
                {table.getRowCount()} resultado(s)
            </p>

            <div className="flex items-center gap-6">
                <div className="hidden items-center gap-2 lg:flex">
                    <Label htmlFor="rows-per-page" className="text-sm font-medium">
                        Por página
                    </Label>

                    <Select
                        value={`${table.getState().pagination.pageSize}`}
                        onValueChange={(value) => table.setPageSize(Number(value))}
                        items={[10, 20, 50].map((n) => ({
                            label: `${n}`,
                            value: `${n}`
                        }))}
                    >
                        <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                            <SelectValue />
                        </SelectTrigger>

                        <SelectContent side="top">
                            <SelectGroup>
                                {[10, 20, 50].map((n) => (
                                    <SelectItem key={n} value={`${n}`}>
                                        {n}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <p className="text-sm font-medium">
                    Página {table.getState().pagination.pageIndex + 1} de{' '}
                    {Math.max(table.getPageCount(), 1)}
                </p>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="hidden size-8 lg:flex"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronsLeftIcon />

                        <span className="sr-only">Primeira página</span>
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeftIcon />

                        <span className="sr-only">Página anterior</span>
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRightIcon />

                        <span className="sr-only">Próxima página</span>
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        className="hidden size-8 lg:flex"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronsRightIcon />

                        <span className="sr-only">Última página</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
