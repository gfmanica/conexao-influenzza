import { useState, type ReactNode } from 'react';

import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
    type PaginationState,
    type SortingState,
    type VisibilityState
} from '@tanstack/react-table';

import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

import { DataTablePagination } from './data-table-pagination';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    toolbar?: ReactNode;
    total?: number;
    pageIndex?: number;
    pageSize?: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    sort?: SortingState;
    onSortChange?: (sorting: SortingState) => void;
    isLoading?: boolean;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    toolbar,
    total = 0,
    pageIndex = 0,
    pageSize = 10,
    onPageChange,
    onPageSizeChange,
    sort: sortingProp,
    onSortChange,
    isLoading = false
}: DataTableProps<TData, TValue>) {
    const [internalSorting, setInternalSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    const sorting = sortingProp ?? internalSorting;

    const pagination: PaginationState = { pageIndex, pageSize };

    const table = useReactTable({
        data,
        columns,
        rowCount: total,
        manualPagination: true,
        manualSorting: !!onSortChange,
        state: {
            sorting,
            columnVisibility,
            pagination
        },
        onSortingChange: (updater) => {
            const next = typeof updater === 'function' ? updater(sorting) : updater;

            if (onSortChange) {
                onSortChange(next);
            } else {
                setInternalSorting(next);
            }
        },
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: (updater) => {
            const next = typeof updater === 'function' ? updater(pagination) : updater;

            if (next.pageIndex !== pageIndex && onPageChange) onPageChange(next.pageIndex);

            if (next.pageSize !== pageSize && onPageSizeChange) onPageSizeChange(next.pageSize);
        },
        getCoreRowModel: getCoreRowModel()
    });

    const skeletonRowCount = Math.min(pageSize, 6);
    const hasData = data.length > 0;

    const showLoading = isLoading && !hasData;
    const showRows = (!isLoading || hasData) && !!table.getRowModel().rows?.length;
    const showNoResults = !isLoading && !hasData;

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
            {toolbar}
            <div className="mx-4 flex-1 overflow-auto rounded-md border lg:mx-6">
                <Table className="table-fixed">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        style={{ width: header.column.getSize() }}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody
                        className={cn(
                            isLoading && hasData && 'opacity-50 transition-opacity duration-150'
                        )}
                    >
                        {showLoading &&
                            Array.from({ length: skeletonRowCount }).map((_, i) => (
                                <TableRow key={i}>
                                    {columns.map((_, j) => (
                                        <TableCell key={j}>
                                            <Skeleton className="h-4 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}

                        {showRows &&
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            style={{ width: cell.column.getSize() }}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}

                        {showNoResults && (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Nenhum resultado encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <DataTablePagination table={table} />
        </div>
    );
}
