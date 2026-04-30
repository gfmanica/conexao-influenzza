import * as React from 'react';

import { ChevronsUpDownIcon, Loader2Icon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { type ComboboxQueryResult } from '@/hooks/use-combobox-query';
import { cn } from '@/lib/utils';

import { ComboboxPagination } from './combobox-pagination';

type ComboboxBase<T> = {
    value: T | null;
    onChange: (item: T | null) => void;
    keyField: keyof T & string;
    displayField: keyof T & string;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    className?: string;
    id?: string;
};

type ComboboxStaticProps<T> = ComboboxBase<T> & {
    options: T[];
    query?: never;
};

type ComboboxRemoteProps<T> = ComboboxBase<T> & {
    options?: never;
    query: ComboboxQueryResult<T>;
};

export type Combobox<T> = ComboboxStaticProps<T> | ComboboxRemoteProps<T>;

export function Combobox<T>({
    value,
    onChange,
    keyField,
    displayField,
    placeholder = 'Selecionar...',
    searchPlaceholder = 'Buscar...',
    emptyText = 'Nenhum resultado.',
    className,
    id,
    query,
    options
}: Combobox<T>) {
    const [open, setOpen] = React.useState(false);

    const isRemote = !!query;
    const items = isRemote ? query.items : options;

    const displayValue = value ? String(value[displayField] ?? '') : '';
    const selectedKey = value ? String(value[keyField]) : '';

    // limpa a query quando fecha o popover
    const prevOpen = React.useRef(open);

    React.useEffect(() => {
        if (prevOpen.current && !open && query) {
            query.reset();
        }
        prevOpen.current = open;
    }, [open]);

    return (
        <Popover modal={false} open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                render={
                    <Button
                        id={id}
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            'bg-input/50 h-9 w-full justify-start border-transparent font-normal shadow-none',
                            className
                        )}
                    />
                }
            >
                {displayValue || <span className="text-muted-foreground">{placeholder}</span>}

                <ChevronsUpDownIcon className="text-muted-foreground ml-auto size-4 shrink-0" />
            </PopoverTrigger>

            <PopoverContent className="w-(--anchor-width) p-0" align="start" sideOffset={4}>
                <Command shouldFilter={!isRemote}>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        {...(isRemote && {
                            value: query!.search,
                            onValueChange: query!.onSearchChange
                        })}
                    />

                    <CommandList>
                        {isRemote && query!.isFetching && items.length === 0 ? (
                            <div className="flex items-center justify-center py-6">
                                <Loader2Icon className="text-muted-foreground size-4 animate-spin" />
                            </div>
                        ) : (
                            <>
                                <CommandEmpty>{emptyText}</CommandEmpty>

                                <CommandGroup
                                    className={cn(
                                        isRemote &&
                                            query!.isFetching &&
                                            items.length > 0 &&
                                            'opacity-50 transition-opacity duration-150'
                                    )}
                                >
                                    {items.map((item) => {
                                        const itemKey = String(item[keyField]);
                                        const itemLabel = String(item[displayField]);

                                        return (
                                            <CommandItem
                                                key={itemKey}
                                                value={itemLabel}
                                                {...(!isRemote && { keywords: [itemKey] })}
                                                data-checked={selectedKey === itemKey}
                                                onSelect={() => {
                                                    onChange(selectedKey === itemKey ? null : item);

                                                    setOpen(false);
                                                }}
                                            >
                                                {itemLabel}
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>

                    {isRemote && (
                        <ComboboxPagination
                            canPreviousPage={query.canPreviousPage}
                            canNextPage={query.canNextPage}
                            isFetching={query.isFetching}
                            onFirst={query.goToFirstPage}
                            onPrevious={query.goToPreviousPage}
                            onNext={query.goToNextPage}
                            onRefetch={query.refetch}
                        />
                    )}
                </Command>
            </PopoverContent>
        </Popover>
    );
}
