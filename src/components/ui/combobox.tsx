import * as React from 'react';

import { ChevronsUpDownIcon } from 'lucide-react';

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
import { cn } from '@/lib/utils';

export type ComboboxOption<T = unknown> = {
    value: string;
    label: string;
    data: T;
};

type ComboboxProps<T = unknown> = {
    options: ComboboxOption<T>[];
    value: string;
    onChange: (option: ComboboxOption<T> | null) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    className?: string;
    id?: string;
};

export function Combobox<T = unknown>({
    options,
    value,
    onChange,
    placeholder = 'Selecionar...',
    searchPlaceholder = 'Buscar...',
    emptyText = 'Nenhum resultado.',
    className,
    id
}: ComboboxProps<T>) {
    const [open, setOpen] = React.useState(false);
    const selected = options.find((o) => o.value === value);

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
                            'bg-input/50 h-9 w-full justify-between border-transparent font-normal shadow-none',
                            className
                        )}
                    />
                }
            >
                {selected ? (
                    selected.label
                ) : (
                    <span className="text-muted-foreground">{placeholder}</span>
                )}
                <ChevronsUpDownIcon className="text-muted-foreground ml-2 size-4 shrink-0" />
            </PopoverTrigger>
            <PopoverContent className="w-(--anchor-width) p-0" align="start" sideOffset={4}>
                <Command>
                    <CommandInput placeholder={searchPlaceholder} />

                    <CommandList>
                        <CommandEmpty>{emptyText}</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    keywords={[option.value]}
                                    data-checked={value === option.value}
                                    onSelect={() => {
                                        onChange(option.value === value ? null : option);
                                        setOpen(false);
                                    }}
                                >
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
