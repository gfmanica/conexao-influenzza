import { ChevronLeft, ChevronRight, ChevronsLeft, RefreshCw } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from './button';

export function ComboboxPagination({
    canPreviousPage,
    canNextPage,
    isFetching,
    onFirst,
    onPrevious,
    onNext,
    onRefetch
}: {
    canPreviousPage: boolean;
    canNextPage: boolean;
    isFetching: boolean;
    onFirst: () => void;
    onPrevious: () => void;
    onNext: () => void;
    onRefetch: () => void;
}) {
    return (
        <div className="border-border/50 flex items-center justify-center gap-0.5 border-t px-2 pt-1">
            <Button variant="ghost" size="icon-sm" onClick={onFirst} disabled={!canPreviousPage}>
                <ChevronsLeft />

                <span className="sr-only">Primeira página</span>
            </Button>

            <Button variant="ghost" size="icon-sm" onClick={onPrevious} disabled={!canPreviousPage}>
                <ChevronLeft />

                <span className="sr-only">Página anterior</span>
            </Button>

            <Button variant="ghost" size="icon-sm" onClick={onNext} disabled={!canNextPage}>
                <ChevronRight />

                <span className="sr-only">Próxima página</span>
            </Button>

            <Button variant="ghost" size="icon-sm" onClick={onRefetch} disabled={isFetching}>
                <RefreshCw className={cn(isFetching && 'animate-spin')} />

                <span className="sr-only">Recarregar</span>
            </Button>
        </div>
    );
}
