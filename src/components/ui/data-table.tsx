import * as React from 'react';

import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState
} from '@tanstack/react-table';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsLeftIcon,
    ChevronsRightIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    filterColumn?: string;
    filterPlaceholder?: string;
    toolbar?: React.ReactNode;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    filterColumn,
    filterPlaceholder = 'Buscar...',
    toolbar
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
            columnVisibility
        }
    });

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 lg:px-6">
                {filterColumn && (
                    <Input
                        placeholder={filterPlaceholder}
                        value={
                            (table
                                .getColumn(filterColumn)
                                ?.getFilterValue() as string) ?? ''
                        }
                        onChange={(e) =>
                            table
                                .getColumn(filterColumn)
                                ?.setFilterValue(e.target.value)
                        }
                        className="max-w-64"
                    />
                )}
                {toolbar && <div className="ml-auto">{toolbar}</div>}
            </div>

            {/* Table */}
            <div className="mx-4 flex-1 overflow-auto rounded-md border lg:mx-6">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && 'selected'
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    Nenhum resultado encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 lg:px-6">
                <p className="text-muted-foreground text-sm">
                    {table.getFilteredRowModel().rows.length} resultado(s)
                </p>
                <div className="flex items-center gap-6">
                    <div className="hidden items-center gap-2 lg:flex">
                        <Label
                            htmlFor="rows-per-page"
                            className="text-sm font-medium"
                        >
                            Por página
                        </Label>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) =>
                                table.setPageSize(Number(value))
                            }
                            items={[10, 20, 50].map((n) => ({
                                label: `${n}`,
                                value: `${n}`
                            }))}
                        >
                            <SelectTrigger
                                size="sm"
                                className="w-20"
                                id="rows-per-page"
                            >
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
                        {table.getPageCount() || 1}
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
                            onClick={() =>
                                table.setPageIndex(table.getPageCount() - 1)
                            }
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronsRightIcon />
                            <span className="sr-only">Última página</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
